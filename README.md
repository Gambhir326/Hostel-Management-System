# Hostel Management System (HMS)

A modern, full-stack Hostel Management System built with **Next.js**, **React**, **MongoDB**, **Mongoose**, and **NextAuth**.

---

## 🌟 Key Features & Role Architecture

The system features a **4-tier role-based access control (RBAC)** architecture:

| Role | Portal / Dashboard | Permissions & Powers |
|---|---|---|
| 👑 **Master Admin** | `/MasterDashboard` | Root authority: Create & delete Warden accounts, view system-wide metrics and accounts |
| 🔑 **Warden** | `/WardenDashboard` | Block management: Resolve hostel complaints, approve/reject student leave requests, monitor student roster |
| 🎓 **Student** | `/StudentDashboard` | Self-service: View room & profile details, lodge complaints (`/CreateIssue`), request leaves |
| 👨‍👩‍👧 **Parent** | `/ParentDashboard` | Guardian portal: Monitor linked child's hostel profile, room details, and complaint resolution progress |

---

## 🛡️ Security & Hardening Features

- **bcrypt Password Hashing:** All credentials salted and encrypted (12 rounds) — never stored in plain text.
- **Login Firewall & Brute-force Protection:** Automatic 24-hour account lockout after 5 consecutive failed login attempts.
- **NoSQL Injection Guard:** Recursive query sanitization stripping dangerous MongoDB operators (`$gt`, `$ne`, etc.).
- **Sparse Indexing:** Non-student accounts (Parents, Wardens, Admins) coexist seamlessly without roll number collision.
- **Dynamic Device Tokens:** Per-device persistent login framework.

---

## 🎨 UI & UX Highlights

- **Adaptive Navigation:** Fully responsive Navbar with mobile hamburger drawer and live role badges.
- **Theme Engine:** Instant Dark / Light mode switching with high-contrast text rendering and `localStorage` persistence.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB Atlas** cluster or local MongoDB instance

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd Hostel-Management-System

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root (refer to `.env.example`):
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hostel_db
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Create Initial Root (Master Admin)
To bootstrap your first root administrator, configure and run the one-time setup script:
```bash
node scripts/createMasterAdmin.js
```
*(Once created, you can safely remove `scripts/createMasterAdmin.js` or keep it ignored via `.gitignore`.)*

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
