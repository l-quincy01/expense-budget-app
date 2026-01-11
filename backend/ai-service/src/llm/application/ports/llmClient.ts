export type LLMFile = {
  filename: string;

  dataUrl: string;
};

export type LLMRequest = {
  temperature?: number;
  inputText: string;
  files?: LLMFile[];
};

export interface ILLMClient {
  completeText(req: LLMRequest): Promise<string>;
}
