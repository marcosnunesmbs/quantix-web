# Product Documentation - Quantix

Quantix is a comprehensive **Personal Finance Manager** designed to give users clarity and control over their cash flow, credit card usage, and future financial commitments. It serves as a central ledger for all financial movements, specializing in complex scenarios like credit card installments and recurrences.

## 🌟 Core Value Operations

### 1. Unified Financial Ledger
Quantix acts as the single source of truth for your finances.
- **Income & Expense Tracking:** Record every cent that comes in or goes out.
- **Categorization:** Organize transactions into custom categories (e.g., "Food", "Housing", "Salary") to spot spending patterns.
- **Account Management:** Link transactions to specific accounts (bank accounts, wallets) to track where money comes from and goes to.
- **Cash Flow View:** See exactly how much money you have effectively available after all obligations.

### 2. Advanced Credit Card Management
Unlike basic trackers, Quantix understands how credit cards actually work.
- **Virtual Summaries:** Instead of cluttering your monthly view with every coffee bought on credit, Quantix rolls them up into a **Single Monthly Invoice** based on your card's closing date.
- **Smart Period Calculation:** It automatically calculates which invoice a purchase belongs to. Buying on the 16th with a closing date of the 15th? That expense moves to next month's bill automatically.
- **Limit Tracking:** Monitor your available credit limit in real-time.
- **Account-Based Payment:** When paying credit card bills, you can select which account to debit for the payment, automatically linking all transactions in the statement to that account.

### 3. Installment Engine
Handle "Buy Now, Pay Later" scenarios effortlessly.
- **Automatic Splitting:** Buy a laptop for $3,000 in 10 installments? Quantix instantly generates 10 future records of $300 each, placed in the correct future invoices.
- **Future Impact:** See the impact of today's installment purchases on your budget 6 months from now.

### 4. Account Management
Manage multiple financial accounts and track balances.
- **Account Types:** Create different types of accounts (bank accounts, wallets, savings accounts).
- **Balance Tracking:** Real-time balance calculation based on inflows and outflows.
- **Transaction Linking:** Link transactions to specific accounts to track where money comes from and goes to.
- **Account Selection:** Choose which account to debit when paying credit card bills.

### 5. Recurrence Automation
Reduce manual data entry for predictable costs.
- **Flexible Rules:** Set up weekly, monthly, or yearly recurrences.
- **Auto-Projection:** The system projects future expenses (like Netflix or Rent) so your future budget isn't empty.
- **End Dates:** Define when a subscription ends, and the system stops projecting it automatically.

---

## 🚀 Key Features

### 📊 Monthly Financial Summary
The high-level dashboard for your month.
*   **Income:** Total money earned.
*   **Expenses:** Sum of direct expenses (cash/debit) + Credit Card Invoices due this month.
*   **Balance:** `Income - Expenses`. This is your actual "Net" for the month.
*   **Drill-down:** Click into any month to see the breakdown.

### 💳 Credit Card Invoices
A dedicated view for managing credit debt.
*   **Invoice Detail:** See every transaction inside a specific invoice.
*   **Payment Tracking:** Mark an entire invoice as paid.
*   **Status:** See open, closed, and overdue invoices.

### 📅 Smart Date Handling
*   **Billing Cycles:** Configurable "Closing Day" and "Due Day" per card.
*   **Best Buy Date:** Implicitly helps you understand the best day to buy to push payment 40 days forward.

---

## 👤 User Personas

*   **The Planner:** Needs to see if they can afford a vacation in December based on current installment commitments ending in November.
*   **The Heavy Card User:** Uses credit cards for everything to get points, but needs to ensure they have the cash to pay the full bill at the end of the month.
*   **The Subscriber:** Has 15 different small subscriptions and needs to ensure they don't lose track of the total monthly drain.

## 📋 User Workflows

### Adding a Transaction
1. User selects transaction type (income/expense)
2. Enters amount, date, and category
3. Selects payment method (cash, debit, credit)
4. If credit card selected, assigns to specific card
5. Optionally sets installments or recurrence

### Viewing Monthly Summary
1. User selects month to view
2. System aggregates all non-credit transactions for the month
3. System calculates credit card statements due in that month
4. System presents income, expenses, and balance

### Managing Credit Card Statement
1. User views credit card statement for specific month
2. System calculates transactions belonging to that statement period
3. User can mark entire statement as paid
4. System updates payment status of all transactions in the statement

## 📊 Business Rules

*   **Transaction Categorization:** Every transaction must belong to a category
*   **Credit Card Billing:** Transactions are assigned to statements based on card's closing day
*   **Installment Generation:** When installments are specified, all installment transactions are created simultaneously
*   **Recurrence Projection:** Recurring transactions are projected into the future until end date
*   **Payment Status:** Individual transactions and entire statements can be marked as paid

## ⚡ Non-Functional Requirements

*   **Performance:** Monthly summaries should load within 2 seconds
*   **Security:** All API requests must be authenticated with API key
*   **Usability:** Common operations should require no more than 3 clicks
*   **Reliability:** System should be available 99.9% of the time
*   **Scalability:** Should handle up to 10,000 transactions per user

## 🔮 Product Vision

To become the definitive personal finance management platform that handles the complexity of modern financial life, helping users make informed decisions about their financial future by providing accurate projections and insights based on their spending patterns and commitments.

## 🔮 Future Roadmap Items (Out of Scope for V1)
*   **Multi-User/Family Sharing**
*   **Bank Integration (Open Finance)**
*   **Investment Tracking**
*   **Budget Goals & Limits**
