# Avelon:  Complete Project Overview - Part 4 of 6

## 9. Loan Lifecycle

### 9.1 Complete Loan Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      COMPLETE LOAN LIFECYCLE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PHASE 1: APPLICATION                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. User selects eligible loan plan                          │   │
│  │ 2. User enters loan amount and duration                     │   │
│  │ 3. System calculates:                                        │   │
│  │    - Required collateral (amount × collateral ratio)        │   │
│  │    - Origination fee                                        │   │
│  │    - Total interest                                         │   │
│  │    - Total repayment amount                                 │   │
│  │ 4. User reviews and confirms terms                          │   │
│  │ 5.  Loan application created (status: PENDING_COLLATERAL)    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  PHASE 2: COLLATERAL DEPOSIT                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. User initiates collateral deposit via wallet             │   │
│  │ 2. Smart contract receives ETH                              │   │
│  │ 3. Contract verifies amount meets requirement               │   │
│  │ 4. Collateral locked in contract                            │   │
│  │ 5. Event emitted, backend syncs                             │   │
│  │ 6. Loan status:  COLLATERAL_DEPOSITED                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  PHASE 3: DISBURSEMENT                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. System verifies collateral deposited                     │   │
│  │ 2. Origination fee deducted from loan amount                │   │
│  │ 3. Net loan amount sent from Treasury to borrower wallet    │   │
│  │ 4. Loan start date and due date recorded                    │   │
│  │ 5. Loan status: ACTIVE                                      │   │
│  │ 6. Email notification sent to borrower                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  PHASE 4: ACTIVE LOAN MONITORING                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ CONTINUOUS MONITORING BY LIQUIDATION BOT:                    │   │
│  │                                                             │   │
│  │ Every 5 minutes:                                            │   │
│  │ 1. Fetch current ETH/PHP price                              │   │
│  │ 2. Calculate current collateral ratio for all active loans  │   │
│  │ 3. Check for ratio breaches:                                 │   │
│  │    - If ratio < liquidation threshold:  Queue for liquidation│   │
│  │    - If ratio < warning threshold: Send warning notification│   │
│  │ 4. Check for overdue loans (past due date + grace period)   │   │
│  │ 5. Execute pending liquidations                             │   │
│  │                                                             │   │
│  │ USER ACTIONS AVAILABLE:                                     │   │
│  │ - View dashboard with real-time ratio                       │   │
│  │ - Make partial repayment                                    │   │
│  │ - Add more collateral                                       │   │
│  │ - Request extension (VIP only)                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│              ┌───────────────┴───────────────┐                     │
│              ▼                               ▼                     │
│  PHASE 5A: SUCCESSFUL REPAYMENT     PHASE 5B: LIQUIDATION          │
│  ┌───────────────────────────┐    ┌───────────────────────────┐   │
│  │ 1. User pays full amount  │    │ 1. Trigger condition met:  │   │
│  │ 2. Smart contract receives│    │    - Ratio < threshold    │   │
│  │ 3. Debt marked as paid    │    │    - Overdue + grace      │   │
│  │ 4. Collateral released    │    │ 2. 24-hour grace period   │   │
│  │ 5. Collateral returned    │    │    (with warning sent)    │   │
│  │    to borrower wallet     │    │ 3. Liquidation executed:   │   │
│  │ 6. Loan status: REPAID    │    │    - Debt settled         │   │
│  │ 7. Credit score improved  │    │    - 5% penalty applied   │   │
│  │ 8. Email:  Congratulations! │    │    - Gas fee deducted     │   │
│  └───────────────────────────┘    │    - Surplus to borrower  │   │
│                                   │ 4. Loan status: LIQUIDATED│   │
│                                   │ 5. Credit score decreased │   │
│                                   │ 6. Email: Liquidation     │   │
│                                   └───────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Loan Statuses

| Status | Description | User Actions Available |
|--------|-------------|------------------------|
| `PENDING_COLLATERAL` | Loan approved, awaiting collateral deposit | Deposit collateral, Cancel |
| `COLLATERAL_DEPOSITED` | Collateral received, processing disbursement | Wait |
| `ACTIVE` | Loan disbursed, repayment period ongoing | Repay, Add collateral, View |
| `REPAID` | Fully repaid, collateral returned | View history |
| `LIQUIDATED` | Defaulted, collateral seized | View history |
| `CANCELLED` | User cancelled before collateral deposit | - |
| `EXPIRED` | Collateral not deposited within time limit (24h) | Reapply |

### 9.3 Collateral Ratio Calculation

```
Collateral Ratio = (Collateral Value in PHP / Loan Value in PHP) × 100%

Example:
- Collateral:  0.75 ETH
- ETH Price: ₱150,000
- Collateral Value: 0.75 × 150,000 = ₱112,500
- Loan Amount: 0.5 ETH = ₱75,000

Collateral Ratio = (112,500 / 75,000) × 100% = 150%
```

### 9.4 Ratio Thresholds

| Threshold | Ratio | Action |
|-----------|-------|--------|
| **Healthy** | ≥150% | No action needed |
| **Warning** | 130-149% | Warning notification sent |
| **Critical** | 120-129% | Urgent warning, user prompted to add collateral |
| **Liquidation** | <120% | 24-hour grace period, then auto-liquidation |

### 9.5 Liquidation Process

```
┌─────────────────────────────────────────────────────────────┐
│                   LIQUIDATION EXECUTION                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TRIGGER CONDITIONS (any of these):                         │
│  ├─ Collateral ratio drops below 120%                      │
│  ├─ Loan term expires without full repayment               │
│  └─ Missed payments beyond grace period (3 days)           │
│                                                             │
│  STEP 1: WARNING (24 hours before liquidation)             │
│  ├─ Email notification sent                                │
│  ├─ Push notification sent                                 │
│  ├─ Dashboard shows critical warning                       │
│  └─ User can add collateral to prevent liquidation         │
│                                                             │
│  STEP 2: GRACE PERIOD EXPIRES                              │
│  ├─ Bot checks if ratio is still below threshold           │
│  ├─ If ratio recovered:  Cancel liquidation                 │
│  └─ If still below:  Proceed to execution                   │
│                                                             │
│  STEP 3: LIQUIDATION EXECUTION                             │
│  ├─ Smart contract calculates amounts:                      │
│  │   ├─ Outstanding Principal                              │
│  │   ├─ Accrued Interest                                   │
│  │   ├─ Late Fees (if applicable)                          │
│  │   ├─ Liquidation Penalty (5%)                           │
│  │   └─ Gas Fee Reserve (0.01 ETH estimated)               │
│  │                                                         │
│  ├─ Total Debt = Principal + Interest + Fees + Penalty     │
│  ├─ Surplus = Collateral - Total Debt - Gas                │
│  │                                                         │
│  ├─ Transfers:                                              │
│  │   ├─ Total Debt → Avelon Treasury                       │
│  │   └─ Surplus → Borrower Wallet (if positive)            │
│  │                                                         │
│  └─ Loan status → LIQUIDATED                               │
│                                                             │
│  STEP 4: POST-LIQUIDATION                                  │
│  ├─ Credit score decreased (-15 points)                    │
│  ├─ Liquidation recorded in user history                   │
│  ├─ Email notification:  Liquidation completed              │
│  └─ Admin notified via dashboard                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.6 Liquidation Calculation Example

```
┌─────────────────────────────────────────────────────────────┐
│              LIQUIDATION CALCULATION EXAMPLE                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LOAN DETAILS:                                              │
│  ├─ Principal Owed: 0.5 ETH                                │
│  ├─ Interest Owed: 0.00616 ETH                             │
│  ├─ Late Fees: 0.01 ETH                                    │
│  ├─ Collateral Deposited: 0.75 ETH                         │
│  └─ ETH Price: ₱150,000                                    │
│                                                             │
│  CALCULATIONS:                                              │
│  ├─ Outstanding Debt:  0.5 + 0.00616 + 0.01 = 0.51616 ETH   │
│  ├─ Liquidation Penalty (5%): 0.51616 × 5% = 0.0258 ETH    │
│  ├─ Gas Reserve:  0.01 ETH                                  │
│  ├─ Total to Avelon:  0.51616 + 0.0258 + 0.01 = 0.55196 ETH │
│  └─ Surplus to Borrower: 0.75 - 0.55196 = 0.19804 ETH      │
│                                                             │
│  DISTRIBUTION:                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ To Avelon Treasury:     0.55196 ETH (₱82,794)        │   │
│  │ To Borrower (surplus): 0.19804 ETH (₱29,706)        │   │
│  │ Gas Fees:              0.01 ETH (₱1,500)            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.7 Partial Repayment

Users can make payments smaller than the total owed: 

```
PARTIAL PAYMENT ALLOCATION:
1. Late fees (if any) → Paid first
2. Accrued interest → Paid second
3. Principal → Paid last

Example:
- Outstanding:  Principal 0.5 ETH + Interest 0.02 ETH = 0.52 ETH
- User pays: 0.2 ETH

Allocation:
- Interest: 0.02 ETH (fully paid) ✓
- Principal: 0.18 ETH (partially paid)

Remaining:  0.32 ETH principal
```

### 9.8 Collateral Top-Up

Users can add collateral to improve their ratio:

```
TOP-UP FLOW:
1. User sees ratio dropping (e.g., 125%)
2. User clicks "Add Collateral"
3. User enters amount to add (e.g., 0.1 ETH)
4. Preview shows new ratio (e.g., 145%)
5. User confirms, signs transaction
6. Smart contract adds to collateral
7. New ratio reflected on dashboard

SMART CONTRACT: 
function addCollateral(uint256 loanId) external payable {
    Loan storage loan = loans[loanId];
    require(msg.sender == loan.borrower, "Not borrower");
    require(loan.status == LoanStatus.ACTIVE, "Loan not active");
    require(msg.value > 0, "Must send ETH");
    
    loan.collateral += msg.value;
    emit CollateralAdded(loanId, msg.value, loan.collateral);
}
```

### 9.9 Loan Extension (VIP Only)

Users with score ≥90 can extend their loan:

```
EXTENSION RULES:
- Only available to VIP tier users (score ≥90)
- Maximum extension: 30 days
- Extension fee: 1% of remaining principal
- Can only extend once per loan
- Must have ratio ≥150% to extend
- Cannot extend if already overdue

FLOW:
1. VIP user clicks "Request Extension"
2. System checks eligibility
3. User selects extension duration (7, 14, 30 days)
4. Extension fee displayed
5. User confirms
6. Fee added to outstanding amount
7. Due date extended
8. Email confirmation sent

SMART CONTRACT:
function extendLoan(uint256 loanId, uint256 additionalDays) external {
    Loan storage loan = loans[loanId];
    require(msg.sender == loan. borrower, "Not borrower");
    require(loan.status == LoanStatus. ACTIVE, "Loan not active");
    require(! loan.extended, "Already extended");
    require(additionalDays <= 30, "Max 30 days");
    require(getCollateralRatio(loanId) >= 15000, "Ratio too low"); // 150%
    
    // Calculate extension fee (1%)
    uint256 extensionFee = (loan.principalOwed * 100) / 10000;
    loan.interestOwed += extensionFee;
    
    loan. dueDate += additionalDays * 1 days;
    loan.extended = true;
    
    emit LoanExtended(loanId, loan.dueDate);
}
```

---

## 10. Fee Structure & Revenue Model

### 10.1 Fee Types

| Fee Type | When Charged | Percentage/Amount | Description |
|----------|--------------|-------------------|-------------|
| **Origination Fee** | At disbursement | 0.5% - 2% (varies by plan) | Deducted from loan amount |
| **Interest** | At repayment | 2% - 8% (varies by plan) | Primary revenue source |
| **Late Payment Fee** | After grace period | 0.5% per day | Penalty for overdue loans |
| **Liquidation Penalty** | At liquidation | 5% of outstanding | Covers liquidation costs |
| **Extension Fee** | At extension (VIP) | 1% of remaining principal | For loan duration extension |

### 10.2 Fee Calculation Examples

**Example 1: Standard Loan, On-Time Repayment**
```
Loan Details:
- Plan: Standard
- Amount: 0.5 ETH
- Duration: 90 days
- Interest Rate: 5%
- Origination Fee: 1. 5%

Calculations:
- Origination Fee: 0.5 × 1.5% = 0.0075 ETH
- Net Disbursed: 0.5 - 0.0075 = 0.4925 ETH
- Interest: 0.5 × 5% × (90/365) = 0.00616 ETH
- Total Repayment: 0.5 + 0.00616 = 0.50616 ETH

Avelon Revenue:
- Origination:  0.0075 ETH
- Interest: 0.00616 ETH
- Total: 0.01366 ETH (~₱2,049 at ₱150,000/ETH)
```

**Example 2: Loan with Late Payment**
```
Same loan as above, but paid 5 days late: 

- Late Fee: 0.50616 × 0.5% × 5 days = 0.01265 ETH
- Total Repayment:  0.50616 + 0.01265 = 0.51881 ETH

Avelon Additional Revenue:  0.01265 ETH (~₱1,897)
```

**Example 3: Liquidated Loan**
```
Loan Details:
- Principal Owed: 0.5 ETH
- Interest Owed: 0.00616 ETH
- Collateral Deposited:  0.75 ETH
- Liquidation Penalty:  5%

Calculations:
- Outstanding Debt: 0.5 + 0.00616 = 0.50616 ETH
- Liquidation Penalty: 0.50616 × 5% = 0.0253 ETH
- Gas Reserve: 0.01 ETH (estimated)
- Total to Avelon:  0.50616 + 0.0253 + 0.01 = 0.54146 ETH
- Surplus to Borrower: 0.75 - 0.54146 = 0.20854 ETH
```

### 10.3 Revenue Model

```
┌─────────────────────────────────────────────────────────────┐
│                   AVELON REVENUE STREAMS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRIMARY REVENUE:                                            │
│  ├─ Interest Income (~60% of revenue)                      │
│  │   └─ Earned on every successful loan                    │
│  │                                                         │
│  └─ Origination Fees (~25% of revenue)                     │
│      └─ Earned at loan disbursement                        │
│                                                             │
│  SECONDARY REVENUE:                                         │
│  ├─ Late Fees (~10% of revenue)                            │
│  │   └─ Penalty income from delayed payments               │
│  │                                                         │
│  └─ Liquidation Penalties (~5% of revenue)                 │
│      └─ Earned when loans are liquidated                   │
│                                                             │
│  EXAMPLE MONTHLY PROJECTION (100 loans):                    │
│  ├─ Average Loan:  0.3 ETH                                  │
│  ├─ Total Volume: 30 ETH                                   │
│  ├─ Origination (1.5%): 0.45 ETH                          │
│  ├─ Interest (5% avg): 1.5 ETH                            │
│  ├─ Late Fees (10% of loans): 0.15 ETH                    │
│  ├─ Liquidations (5% of loans): 0.075 ETH                 │
│  └─ TOTAL REVENUE: ~2.175 ETH/month                        │
│                                                             │
│  At ETH = ₱150,000:  ~₱326,250/month                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Smart Contract Architecture

### 11.1 Contract Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 SMART CONTRACT ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────────────┐                      │
│                    │  AvelonCore. sol │                      │
│                    │  (Main Entry)   │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│         ┌───────────────────┼───────────────────┐          │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │ Treasury. sol│    │LoanManager.  │    │AccessControl│    │
│  │             │    │    sol      │    │    . sol     │    │
│  ├─────────────┤    ├─────────────┤    ├─────────────┤    │
│  │ - deposit() │    │ - createLoan│    │ - isAdmin() │    │
│  │ - withdraw()│    │ - repay()   │    │ - isBorrower│    │
│  │ - balance() │    │ - liquidate │    │ - grantRole │    │
│  └─────────────┘    │ - addCollat │    └─────────────┘    │
│                     └──────┬──────┘                        │
│                            │                               │
│                            ▼                               │
│                    ┌─────────────┐                         │
│                    │ PriceOracle │                         │
│                    │    .sol     │                         │
│                    ├─────────────┤                         │
│                    │ - getPrice()│                         │
│                    │ - setPrice()│ (admin only for demo)  │
│                    └─────────────┘                         │
│                                                             │
│  LIBRARIES USED:                                           │
│  ├─ OpenZeppelin Ownable (access control)                  │
│  ├─ OpenZeppelin ReentrancyGuard (security)               │
│  └─ OpenZeppelin Pausable (emergency stop)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 Contract Specifications

#### AvelonCore.sol
Main entry point that coordinates all contract interactions. 

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable. sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IAvelonCore {
    // Events
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event CollateralDeposited(uint256 indexed loanId, uint256 amount);
    event LoanDisbursed(uint256 indexed loanId, uint256 netAmount);
    event RepaymentMade(uint256 indexed loanId, uint256 amount, uint256 remaining);
    event CollateralAdded(uint256 indexed loanId, uint256 amount);
    event LoanRepaid(uint256 indexed loanId);
    event LoanLiquidated(uint256 indexed loanId, uint256 debtSettled, uint256 surplus);
    event LoanExtended(uint256 indexed loanId, uint256 newDueDate);
    
    // Core Functions
    function createLoan(
        uint256 planId,
        uint256 amount,
        uint256 duration
    ) external returns (uint256 loanId);
    
    function depositCollateral(uint256 loanId) external payable;
    function makeRepayment(uint256 loanId) external payable;
    function addCollateral(uint256 loanId) external payable;
    function liquidate(uint256 loanId) external;
    function extendLoan(uint256 loanId, uint256 additionalDays) external;
    
    // View Functions
    function getLoan(uint256 loanId) external view returns (Loan memory);
    function getCollateralRatio(uint256 loanId) external view returns (uint256);
    function getUserLoans(address user) external view returns (uint256[] memory);
}
```

#### Treasury.sol
Manages Avelon's lending pool. 

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITreasury {
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event LoanFunded(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event RepaymentReceived(uint256 indexed loanId, uint256 amount);
    
    function deposit() external payable;
    function withdraw(uint256 amount) external; // Admin only
    function fundLoan(uint256 loanId, address borrower, uint256 amount) external;
    function receiveRepayment(uint256 loanId) external payable;
    function getBalance() external view returns (uint256);
}
```

#### LoanManager.sol
Core loan logic and state management.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

struct Loan {
    uint256 id;
    address borrower;
    uint256 planId;
    uint256 principal;          // Original loan amount
    uint256 collateral;         // Current collateral amount
    uint256 interestRate;       // Interest rate (basis points, e.g., 500 = 5%)
    uint256 collateralRatio;    // Required ratio (basis points, e.g., 15000 = 150%)
    uint256 originationFee;     // Fee percentage (basis points)
    uint256 startDate;
    uint256 dueDate;
    uint256 principalOwed;      // Remaining principal
    uint256 interestOwed;       // Accrued interest
    uint256 feesOwed;           // Late fees, etc.
    LoanStatus status;
    bool extended;              // Whether loan was extended
}

enum LoanStatus {
    PENDING_COLLATERAL,
    COLLATERAL_DEPOSITED,
    ACTIVE,
    REPAID,
    LIQUIDATED,
    CANCELLED,
    EXPIRED
}
```

#### PriceOracle. sol
ETH/PHP price feed (simplified for demo).

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPriceOracle {
    event PriceUpdated(uint256 newPrice, uint256 timestamp);
    
    function getLatestPrice() external view returns (uint256 price, uint256 updatedAt);
    function setPrice(uint256 price) external; // Admin only for demo
}

contract PriceOracle is IPriceOracle {
    uint256 public ethPricePHP;     // ETH price in PHP (scaled by 10^18)
    uint256 public lastUpdatedAt;
    address public admin;
    
    constructor(uint256 initialPrice) {
        admin = msg.sender;
        ethPricePHP = initialPrice;
        lastUpdatedAt = block.timestamp;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    function setPrice(uint256 price) external onlyAdmin {
        ethPricePHP = price;
        lastUpdatedAt = block.timestamp;
        emit PriceUpdated(price, block.timestamp);
    }
    
    function getLatestPrice() external view returns (uint256, uint256) {
        return (ethPricePHP, lastUpdatedAt);
    }
}
```

### 11.3 Security Features

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **Reentrancy Guard** | OpenZeppelin modifier | Prevent recursive call attacks |
| **Access Control** | Role-based (Admin, Bot) | Restrict sensitive functions |
| **Pausable** | Emergency pause | Stop all operations if needed |
| **Input Validation** | Require statements | Prevent invalid transactions |
| **Integer Safety** | Solidity 0.8+ | Built-in overflow protection |

### 11.4 Development Tools

| Tool | Purpose |
|------|---------|
| **Ganache** | Local Ethereum blockchain |
| **Hardhat** | Development framework, testing, deployment |
| **Ethers.js v6** | JavaScript blockchain interaction |
| **OpenZeppelin** | Secure contract templates |
| **Hardhat Coverage** | Code coverage reporting |
| **Slither** | Static analysis security tool |

### 11.5 Contract Deployment

```typescript
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy PriceOracle (1 ETH = 150,000 PHP)
  const PriceOracle = await ethers.getContractFactory("PriceOracle");
  const initialPrice = ethers. parseUnits("150000", 18);
  const priceOracle = await PriceOracle. deploy(initialPrice);
  await priceOracle.waitForDeployment();
  console.log("PriceOracle deployed to:", await priceOracle. getAddress());

  // Deploy Treasury
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury. waitForDeployment();
  console.log("Treasury deployed to:", await treasury.getAddress());

  // Deploy LoanManager
  const LoanManager = await ethers. getContractFactory("LoanManager");
  const loanManager = await LoanManager.deploy(
    await priceOracle.getAddress(),
    await treasury.getAddress()
  );
  await loanManager. waitForDeployment();
  console.log("LoanManager deployed to:", await loanManager.getAddress());

  // Deploy AvelonCore
  const AvelonCore = await ethers.getContractFactory("AvelonCore");
  const avelonCore = await AvelonCore. deploy(
    await loanManager.getAddress(),
    await treasury.getAddress(),
    await priceOracle.getAddress()
  );
  await avelonCore.waitForDeployment();
  console.log("AvelonCore deployed to:", await avelonCore.getAddress());

  // Fund treasury for demo (10 ETH)
  const fundTx = await treasury.deposit({ value: ethers.parseEther("10") });
  await fundTx. wait();
  console.log("Treasury funded with 10 ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 11.6 Hardhat Configuration

```typescript
// hardhat. config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv. config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    ganache: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env. PRIVATE_KEY ?  [process.env. PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests:  "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
```

---

*End of Part 4 - Continue to Part 5 for AI Verification System, Security & Compliance, and Technology Stack*