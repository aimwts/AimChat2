import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { Message, Role, ModelId, Attachment } from "../types";

// Initialize the API client
// Note: process.env.API_KEY is assumed to be available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChatResponseStream = async (
  history: Message[],
  newMessage: string,
  attachments: Attachment[],
  modelId: ModelId,
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    // 1. Prepare the history for the API
    // We filter out error messages and format them correctly
    // The last message is the "new" one, so we don't include it in history sent to `chats.create` typically,
    // but the SDK handles history state differently depending on if we use `chats.create` or stateless `generateContent`.
    // For a stateless approach that's robust to refreshing, we will reconstruct the history here.
    
    // Convert our internal Message format to Gemini SDK format
    const formattedHistory = history.map((msg) => {
      const parts: Part[] = [];
      
      // Add attachments if any (only for user messages typically, but model can return images theoretically, though rare in text chat)
      if (msg.role === Role.USER && msg.attachments) {
        msg.attachments.forEach(att => {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data
            }
          });
        });
      }

      // Add text content
      if (msg.content) {
        parts.push({ text: msg.content });
      }

      return {
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: parts,
      };
    });

    const chat = ai.chats.create({
      model: modelId,
      history: formattedHistory,
      config: {
        // Thinking budget config for supported models
        thinkingConfig: modelId === ModelId.GEMINI_FLASH_THINKING 
          ? { thinkingBudget: 1024 } 
          : undefined,
      }
    });

    // 2. Prepare the new message content
    const newParts: Part[] = [];
    if (attachments && attachments.length > 0) {
      attachments.forEach(att => {
        newParts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
    }
    if (newMessage) {
        newParts.push({ text: newMessage });
    }

    // 3. Send message and stream response
    // Using sendMessageStream with the message content
    const resultStream = await chat.sendMessageStream({ 
        message: newParts
    });

    let fullText = "";
    
    for await (const chunk of resultStream) {
        // The chunk is of type GenerateContentResponse
        const text = (chunk as GenerateContentResponse).text;
        if (text) {
            fullText += text;
            onChunk(text);
        }
    }

    return fullText;

  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};