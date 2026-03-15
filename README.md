# ⚙️ CareerCoach — Backend

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4-black?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=for-the-badge&logo=render)

**REST API for CareerCoach — AI-powered career mentoring platform.**

[🌐 Live API](https://career-coach-backend-system.onrender.com) · [📹 Demo Video](https://drive.google.com/file/d/1LwdI9IZ2dAzteOhqkvgQfUxRVXHhMstv/view?usp=drive_link) · [🎨 Frontend Repo](https://github.com/rahman2220510189/career_coach)

</div>

---

## 🏗️ Architecture

```
Client (React)
      ↓
Express Server (Render)
      ↓
┌─────────────────────────────────┐
│  Routes                         │
│  /api/auth    → JWT Auth        │
│  /api/analyze → CV Analysis     │
│  /api/interview → Mock Interview│
│  /api/cv      → CV Builder      │
│  /api/contact → Contact Form    │
│  /api/admin   → Admin Panel     │
└─────────────────────────────────┘
      ↓                    ↓
MongoDB Atlas          Groq API
(Database)             (AI Engine)
```

---

## ✨ Key Features

### 🤖 Smart AI Key Rotation
```
Groq Key 1 → limit hit → Groq Key 2 → limit hit → back to Key 1 ♻️
```
Never runs out of AI quota. Automatically rotates between multiple API keys.

### 📄 PDF Parsing
- Extracts text from uploaded CV PDFs
- Handles edge cases (empty PDFs, scanned images)

### 🌐 Job URL Scraping
- Scrapes job descriptions from any URL
- Supports LinkedIn, Bdjobs, Indeed, and more
- Cleans HTML and extracts relevant text

### 🔐 Complete Auth System
- JWT authentication (7-day tokens)
- Password hashing with bcrypt (10 rounds)
- Forgot password via email (Nodemailer + Gmail)
- Reset token expires in 1 hour
- Role-based access (user / admin)

### 📊 Full CRUD Admin API
- User management (promote to admin / delete)
- View all analyses, interviews, CVs
- Contact message management (mark as read)
- Dashboard stats

---

## 🛠️ Tech Stack

```
Node.js 22        — Runtime
Express 4         — Web framework
MongoDB Atlas     — Database (via native driver)
JWT               — Authentication
bcryptjs          — Password hashing
Multer            — File upload handling
pdf-parse         — PDF text extraction
cheerio           — Web scraping
axios             — HTTP client for AI calls
nodemailer        — Email (password reset)
crypto            — Secure token generation
dotenv            — Environment variables
nodemon           — Development auto-reload
```

---

## 📁 Project Structure

```
career-coach-backend/
├── server.js
├── src/
│   ├── config/
│   │   ├── aiCall.js        ← AI call with key rotation
│   │   └── apiKeys.js       ← Key rotation logic
│   ├── middleware/
│   │   └── auth.js          ← JWT + Admin middleware
│   ├── models/
│   │   └── User.js          ← User CRUD operations
│   ├── routes/
│   │   ├── auth.js          ← Register, Login, Forgot/Reset Password
│   │   ├── analyze.js       ← CV analysis
│   │   ├── interview.js     ← Mock interview sessions
│   │   ├── cv.js            ← CV builder
│   │   ├── contact.js       ← Contact form
│   │   └── admin.js         ← Admin panel APIs
│   └── utils/
│       ├── analysisPrompt.js ← AI prompt builder
│       ├── cvPrompt.js       ← CV generation prompt
│       ├── pdfParse.js       ← PDF text extractor
│       ├── scrapeJob.js      ← Job URL scraper
│       └── sendEmail.js      ← Password reset email
└── package.json
```

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register         Register new user
POST   /api/auth/login            Login
GET    /api/auth/me               Get current user (JWT required)
POST   /api/auth/forgot-password  Send reset email
POST   /api/auth/reset-password   Reset password with token
```

### CV Analysis
```
POST   /api/analyze               Upload CV + Job URL → AI analysis
```

### Mock Interview
```
POST   /api/interview/start       Start interview session
POST   /api/interview/answer      Submit answer → get score + feedback
POST   /api/interview/finish      End session → get final score
```

### CV Builder
```
POST   /api/cv/generate           Generate ATS-friendly CV
GET    /api/cv/my-cvs             Get all CVs of current user
GET    /api/cv/:id                Get single CV
DELETE /api/cv/:id                Delete CV
```

### Contact
```
POST   /api/contact               Submit contact form
GET    /api/contact               Get all messages (Admin)
PATCH  /api/contact/:id/read      Mark as read (Admin)
```

### Admin
```
GET    /api/admin/stats           Dashboard stats
GET    /api/admin/users           All users
DELETE /api/admin/user/:id        Delete user
PATCH  /api/admin/user/:id/role   Change user role
GET    /api/admin/analyses        All CV analyses
GET    /api/admin/interviews      All interviews
GET    /api/admin/cvs             All generated CVs
GET    /api/admin/contacts        All contact messages
PATCH  /api/admin/contact/:id/read Mark message as read
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Groq API key(s)
- Gmail App Password

### Installation

```bash
# Clone the repo
git clone https://github.com/rahman2220510189/career-coach-backend.git
cd career-coach-backend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file — **never commit this to GitHub!**

```env
PORT=5000
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
JWT_SECRET=your_64_char_random_secret
GROK_KEY_1=your_groq_api_key_1
GROK_KEY_2=your_groq_api_key_2
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
```

> Generate JWT_SECRET:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Run Development Server

```bash
npm run dev
```

Server runs at [http://localhost:5000](http://localhost:5000)

---

## 🚀 Deployment (Render)

1. Push code to GitHub (without `.env`)
2. Create new **Web Service** on [render.com](https://render.com)
3. Connect GitHub repo
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add all Environment Variables in Render dashboard
7. Deploy!

---

## 🔒 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire in 7 days
- Reset tokens expire in 1 hour
- `.env` never committed to GitHub
- CORS restricted to frontend URL only
- Admin routes protected by role middleware
- Sensitive data never returned in responses

---

## 📄 License

MIT © 2026 [MD. Naymur Rahman](https://github.com/rahman2220510189)

---

<div align="center">
  Built with ❤️ in Dhaka, Bangladesh
  <br/>
  <a href="https://career-coach-backend-system.onrender.com">career-coach-backend-system.onrender.com</a>
</div>