# 🩸 Blood Bank Management System

> **Hackathon Project** — React.js + Node.js + MySQL  
> Domain: Healthcare | Difficulty: Intermediate

---

## 📁 Project Structure

```
blood-bank/
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   ├── db.js             # MySQL connection pool
│   │   └── mailer.js         # Nodemailer email alerts
│   ├── routes/
│   │   ├── donors.js         # Donor registration & history
│   │   ├── donations.js      # Record donation + eligibility
│   │   ├── inventory.js      # Blood group stock levels
│   │   ├── hospitals.js      # Hospital registration
│   │   └── requests.js       # Blood request + approve/reject
│   ├── server.js             # Express app entry point
│   ├── .env.example          # Environment variables template
│   └── package.json
│
├── frontend/                 # React.js SPA
│   ├── public/index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx    # Sidebar + navigation
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Overview + inventory grid
│   │   │   ├── DonorRegister.jsx     # Donor registration form
│   │   │   ├── EligibilityCheck.jsx  # 90-day eligibility checker
│   │   │   ├── DonationHistory.jsx   # All / per-donor history
│   │   │   ├── RecordDonation.jsx    # Log new donation
│   │   │   ├── HospitalRegister.jsx  # Hospital onboarding
│   │   │   ├── RequestBlood.jsx      # Hospital blood request form
│   │   │   ├── AdminRequests.jsx     # Approve / reject requests
│   │   │   └── AdminInventory.jsx    # Edit stock levels
│   │   ├── utils/api.js      # Axios API helpers
│   │   ├── App.js            # React Router routes
│   │   └── App.css           # Global styles
│   └── package.json
│
├── database.sql              # Full MySQL schema + seed data
└── README.md                 # This file
```

---

## ⚙️ Setup Instructions

### Step 1 — Prerequisites
- Node.js v18+
- MySQL 8.0+
- npm or yarn

---

### Step 2 — Database Setup

Open MySQL Workbench or CLI and run:

```sql
-- (Paste the full contents of database.sql here)
-- OR run: mysql -u root -p < database.sql
```

This creates:
- `blood_bank` database
- All 6 tables: `donors`, `donations`, `blood_inventory`, `blood_requests`, `hospitals`, `eligibility_checks`
- Seeds all 8 blood groups with initial stock

---

### Step 3 — Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and Gmail SMTP details
npm install
npm run dev        # Runs on http://localhost:5000
```

**Gmail SMTP Setup (for email alerts):**
1. Go to Google Account → Security → 2-Step Verification → App Passwords
2. Generate an app password for "Mail"
3. Use that 16-char password as `EMAIL_PASS` in `.env`

---

### Step 4 — Frontend Setup

```bash
cd frontend
npm install
npm start          # Runs on http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/donors/register` | Register new donor |
| GET | `/api/donors` | List all donors |
| GET | `/api/donors/:id/history` | Donor's donation history |
| POST | `/api/donate` | Record donation (with eligibility check) |
| GET | `/api/donate/check-eligibility/:id` | 90-day eligibility check |
| GET | `/api/donate/all` | All donation records |
| GET | `/api/inventory` | Current blood group stock |
| PUT | `/api/inventory/:blood_group` | Update stock (admin) |
| POST | `/api/hospitals/register` | Register hospital |
| GET | `/api/hospitals` | List hospitals |
| POST | `/api/request` | Hospital requests blood |
| GET | `/api/request` | All requests |
| PUT | `/api/request/:id/approve` | Admin approves request |
| PUT | `/api/request/:id/reject` | Admin rejects request |

---

## ✨ Key Features

### 🩸 Blood Group Inventory Dashboard
- Real-time stock levels for all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Visual status indicators: ✅ Good / ⚠️ Low / 🚨 Critical
- Configurable low-stock threshold per blood group

### ⏱️ 90-Day Eligibility Check
- Automatically checks last donation date before recording
- Returns days remaining if not eligible
- Logged to `eligibility_checks` table

### 🏥 Hospital Request Workflow
- Hospitals submit blood requests with urgency level (normal / urgent / critical)
- Admin can approve (deducts stock with **MySQL transaction lock**) or reject
- Email notification sent to hospital on status change

### 📧 Urgent Donor Alert Emails
- Triggered when stock drops ≤ threshold after a donation or manual update
- Emails only **eligible donors** (≥ 90 days since last donation) of matching blood group
- Beautiful HTML email template via Nodemailer

### 📋 Donation History
- View all donations or filter by individual donor
- Shows test result (passed/failed), units, date, notes

---

## 🧪 Testing the System

1. Register a donor (Donor Registration page)
2. Record a donation for that donor (Record Donation page)
3. Try recording another donation immediately → should get **not eligible** error
4. Register a hospital (Hospital Registration page)
5. Submit a blood request (Request Blood page)
6. Approve/reject on Admin → Manage Requests page
7. Check inventory updates on Dashboard

---

## 📊 Database Schema

```
donors          → id, name, email, phone, blood_group, date_of_birth
donations       → id, donor_id, blood_group, units, donation_date, test_result, notes
blood_inventory → id, blood_group (UNIQUE), units_available, low_stock_threshold
hospitals       → id, name, email, phone, address
blood_requests  → id, hospital_id, blood_group, units_requested, urgency, status
eligibility_checks → id, donor_id, checked_at, is_eligible, reason
```

---

## 🏆 Hackathon Marks Breakdown

| Category | Max Marks | Key Deliverables |
|----------|-----------|-----------------|
| Prototype / Design | 100 | UI screenshots, PPT slides, DB diagram |
| Complete Implementation | 100 | All API endpoints, all frontend pages, email alerts |

**PPT should include:**
- Problem statement
- Architecture diagram (Frontend ↔ Backend ↔ MySQL)
- Database ER diagram
- Screenshots of each page
- Live demo flow
- Team members

---

*Built with React.js + Node.js + Express + MySQL + Nodemailer*
