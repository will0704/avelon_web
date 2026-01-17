# Avelon: Complete Project Overview - Part 6 of 6 (Final)

## 15. Database Schema

### 15.1 Complete Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum UserRole {
  ADMIN
  BORROWER
}

enum UserStatus {
  REGISTERED        // Email not verified
  VERIFIED          // Email verified, no wallet
  CONNECTED         // Wallet connected, no KYC
  PENDING_KYC       // KYC submitted, awaiting review
  APPROVED          // KYC approved, can borrow
  REJECTED          // KYC rejected
  SUSPENDED         // Account suspended
}

enum KYCLevel {
  NONE
  BASIC             // Government ID only
  STANDARD          // ID + Proof of Income
  ENHANCED          // ID + Income + Address
}

enum DocumentType {
  GOVERNMENT_ID
  PROOF_OF_INCOME
  PROOF_OF_ADDRESS
  SELFIE
}

enum DocumentStatus {
  PENDING
  APPROVED
  REJECTED
}

enum LoanStatus {
  PENDING_COLLATERAL
  COLLATERAL_DEPOSITED
  ACTIVE
  REPAID
  LIQUIDATED
  CANCELLED
  EXPIRED
}

enum TransactionType {
  COLLATERAL_DEPOSIT
  LOAN_DISBURSEMENT
  REPAYMENT
  COLLATERAL_TOPUP
  COLLATERAL_RETURN
  LIQUIDATION
  FEE_PAYMENT
}

enum NotificationType {
  EMAIL_VERIFICATION
  KYC_APPROVED
  KYC_REJECTED
  LOAN_CREATED
  COLLATERAL_DEPOSITED
  LOAN_DISBURSED
  REPAYMENT_REMINDER
  REPAYMENT_RECEIVED
  COLLATERAL_WARNING
  LIQUIDATION_WARNING
  LOAN_LIQUIDATED
  LOAN_REPAID
  LOAN_EXTENDED
  SYSTEM_ANNOUNCEMENT
}

enum InterestType {
  FLAT
  COMPOUND
}

// ==================== MODELS ====================

model User {
  id                    String        @id @default(cuid())
  email                 String        @unique
  emailVerified         DateTime? 
  passwordHash          String? 
  name                  String? 
  phone                 String? 
  avatar                String?
  role                  UserRole      @default(BORROWER)
  status                UserStatus    @default(REGISTERED)
  
  // KYC
  kycLevel              KYCLevel      @default(NONE)
  kycSubmittedAt        DateTime? 
  kycApprovedAt         DateTime?
  kycRejectionReason    String? 
  
  // Credit Score
  creditScore           Int?           // 0-100
  creditTier            String?       // BASIC, STANDARD, PREMIUM, VIP
  
  // Extracted KYC Data (from AI)
  legalName             String? 
  birthDate             DateTime?
  address               String?
  monthlyIncome         Decimal?
  employmentType        String?
  
  // Statistics
  totalBorrowed         Decimal       @default(0)
  totalRepaid           Decimal       @default(0)
  activeLoansCount      Int           @default(0)
  completedLoansCount   Int           @default(0)
  defaultCount          Int           @default(0)
  
  // Timestamps
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  lastLoginAt           DateTime? 
  
  // Relations
  accounts              Account[]
  sessions              Session[]
  wallets               Wallet[]
  documents             Document[]
  loans                 Loan[]
  notifications         Notification[]
  notificationPrefs     NotificationPreference? 
  deviceTokens          DeviceToken[]
  auditLogs             AuditLog[]
  
  @@index([email])
  @@index([status])
  @@index([creditScore])
}

model Account {
  id                    String    @id @default(cuid())
  userId                String
  type                  String    // oauth, email, credentials
  provider              String    // google, github, credentials
  providerAccountId     String
  refresh_token         String? 
  access_token          String? 
  expires_at            Int? 
  token_type            String?
  scope                 String? 
  id_token              String? 
  
  user                  User      @relation(fields:  [userId], references:  [id], onDelete: Cascade)
  
  createdAt             DateTime  @default(now())
  
  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id                    String    @id @default(cuid())
  sessionToken          String    @unique
  userId                String
  expires               DateTime
  ipAddress             String? 
  userAgent             String?
  
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt             DateTime  @default(now())
  
  @@index([userId])
}

model VerificationToken {
  identifier            String
  token                 String    @unique
  expires               DateTime
  type                  String    // EMAIL_VERIFICATION, PASSWORD_RESET
  
  createdAt             DateTime  @default(now())
  
  @@unique([identifier, token])
}

model Wallet {
  id                    String    @id @default(cuid())
  userId                String
  address               String    @unique
  chainId               Int       @default(1337) // 1337 = Ganache, 1 = Mainnet
  isPrimary             Boolean   @default(false)
  isVerified            Boolean   @default(false)
  verifiedAt            DateTime? 
  label                 String?   // User-defined label
  
  user                  User      @relation(fields:  [userId], references:  [id], onDelete: Cascade)
  loans                 Loan[]
  
  createdAt             DateTime  @default(now())
  lastUsedAt            DateTime  @default(now())
  
  @@unique([userId, address])
  @@index([address])
  @@index([userId])
}

model Document {
  id                    String          @id @default(cuid())
  userId                String
  type                  DocumentType
  status                DocumentStatus  @default(PENDING)
  
  // File Info
  fileName              String
  fileSize              Int
  mimeType              String
  storagePath           String          // Encrypted file path
  
  // AI Verification Results
  aiVerified            Boolean         @default(false)
  aiConfidence          Float?           // 0-1 confidence score
  aiExtractedData       Json?           // Extracted fields
  aiFraudScore          Float?           // 0-1 fraud probability
  aiFraudFlags          String[]        // List of fraud indicators
  
  // Manual Review
  reviewedBy            String?          // Admin ID
  reviewedAt            DateTime? 
  rejectionReason       String?
  
  // Timestamps
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  expiresAt             DateTime?       // Document expiry date
  
  user                  User            @relation(fields:  [userId], references:  [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([type])
  @@index([status])
}

model LoanPlan {
  id                    String        @id @default(cuid())
  name                  String        @unique
  description           String? 
  
  // Eligibility
  minCreditScore        Int           // Minimum score required
  
  // Loan Terms
  minAmount             Decimal       // Minimum loan (ETH)
  maxAmount             Decimal       // Maximum loan (ETH)
  durationOptions       Int[]         // Available durations in days
  interestRate          Float         // Interest rate percentage
  interestType          InterestType  @default(FLAT)
  
  // Collateral
  collateralRatio       Float         // e.g., 150 = 150%
  
  // Fees
  originationFee        Float         // Percentage
  latePenaltyRate       Float         @default(0.5) // Daily percentage
  gracePeriodDays       Int           @default(3)
  
  // Extension (VIP only)
  extensionAllowed      Boolean       @default(false)
  maxExtensionDays      Int           @default(0)
  extensionFee          Float         @default(0) // Percentage
  
  // Status
  isActive              Boolean       @default(true)
  
  // Metadata
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  createdBy             String        // Admin ID
  
  loans                 Loan[]
  
  @@index([isActive])
  @@index([minCreditScore])
}

model Loan {
  id                    String        @id @default(cuid())
  
  // References
  userId                String
  walletId              String
  planId                String
  
  // Blockchain
  contractAddress       String?        @unique
  contractLoanId        Int?          // ID within smart contract
  
  // Loan Details
  principal             Decimal       // Original loan amount (ETH)
  collateralRequired    Decimal       // Required collateral (ETH)
  collateralDeposited   Decimal       @default(0) // Actual deposited
  duration              Int           // Duration in days
  interestRate          Float         // Snapshot of rate at creation
  originationFee        Decimal       // Actual fee amount
  
  // Outstanding Amounts
  principalOwed         Decimal       // Remaining principal
  interestOwed          Decimal       @default(0) // Accrued interest
  feesOwed              Decimal       @default(0) // Late fees, etc.
  
  // Status & Dates
  status                LoanStatus    @default(PENDING_COLLATERAL)
  createdAt             DateTime      @default(now())
  collateralDepositedAt DateTime? 
  disbursedAt           DateTime?
  dueDate               DateTime? 
  repaidAt              DateTime? 
  liquidatedAt          DateTime? 
  
  // Extension
  extended              Boolean       @default(false)
  originalDueDate       DateTime? 
  extensionFee          Decimal? 
  
  // Risk Metrics (at time of approval)
  creditScoreSnapshot   Int           // User's score when loan created
  ethPriceSnapshot      Decimal       // ETH/PHP rate when loan created
  
  // Relations
  user                  User          @relation(fields: [userId], references: [id])
  wallet                Wallet        @relation(fields: [walletId], references: [id])
  plan                  LoanPlan      @relation(fields: [planId], references: [id])
  transactions          LoanTransaction[]
  
  @@index([userId])
  @@index([status])
  @@index([dueDate])
}

model LoanTransaction {
  id                    String            @id @default(cuid())
  loanId                String
  type                  TransactionType
  
  // Amounts
  amount                Decimal           // ETH amount
  amountPHP             Decimal?           // PHP equivalent at time
  ethPrice              Decimal?           // ETH/PHP rate used
  
  // Blockchain
  txHash                String?           @unique
  blockNumber           Int?
  gasUsed               Decimal?
  
  // Status
  confirmed             Boolean           @default(false)
  confirmedAt           DateTime? 
  
  // Metadata
  note                  String?
  createdAt             DateTime          @default(now())
  
  loan                  Loan              @relation(fields:  [loanId], references: [id])
  
  @@index([loanId])
  @@index([txHash])
  @@index([type])
}

model Notification {
  id                    String              @id @default(cuid())
  userId                String
  type                  NotificationType
  
  // Content
  title                 String
  message               String
  metadata              Json?               // Additional data
  
  // Status
  isRead                Boolean             @default(false)
  readAt                DateTime? 
  
  // Delivery
  emailSent             Boolean             @default(false)
  emailSentAt           DateTime? 
  pushSent              Boolean             @default(false)
  pushSentAt            DateTime? 
  
  createdAt             DateTime            @default(now())
  
  user                  User                @relation(fields:  [userId], references:  [id], onDelete: Cascade)
  
  @@index([userId, isRead])
  @@index([createdAt])
}

model NotificationPreference {
  id                    String    @id @default(cuid())
  userId                String    @unique
  
  // Email Preferences
  emailLoanUpdates      Boolean   @default(true)
  emailRepaymentReminders Boolean @default(true)
  emailLiquidationAlerts Boolean  @default(true)
  emailMarketingNews    Boolean   @default(false)
  
  // Push Preferences
  pushLoanUpdates       Boolean   @default(true)
  pushRepaymentReminders Boolean  @default(true)
  pushLiquidationAlerts Boolean   @default(true)
  
  updatedAt             DateTime  @updatedAt
  
  user                  User      @relation(fields: [userId], references: [id], onDelete:  Cascade)
}

model DeviceToken {
  id                    String    @id @default(cuid())
  userId                String
  token                 String    @unique
  platform              String    // IOS, ANDROID, WEB
  isActive              Boolean   @default(true)
  
  createdAt             DateTime  @default(now())
  lastUsedAt            DateTime  @default(now())
  
  user                  User      @relation(fields: [userId], references: [id], onDelete:  Cascade)
  
  @@index([userId])
}

model PriceHistory {
  id                    String    @id @default(cuid())
  ethPricePHP           Decimal   // ETH price in PHP
  source                String    // manual, chainlink, coingecko
  
  createdAt             DateTime  @default(now())
  
  @@index([createdAt])
}

model AuditLog {
  id                    String    @id @default(cuid())
  userId                String? 
  action                String    // LOGIN, KYC_SUBMIT, LOAN_CREATE, etc.
  entity                String?    // User, Loan, Document, etc.
  entityId              String?
  
  // Details
  ipAddress             String?
  userAgent             String? 
  metadata              Json?     // Additional context
  
  createdAt             DateTime  @default(now())
  
  user                  User?      @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

model SystemConfig {
  id                    String    @id @default(cuid())
  key                   String    @unique
  value                 String
  description           String?
  
  updatedAt             DateTime  @updatedAt
  updatedBy             String?    // Admin ID
}
```

---

## 16. API Specification

### 16.1 API Structure

```
BASE URL: /api/v1

AUTHENTICATION:
├─ POST   /auth/register              # Register new user
├─ POST   /auth/login                 # Email/password login
├─ POST   /auth/logout                # End session
├─ POST   /auth/verify-email          # Verify email token
├─ POST   /auth/forgot-password       # Request password reset
├─ POST   /auth/reset-password        # Reset password with token
├─ GET    /auth/session               # Get current session
└─ POST   /auth/refresh               # Refresh access token

USERS: 
├─ GET    /users/me                   # Get current user profile
├─ PUT    /users/me                   # Update profile
├─ GET    /users/me/stats             # Get user statistics
└─ DELETE /users/me                   # Delete account

WALLETS: 
├─ GET    /wallets                    # List user's wallets
├─ POST   /wallets/connect            # Initiate wallet connection
├─ POST   /wallets/verify             # Verify wallet signature
├─ PUT    /wallets/: id/primary        # Set as primary wallet
└─ DELETE /wallets/:id                # Remove wallet

KYC:
├─ GET    /kyc/status                 # Get KYC status
├─ POST   /kyc/documents              # Upload document
├─ GET    /kyc/documents              # List uploaded documents
├─ DELETE /kyc/documents/:id          # Delete document
└─ POST   /kyc/submit                 # Submit for verification

LOAN PLANS:
├─ GET    /plans                      # List available plans (for user's tier)
└─ GET    /plans/:id                  # Get plan details

LOANS:
├─ GET    /loans                      # List user's loans
├─ POST   /loans                      # Create loan application
├─ GET    /loans/:id                  # Get loan details
├─ POST   /loans/: id/collateral       # Record collateral deposit
├─ POST   /loans/:id/repay            # Record repayment
├─ POST   /loans/:id/add-collateral   # Record collateral top-up
├─ POST   /loans/:id/extend           # Request extension (VIP)
├─ DELETE /loans/:id                  # Cancel loan (before collateral)
└─ GET    /loans/:id/transactions     # Get loan transactions

MARKET: 
├─ GET    /market/price               # Get current ETH/PHP price
└─ GET    /market/price/history       # Get price history

NOTIFICATIONS:
├─ GET    /notifications              # List notifications
├─ PUT    /notifications/:id/read     # Mark as read
├─ PUT    /notifications/read-all     # Mark all as read
├─ GET    /notifications/preferences  # Get preferences
└─ PUT    /notifications/preferences  # Update preferences

ADMIN ROUTES (requires admin role):
├─ GET    /admin/users                # List all users
├─ GET    /admin/users/:id            # Get user details
├─ PUT    /admin/users/:id/status     # Update user status
├─ GET    /admin/loans                # List all loans
├─ GET    /admin/loans/:id            # Get loan details
├─ POST   /admin/loans/:id/liquidate  # Manual liquidation
├─ GET    /admin/plans                # List all plans
├─ POST   /admin/plans                # Create plan
├─ PUT    /admin/plans/:id            # Update plan
├─ DELETE /admin/plans/:id            # Deactivate plan
├─ GET    /admin/kyc/pending          # List pending KYC
├─ PUT    /admin/kyc/: userId/approve  # Approve KYC
├─ PUT    /admin/kyc/:userId/reject   # Reject KYC
├─ GET    /admin/treasury             # Get treasury balance
├─ POST   /admin/price                # Update ETH/PHP price (demo)
├─ GET    /admin/analytics            # Get platform analytics
└─ GET    /admin/audit-logs           # Get audit logs
```

### 16.2 Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ...  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages":  5
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code":  "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 16.3 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized for this action |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `BLOCKCHAIN_ERROR` | 502 | Blockchain interaction failed |
| `AI_SERVICE_ERROR` | 502 | AI service unavailable |

### 16.4 Example API Implementations

```typescript
// src/routes/loan. routes.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { LoanService } from '../services/loan.service';

const loanRoutes = new Hono();
const loanService = new LoanService();

// Create loan application schema
const createLoanSchema = z.object({
  planId: z.string(),
  amount: z.string(), // ETH amount as string
  duration: z.number().int().positive(),
  walletId: z. string()
});

// List user's loans
loanRoutes.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const loans = await loanService.getUserLoans(userId);
  
  return c.json({
    success: true,
    data:  loans
  });
});

// Create loan application
loanRoutes. post(
  '/',
  authMiddleware,
  zValidator('json', createLoanSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req. valid('json');
    
    const loan = await loanService. createLoan({
      userId,
      planId: body.planId,
      amount: body.amount,
      duration: body.duration,
      walletId: body.walletId
    });
    
    return c.json({
      success: true,
      data: loan
    }, 201);
  }
);

// Get loan details
loanRoutes.get('/:id', authMiddleware, async (c) => {
  const userId = c. get('userId');
  const loanId = c. req.param('id');
  
  const loan = await loanService.getLoanById(loanId, userId);
  
  if (!loan) {
    return c.json({
      success:  false,
      error: { code: 'NOT_FOUND', message: 'Loan not found' }
    }, 404);
  }
  
  return c.json({
    success: true,
    data: loan
  });
});

// Make repayment
loanRoutes.post('/:id/repay', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const loanId = c.req.param('id');
  const { amount, txHash } = await c.req.json();
  
  const result = await loanService.recordRepayment({
    loanId,
    userId,
    amount,
    txHash
  });
  
  return c.json({
    success:  true,
    data: result
  });
});

export { loanRoutes };
```

---

## 17. Development Roadmap

### 17.1 Phase Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   DEVELOPMENT TIMELINE                       │
│                      (14 Weeks Total)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PHASE 1: Foundation (Weeks 1-2)                            │
│  ├─ Project setup, database, authentication                │
│  └─ Deliverable: Users can register and login              │
│                                                             │
│  PHASE 2: Smart Contracts (Weeks 3-4)                       │
│  ├─ Solidity contracts, Hardhat setup, Ganache             │
│  └─ Deliverable: Contracts deployed on local blockchain    │
│                                                             │
│  PHASE 3: AI Model (Weeks 3-5)                              │
│  ├─ Document classifier, OCR, credit scorer                │
│  └─ Deliverable: AI service verifying documents            │
│                                                             │
│  PHASE 4: Backend API (Weeks 5-7)                           │
│  ├─ All API endpoints, blockchain integration              │
│  └─ Deliverable: Complete API with Swagger docs            │
│                                                             │
│  PHASE 5: Web Frontend (Weeks 6-8)                          │
│  ├─ All pages, wallet connection, loan management          │
│  └─ Deliverable:  Functional web application                │
│                                                             │
│  PHASE 6: Mobile App (Weeks 8-10)                           │
│  ├─ React Native app, push notifications                   │
│  └─ Deliverable:  Functional mobile application             │
│                                                             │
│  PHASE 7: Integration & Testing (Weeks 10-12)               │
│  ├─ End-to-end testing, bug fixes                          │
│  └─ Deliverable:  Stable, tested platform                   │
│                                                             │
│  PHASE 8: Documentation & Demo (Weeks 12-14)                │
│  ├─ Technical docs, user guides, demo preparation          │
│  └─ Deliverable: Complete project ready for presentation   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 17.2 Detailed Weekly Breakdown

#### Phase 1: Foundation (Weeks 1-2)

**Week 1:**
- [ ] Initialize all 5 repositories
- [ ] Set up avelon_types with base types, publish to GitHub Packages
- [ ] Set up avelon_backend with Hono + TypeScript
- [ ] Configure Docker Compose (PostgreSQL, Redis, Ganache)
- [ ] Set up Prisma schema and run initial migrations
- [ ] Implement user registration endpoint
- [ ] Set up Resend for email service
- [ ] Implement email verification flow

**Week 2:**
- [ ] Implement login/logout endpoints
- [ ] Set up JWT authentication middleware
- [ ] Implement password reset flow
- [ ] Set up avelon_web with Next.js 14
- [ ] Create authentication pages (login, register, verify)
- [ ] Implement wallet connection (Wagmi + RainbowKit)
- [ ] Implement wallet signature verification
- [ ] Connect frontend to backend API

**Deliverables Week 2:**
- ✅ Users can register with email
- ✅ Email verification working
- ✅ Users can login/logout
- ✅ Users can connect and verify wallet

---

#### Phase 2: Smart Contracts (Weeks 3-4)

**Week 3:**
- [ ] Set up Hardhat project in avelon_backend/contracts
- [ ] Configure Ganache integration
- [ ] Implement AccessControl. sol
- [ ] Implement Treasury.sol with deposit/withdraw
- [ ] Implement PriceOracle.sol (admin-controlled)
- [ ] Write unit tests for above contracts

**Week 4:**
- [ ] Implement LoanManager.sol (core logic)
- [ ] Implement loan creation and collateral deposit
- [ ] Implement repayment logic
- [ ] Implement liquidation logic
- [ ] Implement AvelonCore.sol (main entry)
- [ ] Complete unit tests (target: 100% coverage)
- [ ] Create deployment scripts
- [ ] Deploy to local Ganache

**Deliverables Week 4:**
- ✅ All smart contracts implemented
- ✅ 100% test coverage
- ✅ Contracts deployed on Ganache
- ✅ Contract ABIs exported

---

#### Phase 3: AI Model (Weeks 3-5)

**Week 3 (parallel with contracts):**
- [ ] Set up avelon_llm with FastAPI
- [ ] Configure Docker for AI service
- [ ] Implement health check endpoint
- [ ] Set up Tesseract OCR
- [ ] Implement basic text extraction
- [ ] Create document upload endpoint

**Week 4:**
- [ ] Collect/create training data (synthetic documents)
- [ ] Set up Google Colab notebook for training
- [ ] Train document classifier (ResNet-18)
- [ ] Implement document classification service
- [ ] Train NER model for data extraction

**Week 5:**
- [ ] Implement fraud detection (rule-based + CNN)
- [ ] Implement credit scoring algorithm
- [ ] Create complete verification pipeline
- [ ] Integrate all AI services
- [ ] Test with sample documents
- [ ] Performance optimization

**Deliverables Week 5:**
- ✅ AI microservice running
- ✅ Document verification working
- ✅ Credit scoring functional
- ✅ 85%+ classification accuracy

---

#### Phase 4: Backend API (Weeks 5-7)

**Week 5 (continued):**
- [ ] Implement LoanPlan CRUD (admin)
- [ ] Implement loan application endpoint
- [ ] Implement KYC document upload
- [ ] Connect backend to AI service

**Week 6:**
- [ ] Implement blockchain service (Ethers.js)
- [ ] Implement loan lifecycle endpoints
- [ ] Implement transaction recording
- [ ] Implement collateral ratio calculations
- [ ] Set up real-time price updates

**Week 7:**
- [ ] Implement notification system (email + in-app)
- [ ] Implement liquidation bot (background job)
- [ ] Implement admin dashboard APIs
- [ ] Implement analytics endpoints
- [ ] Create OpenAPI documentation
- [ ] Load testing

**Deliverables Week 7:**
- ✅ Complete REST API
- ✅ Liquidation bot running
- ✅ OpenAPI documentation
- ✅ All endpoints tested

---

#### Phase 5: Web Frontend (Weeks 6-8)

**Week 6 (parallel with backend):**
- [ ] Create landing page with Framer Motion animations
- [ ] Style authentication pages
- [ ] Create onboarding flow UI
- [ ] Implement KYC document upload interface

**Week 7:**
- [ ] Create borrower dashboard
- [ ] Implement loan application flow
- [ ] Create active loan management page
- [ ] Implement repayment interface
- [ ] Create collateral management UI

**Week 8:**
- [ ] Create admin dashboard
- [ ] Implement user management (admin)
- [ ] Implement loan plan management (admin)
- [ ] Create KYC review interface (admin)
- [ ] Implement analytics dashboard
- [ ] Create notification center
- [ ] Create settings pages
- [ ] Responsive design review

**Deliverables Week 8:**
- ✅ Complete web application
- ✅ All pages functional
- ✅ Responsive design
- ✅ Admin dashboard complete

---

#### Phase 6: Mobile App (Weeks 8-10)

**Week 8 (parallel with web):**
- [ ] Set up avelon_mobile with React Native
- [ ] Configure navigation structure
- [ ] Create authentication screens
- [ ] Implement biometric login

**Week 9:**
- [ ] Create dashboard screen
- [ ] Implement loan list and details
- [ ] Create repayment screen
- [ ] Integrate WalletConnect
- [ ] Set up Firebase Cloud Messaging

**Week 10:**
- [ ] Create notification center
- [ ] Implement settings screens
- [ ] Polish UI and animations
- [ ] Test on iOS simulator
- [ ] Test on Android emulator

**Deliverables Week 10:**
- ✅ Functional iOS app
- ✅ Functional Android app
- ✅ Push notifications working
- ✅ WalletConnect working

---

#### Phase 7: Integration & Testing (Weeks 10-12)

**Week 10 (continued):**
- [ ] Create end-to-end test scenarios
- [ ] Test complete user journeys
- [ ] Cross-platform testing

**Week 11:**
- [ ] Bug fixes from testing
- [ ] Performance optimization
- [ ] Security review
- [ ] Smart contract audit (internal)

**Week 12:**
- [ ] Final bug fixes
- [ ] UI/UX polish
- [ ] Error message improvements
- [ ] Loading state improvements

**Deliverables Week 12:**
- ✅ Stable, tested platform
- ✅ All major bugs fixed
- ✅ Performance optimized

---

#### Phase 8: Documentation & Demo (Weeks 12-14)

**Week 12 (continued):**
- [ ] Write technical architecture document
- [ ] Finalize API documentation
- [ ] Write smart contract documentation

**Week 13:**
- [ ] Create user guide (borrower)
- [ ] Create admin guide
- [ ] Record video tutorials
- [ ] Prepare demo script

**Week 14:**
- [ ] Set up demo environment
- [ ] Prepare sample data
- [ ] Create presentation slides
- [ ] Final review and rehearsal

**Deliverables Week 14:**
- ✅ Complete documentation
- ✅ Demo-ready environment
- ✅ Presentation materials
- ✅ Project ready for defense

---

## 18. Demo Scope & Limitations

### 18.1 What Will Be Functional

| Feature | Status | Notes |
|---------|--------|-------|
| User Registration | ✅ Full | Email verification working |
| User Login | ✅ Full | Session management, JWT |
| Wallet Connection | ✅ Full | MetaMask, signature verification |
| Document Upload | ✅ Full | File upload, storage |
| AI Verification | ✅ Demo | Works with training data |
| Credit Scoring | ✅ Full | Algorithm implemented |
| Loan Plans | ✅ Full | Admin CRUD operations |
| Loan Application | ✅ Full | End-to-end flow |
| Collateral Deposit | ✅ Full | Smart contract interaction |
| Loan Disbursement | ✅ Full | Treasury to borrower |
| Repayment | ✅ Full | Partial and full |
| Collateral Top-Up | ✅ Full | Add more collateral |
| Liquidation | ✅ Full | Automated bot |
| Email Notifications | ✅ Full | All loan events |
| Push Notifications | ✅ Full | Mobile app |
| Admin Dashboard | ✅ Full | All management features |
| Mobile App | ✅ Full | iOS and Android |

### 18.2 What Will Be Simulated/Mocked

| Feature | Simulation Method |
|---------|-------------------|
| **ETH/PHP Price** | Admin manually sets price (no live oracle) |
| **Real Documents** | Using synthetic/sample documents |
| **Real ETH** | Using Ganache test ETH (no real value) |
| **Production AI** | Demo-grade model, not production accuracy |
| **Email Delivery** | Resend free tier or console logging |
| **Push Delivery** | FCM test environment |

### 18.3 Limitations

| Limitation | Reason | Future Enhancement |
|------------|--------|-------------------|
| No real money | Demo/capstone scope | Mainnet deployment |
| Mock price oracle | Simplified demo | Chainlink integration |
| Limited AI training data | Demo scope | Production dataset |
| No 2FA | Time constraints | TOTP implementation |
| No social login | Focus on core features | OAuth providers |
| Single chain | Demo simplicity | Multi-chain support |
| No wallet recovery | Security model choice | Social recovery |

### 18.4 Demo Scenario (15 minutes)

```
1.  INTRODUCTION (2 min)
   - Show landing page
   - Explain Avelon concept

2. USER REGISTRATION (2 min)
   - Register new account
   - Verify email (show email received)
   - Login

3. WALLET & KYC (3 min)
   - Connect MetaMask
   - Sign verification message
   - Upload sample documents
   - Show AI processing
   - Display credit score and tier

4. LOAN APPLICATION (4 min)
   - Browse available loan plans
   - Select plan and amount
   - Show calculated terms (ETH + PHP display)
   - Deposit collateral (MetaMask transaction)
   - Show loan disbursement

5. LOAN MONITORING (2 min)
   - Show active loan dashboard
   - Display collateral ratio
   - Admin:  Change ETH price to trigger warning
   - Show notification received

6. REPAYMENT (2 min)
   - Make partial repayment
   - Make final repayment
   - Show collateral returned
   - Show loan marked as repaid

7. ADMIN FEATURES (Optional, if time permits)
   - Show admin dashboard
   - KYC approval queue
   - Loan analytics
```

---

## 19. Success Criteria

### 19.1 Technical Success Criteria

| Criteria | Target | Measurement |
|----------|--------|-------------|
| AI Document Classification | 85%+ accuracy | Test dataset evaluation |
| Smart Contract Coverage | 100% | Hardhat coverage report |
| API Response Time | <500ms (p95) | Load testing |
| Web Page Load | <3s | Lighthouse score |
| Mobile App Launch | <2s | Manual testing |
| Zero Critical Bugs | 0 | QA testing |
| Zero Security Vulnerabilities | 0 (critical/high) | Security review |

### 19.2 Functional Success Criteria

| Criteria | Verification |
|----------|--------------|
| User can complete registration flow | End-to-end test |
| User can verify documents via AI | Demo with sample docs |
| User can apply for and receive loan | Full loan lifecycle test |
| User can make repayments | Transaction verification |
| Liquidation triggers correctly | Simulate low ratio |
| Notifications delivered | Email and push testing |
| Admin can manage platform | Admin dashboard testing |
| Mobile app feature parity | Comparative testing |

### 19.3 Documentation Success Criteria

| Document | Completeness |
|----------|--------------|
| Technical Architecture | System diagrams, data flows |
| API Documentation | All endpoints, request/response |
| Smart Contract Docs | NatSpec comments, interfaces |
| User Guide | Step-by-step with screenshots |
| Admin Guide | All management functions |
| Deployment Guide | Local and demo setup |

---

## 20. Glossary

| Term | Definition |
|------|------------|
| **AML** | Anti-Money Laundering - regulations to prevent financial crimes |
| **Collateral** | ETH deposited by borrower to secure a loan |
| **Collateral Ratio** | (Collateral Value / Loan Value) × 100% |
| **Credit Score** | 0-100 rating of borrower creditworthiness |
| **DeFi** | Decentralized Finance |
| **ETH** | Ethereum cryptocurrency |
| **Ganache** | Local Ethereum blockchain for development |
| **Gas** | Fee paid for Ethereum transactions |
| **Hardhat** | Ethereum development framework |
| **KYC** | Know Your Customer - identity verification |
| **Liquidation** | Seizure of collateral when ratio falls below threshold |
| **NER** | Named Entity Recognition - extracting structured data from text |
| **OCR** | Optical Character Recognition - text extraction from images |
| **Oracle** | Service providing external data to blockchain |
| **Principal** | Original loan amount |
| **RA 10173** | Philippine Data Privacy Act of 2012 |
| **Smart Contract** | Self-executing code on blockchain |
| **Treasury** | Avelon's fund pool for lending |
| **Wallet** | Cryptocurrency storage (e.g., MetaMask) |
| **Web3** | Decentralized web technologies |

---

## 21. Appendices

### Appendix A: Environment Variables

```bash
# avelon_backend/.env. example

# Database
DATABASE_URL="postgresql://avelon: avelon_password@localhost:5432/avelon_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Email (Resend)
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="noreply@avelon.finance"

# Blockchain
GANACHE_URL="http://127.0.0.1:8545"
DEPLOYER_PRIVATE_KEY="0x..."
TREASURY_ADDRESS="0x..."
AVELON_CORE_ADDRESS="0x..."
LOAN_MANAGER_ADDRESS="0x..."
PRICE_ORACLE_ADDRESS="0x..."

# AI Service
AI_SERVICE_URL="http://localhost:8000"

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID="avelon-xxxxx"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@..."

# File Storage
STORAGE_PATH="./uploads"
ENCRYPTION_KEY="your-32-byte-encryption-key-here"

# App Config
ETH_PHP_RATE="150000"
MIN_COLLATERAL_RATIO="120"
WARNING_COLLATERAL_RATIO="130"
GRACE_PERIOD_HOURS="24"
LIQUIDATION_PENALTY_PERCENT="5"
```

```bash
# avelon_web/.env.local. example

NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Blockchain
NEXT_PUBLIC_CHAIN_ID="1337"
NEXT_PUBLIC_RPC_URL="http://127.0.0.1:8545"
NEXT_PUBLIC_AVELON_CORE_ADDRESS="0x..."
```

```bash
# avelon_llm/.env.example

# API
API_HOST="0.0.0.0"
API_PORT="8000"
DEBUG="true"

# Models
MODEL_PATH="./app/models"
CLASSIFIER_WEIGHTS="document_classifier/weights/classifier. pt"
NER_WEIGHTS="ner_extractor/weights/ner_model.pt"

# OCR
TESSERACT_CMD="/usr/bin/tesseract"
```

### Appendix B: Repository Setup Commands

```bash
# 1. Clone all repositories
git clone https://github.com/[your-org]/avelon_web.git
git clone https://github.com/[your-org]/avelon_mobile.git
git clone https://github.com/[your-org]/avelon_backend.git
git clone https://github.com/[your-org]/avelon_llm. git
git clone https://github.com/[your-org]/avelon_types.git

# 2. Setup avelon_types (publish first)
cd avelon_types
npm install
npm run build
npm publish  # To GitHub Packages

# 3. Setup avelon_backend
cd ../avelon_backend
npm install
cp .env.example . env
docker-compose up -d  # Start PostgreSQL, Redis, Ganache
npx prisma migrate dev
npx prisma db seed

# Deploy smart contracts
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network ganache
cd ..

npm run dev  # Start API server

# 4. Setup avelon_llm
cd ../avelon_llm
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env. example .env
uvicorn app.main:app --reload --port 8000

# 5. Setup avelon_web
cd ../avelon_web
npm install
cp .env.example .env. local
npm run dev  # Starts on http://localhost:3000

# 6. Setup avelon_mobile
cd ../avelon_mobile
npm install
cp . env.example .env
npx react-native run-android  # or run-ios
```

### Appendix C: Contact & References

**Project Type:** Capstone/Thesis - System Development  
**Academic Year:** 2025-2026  
**Team Size:** 4-6 developers

**Key Technologies:**
- Next.js 14, React Native, Hono, PostgreSQL
- Solidity, Hardhat, Ethers.js
- Python, FastAPI, PyTorch
- Resend, Firebase Cloud Messaging

**References:**
1. Ethereum Foundation - Smart Contract Best Practices
2. OpenZeppelin - Secure Smart Contract Library
3. Philippine Data Privacy Act (RA 10173)
4. Chainlink - Decentralized Oracle Network
5. PyTorch Documentation - Deep Learning Framework
6. Tesseract OCR Documentation
7. FastAPI Documentation
8. Next.js 14 Documentation
9. React Native Documentation
10. Hono Framework Documentation

---

## Document Summary

| Section | Status |
|---------|--------|
| 1. Executive Summary | ✅ Complete |
| 2. Problem Statement | ✅ Complete |
| 3. Solution Overview | ✅ Complete |
| 4. System Architecture | ✅ Complete |
| 5. Repository Structure | ✅ Complete |
| 6. User Roles & Permissions | ✅ Complete |
| 7. Loan Plans & Interest Model | ✅ Complete |
| 8. Credit Scoring System | ✅ Complete |
| 9. Loan Lifecycle | ✅ Complete |
| 10. Fee Structure & Revenue Model | ✅ Complete |
| 11. Smart Contract Architecture | ✅ Complete |
| 12. AI Verification System | ✅ Complete |
| 13. Security & Compliance | ✅ Complete |
| 14. Technology Stack | ✅ Complete |
| 15. Database Schema | ✅ Complete |
| 16. API Specification | ✅ Complete |
| 17. Development Roadmap | ✅ Complete |
| 18. Demo Scope & Limitations | ✅ Complete |
| 19. Success Criteria | ✅ Complete |
| 20. Glossary | ✅ Complete |
| 21. Appendices | ✅ Complete |

---

**Document Version:** 3.0 (Final)  
**Total Sections:** 21  
**Last Updated:** January 2026  
**Status:** ✅ Finalized - Ready for Development

---

*End of Avelon Project Overview Document*