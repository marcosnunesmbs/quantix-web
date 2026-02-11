<p align="center">
  <img src="./assets/logo.png" width="200" alt="Quantix Logo" />
  <br>
  <em>Advanced Personal Finance API built with NestJS & Domain-Centric Architecture</em>
</p>

---

## 📖 About

**Quantix** is a powerful personal finance manager designed to handle the complexity of real-world financial lives.

Most finance apps treat every transaction as a simple "money out" event. Quantix understands that **Credit Cards** work differently. It natively handles **installments**, **billing cycles**, **closing dates**, and **recurrences**, giving you a precise view of your actual cash flow and future commitments.

## 🚀 Key Features

*   **💳 Virtual Credit Card Statements**: No more clutter. Daily card expenses are automatically aggregated into a single monthly invoice based on your card's closing date.
*   **➗ Smart Installment Engine**: Buy now, pay later. Automatically generates future installment records and places them in the correct future invoices.
*   **🔄 Robust Recurrence**: Set up recurring income/expenses (e.g., Netflix, Rent, Salary) and project your future balances.
*   **🏦 Account Management**: Track money across multiple accounts (bank accounts, wallets) with real-time balance calculations.
*   **🔗 Transaction Linking**: Link transactions to specific accounts to track where money comes from and goes to.
*   **🏗️ Domain-Centric Architecture**: Business logic is strictly isolated from infrastructure and frameworks, ensuring long-term maintainability.

## 🛠️ Tech Stack

*   **Framework:** [NestJS](https://nestjs.com/)
*   **Language:** TypeScript
*   **Database:** SQLite (Simple, portable, file-based)
*   **ORM:** TypeORM
*   **Time Handling:** date-fns

## ⚡ Getting Started

### Prerequisites
*   Node.js (LTS)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/quantix.git
    cd quantix
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Ensure the data directory exists:
    ```bash
    mkdir data 2>nul || mkdir data
    # Linux/Mac: mkdir -p data
    ```

### Running the App

```bash
# Development mode (watch)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Server will start at `http://localhost:3000`.

## 🗂️ Environment Variables

The application uses the following environment variables:

*   `DATABASE_PATH` - Path to the SQLite database file (default: `./data/quantix.db`)
*   `PORT` - Port number for the server (default: `3000`)
*   `API_KEY` - API key for authentication (default: `quantix-api-key`)

## 📡 API Documentation

The API is secured with an API key. All requests must include the `API-KEY` header.

### Authentication

Include your API key in the header for all requests:

```
API-KEY: your_api_key_here
```

### Available Endpoints

#### Categories
* `POST /categories` - Create a new category
* `GET /categories` - Get all categories
* `GET /categories/:id` - Get a specific category
* `PATCH /categories/:id` - Update a category
* `DELETE /categories/:id` - Delete a category

#### Transactions
* `POST /transactions` - Create a new transaction (supports installments and recurrence)
* `GET /transactions` - Get all transactions with optional filters
* `GET /transactions/:id` - Get a specific transaction
* `PATCH /transactions/:id` - Update a transaction
* `PATCH /transactions/:id/pay` - Mark a transaction as paid
* `PATCH /transactions/:id/unpay` - Mark a transaction as unpaid
* `DELETE /transactions/:id` - Delete a transaction

#### Credit Cards
* `POST /credit-cards` - Create a new credit card
* `GET /credit-cards` - Get all credit cards
* `GET /credit-cards/:id` - Get a specific credit card
* `PATCH /credit-cards/:id` - Update a credit card
* `GET /credit-cards/:id/statement` - Get credit card statement for a month
* `POST /credit-cards/:id/pay-statement` - Mark all transactions in a statement as paid
* `DELETE /credit-cards/:id` - Delete a credit card

#### Accounts
* `POST /accounts` - Create a new account
* `GET /accounts` - Get all accounts with current balances
* `GET /accounts/:id` - Get a specific account with details
* `PATCH /accounts/:id` - Update an account
* `DELETE /accounts/:id` - Delete an account (if no transactions are linked)
* `GET /accounts/:id/balance` - Get the current balance for an account
* `GET /accounts/:id/transactions` - Get all transactions linked to an account
* `PATCH /accounts/:id/link-transaction` - Link a transaction to an account

#### Summary
* `GET /summary` - Get monthly financial summary

### Example Requests

#### Create a Transaction
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "API-KEY: your_api_key_here" \
  -d '{
    "type": "EXPENSE",
    "name": "Grocery Shopping",
    "amount": 125.50,
    "date": "2026-02-15",
    "paymentMethod": "CREDIT",
    "creditCardId": "card-id-here"
  }'
```

#### Create an Installment Transaction
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -H "API-KEY: your_api_key_here" \
  -d '{
    "type": "EXPENSE",
    "name": "Laptop Purchase",
    "amount": 3000,
    "date": "2026-02-10",
    "paymentMethod": "CREDIT",
    "creditCardId": "card-id-here",
    "installments": 3
  }'
```

#### Get Credit Card Statement
```bash
curl -X GET "http://localhost:3000/credit-cards/card-id-here/statement?month=2026-02" \
  -H "API-KEY: your_api_key_here"
```

### Swagger Documentation

Access the interactive API documentation at: `http://localhost:3000/api`

## 🧪 Testing

We rely on a comprehensive test suite to ensure domain logic accuracy.

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e
```

## 📂 Project Structure

```
src/
├── domain/           # Pure business logic (Entities, Interfaces) 🧠
├── infra/            # Implementation details (Database, Repos) ⚙️
├── modules/          # User-facing features (Controllers, Services) 🔌
└── shared/           # Utilities (Date handling, DTOs) 🛠️
```

## 📚 Documentation

For deeper dives into specific topics, check out our specialized documentation:

*   [**🛒 PRODUCT.md**](./PRODUCT.md) - Detailed feature specifications and use cases.
*   [**🏗️ ARCHITECTURE.md**](./ARCHITECTURE.md) - System design, data flow, and architectural decisions.
*   [**🤝 CONTRIBUTING.md**](./CONTRIBUTING.md) - Development guidelines and workflows.

## 📄 License

This project is currently private/proprietary.
