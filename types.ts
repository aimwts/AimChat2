export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64 encoded data
  name?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  timestamp: number;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export enum ModelId {
  GEMINI_FLASH = 'gemini-2.5-flash',
  GEMINI_PRO = 'gemini-3-pro-preview',
  GEMINI_FLASH_THINKING = 'gemini-2.5-flash-thinking-preview-01-21',
}

export const MODEL_LABELS: Record<ModelId, string> = {
  [ModelId.GEMINI_FLASH]: 'Gemini 2.5 Flash',
  [ModelId.GEMINI_PRO]: 'Gemini 3.0 Pro',
  [ModelId.GEMINI_FLASH_THINKING]: 'Gemini 2.5 Flash (Thinking)',
};