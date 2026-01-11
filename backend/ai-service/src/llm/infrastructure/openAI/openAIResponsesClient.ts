import { ILLMClient, LLMRequest } from "#llm/application/ports/llmClient";
import OpenAI from "openai";

export class OpenAIResponsesClient implements ILLMClient {
  private readonly client: OpenAI;

  constructor(private readonly model: string, opts?: { apiKey?: string }) {
    this.client = new OpenAI({ apiKey: opts?.apiKey });
  }

  async completeText(req: LLMRequest): Promise<string> {
    const content = [
      ...(req.files ?? []).map((f) => ({
        type: "input_file" as const,
        filename: f.filename,
        file_data: f.dataUrl,
      })),
      { type: "input_text" as const, text: req.inputText },
    ];

    const resp = await this.client.responses.create({
      model: this.model,
      temperature: req.temperature ?? 0,
      input: [{ role: "user", content }],
    });

    let text: string | undefined = (resp as any).output_text;

    if (!text) {
      const out = (resp as any).output ?? [];
      for (const item of out) {
        if (item?.type === "message") {
          for (const c of item?.content ?? []) {
            if ((c.type === "text" || c.type === "output_text") && c.text) {
              text = c.text as string;
              break;
            }
          }
        }
        if (text) break;
      }
    }

    if (!text) throw new Error("LLM returned no text");
    return text;
  }
}
