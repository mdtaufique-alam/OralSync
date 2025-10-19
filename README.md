<h1 align="center">🦷 OralSync – Dental Platform with AI Voice Agent 🦷</h1>

![Demo App](/public/screenshot-for-readme.png)

Highlights:

- 🏠 Modern Landing Page with gradients & images
- 🔐 Authentication via Clerk (Google, GitHub, Email & Password)
- 🔑 Email Verification (6-digit code)
- 📅 Appointment Booking System
- 🦷 3-Step Booking Flow (Dentist → Service & Time → Confirm)
- 📩 Email Notifications for Bookings (Resend)
- 📊 Admin Dashboard for Managing Appointments
- 🗣️ AI Voice Agent powered by Vapi (Pro Plans only)
- 💳 Subscription Payments with Clerk (Free + 2 Paid Plans)
- 🧾 Automatic Invoices via Email
- 💸 Smart Subscription Upgrades (pay only the difference)
- 📂 PostgreSQL for Data Persistence
- 🎨 Styling with Tailwind CSS + Shadcn
- ⚡ Data Fetching with TanStack Query
- 🤖 CodeRabbit for PR Optimizations
- 🧑‍💻 Git & GitHub Workflow (branches, PRs, merges)
- 🚀 Deployment on Sevalla (free-tier friendly)

---

## 🧪 .env Setup

```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL=your_postgres_database_url

# Real-time AI Voice Assistant (FREE!)
GROQ_API_KEY=your_groq_api_key_here

# Pro Voice Features (Optional)
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key

# Admin & Email
ADMIN_EMAIL=your_admin_email@example.com
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=your_app_url
```

### 🆓 Free AI Setup (Real-time Voice Assistant)

1. **Get Groq API Key** (FREE!):
   - Visit: https://console.groq.com/
   - Sign up for free account
   - Get your API key
   - Add to `.env` file: `GROQ_API_KEY=your_key_here`

2. **Features**:
   - ✅ Real-time voice conversation
   - ✅ Ultra-fast responses (Groq)
   - ✅ Multiple free AI models
   - ✅ Streaming responses
   - ✅ No API costs for basic usage

## Run the app

```bash
1- npm install
2- npm run dev
```
