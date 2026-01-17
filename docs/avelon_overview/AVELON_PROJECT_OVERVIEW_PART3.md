# Avelon:   Complete Project Overview - Part 3 of 6

## 6. User Roles & Permissions

### 6.1 Role Definitions

Avelon has only **two user roles** (no external lenders):

| Role | Description | Count |
|------|-------------|-------|
| **Admin** | Platform operators who manage loan plans, monitor loans, handle disputes | Limited (internal team) |
| **Borrower** | End users who apply for and manage loans | Unlimited (public users) |

### 6.2 Admin Permissions

```
ADMIN CAPABILITIES:
├─ Loan Plan Management
│   ├─ Create new loan plans
│   ├─ Edit existing loan plans
│   ├─ Activate/deactivate plans
│   └─ Set eligibility requirements
│
├─ User Management
│   ├─ View all users and their scores
│   ├─ Review KYC documents
│   ├─ Override AI verification (manual approval/rejection)
│   ├─ Suspend/ban users
│   └─ View user loan history
│
├─ Loan Operations
│   ├─ View all active loans
│   ├─ Monitor collateral ratios
│   ├─ Manually trigger liquidation (emergency)
│   ├─ View loan analytics and reports
│   └─ Export loan data
│
├─ Treasury Management
│   ├─ View treasury balance
│   ├─ Deposit funds to treasury
│   ├─ Withdraw funds from treasury
│   └─ View transaction history
│
├─ System Configuration
│   ├─ Update ETH/PHP price (for demo)
│   ├─ Configure notification templates
│   ├─ View system logs
│   └─ Manage platform settings
│
└─ Analytics & Reports
    ├─ Dashboard with KPIs
    ├─ Loan performance metrics
    ├─ User acquisition stats
    └─ Revenue reports
```

### 6.3 Borrower Permissions

```
BORROWER CAPABILITIES:
├─ Account Management
│   ├─ Register with email
│   ├─ Verify email address
│   ├─ Update profile information
│   ├─ Connect/disconnect wallets
│   └─ Manage notification preferences
│
├─ KYC & Verification
│   ├─ Upload required documents
│   ├─ View verification status
│   ├─ View credit score
│   ├─ View available loan plans (based on score)
│   └─ Re-submit documents if rejected
│
├─ Loan Operations
│   ├─ View eligible loan plans
│   ├─ Apply for loans
│   ├─ Deposit collateral
│   ├─ View active loans
│   ├─ Make repayments (full or partial)
│   ├─ Add collateral to existing loans
│   ├─ Request loan extension (VIP only)
│   └─ View loan history
│
├─ Monitoring
│   ├─ Real-time collateral ratio
│   ├─ ETH/PHP price display
│   ├─ Repayment schedule
│   ├─ Notification center
│   └─ Transaction history
│
└─ Support
    ├─ Contact customer support
    ├─ View FAQs
    └─ Report issues
```

### 6.4 Borrower Verification States

```
VERIFICATION STATE MACHINE: 

┌──────────────┐
│  REGISTERED  │ ─── Email not verified
└──────┬───────┘
       │ (verify email)
       ▼
┌──────────────┐
│   VERIFIED   │ ─── Email verified, no wallet
└──────┬───────┘
       │ (connect wallet)
       ▼
┌──────────────┐
│   CONNECTED  │ ─── Wallet connected, no KYC
└──────┬───────┘
       │ (upload documents)
       ▼
┌──────────────┐
│  PENDING_KYC │ ─── Documents submitted, awaiting AI review
└──────┬───────┘
       │
       ├─────────────────────────────────┐
       │ (AI approves)                   │ (AI rejects)
       ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│   APPROVED   │                  │   REJECTED   │
│  Score: XX   │                  │  Can resubmit│
└──────────────┘                  └──────────────┘
       │
       │ (admin suspends)
       ▼
┌──────────────┐
│  SUSPENDED   │ ─── Account frozen
└──────────────┘
```

### 6.5 Permission Matrix

| Action | Admin | Borrower (Approved) | Borrower (Other) |
|--------|-------|---------------------|------------------|
| View own profile | ✅ | ✅ | ✅ |
| View all users | ✅ | ❌ | ❌ |
| Upload KYC documents | ❌ | ✅ | ✅ |
| Apply for loan | ❌ | ✅ | ❌ |
| View own loans | ✅ | ✅ | ❌ |
| View all loans | ✅ | ❌ | ❌ |
| Create loan plans | ✅ | ❌ | ❌ |
| Approve/reject KYC | ✅ | ❌ | ❌ |
| Trigger liquidation | ✅ | ❌ | ❌ |
| Update ETH price | ✅ | ❌ | ❌ |
| Access treasury | ✅ | ❌ | ❌ |

---

## 7. Loan Plans & Interest Model

### 7.1 Loan Plan Structure

Loan plans are created and managed by Admins.  Each plan defines:

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Plan display name | "Starter Loan" |
| `description` | Plan description | "Perfect for first-time borrowers" |
| `minCreditScore` | Minimum score required | 40 |
| `minAmount` | Minimum loan amount (ETH) | 0.01 ETH |
| `maxAmount` | Maximum loan amount (ETH) | 0.5 ETH |
| `durationOptions` | Available durations (days) | [30, 60, 90] |
| `interestRate` | Interest rate percentage | 5.0% |
| `interestType` | FLAT or COMPOUND | FLAT |
| `collateralRatio` | Required collateral percentage | 150% |
| `originationFee` | Upfront fee percentage | 1.5% |
| `latePenaltyRate` | Daily penalty for late payment | 0.5% |
| `gracePeriodDays` | Days before late penalty applies | 3 |
| `extensionAllowed` | Whether VIP can extend | true/false |
| `maxExtensionDays` | Maximum extension duration | 30 |
| `extensionFee` | Fee for extension | 1% |
| `isActive` | Whether plan is available | true |

### 7.2 Default Loan Plans

| Plan Name | Min Score | Loan Range (ETH) | Durations | Interest | Collateral | Origination |
|-----------|-----------|------------------|-----------|----------|------------|-------------|
| **Starter** | 40 | 0.01 - 0.1 | 30, 60 days | 8% | 200% | 2% |
| **Standard** | 60 | 0.05 - 0.5 | 30, 60, 90 days | 5% | 150% | 1. 5% |
| **Premium** | 80 | 0.1 - 1.0 | 30, 60, 90, 180 days | 3% | 130% | 1% |
| **VIP** | 90 | 0.1 - 2.0 | 30, 60, 90, 180 days | 2% | 120% | 0.5% |

### 7.3 Interest Calculation

**Flat Interest Formula:**
```
Total Interest = Principal × Interest Rate × (Duration / 365)

Example:
- Principal: 0.5 ETH
- Interest Rate: 5%
- Duration: 90 days

Total Interest = 0.5 × 0.05 × (90/365) = 0.00616 ETH
Total Repayment = 0.5 + 0.00616 = 0.50616 ETH
```

**Complete Loan Calculation Example:**
```
┌─────────────────────────────────────────────────────────────┐
│                 LOAN CALCULATION EXAMPLE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INPUTS:                                                    │
│  ├─ Plan: Standard                                         │
│  ├─ Loan Amount: 0.5 ETH                                   │
│  ├─ Duration: 90 days                                      │
│  ├─ Interest Rate: 5%                                      │
│  ├─ Collateral Ratio: 150%                                 │
│  ├─ Origination Fee: 1.5%                                  │
│  └─ ETH/PHP Rate: ₱150,000                                 │
│                                                             │
│  CALCULATIONS:                                              │
│  ├─ Collateral Required: 0.5 × 150% = 0.75 ETH             │
│  ├─ Collateral in PHP: 0.75 × 150,000 = ₱112,500           │
│  ├─ Origination Fee: 0.5 × 1.5% = 0.0075 ETH               │
│  ├─ Net Disbursed: 0.5 - 0.0075 = 0.4925 ETH               │
│  ├─ Interest:  0.5 × 5% × (90/365) = 0.00616 ETH            │
│  └─ Total Repayment: 0.5 + 0.00616 = 0.50616 ETH           │
│                                                             │
│  SUMMARY FOR USER:                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ You Receive:        0.4925 ETH (₱73,875)            │   │
│  │ You Deposit:        0.75 ETH (₱112,500)             │   │
│  │ You Repay:          0.50616 ETH (₱75,924)           │   │
│  │ Due Date:           April 17, 2026                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.4 ETH/PHP Display Conversion

All loan amounts are denominated in ETH but displayed with PHP equivalent: 

```
DISPLAY FORMAT: 
┌─────────────────────────────────────────┐
│  Loan Amount:       0.5 ETH              │
│  PHP Equivalent:  ₱75,000. 00            │
│  (Rate: 1 ETH = ₱150,000.00)            │
│  Last Updated: 2 minutes ago            │
└─────────────────────────────────────────┘
```

**Price Oracle (Demo):**
- Admin manually sets ETH/PHP rate in the demo
- Rate stored in smart contract and database
- Frontend fetches rate and displays conversions
- For production:  Integrate Chainlink oracle

### 7.5 Loan Plan Database Schema

```prisma
model LoanPlan {
  id                    String        @id @default(cuid())
  name                  String        @unique
  description           String?
  
  // Eligibility
  minCreditScore        Int           // Minimum score required (0-100)
  
  // Loan Terms
  minAmount             Decimal       // Minimum loan (ETH)
  maxAmount             Decimal       // Maximum loan (ETH)
  durationOptions       Int[]         // Available durations in days [30, 60, 90]
  interestRate          Float         // Interest rate percentage (e.g., 5.0 = 5%)
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
  extensionFee          Float         @default(0)
  
  // Status
  isActive              Boolean       @default(true)
  
  // Metadata
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  createdBy             String        // Admin ID
  
  loans                 Loan[]
}

enum InterestType {
  FLAT
  COMPOUND
}
```

---

## 8. Credit Scoring System

### 8.1 Scoring Overview

Avelon uses a **0-100 credit score** to determine borrower eligibility: 

```
┌─────────────────────────────────────────────────────────────┐
│                   AVELON CREDIT SCORE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SCORE RANGE:  0 ─────────────────────────────────────► 100  │
│               │         │         │         │         │     │
│               0        40        60        80        90     │
│           REJECTED   BASIC   STANDARD  PREMIUM    VIP       │
│                                                             │
│  SCORING COMPONENTS:                                        │
│  ├─ Document Verification:   40 points (40%)                 │
│  ├─ Financial Indicators:   35 points (35%)                 │
│  ├─ Avelon History:         15 points (15%)                 │
│  └─ Wallet Analysis:        10 points (10%)                 │
│                             ─────────                       │
│                             100 points total                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Scoring Components

#### A. Document Verification (40 points)

| Document | Points | Validation |
|----------|--------|------------|
| Valid Government ID | +15 | AI verifies authenticity, extracts data |
| Proof of Income | +15 | AI extracts income amount, validates format |
| Proof of Address | +10 | AI validates address matches ID |

**Document Penalties:**
| Issue | Penalty |
|-------|---------|
| Suspected tampering | -20 points |
| Expired document | -10 points |
| Mismatched information | -15 points |
| Low quality/unreadable | -5 points |

#### B. Financial Indicators (35 points)

| Factor | Points | Calculation |
|--------|--------|-------------|
| Monthly Income Level | +5 to +15 | Based on income brackets |
| Employment Type | +5 to +10 | Permanent > Contract > Self-employed |
| Debt-to-Income Ratio | -10 to +10 | Lower ratio = more points |

**Income Brackets (PHP):**
| Monthly Income | Points |
|----------------|--------|
| Below ₱15,000 | +5 |
| ₱15,000 - ₱30,000 | +8 |
| ₱30,000 - ₱50,000 | +10 |
| ₱50,000 - ₱100,000 | +12 |
| Above ₱100,000 | +15 |

**Employment Type:**
| Type | Points |
|------|--------|
| Permanent/Regular | +10 |
| Contract | +7 |
| Self-employed | +5 |
| Unemployed (with income proof) | +3 |

#### C. Avelon History (15 points)

| Factor | Points |
|--------|--------|
| First-time user (no history) | +5 (base) |
| Previous loan fully repaid | +3 per loan (max +10) |
| All payments on time | +2 per loan |
| Previous default | -15 per default |
| Late payments | -2 per late payment |

#### D. Wallet Analysis (10 points)

| Factor | Points | Criteria |
|--------|--------|----------|
| Wallet Age | +1 to +4 | >6 months = +4, <1 month = +1 |
| Transaction Count | +1 to +3 | >50 txns = +3, <10 txns = +1 |
| Current ETH Balance | +1 to +3 | Higher balance = more points |

### 8.3 Credit Tiers

| Tier | Score Range | Available Plans | Collateral Ratio | Max Loan | Special Perks |
|------|-------------|-----------------|------------------|----------|---------------|
| **Rejected** | 0-39 | None | - | 0 ETH | Must re-verify |
| **Basic** | 40-59 | Starter only | 200% | 0.1 ETH | - |
| **Standard** | 60-79 | Starter, Standard | 150% | 0.5 ETH | - |
| **Premium** | 80-89 | Starter, Standard, Premium | 130% | 1.0 ETH | Priority support |
| **VIP** | 90-100 | All plans | 120% | 2.0 ETH | Loan extension |

### 8.4 Score Calculation Example

```
┌─────────────────────────────────────────────────────────────┐
│              CREDIT SCORE CALCULATION EXAMPLE                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  USER:  Juan Dela Cruz                                       │
│                                                             │
│  A. DOCUMENT VERIFICATION (40 points max)                   │
│  ├─ Valid Driver's License:            +15                   │
│  ├─ Payslip (₱45,000/month):          +15                   │
│  ├─ Utility Bill (address match):      +10                   │
│  └─ Subtotal:                           40/40                │
│                                                             │
│  B.  FINANCIAL INDICATORS (35 points max)                    │
│  ├─ Monthly Income (₱45,000):          +10                   │
│  ├─ Employment (Permanent):            +10                   │
│  ├─ Debt-to-Income (Low):              +8                   │
│  └─ Subtotal:                          28/35                │
│                                                             │
│  C. AVELON HISTORY (15 points max)                          │
│  ├─ First-time user:                   +5                   │
│  └─ Subtotal:                          5/15                 │
│                                                             │
│  D. WALLET ANALYSIS (10 points max)                         │
│  ├─ Wallet Age (3 months):             +2                   │
│  ├─ Transaction Count (25):            +2                   │
│  ├─ ETH Balance (0.5 ETH):             +2                   │
│  └─ Subtotal:                          6/10                 │
│                                                             │
│  ═══════════════════════════════════════════════════════   │
│  TOTAL SCORE:                           79/100               │
│  TIER:                                  STANDARD             │
│  AVAILABLE PLANS:                      Starter, Standard    │
│  MAX LOAN:                             0.5 ETH              │
│  ═══════════════════════════════════════════════════════   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.5 Score Improvement

Users can improve their score over time by: 

1. **Successfully repaying loans** (+3 points per loan, max +10)
2. **Making on-time payments** (+2 points per loan)
3. **Updating financial documents** with better income
4. **Building wallet history** (more transactions, longer age)
5. **Re-submitting documents** if previously rejected

### 8.6 Score Display in UI

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR CREDIT SCORE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                         79                                  │
│                    ┌─────────┐                              │
│     ████████████████████████░░░░░░░░░░                      │
│     0              50              100                      │
│                                                             │
│     Tier:  STANDARD                                          │
│     Status:  Approved                                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SCORE BREAKDOWN                                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Documents:     ████████████████████ 40/40 (100%)    │   │
│  │ Financial:    ████████████████░░░░ 28/35 (80%)     │   │
│  │ History:      ██████░░░░░░░░░░░░░░  5/15 (33%)     │   │
│  │ Wallet:       ████████████░░░░░░░░  6/10 (60%)     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💡 Tip:  Repay your first loan on time to improve          │
│     your score by up to 5 points!                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.7 Scoring Algorithm (Pseudocode)

```python
def calculate_credit_score(user, documents, wallet):
    score = 0
    breakdown = {}
    
    # A. Document Verification (40 points)
    doc_score = 0
    if documents. government_id. valid:
        doc_score += 15
    if documents. proof_of_income. valid:
        doc_score += 15
    if documents. proof_of_address.valid:
        doc_score += 10
    
    # Apply penalties
    for doc in documents: 
        if doc.suspected_tampering: 
            doc_score -= 20
        if doc.expired:
            doc_score -= 10
        if doc.info_mismatch:
            doc_score -= 15
    
    doc_score = max(0, doc_score)  # Floor at 0
    breakdown['documents'] = doc_score
    score += doc_score
    
    # B. Financial Indicators (35 points)
    fin_score = 0
    income = documents.proof_of_income. extracted_income
    
    if income >= 100000:
        fin_score += 15
    elif income >= 50000:
        fin_score += 12
    elif income >= 30000:
        fin_score += 10
    elif income >= 15000:
        fin_score += 8
    else:
        fin_score += 5
    
    # Employment type
    emp_type = documents.proof_of_income.employment_type
    if emp_type == 'PERMANENT':
        fin_score += 10
    elif emp_type == 'CONTRACT':
        fin_score += 7
    else:
        fin_score += 5
    
    # Debt-to-income (simplified)
    fin_score += 8  # Assume low for demo
    
    breakdown['financial'] = min(35, fin_score)
    score += breakdown['financial']
    
    # C.  Avelon History (15 points)
    hist_score = 5  # Base for first-time users
    
    for loan in user.completed_loans:
        if loan.status == 'REPAID':
            hist_score += 3  # Max +10
        if loan.all_payments_on_time:
            hist_score += 2
    
    for loan in user.defaulted_loans: 
        hist_score -= 15
    
    hist_score = max(0, min(15, hist_score))
    breakdown['history'] = hist_score
    score += hist_score
    
    # D.  Wallet Analysis (10 points)
    wallet_score = 0
    
    # Wallet age
    age_months = wallet.age_in_months
    if age_months >= 6:
        wallet_score += 4
    elif age_months >= 3:
        wallet_score += 2
    else:
        wallet_score += 1
    
    # Transaction count
    txn_count = wallet.transaction_count
    if txn_count >= 50:
        wallet_score += 3
    elif txn_count >= 20:
        wallet_score += 2
    else:
        wallet_score += 1
    
    # Balance
    balance = wallet.eth_balance
    if balance >= 1. 0:
        wallet_score += 3
    elif balance >= 0.5:
        wallet_score += 2
    else:
        wallet_score += 1
    
    breakdown['wallet'] = min(10, wallet_score)
    score += breakdown['wallet']
    
    # Determine tier
    if score >= 90:
        tier = 'VIP'
    elif score >= 80:
        tier = 'PREMIUM'
    elif score >= 60:
        tier = 'STANDARD'
    elif score >= 40:
        tier = 'BASIC'
    else: 
        tier = 'REJECTED'
    
    return {
        'score':  score,
        'tier': tier,
        'breakdown': breakdown
    }
```

---

*End of Part 3 - Continue to Part 4 for Loan Lifecycle, Fee Structure, and Smart Contracts*