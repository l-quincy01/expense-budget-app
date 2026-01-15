# UnitTestsWarp.md

This document outlines a suggested unit test plan for BudgetlyAI. It is organized by service and by layer to guide where and how to add tests over time.

## General structure

- Place .NET tests in a dedicated test project (e.g. `tests/CoreService.Tests/`) that references `backend/core-service/backend.csproj`.
- Place AI service (Node/TypeScript) tests in a tests folder inside `backend/ai-service` (e.g. `backend/ai-service/tests/`).
- Place frontend (Next.js) tests in `frontend/src` alongside code (e.g. `__tests__` folders) or in `frontend/tests/`.
- Use separate test suites for **unit** vs **integration** tests when possible.

---

## Backend core-service (ASP.NET Core)

### 1. Domain services (high priority "pure" unit tests)

Target: classes under `backend/core-service/Services/` that contain business logic and minimal IO.

Focus areas:

- **BudgetService**
  - Creating budgets with valid and invalid inputs (e.g. missing name, negative values, overlapping date ranges).
  - Updating budgets and ensuring invariants (e.g. total limits, per-category caps) are preserved.
  - Deleting budgets and verifying related records are handled correctly (e.g. cannot delete if in use, or behavior if allowed).

- **TransactionService**
  - Adding user transactions and mapping incoming DTOs to `UserAddedTransaction` domain entities.
  - Validating transaction dates, amounts (positive/negative), and category mappings.
  - Filtering and querying transactions (by date, category, dashboard, etc.) where logic is in the service rather than the DB.

- **DashboardQueryService**
  - Fetching dashboard read models from MongoDB via `MongoDbService` (using mocks/fakes for Mongo).
  - Correctly mapping query parameters (user id, dashboard name) to repository calls.
  - Handling "not found" dashboards vs other error paths.

Implementation notes:

- Mock EF Core `BudgetsDbContext` using an in-memory provider or a repository abstraction.
- Mock `MongoDbService` using interfaces or by wrapping its collections, so service logic can be tested without a real DB.

### 2. Dashboard orchestration and ingest client

Target: `DashboardService` and `NodeIngestClient`.

Focus areas:

- **DashboardService**
  - `CreateDashboardAsync`
    - Logs the expected messages when called.
    - Calls `INodeIngestClient.CreateDashboardAsync` with the correct `userId`, `dashboardName`, and PDF count.
    - Properly propagates cancellation tokens.
  - `UpdateDashboardAsync`
    - Same as above, but calling `INodeIngestClient.UpdateDashboardAsync`.
  - `DeleteDashboardAsync`
    - Correctly URL-decodes dashboard names.
    - Builds a MongoDB filter matching `UserId` and `Name`.
    - Deletes related collections (`MonthlyTransactions`, `MonthlyIncomeExpenses`, `MonthlyCategoryExpenditures`).
    - Throws a `KeyNotFoundException` when no dashboard was deleted.

- **NodeIngestClient**
  - URL construction
    - When `NodeIngest:BaseUrl` is set, uses it as base.
    - When not set, falls back to `http://localhost:4010/api/dashboards`.
    - For `UpdateDashboardAsync`, appends an URL-encoded dashboard name.
  - Multipart request building
    - Attaches `dashboardName` as form field.
    - Attaches each PDF as `application/pdf` with the original filename.
    - Adds the `x-user-id` header.
  - Error handling
    - When the AI service returns non-success, logs the warning and throws an `InvalidOperationException` containing the response body.

Implementation notes:

- Use an in-memory `HttpMessageHandler` or a mock of `IHttpClientFactory` to capture outgoing HTTP requests without making real network calls.
- Verify both the HTTP method and URL, as well as headers and form content.

### 3. Auth and infrastructure helpers

Target: `Services/Auth` and `Infrastructure/Auth`.

Focus areas:

- **ClerkAuthService**
  - Given valid and invalid tokens, interacts with Clerk SDK as expected.
  - Extracts user information correctly and sets up user context.
  - Handles typical error cases (expired token, malformed token, missing claims).

- **ClaimsPrincipalExtensions**
  - Correctly extracts the application user id from various token shapes.
  - Returns `null` or throws in a predictable way when required claims are missing.

These tests are small but valuable for preventing regressions in auth and identity plumbing.

### 4. Controllers (thin unit / controller tests)

Target: controllers under `backend/core-service/Controllers/`.

Focus areas:

- Each controller action:
  - Returns appropriate HTTP status codes for success vs common failure modes (e.g. 200/201 vs 400/404/500).
  - Calls the expected service methods with the correct parameters.
  - Properly propagates `CancellationToken`.

Implementation notes:

- Use mocked services (e.g. mock `IBudgetService`, `IDashboardService`, etc.) and verify that actions delegate responsibilities rather than duplicating logic.

---

## Backend AI service (Node/TypeScript)

The AI service is responsible for ingestion and LLM-based extraction; many of its units can be tested without hitting external services.

### 1. MongoDB connection utilities (`src/db`)

Focus areas:

- `connectMongo`
  - Given a valid URI and database name, resolves successfully and returns a usable connection.
  - Throws or rejects with a clear error for invalid URIs or missing DB names.
  - Does not create duplicate connections when called multiple times (if the implementation includes caching).

Implementation notes:

- Use `mongodb`’s in-memory or mocked driver APIs where possible, or spy on the `MongoClient` constructor.

### 2. LLM orchestration layer (`src/llm`)

Focus areas:

- Functions that call OpenAI
  - Build prompts with the correct structure and include required fields (user id, date ranges, currencies, etc.).
  - Parse OpenAI responses into internal DTOs while handling:
    - Normal/correct responses.
    - Missing fields.
    - Unexpected extra fields.
    - Empty or malformed arrays.

Implementation notes:

- Inject or mock the `openai` client; never hit real OpenAI in unit tests.
- Use fixtures representing typical statement outputs and edge cases.

### 3. Mapping and aggregation logic (`src/mappers`, `src/services`)

Focus areas:

- Mapping functions that:
  - Convert raw LLM outputs into MongoDB `Dashboard` documents and related collections.
  - Aggregate totals by month, by category, and by income/expense type.
  - Compute derived metrics used in charts (e.g., balances, spending percentages).

Test cases should cover:

- Correct handling of multiple months of data.
- Mixed income/expense transactions with rounding and currency formatting.
- Missing categories or `uncategorized` transactions.
- Idempotency where the same statements are re-ingested.

### 4. Dashboard routes (`src/routes/dashboard.routes`)

Although more integration-like, you can still treat these as unit/route tests.

Focus areas:

- `POST /api/dashboards`
  - Validates multipart uploads (at least one PDF is required).
  - Requires the `x-user-id` header.
  - On success, responds with the expected payload (e.g., dashboard id / counts / name).
  - On failure from downstream services, returns appropriate error status and message.

- Update endpoints (e.g. `PATCH /api/dashboards/:name`)
  - URL-encodes/decodes dashboard names correctly.
  - Handles attempts to update non-existent dashboards with a clear error.

Implementation notes:

- Use `supertest` (or similar) against an in-memory Express app instance.
- Mock Mongo and the LLM layer so route tests stay fast and deterministic.

---

## Frontend (Next.js, `frontend/`)

Frontend unit tests should focus on **pure logic** and **UI behavior decoupled from real backends**.

### 1. Utility functions (`src/utils` and `src/utils/chart`)

Focus areas (non-exhaustive examples):

- `chart/barchart/categories/sumCategories.ts`
  - Sums spending by category across months.
  - Handles empty arrays and missing categories.

- `chart/barchart/categories/sumCategoryTotalsByMonth.ts`
  - Aggregates category totals per month, ensuring months are handled consistently (e.g. with/without data).

- `chart/lineChart/categories/buildSeries.ts`
  - Transforms raw monthly category data into series format expected by the chart components.
  - Ensures series labels, colors, and ordering are deterministic.

- `chart/lineChart/incomeExpense/mergeMonthlyTransactions.ts`
  - Merges and sorts income/expense transactions by date.
  - Handles overlapping months and duplicate entries.

- `chart/lineChart/incomeExpense/sortedMonthlyTransactions.ts`
  - Ensures transactions are sorted by date and/or amount as expected by the UI.

- `overview/calculateMonthlyTotals.ts`, `overview/getDashboardBalances.ts`, `overview/incomePercentageSpent.ts`
  - Correctly compute totals, balances, and percentage spent across different combinations of incomes and expenses.
  - Handle edge cases like zero income (avoid division by zero) and negative balances.

- `dashboards/sortDashboard.ts` and `sumMonths.ts`
  - Ensure dashboards and months are sorted consistently and stably.

These are prime candidates for pure, framework-agnostic unit tests that run very quickly.

### 2. Data hooks (`src/hooks`)

Focus areas:

- `useApi` (in `src/lib/api.ts`)
  - Adds `Authorization` header when a token is available and omits it when not.
  - Appends `path` to `NEXT_PUBLIC_API_BASE` correctly.
  - Throws errors on non-OK responses and parses JSON on success.

- `useDashboard`
  - Correctly decodes `dashboardName` from route params.
  - Fetches dashboard names on mount, updates loading/error state appropriately.
  - Fetches the selected dashboard when `dashboardName` changes and sorts months via `sortDashboardMonths`.
  - Cleans up in-flight requests on unmount and does not update state when unmounted.

- Other hooks (`useBudgets`, `useMonthlyTransactions`, `useMonthlyIncomeExpense`, `useMonthlyCategoryExpenditure`, `useOverview`, `useProfile`)
  - Each should have tests asserting:
    - Calls to `useApi` with the expected endpoint paths.
    - Correct mapping of API responses to hook state.
    - Proper error and loading state transitions.

Implementation notes:

- Use a testing library that supports React hooks (e.g. React Testing Library with hook wrappers).
- Mock `useAuth` (for `useApi`) and `fetch`/`global.fetch` so no real network calls are made.

### 3. Key components (logic-focused)

Focus on components where logic is non-trivial and not purely presentational.

Examples:

- Dashboard table components (`src/components/dashboard/views/*`, `src/components/table/*`)
  - Correctly render rows and columns based on provided data.
  - Respond to sorting, filtering, and pagination actions.

- Dashboard dialogs (`src/components/dashboard/dialogs/*`, `src/components/sidebar/dialogs/*`)
  - Validate forms before submission.
  - Call callbacks/handlers with the correct payloads.

- `DashboardLanding` page (`src/app/(auth)/dashboard/page.tsx`)
  - Redirects to the first dashboard when dashboards exist.
  - Shows loading and error states appropriately.
  - Uses `encodeURIComponent` / `decodeURIComponent` correctly when constructing URLs.

Implementation notes:

- Use React Testing Library to render components and assert on DOM output and user interactions.
- Mock hooks (`useDashboard`, `useTheme`, etc.) where necessary to isolate component behavior.

---

## Integration vs unit boundaries (for future work)

While this document focuses on unit tests, consider adding higher-level integration tests later that:

- Spin up the core-service with in-memory Postgres and Mongo (or test containers) and exercise entire endpoints.
- Spin up the AI service with mocked OpenAI and real Mongo, testing ingestion flows end-to-end.
- Use Playwright or similar to exercise the Next.js frontend with a mocked backend.

Keep those separate from unit tests (different projects or folders and different commands) to maintain fast feedback from true unit test runs while still validating end-to-end behavior.