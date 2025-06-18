# Secure Auth Portal (Next.js + Prisma + 2FA + OTP + CAPTCHA)

This is a secure authentication portal built using Next.js, Prisma, Tailwind CSS, and SQLite. The application includes:

- OTP-based email verification during registration
- Optional Two-Factor Authentication (2FA)
- Google reCAPTCHA to prevent bots
- Password strength meter
- Activity log for user actions (login, logout, password changes, 2FA updates)
- Account lockout protection after failed login attempts
- Secure password handling with bcrypt encryption
- Animated dark-themed UI with glassmorphism design
- Responsive mobile-friendly layout

## Features

- Registration with email verification (OTP)
- Login with optional 2FA verification
- Forgot password and reset functionality
- Password strength indicator
- CAPTCHA validation using Google reCAPTCHA v2
- Account deletion with 2FA check (if enabled)
- View and manage activity logs
- Toggle password visibility
- Feedback via toast messages instead of labels

## Technologies Used

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Node.js, Prisma ORM, SQLite (can be changed)
- **Security:** bcrypt, OTP, 2FA (TOTP), CAPTCHA
- **Email:** Nodemailer (Gmail SMTP)
- **Icons:** Lucide React
- **Notifications:** react-hot-toast

## Getting Started

### 1. Running the project

i. Type cd secure-portal
ii. After that typenpm run dev
iii.  Click on  - Local: http://localhost:3000

### 2. Install Dependencies

npm install

## NPM Packages Used

# Runtime & Framework
npm install next react react-dom

# Styling & UI
npm install tailwindcss postcss autoprefixer
npm install lucide-react
npm install react-hot-toast
npm install react-google-recaptcha

# Database & ORM
npm install @prisma/client
npm install prisma --save-dev
npm install sqlite3

# Authentication & Security
npm install bcryptjs
npm install speakeasy
npm install nodemailer
npm install date-fns
npm install qrcode

## NPX Commands Used

# Initialize Prisma
npx prisma init

# Apply Prisma migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
