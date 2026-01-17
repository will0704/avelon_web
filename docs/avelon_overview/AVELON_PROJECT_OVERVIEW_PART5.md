# Avelon: Complete Project Overview - Part 5 of 6

## 12. AI Verification System

### 12.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 AI VERIFICATION PIPELINE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INPUT:  User-uploaded documents                             │
│  ├─ Government ID (image)                                  │
│  ├─ Proof of Income (image/PDF)                            │
│  └─ Proof of Address (image/PDF)                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              STAGE 1: PREPROCESSING                  │   │
│  │  ├─ Image quality check                             │   │
│  │  ├─ Format validation                               │   │
│  │  ├─ Size normalization (224x224)                    │   │
│  │  └─ Rotation correction                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              STAGE 2: OCR EXTRACTION                 │   │
│  │  ├─ Text extraction (Tesseract OCR)                 │   │
│  │  ├─ Field identification                            │   │
│  │  └─ Structured data output                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          STAGE 3: DOCUMENT CLASSIFICATION            │   │
│  │  ├─ CNN Model identifies document type              │   │
│  │  ├─ Categories:  Government ID, Payslip, Utility Bill│   │
│  │  └─ Confidence score output                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            STAGE 4: FRAUD DETECTION                  │   │
│  │  ├─ Tampering detection (image forensics)           │   │
│  │  ├─ Consistency checks (name, address match)        │   │
│  │  ├─ Format validation (ID numbers, dates)           │   │
│  │  └─ Anomaly scoring                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           STAGE 5: DATA EXTRACTION (NER)             │   │
│  │  ├─ Name extraction                                 │   │
│  │  ├─ Address extraction                              │   │
│  │  ├─ ID number extraction                            │   │
│  │  ├─ Income amount extraction                        │   │
│  │  └─ Date extraction (birth, expiry)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            STAGE 6: CREDIT SCORING                   │   │
│  │  ├─ Apply scoring formula (see Section 8)           │   │
│  │  ├─ Calculate final score (0-100)                   │   │
│  │  ├─ Determine tier assignment                       │   │
│  │  └─ Generate eligibility report                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  OUTPUT:                                                     │
│  ├─ Verification Status (APPROVED / REJECTED)              │
│  ├─ Credit Score (0-100)                                   │
│  ├─ Tier Assignment (Basic / Standard / Premium / VIP)     │
│  ├─ Extracted Data (name, address, income, etc.)           │
│  └─ Confidence Scores (per document)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 Accepted Documents

#### Government IDs (Philippines)

| ID Type | Fields Extracted |
|---------|------------------|
| Philippine National ID (PhilID) | Name, Address, Birthdate, PhilSys Number |
| Driver's License | Name, Address, Birthdate, License Number, Expiry |
| Passport | Name, Birthdate, Passport Number, Expiry |
| SSS ID / UMID | Name, SSS Number |
| Voter's ID | Name, Address, VIN |
| PRC ID | Name, PRC Number, Profession |

#### Proof of Income

| Document Type | Fields Extracted |
|---------------|------------------|
| Payslip | Employer, Gross Income, Net Income, Pay Period |
| Certificate of Employment | Employer, Position, Monthly Salary |
| ITR (Income Tax Return) | Annual Income, Tax Paid |
| Bank Statement | Account Holder, Average Balance, Income Deposits |

#### Proof of Address

| Document Type | Fields Extracted |
|---------------|------------------|
| Utility Bill (Electric/Water) | Name, Address, Bill Date |
| Barangay Certificate | Name, Address, Issue Date |
| Bank Statement | Name, Address |

### 12.3 Model Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI MODEL COMPONENTS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MODEL 1: Document Classifier (CNN)                         │
│  ├─ Architecture: ResNet-18 (pretrained, fine-tuned)       │
│  ├─ Input:  224x224 RGB image                               │
│  ├─ Output:  Document type + confidence                     │
│  ├─ Classes: 10 document types                             │
│  └─ Training Data: ~500-1000 samples per class (demo)      │
│                                                             │
│  MODEL 2: Text Extractor (OCR)                              │
│  ├─ Engine: Tesseract OCR 5.0                              │
│  ├─ Languages: English, Filipino                           │
│  └─ Post-processing: Regex for structured fields           │
│                                                             │
│  MODEL 3: Named Entity Recognition (NER)                    │
│  ├─ Architecture: BERT-based (fine-tuned)                  │
│  ├─ Entities: NAME, ADDRESS, ID_NUMBER, AMOUNT, DATE       │
│  └─ Training Data:  ~5,000 annotated samples (demo)         │
│                                                             │
│  MODEL 4: Fraud Detector                                    │
│  ├─ Architecture: Ensemble (CNN + Rule-based)              │
│  ├─ Detects: Image manipulation, text inconsistency        │
│  ├─ Features:  EXIF analysis, edge detection, copy-move     │
│  └─ Output: Fraud probability score (0-1)                  │
│                                                             │
│  MODEL 5: Credit Scorer                                     │
│  ├─ Architecture:  Gradient Boosting (XGBoost)              │
│  ├─ Input: Extracted features from all documents           │
│  ├─ Output: Credit score (0-100)                           │
│  └─ Features: Income, employment, document validity        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 12.4 AI Microservice API

```
┌─────────────────────────────────────────────────────────────┐
│                 AI SERVICE ENDPOINTS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Base URL: http://localhost:8000/api/v1                     │
│                                                             │
│  POST /verify/document                                      │
│  ├─ Input: { document_type, image_base64 }                 │
│  └─ Output: {                                              │
│       valid: boolean,                                      │
│       doc_type: string,                                    │
│       confidence: float,                                   │
│       extracted_data: object                               │
│     }                                                      │
│                                                             │
│  POST /verify/complete                                      │
│  ├─ Input: {                                               │
│       government_id: base64,                               │
│       proof_of_income:  base64,                             │
│       proof_of_address:  base64                             │
│     }                                                      │
│  └─ Output:  {                                              │
│       status:  "APPROVED" | "REJECTED",                     │
│       credit_score: 0-100,                                 │
│       tier: "BASIC" | "STANDARD" | "PREMIUM" | "VIP",      │
│       extracted_data: {                                    │
│         name: string,                                      │
│         address: string,                                   │
│         birth_date: string,                                │
│         monthly_income: number,                            │
│         employment_type: string                            │
│       },                                                   │
│       document_scores: {                                   │
│         government_id: float,                              │
│         proof_of_income:  float,                            │
│         proof_of_address: float                            │
│       },                                                   │
│       fraud_flags: string[],                               │
│       rejection_reasons: string[]                          │
│     }                                                      │
│                                                             │
│  POST /score/calculate                                      │
│  ├─ Input: { user_id, extracted_data, wallet_data }        │
│  └─ Output: { score, breakdown, tier }                     │
│                                                             │
│  GET /health                                                │
│  └─ Output: { status:  "healthy", models_loaded: true }     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 12.5 Training Data Strategy (Demo)

For the capstone demonstration, training data will be sourced from:

| Data Type | Source | Quantity |
|-----------|--------|----------|
| Government IDs | Synthetic generated samples + team member samples (redacted) | ~500 samples |
| Payslips | Template-based generation | ~300 samples |
| Utility Bills | Template-based generation | ~200 samples |
| Fraud Samples | Manually manipulated documents | ~100 samples |

**Data Augmentation Techniques:**
- Rotation (±15°)
- Brightness/contrast variation
- Gaussian noise
- Perspective transformation
- Partial occlusion

### 12.6 Model Training Workflow (Google Colab)

```python
# Example Colab Notebook:  Document Classifier Training

# Cell 1: Check GPU availability
import torch
print(f"GPU Available: {torch.cuda.is_available()}")
print(f"GPU Name: {torch. cuda.get_device_name(0) if torch.cuda. is_available() else 'None'}")

# Cell 2: Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')

# Cell 3: Install dependencies
!pip install torch torchvision pillow

# Cell 4: Import libraries
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from torch.utils.data import DataLoader, Dataset
from PIL import Image
import os

# Cell 5: Define model
class DocumentClassifier(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.resnet = models.resnet18(pretrained=True)
        self.resnet. fc = nn.Linear(512, num_classes)
    
    def forward(self, x):
        return self.resnet(x)

# Cell 6: Training loop
device = torch.device('cuda' if torch. cuda.is_available() else 'cpu')
model = DocumentClassifier(num_classes=10).to(device)
criterion = nn. CrossEntropyLoss()
optimizer = torch.optim. Adam(model.parameters(), lr=0.001)

num_epochs = 10
for epoch in range(num_epochs):
    model.train()
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
    
    print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')

# Cell 7: Save model to Google Drive
torch.save(model. state_dict(), '/content/drive/MyDrive/avelon_models/document_classifier. pt')
print("Model saved!")
```

### 12.7 Model Update Schedule

| Task | Frequency | Description |
|------|-----------|-------------|
| Model Retraining | Weekly (Sunday 2 AM) | Retrain on new verified samples |
| Fraud Pattern Update | Weekly | Update fraud detection rules |
| Performance Evaluation | Weekly | Accuracy, precision, recall metrics |
| Model Deployment | After validation | Blue-green deployment |

### 12.8 AI Service Implementation

```python
# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
from typing import Optional, List

from app.services.classifier_service import DocumentClassifier
from app.services.ocr_service import OCRService
from app.services.extractor_service import EntityExtractor
from app.services.fraud_service import FraudDetector
from app.services.scorer_service import CreditScorer

app = FastAPI(title="Avelon AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
classifier = DocumentClassifier()
ocr = OCRService()
extractor = EntityExtractor()
fraud_detector = FraudDetector()
scorer = CreditScorer()

class DocumentVerifyRequest(BaseModel):
    document_type: str
    image_base64: str

class CompleteVerifyRequest(BaseModel):
    government_id: str
    proof_of_income: str
    proof_of_address:  str
    wallet_age_months: Optional[int] = 0
    transaction_count: Optional[int] = 0
    eth_balance: Optional[float] = 0.0

class VerificationResponse(BaseModel):
    status: str
    credit_score: int
    tier: str
    extracted_data: dict
    document_scores:  dict
    fraud_flags: List[str]
    rejection_reasons: List[str]

@app.get("/health")
async def health_check():
    return {
        "status":  "healthy",
        "models_loaded":  True,
        "version": "1.0.0"
    }

@app. post("/api/v1/verify/document")
async def verify_single_document(request:  DocumentVerifyRequest):
    try: 
        # Decode image
        image_bytes = base64.b64decode(request. image_base64)
        
        # Classify document
        doc_type, confidence = classifier.classify(image_bytes)
        
        # Extract text via OCR
        text = ocr.extract_text(image_bytes)
        
        # Extract entities
        entities = extractor.extract(text, doc_type)
        
        # Check for fraud
        fraud_score = fraud_detector. analyze(image_bytes, text)
        
        return {
            "valid":  confidence > 0.8 and fraud_score < 0.3,
            "doc_type": doc_type,
            "confidence": confidence,
            "extracted_data": entities,
            "fraud_score": fraud_score
        }
    except Exception as e: 
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/verify/complete", response_model=VerificationResponse)
async def verify_complete(request: CompleteVerifyRequest):
    try:
        results = {}
        extracted_data = {}
        fraud_flags = []
        rejection_reasons = []
        
        # Process each document
        for doc_type, image_b64 in [
            ("government_id", request.government_id),
            ("proof_of_income", request.proof_of_income),
            ("proof_of_address", request. proof_of_address)
        ]: 
            image_bytes = base64.b64decode(image_b64)
            
            # Classify
            detected_type, confidence = classifier.classify(image_bytes)
            results[doc_type] = confidence
            
            # OCR + Extract
            text = ocr.extract_text(image_bytes)
            entities = extractor.extract(text, doc_type)
            extracted_data. update(entities)
            
            # Fraud check
            fraud_score = fraud_detector. analyze(image_bytes, text)
            if fraud_score > 0.5:
                fraud_flags. append(f"Suspected tampering in {doc_type}")
        
        # Calculate credit score
        wallet_data = {
            "age_months": request.wallet_age_months,
            "transaction_count": request.transaction_count,
            "eth_balance": request.eth_balance
        }
        
        score_result = scorer.calculate(
            extracted_data=extracted_data,
            document_scores=results,
            wallet_data=wallet_data,
            fraud_flags=fraud_flags
        )
        
        # Determine status
        if score_result["score"] < 40:
            status = "REJECTED"
            rejection_reasons. append("Credit score below minimum threshold")
        elif len(fraud_flags) > 0:
            status = "REJECTED"
            rejection_reasons.extend(fraud_flags)
        else: 
            status = "APPROVED"
        
        return VerificationResponse(
            status=status,
            credit_score=score_result["score"],
            tier=score_result["tier"],
            extracted_data=extracted_data,
            document_scores=results,
            fraud_flags=fraud_flags,
            rejection_reasons=rejection_reasons
        )
    except Exception as e: 
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn. run(app, host="0.0.0.0", port=8000)
```

---

## 13. Security & Compliance

### 13.1 Authentication Security

| Measure | Implementation |
|---------|----------------|
| Password Hashing | bcrypt with 12 rounds |
| Password Requirements | Min 8 chars, uppercase, lowercase, number, special |
| JWT Tokens | Access:  15 min, Refresh: 7 days |
| Session Storage | HTTP-only cookies |
| CSRF Protection | Double-submit cookie pattern |
| Rate Limiting | 5 failed logins = 15 min lockout |
| 2FA (Future) | TOTP via authenticator app |

### 13.2 Data Encryption

| Data Type | At Rest | In Transit |
|-----------|---------|------------|
| Passwords | bcrypt hash | HTTPS/TLS 1.3 |
| KYC Documents | AES-256 encrypted | HTTPS/TLS 1.3 |
| Personal Data | AES-256 encrypted | HTTPS/TLS 1.3 |
| Wallet Addresses | Plain (public data) | HTTPS/TLS 1.3 |
| Session Tokens | - | HTTPS/TLS 1.3 |

### 13.3 Smart Contract Security

| Vulnerability | Mitigation |
|---------------|------------|
| Reentrancy | OpenZeppelin ReentrancyGuard |
| Integer Overflow | Solidity 0.8+ built-in checks |
| Access Control | Role-based permissions |
| Front-running | Commit-reveal scheme (if needed) |
| Oracle Manipulation | Admin-controlled oracle (demo) |
| Denial of Service | Gas limits, input validation |

### 13.4 KYC Process

```
┌─────────────────────────────────────────────────────────────┐
│                      KYC LEVELS                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LEVEL 1: BASIC VERIFICATION                                │
│  ├─ Requirements:                                            │
│  │   ├─ Valid Government ID                                │
│  │   └─ Selfie holding ID (optional for demo)              │
│  ├─ Loan Limit: 0.1 ETH                                    │
│  └─ Processing:  Automated (AI)                             │
│                                                             │
│  LEVEL 2: STANDARD VERIFICATION                             │
│  ├─ Requirements:                                           │
│  │   ├─ Level 1 documents                                  │
│  │   └─ Proof of Income                                    │
│  ├─ Loan Limit: 0.5 ETH                                    │
│  └─ Processing:  Automated (AI) + Manual review if flagged  │
│                                                             │
│  LEVEL 3: ENHANCED VERIFICATION                             │
│  ├─ Requirements:                                           │
│  │   ├─ Level 2 documents                                  │
│  │   ├─ Proof of Address                                   │
│  │   └─ Video verification call (optional)                 │
│  ├─ Loan Limit: 2. 0 ETH                                    │
│  └─ Processing: AI + Manual review required                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 13.5 AML Procedures

| Check | Trigger | Action |
|-------|---------|--------|
| Transaction Monitoring | Loan amount > 0.5 ETH | Flag for manual review |
| Velocity Check | > 3 loan applications/month | Flag for review |
| Wallet Screening | Every loan application | Check against public blacklists |
| Duplicate Detection | Every KYC submission | Check if ID used by another account |
| Unusual Patterns | AI anomaly detection | Flag for investigation |

**AML Workflow:**
```
1. User submits loan application
2. System runs automated checks: 
   - Transaction amount check
   - Velocity check
   - Wallet screening
   - Duplicate document check
3. If flagged: 
   - Application paused
   - Admin notified
   - Manual review required
4. Admin reviews and approves/rejects
5. Decision logged with reason
```

### 13.6 Data Privacy (RA 10173 Compliance)

**Republic Act 10173 - Data Privacy Act of 2012**

| Requirement | Implementation |
|-------------|----------------|
| **Consent** | Explicit consent checkbox during registration |
| **Purpose Limitation** | Data collected only for lending purposes |
| **Proportionality** | Minimum necessary data collected |
| **Transparency** | Clear privacy policy, data usage explanation |
| **Data Subject Rights** | Export data, request deletion |
| **Security** | Encryption, access controls, audit logs |
| **Retention** | 5 years after account closure (legal requirement) |
| **Breach Notification** | Within 72 hours of discovery |

**Privacy Features:**
- Privacy policy page (mandatory read before signup)
- Consent management (granular permissions)
- Data export (user can download their data)
- Account deletion (with data anonymization)
- Audit logging (track all data access)

### 13.7 Wallet Security

| Aspect | Policy |
|--------|--------|
| Private Keys | NEVER stored by Avelon |
| Wallet Verification | Signature-based proof of ownership |
| Multiple Wallets | Users can link multiple wallets |
| Wallet Recovery | NOT supported (user responsibility) |
| Transaction Signing | Always on user's device (MetaMask) |

---

## 14. Technology Stack

### 14.1 Complete Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FRONTEND (WEB) - avelon_web                                │
│  ├─ Framework: Next.js 14+ (App Router)                    │
│  ├─ Language: TypeScript 5.x                               │
│  ├─ Styling: TailwindCSS 3.x                               │
│  ├─ Animations: Framer Motion 10. x                         │
│  ├─ State:  React Query (TanStack Query) + Zustand          │
│  ├─ Forms: React Hook Form + Zod                           │
│  ├─ Auth: NextAuth.js v5 (Auth. js)                         │
│  └─ Web3:  Wagmi v2 + RainbowKit                            │
│                                                             │
│  FRONTEND (MOBILE) - avelon_mobile                          │
│  ├─ Framework: React Native 0.73+                          │
│  ├─ Navigation: React Navigation 6.x                       │
│  ├─ Styling: NativeWind (TailwindCSS)                      │
│  ├─ State: React Query + Zustand                           │
│  ├─ Auth:  Secure storage + JWT                             │
│  ├─ Web3: WalletConnect v2                                 │
│  └─ Notifications: Firebase Cloud Messaging                │
│                                                             │
│  BACKEND - avelon_backend                                   │
│  ├─ Framework: Hono 4.x                                    │
│  ├─ Runtime: Node.js 20 LTS                                │
│  ├─ Language: TypeScript 5.x                               │
│  ├─ Validation: Zod                                        │
│  ├─ Database ORM: Prisma 5.x                               │
│  └─ API Docs:  Scalar (OpenAPI)                             │
│                                                             │
│  DATABASE & CACHE                                           │
│  ├─ Primary DB: PostgreSQL 16                              │
│  ├─ ORM: Prisma                                            │
│  ├─ Cache:  Redis 7.x                                       │
│  └─ File Storage: Local / MinIO (S3-compatible)            │
│                                                             │
│  AI/ML SERVICE - avelon_llm                                 │
│  ├─ Framework: FastAPI                                     │
│  ├─ Language: Python 3.11+                                 │
│  ├─ ML Libraries: PyTorch, Transformers, OpenCV            │
│  ├─ OCR: Tesseract 5.0                                     │
│  ├─ Containerization: Docker                               │
│  └─ Training: Google Colab (Free GPU)                      │
│                                                             │
│  BLOCKCHAIN                                                 │
│  ├─ Network: Ethereum (Ganache for demo)                   │
│  ├─ Language: Solidity 0.8.19+                             │
│  ├─ Framework: Hardhat 2.x                                 │
│  ├─ Libraries: OpenZeppelin Contracts 5.x                  │
│  ├─ Testing: Hardhat + Chai + Ethers.js                    │
│  └─ Client Library:  Ethers.js v6                           │
│                                                             │
│  EMAIL & NOTIFICATIONS                                      │
│  ├─ Email Provider:  Resend (free tier)                     │
│  ├─ Email Templates: React Email                           │
│  ├─ Push Notifications: Firebase Cloud Messaging           │
│  └─ In-App:  WebSocket / Server-Sent Events                 │
│                                                             │
│  SHARED TYPES - avelon_types                                │
│  ├─ Language: TypeScript                                   │
│  ├─ Distribution: GitHub Packages (npm)                    │
│  └─ Used by: web, mobile, backend                          │
│                                                             │
│  DEVOPS & TOOLING                                           │
│  ├─ Version Control: Git + GitHub                          │
│  ├─ CI/CD: GitHub Actions                                  │
│  ├─ Containerization: Docker + Docker Compose              │
│  ├─ Local Blockchain: Ganache                              │
│  ├─ API Testing: Postman / Insomnia                        │
│  └─ Code Quality: ESLint, Prettier, Husky                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 14.2 Cost Analysis - 100% Free Stack

| Category | Tools | Cost |
|----------|-------|------|
| **Frameworks & Libraries** | Next.js, React Native, Hono, PyTorch, etc. | **$0** |
| **Local Development** | Docker, Ganache, PostgreSQL, Redis | **$0** |
| **Hosting (Demo)** | Vercel, Railway/Render, Supabase | **$0** (free tiers) |
| **Email** | Resend | **$0** (3,000/month free) |
| **Push Notifications** | Firebase | **$0** (unlimited) |
| **OCR** | Tesseract | **$0** (open source) |
| **ML Training** | Google Colab | **$0** (free GPU) |
| **TOTAL** | | **$0** |

### 14.3 Package Versions

**Frontend (package.json):**
```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^10.18.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "next-auth": "^5.0.0-beta",
    "wagmi": "^2.5.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "ethers": "^6.10.0"
  }
}
```

**Backend (package.json):**
```json
{
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.4.0",
    "@prisma/client": "^5.8.0",
    "zod": "^3.22.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "resend": "^3.0.0",
    "@react-email/components": "^0.0.14",
    "ethers": "^6.10.0",
    "ioredis": "^5.3.0",
    "firebase-admin": "^12.0.0",
    "node-cron": "^3.0.0"
  },
  "devDependencies": {
    "prisma":  "^5.8.0",
    "hardhat": "^2.19.0",
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@openzeppelin/contracts":  "^5.0.0"
  }
}
```

**AI Service (requirements.txt):**
```txt
fastapi==0.109.0
uvicorn==0.27.0
python-multipart==0.0.6
torch==2.1.0
torchvision==0.16.0
transformers==4.36.0
scikit-learn==1.4.0
xgboost==2.0.0
opencv-python==4.9.0.80
Pillow==10.2.0
pytesseract==0.3.10
spacy==3.7.0
numpy==1.26.0
pandas==2.2.0
pydantic==2.5.0
python-dotenv==1.0.0
```

### 14.4 Development Environment Setup

**Docker Compose (avelon_backend/docker-compose.yml):**
```yaml
version: '3.8'

services:
  postgres: 
    image: postgres:16
    container_name: avelon_postgres
    environment:
      POSTGRES_USER: avelon
      POSTGRES_PASSWORD: avelon_password
      POSTGRES_DB: avelon_db
    ports: 
      - "5432:5432"
    volumes: 
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: avelon_redis
    ports:
      - "6379:6379"
    volumes: 
      - redis_data:/data

  ganache:
    image: trufflesuite/ganache: latest
    container_name: avelon_ganache
    ports:
      - "8545:8545"
    command: >
      --chain. chainId 1337
      --wallet.totalAccounts 10
      --wallet.defaultBalance 1000
      --miner.blockGasLimit 30000000

volumes:
  postgres_data:
  redis_data:
```

---

*End of Part 5 - Continue to Part 6 for Database Schema, API Specification, Development Roadmap, and Appendices*