# 🦷 DentWise - Modern Dental Practice Management Platform

A comprehensive dental practice management platform built with Next.js, featuring appointment booking, patient management, and AI-powered voice assistance.

## ✨ Features

- 🏠 **Modern Landing Page** with beautiful gradients and responsive design
- 🔐 **Authentication** via Clerk (Google, GitHub, Email & Password)
- 📅 **Appointment Booking System** with 3-step booking flow
- 🦷 **Doctor Management** with specialties and availability
- 📩 **Email Notifications** for appointment confirmations (Resend)
- 📊 **Admin Dashboard** for managing appointments and doctors
- 🗣️ **AI Voice Agent** powered by Vapi (Pro Plans)
- 💳 **Subscription Management** with Clerk billing
- 🎨 **Modern UI** with Tailwind CSS and Shadcn components
- ⚡ **Fast Performance** with Next.js 15 and Turbopack

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dentwise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your API keys:
   ```bash
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Database
   DATABASE_URL="file:./dev.db"
   
   # Vapi AI (Optional)
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
   NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key
   
   # Admin
   ADMIN_EMAIL=admin@yourdomain.com
   
   # Email Service
   RESEND_API_KEY=your_resend_api_key
   
   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Authentication**: Clerk
- **Database**: SQLite (Prisma ORM)
- **Email**: Resend
- **AI Voice**: Vapi
- **State Management**: TanStack Query
- **Deployment**: Vercel/Netlify ready

## 📁 Project Structure

```
dentwise/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                # Utility functions and configurations
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
└── scripts/               # Utility scripts
```

## 🔧 Configuration

### Admin Access

To access the admin dashboard, set your email in the `ADMIN_EMAIL` environment variable and sign up with that email address.

### Email Setup

1. Create a Resend account at [resend.com](https://resend.com)
2. Get your API key and add it to `.env.local`
3. Configure your domain for production use

### AI Voice Setup (Optional)

1. Create a Vapi account at [vapi.ai](https://vapi.ai)
2. Set up your assistant and get the API keys
3. Add the keys to your environment variables

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app is compatible with any platform that supports Next.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.