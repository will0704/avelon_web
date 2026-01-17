# AI Training Prompt:  Avelon Senior Software Engineer (Part 2)

---

## Loan System Specifications

### Loan Plans

Loan plans are created by Admins and define borrowing terms:

| Plan | Min Score | Loan Range (ETH) | Durations | Interest | Collateral | Origination |
|------|-----------|------------------|-----------|----------|------------|-------------|
| **Starter** | 40 | 0.01 - 0.1 | 30, 60 days | 8% | 200% | 2% |
| **Standard** | 60 | 0.05 - 0.5 | 30, 60, 90 days | 5% | 150% | 1. 5% |
| **Premium** | 80 | 0.1 - 1.0 | 30, 60, 90, 180 days | 3% | 130% | 1% |
| **VIP** | 90 | 0.1 - 2.0 | 30, 60, 90, 180 days | 2% | 120% | 0.5% |

### Currency Model

**CRITICAL**: All loans are denominated in **ETH** but displayed with **PHP equivalent**: 

```typescript
// Display format example
{
  loanAmount: "0.5 ETH",
  phpEquivalent: "₱75,000.00",
  exchangeRate: "1 ETH = ₱150,000.00",
  lastUpdated: "2 minutes ago"
}
```

- Price oracle is admin-controlled in demo (no live Chainlink)
- Rate stored in both smart contract and database
- Frontend fetches rate and displays conversions

### Interest Calculation (Flat)

```
Total Interest = Principal × Interest Rate × (Duration / 365)

Example:
- Principal: 0.5 ETH
- Interest Rate: 5%
- Duration: 90 days

Total Interest = 0.5 × 0.05 × (90/365) = 0.00616 ETH
Total Repayment = 0.5 + 0.00616 = 0.50616 ETH
```

### Collateral Ratio Calculation

```
Collateral Ratio = (Collateral Value / Loan Value) × 100%

Example:
- Collateral:  0.75 ETH
- ETH Price: ₱150,000
- Collateral Value: ₱112,500
- Loan Value: ₱75,000

Ratio = (112,500 / 75,000) × 100% = 150%
```

### Ratio Thresholds

| Threshold | Ratio | Action |
|-----------|-------|--------|
| **Healthy** | ≥150% | No action needed |
| **Warning** | 130-149% | Warning notification sent |
| **Critical** | 120-129% | Urgent warning, prompt to add collateral |
| **Liquidation** | <120% | 24-hour grace period, then auto-liquidation |

---

## Loan Lifecycle

### Complete Flow

```
1. APPLICATION
   └─ User selects plan, amount, duration
   └─ System calculates collateral, fees, total repayment
   └─ Loan created with status:  PENDING_COLLATERAL

2. COLLATERAL DEPOSIT
   └─ User deposits ETH via MetaMask
   └─ Smart contract receives and locks collateral
   └─ Status: COLLATERAL_DEPOSITED

3. DISBURSEMENT
   └─ Origination fee deducted
   └─ Net amount sent from Treasury to borrower
   └─ Status: ACTIVE
   └─ Due date set

4. ACTIVE MONITORING (Liquidation Bot)
   └─ Every 5 minutes: 
      ├─ Fetch current ETH/PHP price
      ├─ Calculate ratios for all active loans
      ├─ Send warnings if ratio < 130%
      └─ Queue liquidation if ratio < 120%

5A. SUCCESSFUL REPAYMENT
    └─ User pays full amount
    └─ Collateral released and returned
    └─ Status: REPAID
    └─ Credit score improved (+3 to +5 points)

5B. LIQUIDATION
    └─ Ratio < 120% OR overdue past grace period
    └─ 24-hour warning sent
    └─ If not resolved: 
       ├─ Debt + 5% penalty calculated
       ├─ Debt sent to Treasury
       ├─ Surplus returned to borrower
       └─ Status: LIQUIDATED
       └─ Credit score decreased (-15 points)
```

### Loan Statuses

```typescript
enum LoanStatus {
  PENDING_COLLATERAL   // Awaiting collateral deposit
  COLLATERAL_DEPOSITED // Collateral received, processing
  ACTIVE               // Loan disbursed, repayment ongoing
  REPAID               // Fully repaid, collateral returned
  LIQUIDATED           // Defaulted, collateral seized
  CANCELLED            // User cancelled before deposit
  EXPIRED              // Collateral not deposited in 24h
}
```

### Liquidation Process

```
TRIGGER: Ratio < 120% OR Loan overdue + grace period

STEP 1: WARNING (24 hours before)
├─ Email notification
├─ Push notification
├─ Dashboard shows critical warning
└─ User can add collateral to prevent

STEP 2: GRACE PERIOD CHECK
├─ If ratio recovered → Cancel liquidation
└─ If still below → Proceed

STEP 3: EXECUTION
├─ Calculate:  Principal + Interest + Late Fees
├─ Add:  5% liquidation penalty
├─ Reserve: ~0.01 ETH for gas
├─ Total Debt → Avelon Treasury
└─ Surplus → Borrower wallet

STEP 4: POST-LIQUIDATION
├─ Credit score:  -15 points
├─ Status: LIQUIDATED
└─ Email: Liquidation completed
```

### Fee Structure

| Fee Type | When | Amount |
|----------|------|--------|
| **Origination Fee** | At disbursement | 0.5% - 2% (plan-based) |
| **Interest** | At repayment | 2% - 8% (plan-based) |
| **Late Fee** | After grace period | 0.5% per day |
| **Liquidation Penalty** | At liquidation | 5% of outstanding |
| **Extension Fee** | At extension (VIP) | 1% of remaining |

---

## Credit Scoring System

### Score Range:  0-100

```
┌─────────────────────────────────────────────────────────────┐
│  0 ──────── 40 ──────── 60 ──────── 80 ──────── 90 ──── 100 │
│  │ REJECTED │  BASIC   │ STANDARD │ PREMIUM  │    VIP    │ │
└─────────────────────────────────────────────────────────────┘
```

### Scoring Components

| Component | Max Points | Weight |
|-----------|------------|--------|
| Document Verification | 40 | 40% |
| Financial Indicators | 35 | 35% |
| Avelon History | 15 | 15% |
| Wallet Analysis | 10 | 10% |

### Document Verification (40 points)

| Document | Points |
|----------|--------|
| Valid Government ID | +15 |
| Proof of Income | +15 |
| Proof of Address | +10 |

**Penalties:**
- Suspected tampering: -20
- Expired document: -10
- Mismatched information: -15

### Financial Indicators (35 points)

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
| Permanent | +10 |
| Contract | +7 |
| Self-employed | +5 |

### Avelon History (15 points)

| Factor | Points |
|--------|--------|
| First-time user | +5 (base) |
| Loan fully repaid | +3 per loan (max +10) |
| On-time payments | +2 per loan |
| Previous default | -15 per default |
| Late payments | -2 per late payment |

### Wallet Analysis (10 points)

| Factor | Points |
|--------|--------|
| Wallet age >6 months | +4 |
| Wallet age 3-6 months | +2 |
| Wallet age <1 month | +1 |
| >50 transactions | +3 |
| 20-50 transactions | +2 |
| Balance >1 ETH | +3 |
| Balance 0.5-1 ETH | +2 |

### Credit Tiers

| Tier | Score | Max Loan | Collateral | Available Plans |
|------|-------|----------|------------|-----------------|
| **Rejected** | 0-39 | 0 | - | None |
| **Basic** | 40-59 | 0. 1 ETH | 200% | Starter |
| **Standard** | 60-79 | 0.5 ETH | 150% | Starter, Standard |
| **Premium** | 80-89 | 1.0 ETH | 130% | Starter, Standard, Premium |
| **VIP** | 90-100 | 2.0 ETH | 120% | All + Extension privilege |