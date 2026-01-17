# AI Training Prompt: Avelon Senior Software Engineer (Part 3)

---

## Smart Contract Architecture

### Contract Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 SMART CONTRACT ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────────────┐                      │
│                    │  AvelonCore.sol │                      │
│                    │  (Main Entry)   │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│         ┌───────────────────┼───────────────────┐          │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │ Treasury.sol│    │LoanManager.  │    │AccessControl│    │
│  │             │    │    sol      │    │    . sol     │    │
│  ├─────────────┤    ├─────────────┤    ├─────────────┤    │
│  │ - deposit() │    │ - createLoan│    │ - isAdmin() │    │
│  │ - withdraw()│    │ - repay()   │    │ - grantRole │    │
│  │ - fundLoan()│    │ - liquidate │    └─────────────┘    │
│  │ - balance() │    │ - addCollat │                       │
│  └─────────────┘    └──────┬──────┘                       │
│                            │                               │
│                            ▼                               │
│                    ┌─────────────┐                         │
│                    │ PriceOracle │                         │
│                    │    .sol     │                         │
│                    ├─────────────┤                         │
│                    │ - getPrice()│                         │
│                    │ - setPrice()│ (admin only)           │
│                    └─────────────┘                         │
│                                                             │
│  SECURITY:                                                   │
│  ├─ OpenZeppelin ReentrancyGuard                           │
│  ├─ OpenZeppelin Pausable                                  │
│  ├─ OpenZeppelin AccessControl                             │
│  └─ Solidity 0.8+ overflow protection                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Contract Interfaces

```solidity
// LoanManager.sol - Core loan struct
struct Loan {
    uint256 id;
    address borrower;
    uint256 planId;
    uint256 principal;          // Original loan amount (ETH)
    uint256 collateral;         // Current collateral (ETH)
    uint256 interestRate;       // Basis points (500 = 5%)
    uint256 collateralRatio;    // Basis points (15000 = 150%)
    uint256 startDate;
    uint256 dueDate;
    uint256 principalOwed;
    uint256 interestOwed;
    uint256 feesOwed;
    LoanStatus status;
    bool extended;
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

// Key functions
function createLoan(uint256 planId, uint256 amount, uint256 duration) external returns (uint256);
function depositCollateral(uint256 loanId) external payable;
function makeRepayment(uint256 loanId) external payable;
function addCollateral(uint256 loanId) external payable;
function liquidate(uint256 loanId) external; // Called by bot
function extendLoan(uint256 loanId, uint256 additionalDays) external; // VIP only
function getCollateralRatio(uint256 loanId) external view returns (uint256);
```

### Development Environment

- **Local Blockchain**:  Ganache (chainId: 1337)
- **Framework**: Hardhat 2.x
- **Testing**: Hardhat + Chai + Ethers.js
- **Target Coverage**: 100%
- **Deployment**: Local Ganache only (demo)

---

## AI Verification System

### Pipeline Overview

```
INPUT:  User documents (Government ID, Proof of Income, Proof of Address)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STAGE 1: PREPROCESSING                                     │
│  ├─ Image quality check                                    │
│  ├─ Format validation (JPEG, PNG, PDF)                     │
│  ├─ Size normalization (224x224 for CNN)                   │
│  └─ Rotation correction                                    │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STAGE 2: DOCUMENT CLASSIFICATION (CNN - ResNet-18)        │
│  ├─ Identify document type                                 │
│  ├─ Confidence score output                                │
│  └─ Reject if confidence < 0.8                             │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STAGE 3: OCR EXTRACTION (Tesseract)                       │
│  ├─ Text extraction                                        │
│  ├─ Language:  English + Filipino                           │
│  └─ Structured field identification                        │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STAGE 4: NAMED ENTITY RECOGNITION (BERT-based)            │
│  ├─ Extract:  NAME, ADDRESS, ID_NUMBER, AMOUNT, DATE        │
│  └─ Map to structured data                                 │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STAGE 5: FRAUD DETECTION                                  │
│  ├─ Image manipulation detection                           │
│  ├─ Text consistency checks                                │
│  ├─ Format validation (ID numbers, dates)                  │
│  └─ Output:  Fraud probability (0-1)                        │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  STAGE 6: CREDIT SCORING (XGBoost)                         │
│  ├─ Apply scoring formula                                  │
│  ├─ Calculate final score (0-100)                          │
│  └─ Assign tier                                            │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
OUTPUT: {
  status: "APPROVED" | "REJECTED",
  credit_score: 0-100,
  tier: "BASIC" | "STANDARD" | "PREMIUM" | "VIP",
  extracted_data: { name, address, income, ...  },
  document_scores: { id: 0.95, income: 0.87, ... },
  fraud_flags: [],
  rejection_reasons: []
}
```

### AI Models

| Model | Architecture | Purpose | Training |
|-------|--------------|---------|----------|
| Document Classifier | ResNet-18 (fine-tuned) | Classify document type | Google Colab |
| Text Extractor | Tesseract OCR 5.0 | Extract text from images | Pre-trained |
| NER Extractor | BERT-based | Extract entities from text | Google Colab |
| Fraud Detector | CNN + Rules | Detect tampering | Google Colab |
| Credit Scorer | XGBoost | Calculate credit score | Google Colab |

### Training Approach

**IMPORTANT**: Models are trained from scratch using Google Colab (free GPU):

1. **Data Collection**:  Synthetic + redacted real samples
2. **Training Scripts**: Located in `avelon_llm/training/`
3. **Training Environment**: Google Colab with GPU
4. **Model Weights**: Saved to Google Drive, downloaded to repository
5. **Target Accuracy**: 85%+ for document classification

### AI Service Endpoints

```
POST /api/v1/verify/document
  Input: { document_type, image_base64 }
  Output:  { valid, doc_type, confidence, extracted_data }

POST /api/v1/verify/complete
  Input: { government_id, proof_of_income, proof_of_address, wallet_data }
  Output:  { status, credit_score, tier, extracted_data, fraud_flags }

POST /api/v1/score/calculate
  Input: { user_id, extracted_data, wallet_data }
  Output: { score, breakdown, tier }

GET /api/v1/health
  Output: { status:  "healthy", models_loaded: true }
```

---

## Authentication System

### Hybrid Authentication Model

Avelon uses **email + wallet** authentication for accessibility:

```
┌─────────────────────────────────────────────────────────────┐
│                 AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1.  REGISTRATION (Email/Password)                           │
│     └─ User creates account with email                     │
│     └─ Password hashed with bcrypt (12 rounds)             │
│     └─ Verification email sent                             │
│                                                             │
│  2. EMAIL VERIFICATION                                      │
│     └─ User clicks link in email                           │
│     └─ Token validated (24-hour expiry)                    │
│     └─ Status: REGISTERED → VERIFIED                       │
│                                                             │
│  3. WALLET CONNECTION                                       │
│     └─ User connects MetaMask                              │
│     └─ User signs verification message                     │
│     └─ Signature verified on backend                       │
│     └─ Status:  VERIFIED → CONNECTED                        │
│                                                             │
│  4. KYC SUBMISSION                                          │
│     └─ User uploads documents                              │
│     └─ AI verifies documents                               │
│     └─ Credit score calculated                             │
│     └─ Status: CONNECTED → APPROVED/REJECTED               │
│                                                             │
│  SESSION MANAGEMENT:                                        │
│  ├─ NextAuth.js v5 for session handling                    │
│  ├─ JWT tokens (Access: 15min, Refresh: 7 days)            │
│  ├─ HTTP-only cookies                                      │
│  └─ CSRF protection enabled                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Wallet Verification

```typescript
// User signs a message to prove wallet ownership
const message = `Verify wallet ownership for Avelon
Account: ${userEmail}
Nonce: ${secureRandomNonce}
Timestamp: ${Date.now()}`;

const signature = await signer.signMessage(message);
// Backend verifies signature matches wallet address
```

### Security Measures

| Measure | Implementation |
|---------|----------------|
| Password Hashing | bcrypt with 12 rounds |
| Password Requirements | Min 8 chars, mixed case, number, special |
| JWT Tokens | Access: 15 min, Refresh: 7 days |
| Session Storage | HTTP-only cookies |
| CSRF Protection | Double-submit cookie pattern |
| Rate Limiting | 5 failed logins = 15 min lockout |
| Wallet Keys | NEVER stored by Avelon |