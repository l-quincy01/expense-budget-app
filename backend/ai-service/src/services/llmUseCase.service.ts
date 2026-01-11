import { ExtractAllResult, PdfInput } from "#llm/domain/types";
import llmOpenAIService from "#llm/services/openAI/llmOpenAIService";

const extractStatementDataUseCase = llmOpenAIService();

export async function generateStatementDataUseCase(
  pdfs: PdfInput[],
  userId: string
): Promise<ExtractAllResult> {
  return extractStatementDataUseCase.execute(pdfs, userId);
}
