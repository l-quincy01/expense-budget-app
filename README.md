
# Overview

BudgetlyAI is a simple personal finance app that helps you see how your money is spent and to create budgets that can help you manage your money better. 

BudgetlyAI makes sense of your finances without having to turn budgeting into a second job. The app does the boring work of extracting transactions, organising them by month and category, and presenting them in a way that actually makes sense.



<!-- ![image info](./screenshots/1.png) -->

# User Interface
### Onboarding Screens

| Welcome | Sign Up |
|--------|--------|
| <img src="./screenshots/1.png" width="85%" /> | <img src="./screenshots/1c.png" width="85%" /> |

| Sign Up (Email OTP) | Login |
|-------------------|-------|
| <img src="./screenshots/1d.png" width="85%" /> | <img src="./screenshots/1b.png" width="85%" /> |

### Dashboard Screens
#### Overview
| Overview | Budgets |
|--------|--------|
| <img src="./screenshots/3.png" width="85%" /> | <img src="./screenshots/4.png" width="85%" /> |


| Series Charts | Series Charts (B) |
|-------------------|-------|
| <img src="./screenshots/5.png" width="85%" /> | <img src="./screenshots/6.png" width="85%" /> |





| Spending Categories  Table | Spending Categories  Charts |
|--------|--------|
| <img src="./screenshots/7.png" width="85%" /> | <img src="./screenshots/8.png" width="85%" /> |


# Backend Architecture

BudgetlyAI process statements through an AI pipeline, extracts spending data from the statements and persists this extracted data into mongoDB.

 Two services:
- `core-service`: ASP.NET Core API for authentication, dashboards and budgets.
- `ai-service`: Node  service that runs the LLM extraction workflow and writes dashboard aggregates to MongoDB.

## Folder Structure & Tech Stack
```
├── core-service
│   ├── Controllers
│   ├── Data
│   ├── Infrastructure
│   ├── Models
│   └── Services
└── ai-service
    ├── src
    │   ├── config
    │   ├── controllers
    │   ├── db
    │   ├── llm
    │   ├── mappers
    │   ├── routes
    │   └── services
    └── package.json
```

| Language | Framework / Runtime |
|----------|---------------------|
| C# | ASP.NET Core |
| TypeScript | NodeJS (Express)  |
| SQL | PostgreSQL (EF Core) |

<br>



### Authentication & Authorization
Clerk handles email-first authentication. Users receive OTP codes via email the .NET API validates Clerk JWTs and scopes data per user.

```mermaid
flowchart LR
    FE[Frontend] -- email OTP login --> Clerk[[Clerk Auth]]
    API[[core-service]] -- validates JWT --> Clerk
    API --> Postgres[(PostgreSQL)]
    API --> Mongo[(MongoDB)]
    FE -->|JWT| API
```

### Sign in/Sign up Sequence
```mermaid
sequenceDiagram
    actor Client
    Client ->> ClerkAuth: start email sign-in (OTP)
    ClerkAuth ->> Client: send OTP to email
    Client ->> ClerkAuth: verify OTP
    ClerkAuth ->> Client: issue session + JWT

    Client ->> API: request account & dashboards with JWT
    alt first-time user
        API ->> ClerkAuth: fetch user info
        API ->> Postgres: create user-owned rows
        API ->> Mongo: init dashboard space
        API -->> Client: mark as new user
    else existing user
        API ->> Postgres: load budgets/transactions
        API ->> Mongo: load dashboard aggregates
    end
    API -->> Client: return account + dashboard data
```

### Ingestion & AI Pipeline
```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as core-service
    participant AI as ai-service
    participant LLM as OpenAI
    participant M as MongoDB

    FE->>API: POST /api/dashboards (multipart PDFs, JWT)
    API->>AI: Forward PDFs + x-user-id header
    AI->>AI: Validate request (multer, guards)
    AI->>LLM: Run extractors (tx, income/expense, categories, overview)
    LLM-->>AI: Structured JSON arrays
    AI->>M: Insert/append dashboard doc + aggregates
    AI-->>API: dashboardId + counts
    API-->>FE: dashboard created/updated
```

### Data Flow
```mermaid
flowchart LR
    FE[Frontend] -->|JWT| API[core-service]
    API -->|budgets + transactions| PSQL[(PostgreSQL)]
    API -->|read dashboards| MONGO[(MongoDB)]
    API -->|ingest PDFs| AI[ai-service]
    AI -->|LLM extraction| OpenAI[[OpenAI Chat Completions]]
    AI -->|write dashboards| MONGO
```
