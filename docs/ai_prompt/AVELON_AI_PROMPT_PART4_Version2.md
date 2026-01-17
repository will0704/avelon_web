# AI Training Prompt: Avelon Senior Software Engineer (Part 4)

---

## Database Schema (Key Models)

### User Model

```prisma
model User {
  id                    String        @id @default(cuid())
  email                 String        @unique
  emailVerified         DateTime? 
  passwordHash          String? 
  name                  String? 
  role                  UserRole      @default(BORROWER)
  status                UserStatus    @default(REGISTERED)
  
  // KYC
  kycLevel              KYCLevel      @default(NONE)
  kycApprovedAt         DateTime? 
  
  // Credit Score
  creditScore           Int?            // 0-100
  creditTier            String?       // BASIC, STANDARD, PREMIUM, VIP
  
  // Extracted KYC Data
  legalName             String? 
  address               String? 
  monthlyIncome         Decimal?
  
  // Statistics
  totalBorrowed         Decimal       @default(0)
  totalRepaid           Decimal       @default(0)
  activeLoansCount      Int           @default(0)
  defaultCount          Int           @default(0)
  
  // Relations
  wallets               Wallet[]
  documents             Document[]
  loans                 Loan[]
  notifications         Notification[]
}

enum UserRole { ADMIN, BORROWER }
enum UserStatus { REGISTERED, VERIFIED, CONNECTED, PENDING_KYC, APPROVED, REJECTED, SUSPENDED }
enum KYCLevel { NONE, BASIC, STANDARD, ENHANCED }
```

### Loan Model

```prisma
model Loan {
  id                    String        @id @default(cuid())
  userId                String
  walletId              String
  planId                String
  
  // Blockchain
  contractAddress       String?        @unique
  contractLoanId        Int?
  
  // Loan Details
  principal             Decimal       // Original amount (ETH)
  collateralRequired    Decimal       // Required collateral (ETH)
  collateralDeposited   Decimal       @default(0)
  duration              Int           // Days
  interestRate          Float
  originationFee        Decimal
  
  // Outstanding
  principalOwed         Decimal
  interestOwed          Decimal       @default(0)
  feesOwed              Decimal       @default(0)
  
  // Status & Dates
  status                LoanStatus    @default(PENDING_COLLATERAL)
  dueDate               DateTime? 
  repaidAt              DateTime?
  liquidatedAt          DateTime? 
  
  // Extension
  extended              Boolean       @default(false)
  
  // Snapshots
  creditScoreSnapshot   Int
  ethPriceSnapshot      Decimal
  
  // Relations
  user                  User          @relation(...)
  wallet                Wallet        @relation(...)
  plan                  LoanPlan      @relation(...)
  transactions          LoanTransaction[]
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
```

### LoanPlan Model

```prisma
model LoanPlan {
  id                    String        @id @default(cuid())
  name                  String        @unique
  description           String?
  
  // Eligibility
  minCreditScore        Int
  
  // Terms
  minAmount             Decimal       // ETH
  maxAmount             Decimal       // ETH
  durationOptions       Int[]         // Days
  interestRate          Float         // Percentage
  collateralRatio       Float         // e.g., 150 = 150%
  originationFee        Float         // Percentage
  latePenaltyRate       Float         @default(0.5)
  gracePeriodDays       Int           @default(3)
  
  // Extension (VIP)
  extensionAllowed      Boolean       @default(false)
  maxExtensionDays      Int           @default(0)
  extensionFee          Float         @default(0)
  
  isActive              Boolean       @default(true)
  loans                 Loan[]
}
```

---

## API Specification

### Base URL
```
/api/v1
```

### Authentication Endpoints
```
POST   /auth/register              # Register new user
POST   /auth/login                 # Email/password login
POST   /auth/logout                # End session
POST   /auth/verify-email          # Verify email token
POST   /auth/forgot-password       # Request password reset
POST   /auth/reset-password        # Reset with token
GET    /auth/session               # Get current session
```

### User Endpoints
```
GET    /users/me                   # Get current user profile
PUT    /users/me                   # Update profile
GET    /users/me/stats             # Get user statistics
```

### Wallet Endpoints
```
GET    /wallets                    # List user's wallets
POST   /wallets/connect            # Initiate wallet connection
POST   /wallets/verify             # Verify wallet signature
PUT    /wallets/: id/primary        # Set as primary wallet
DELETE /wallets/:id                # Remove wallet
```

### KYC Endpoints
```
GET    /kyc/status                 # Get KYC status
POST   /kyc/documents              # Upload document
GET    /kyc/documents              # List uploaded documents
DELETE /kyc/documents/: id          # Delete document
POST   /kyc/submit                 # Submit for verification
```

### Loan Plan Endpoints
```
GET    /plans                      # List available plans (for user's tier)
GET    /plans/:id                  # Get plan details
```

### Loan Endpoints
```
GET    /loans                      # List user's loans
POST   /loans                      # Create loan application
GET    /loans/:id                  # Get loan details
POST   /loans/:id/collateral       # Record collateral deposit
POST   /loans/:id/repay            # Record repayment
POST   /loans/:id/add-collateral   # Record collateral top-up
POST   /loans/:id/extend           # Request extension (VIP)
DELETE /loans/:id                  # Cancel loan (before collateral)
GET    /loans/:id/transactions     # Get loan transactions
```

### Market Endpoints
```
GET    /market/price               # Get current ETH/PHP price
GET    /market/price/history       # Get price history
```

### Notification Endpoints
```
GET    /notifications              # List notifications
PUT    /notifications/:id/read     # Mark as read
PUT    /notifications/read-all     # Mark all as read
GET    /notifications/preferences  # Get preferences
PUT    /notifications/preferences  # Update preferences
```

### Admin Endpoints
```
GET    /admin/users                # List all users
GET    /admin/users/:id            # Get user details
PUT    /admin/users/:id/status     # Update user status
GET    /admin/loans                # List all loans
POST   /admin/loans/: id/liquidate  # Manual liquidation
GET    /admin/plans                # List all plans
POST   /admin/plans                # Create plan
PUT    /admin/plans/:id            # Update plan
GET    /admin/kyc/pending          # List pending KYC
PUT    /admin/kyc/: userId/approve  # Approve KYC
PUT    /admin/kyc/:userId/reject   # Reject KYC
GET    /admin/treasury             # Get treasury balance
POST   /admin/price                # Update ETH/PHP price
GET    /admin/analytics            # Get platform analytics
```

### Response Format

```typescript
// Success
{
  "success": true,
  "data": { ...  },
  "meta": { "page": 1, "limit": 20, "total": 100 }
}

// Error
{
  "success": false,
  "error":  {
    "code":  "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [{ "field": "email", "message": "Invalid format" }]
  }
}
```

---

## Notification System

### Email Notifications (Resend + React Email)

**Email Types:**
- Welcome email (after signup)
- Email verification (magic link)
- Password reset
- KYC approved/rejected
- Loan application received
- Loan approved with terms
- Collateral deposited
- Loan disbursed
- Repayment reminder (3 days before)
- Repayment received
- Collateral warning (ratio < 130%)
- Liquidation warning (24 hours before)
- Liquidation executed
- Loan fully repaid

### Push Notifications (Firebase Cloud Messaging)

**Push Types:**
- Loan status updates
- Repayment reminders
- Collateral warnings
- Liquidation warnings
- Transaction confirmations

### Implementation

```typescript
// Email sending example
import { Resend } from 'resend';
import { LoanApprovedEmail } from '@/emails/loan-approved';

const resend = new Resend(process.env. RESEND_API_KEY);

async function sendLoanApprovalEmail(user: User, loan: Loan) {
  await resend.emails. send({
    from: 'Avelon <noreply@avelon.finance>',
    to: user.email,
    subject: '🎉 Your Loan Application Was Approved!',
    react: LoanApprovedEmail({
      userName: user.name,
      loanAmount: loan.principal. toString(),
      interestRate: loan. interestRate,
      duration: loan.duration,
      dashboardLink: `https://avelon.finance/loans/${loan.id}`
    })
  });
}
```

---

## Liquidation Bot

### Implementation

```typescript
// jobs/liquidation. job.ts
import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';
import { sendLiquidationWarning, sendLiquidationExecuted } from '@/services/notification. service';

const LIQUIDATION_THRESHOLD = 120; // 120%
const WARNING_THRESHOLD = 130; // 130%
const GRACE_PERIOD_HOURS = 24;

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running liquidation check...');
  
  // Get current ETH price
  const ethPrice = await getCurrentEthPrice();
  
  // Get all active loans
  const activeLoans = await prisma.loan.findMany({
    where: { status: 'ACTIVE' },
    include: { user: true, wallet: true }
  });
  
  for (const loan of activeLoans) {
    const ratio = calculateCollateralRatio(loan, ethPrice);
    
    if (ratio < LIQUIDATION_THRESHOLD) {
      // Check if grace period has passed
      const warningTime = loan.liquidationWarningAt;
      if (warningTime && isGracePeriodExpired(warningTime)) {
        // Execute liquidation
        await executeLiquidation(loan);
        await sendLiquidationExecuted(loan. user, loan);
      } else if (! warningTime) {
        // Send warning, start grace period
        await prisma.loan.update({
          where:  { id: loan. id },
          data: { liquidationWarningAt: new Date() }
        });
        await sendLiquidationWarning(loan. user, loan, ratio);
      }
    } else if (ratio < WARNING_THRESHOLD) {
      // Send collateral warning
      await sendCollateralWarning(loan.user, loan, ratio);
    }
    
    // Check if overdue
    if (isOverdue(loan)) {
      await handleOverdueLoan(loan);
    }
  }
});

function calculateCollateralRatio(loan: Loan, ethPrice: number): number {
  const collateralValue = parseFloat(loan.collateralDeposited. toString()) * ethPrice;
  const loanValue = parseFloat(loan.principalOwed.toString()) * ethPrice;
  return (collateralValue / loanValue) * 100;
}
```