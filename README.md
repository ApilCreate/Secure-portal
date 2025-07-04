# **Secure Portal**

A modern, secure authentication portal built with **Next.js**, **Prisma**, and **SQLite**. Featuring advanced security with Two-Factor Authentication (2FA), OTP-based email verification, Google reCAPTCHA, and more. Enjoy a responsive, dark-themed UI with glassmorphism design and animated backgrounds.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2E3440?logo=prisma)](https://www.prisma.io/)

## **Table of Contents**

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Utilities](#utilities)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [NPM Packages](#npm-packages)
- [NPX Commands](#npx-commands)

## **Project Overview**

Secure Portal is a full-stack web application delivering a robust and user-friendly authentication system. It combines industry-standard security practices with a sleek, responsive UI. Built with modern web technologies, it showcases secure authentication workflows and a visually engaging glassmorphism design.

**Key Highlights:**
- OTP-based email verification for registration
- Two-Factor Authentication (TOTP-based)
- Google reCAPTCHA v2 for bot protection
- Account lockout after failed login attempts
- Real-time activity logging and email notifications
- Dark-themed, responsive UI with animations

## **Features**

- **User Registration**: OTP-based email verification
- **User Login**: Optional 2FA with TOTP
- **Password Reset**: Strength validation and match check
- **Account Deletion**: Password or 2FA confirmation with email
- **Bot Protection**: Google reCAPTCHA v2
- **Password Strength Meter**: Visual feedback for secure passwords
- **Activity Log**: Tracks login, logout, and security events
- **Account Lockout**: Locks after 5 failed attempts (15-min cooldown)
- **UI Enhancements**: Password visibility toggle, real-time toast notifications
- **Responsive Design**: Dark-themed UI with glassmorphism and animations

## **Technologies Used**

### Frontend
- **Next.js 14** (App Router)
- **React**
- **Tailwind CSS**
- **Lucide React** (Icons)
- **react-hot-toast**
- **react-google-recaptcha**

### Backend
- **Node.js**
- **Prisma ORM**
- **SQLite** (supports PostgreSQL/MySQL)

### Security
- **bcryptjs**: Password hashing
- **speakeasy**: TOTP-based 2FA
- **Nodemailer**: Email notifications (SMTP via Gmail)
- **qrcode**: QR code generation for 2FA

## **Utilities**
- **date-fns**: Date manipulation
- **PostCSS & Autoprefixer**: CSS processing

## **Getting Started**

Follow these steps to set up and run Secure Portal locally.

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Gmail Account**: For Nodemailer (App Password required)
- **Google reCAPTCHA v2**: Site Key and Secret Key

### Installation
1. Open the file:
   ```bash
   cd secure-portal
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize Prisma:
   ```bash
   npx prisma init
   npx prisma migrate dev --name init
   npx prisma generate
   ```

### Environment Configuration
Create a `.env` file in the root directory with the following:

```bash
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM="Secure Portal <your-gmail-address@gmail.com>"
JWT_SECRET=your-32-character-jwt-secret
```

Replace placeholders with actual values.

### Running the Application
1. Start the development server:
   ```bash
   npm run dev
   ```
2. View the database in real-time:
   ```bash
   npx prisma studio
   ```
3. Or, import `prisma/dev.db` into SQLite.
4. Open the app at: [http://localhost:3000](http://localhost:3000)

## **Project Structure**

```plaintext
├── app/              # Next.js App Router pages and API routes
├── components/       # Reusable React components
├── lib/              # Utility functions and configurations
├── prisma/           # Prisma schema and migrations
├── public/           # Static assets (images, fonts, etc.)
├── styles/           # Global CSS and Tailwind configs
├── .env              # Environment variables
├── package.json      # Project dependencies and scripts
├── readme.md         # Project documentation
```

## **Security Features**
- **Password Hashing**: bcryptjs
- **2FA**: TOTP via speakeasy
- **OTP Email Verification**: Secure registration
- **Google reCAPTCHA v2**: Bot protection
- **Account Lockout**: 5 failed attempts trigger 15-minute lock
- **JWT Authentication**: Secure API routes
- **Activity Logging**: Tracks key user actions in the database

## **NPM Packages**

### Runtime & Framework
```bash
npm install next
npm install react
npm install react-dom
```

### Styling & UI
```bash
npm install tailwindcss
npm install postcss
npm install autoprefixer
npm install three
npm install vanta
npm install lucide-react
npm install react-hot-toast
npm install react-google-recaptcha
```

### Database & ORM
```bash
npm install @prisma/client
npm install prisma --save-dev
npm install sqlite3
```

### Authentication & Security
```bash
npm install bcryptjs
npm install speakeasy
npm install nodemailer
npm install date-fns
npm install qrcode
npm install jwt-decode
```

## **NPX Commands**

### Initialize Prisma
```bash
npx prisma init
```

### Apply Migrations
```bash
npx prisma migrate dev --name init
```

### Generate Prisma Client
```bash
npx prisma generate
```
