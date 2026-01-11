import { CategoriesExtractor } from "#llm/application/extractors/extractor.categories/categoriesExtractor";

import { MonthlyTransactionsExtractor } from "#llm/application/extractors/extractor.monthlyTransactions/monthlyTransactionsExtractor";
import { OverviewExtractor } from "#llm/application/extractors/extractor.overview/overviewExtractor";
import { JsonArrayParser } from "#llm/application/parsing/jsonArrayParser";
import { JsonSanitizer } from "#llm/application/parsing/jsonSanitizer";
import {
  CategoriesPrompt,
  IncomeExpensePrompt,
  OverviewPrompt,
  TransactionsPrompt,
} from "#llm/application/prompts/promptBuilders";
import { DataUrlFileEncoder } from "#llm/infrastructure/files/dataUrlFileEncoder";
import { OpenAIResponsesClient } from "#llm/infrastructure/openAI/openAIResponsesClient";
import { ExtractStatementData } from "#llm/application/extractors/extractStatementData";
import { IncomeExpenseExtractor } from "#llm/application/extractors/extractor.incomeExpense/incomeExpenseExtractor";

export default function llmOpenAIService() {
  const llm = new OpenAIResponsesClient("chatgpt-4o-latest");
  const encoder = new DataUrlFileEncoder();

  const sanitizer = new JsonSanitizer();
  const parser = new JsonArrayParser(sanitizer);

  const txExtractor = new MonthlyTransactionsExtractor(
    llm,
    encoder,
    parser,
    new TransactionsPrompt()
  );
  const ieExtractor = new IncomeExpenseExtractor(
    llm,
    encoder,
    parser,
    new IncomeExpensePrompt()
  );
  const catExtractor = new CategoriesExtractor(
    llm,
    encoder,
    parser,
    new CategoriesPrompt()
  );
  const ovExtractor = new OverviewExtractor(
    llm,
    encoder,
    parser,
    new OverviewPrompt()
  );

  return new ExtractStatementData(
    txExtractor,
    ieExtractor,
    catExtractor,
    ovExtractor
  );
}
