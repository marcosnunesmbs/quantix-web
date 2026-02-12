# API Contracts: Quantix Finance Dashboard

## Base API Configuration

All API requests require:
- Base URL: Configurable via environment variables
- Headers: `API-KEY` header with authentication token
- Content-Type: `application/json` for POST/PUT/PATCH requests

## Endpoints

### Categories

#### GET /categories
**Purpose**: Retrieve all categories
**Authentication**: Required
**Response**: Array of Category objects
**Success Code**: 200
**Error Codes**: 401 (Unauthorized)

#### POST /categories
**Purpose**: Create a new category
**Authentication**: Required
**Request Body**: 
```json
{
  "name": "string",
  "type": "INCOME|EXPENSE"
}
```
**Response**: Created Category object
**Success Code**: 201
**Error Codes**: 400 (Invalid input), 401 (Unauthorized)

#### DELETE /categories/{id}
**Purpose**: Delete a category
**Authentication**: Required
**Parameters**: Category ID in path
**Success Code**: 200
**Error Codes**: 401 (Unauthorized), 404 (Not found)

### Transactions

#### GET /transactions
**Purpose**: Retrieve all transactions
**Authentication**: Required
**Query Parameters**: 
- `month`: Optional, format YYYY-MM
**Response**: Array of Transaction objects
**Success Code**: 200
**Error Codes**: 401 (Unauthorized)

#### POST /transactions
**Purpose**: Create a new transaction
**Authentication**: Required
**Request Body**: 
```json
{
  "type": "INCOME|EXPENSE",
  "name": "string",
  "amount": "number",
  "date": "string (YYYY-MM-DD)",
  "categoryId": "string (optional)",
  "paymentMethod": "CASH|PIX|DEBIT|CREDIT (optional)",
  "creditCardId": "string (optional)",
  "accountId": "string (optional)",
  "installments": "number (optional)",
  "targetDueMonth": "string (optional, YYYY-MM)",
  "recurrence": {
    "frequency": "MONTHLY|WEEKLY|YEARLY",
    "interval": "number (optional)",
    "endDate": "string (optional, YYYY-MM-DD)"
  }
}
```
**Response**: Created Transaction object
**Success Code**: 201
**Error Codes**: 400 (Invalid input), 401 (Unauthorized)

#### PATCH /transactions/{id}/pay
**Purpose**: Mark a transaction as paid/received
**Authentication**: Required
**Parameters**: Transaction ID in path
**Response**: Updated Transaction object
**Success Code**: 200
**Error Codes**: 401 (Unauthorized), 404 (Not found)

#### DELETE /transactions/{id}
**Purpose**: Delete a transaction
**Authentication**: Required
**Parameters**: Transaction ID in path
**Success Code**: 200
**Error Codes**: 401 (Unauthorized), 404 (Not found)

### Accounts

#### GET /accounts
**Purpose**: Retrieve all accounts
**Authentication**: Required
**Response**: Array of Account objects
**Success Code**: 200
**Error Codes**: 401 (Unauthorized)

#### POST /accounts
**Purpose**: Create a new account
**Authentication**: Required
**Request Body**: 
```json
{
  "name": "string",
  "type": "BANK_ACCOUNT|WALLET|SAVINGS_ACCOUNT|INVESTMENT_ACCOUNT|OTHER",
  "initialBalance": "number"
}
```
**Response**: Created Account object
**Success Code**: 201
**Error Codes**: 400 (Invalid input), 401 (Unauthorized)

#### GET /accounts/{id}
**Purpose**: Retrieve a specific account
**Authentication**: Required
**Parameters**: Account ID in path
**Response**: Account object
**Success Code**: 200
**Error Codes**: 401 (Unauthorized), 404 (Not found)

#### PATCH /accounts/{id}
**Purpose**: Update an account
**Authentication**: Required
**Parameters**: Account ID in path
**Request Body**: 
```json
{
  "name": "string (optional)",
  "type": "BANK_ACCOUNT|WALLET|SAVINGS_ACCOUNT|INVESTMENT_ACCOUNT|OTHER (optional)"
}
```
**Response**: Updated Account object
**Success Code**: 200
**Error Codes**: 400 (Invalid input), 401 (Unauthorized), 404 (Not found)

#### DELETE /accounts/{id}
**Purpose**: Delete an account
**Authentication**: Required
**Parameters**: Account ID in path
**Success Code**: 204
**Error Codes**: 401 (Unauthorized), 404 (Not found), 409 (Conflict - has associated transactions)

#### GET /accounts/{id}/balance
**Purpose**: Get current balance for an account
**Authentication**: Required
**Parameters**: Account ID in path
**Response**: AccountBalance object
**Success Code**: 200
**Error Codes**: 401 (Unauthorized), 404 (Not found)

#### GET /accounts/{id}/transactions
**Purpose**: Get all transactions linked to an account
**Authentication**: Required
**Parameters**: Account ID in path
**Response**: Array of Transaction objects
**Success Code**: 200
**Error Codes**: 401 (Unauthorized), 404 (Not found)

### Credit Cards

#### GET /credit-cards
**Purpose**: Retrieve all credit cards
**Authentication**: Required
**Response**: Array of CreditCard objects
**Success Code**: 200
**Error Codes**: 401 (Unauthorized)

#### POST /credit-cards
**Purpose**: Create a new credit card
**Authentication**: Required
**Request Body**: 
```json
{
  "name": "string",
  "brand": "string (optional)",
  "limitAmount": "number",
  "closingDay": "number (1-31)",
  "dueDay": "number (1-31)"
}
```
**Response**: Created CreditCard object
**Success Code**: 201
**Error Codes**: 400 (Invalid input), 401 (Unauthorized)

#### GET /credit-cards/{id}/statement
**Purpose**: Get credit card statement for a specific month
**Authentication**: Required
**Parameters**: 
- Credit card ID in path
- Month as query parameter (YYYY-MM format)
**Response**: Statement object
**Success Code**: 200
**Error Codes**: 401 (Unauthorized), 404 (Not found)

#### POST /credit-cards/{id}/pay-statement
**Purpose**: Mark all transactions in a credit card statement as paid
**Authentication**: Required
**Parameters**: 
- Credit card ID in path
- Request Body:
```json
{
  "month": "string (YYYY-MM format)",
  "paymentAccountId": "string (ID of the account to debit for the payment)"
}
```
**Response**: Success message object with payment details
**Success Code**: 200
**Error Codes**: 400 (Invalid input), 401 (Unauthorized), 404 (Credit card or statement not found)

### Summary

#### GET /summary
**Purpose**: Get monthly financial summary
**Authentication**: Required
**Query Parameters**: 
- Month as query parameter (YYYY-MM format)
**Response**: Summary object
**Success Code**: 200
**Error Codes**: 401 (Unauthorized)