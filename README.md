# Secure Portal

A modern authentication portal built with Next.js, Prisma, and SQLite, designed to demonstrate a complete and secure user authentication flow. It includes Two-Factor Authentication (2FA), OTP-based email verification, Google reCAPTCHA protection, account lockout safeguards, and a responsive dark-themed UI with glassmorphism styling and animated backgrounds.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2E3440?logo=prisma)](https://www.prisma.io/)

## Table of Contents

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
- [Development Notes](#development-notes)

## Project Overview

Secure Portal is a full-stack web application that delivers a robust, user-friendly authentication system built on modern web technologies. It combines industry-standard security practices, such as password hashing, two-factor authentication, and bot protection, with a polished, responsive interface featuring a dark theme, glassmorphism design, and subtle animations.

Key highlights include:

- OTP-based email verification during registration
- Optional Two-Factor Authentication using TOTP
- Google reCAPTCHA v2 for bot protection
- Account lockout after repeated failed login attempts
- Real-time activity logging and email notifications
- A dark-themed, responsive UI with smooth animations

## Features

- User Registration: OTP-based email verification before account activation
- User Login: Optional 2FA using TOTP for an additional layer of security
- Password Reset: Strength validation and confirmation matching
- Account Deletion: Requires password or 2FA confirmation, with email notification
- Bot Protection: Google reCAPTCHA v2 on key forms
- Password Strength Meter: Real-time visual feedback while creating a password
- Activity Log: Records login, logout, and other security-related events
- Account Lockout: Locks an account after five failed login attempts, with a fifteen-minute cooldown
- UI Enhancements: Password visibility toggle and real-time toast notifications
- Responsive Design: Dark-themed UI with glassmorphism elements and animated backgrounds

## Technologies Used

### Frontend

- Next.js 14 (App Router)
- React
- Tailwind CSS
- Lucide React for icons
- react-hot-toast for notifications
- react-google-recaptcha for bot protection

### Backend

- Node.js
- Prisma ORM
- SQLite (with support for PostgreSQL or MySQL)

### Security

- bcryptjs for password hashing
- speakeasy for TOTP-based 2FA
- Nodemailer for email notifications via SMTP (Gmail)
- qrcode for generating 2FA setup QR codes

## Utilities

- date-fns for date manipulation
- PostCSS and Autoprefixer for CSS processing

## Getting Started

Follow these steps to set up and run Secure Portal locally.

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A Gmail account for sending emails via Nodemailer (an App Password is required)
- A Google reCAPTCHA v2 site key and secret key

### Installation

1. Navigate to the project directory:

   ```bash
   cd secure-portal
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Initialize Prisma and set up the database:

   ```bash
   npx prisma init
   npx prisma migrate dev --name init
   npx prisma generate
   ```

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```bash
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM="Secure Portal <your-gmail-address@gmail.com>"
JWT_SECRET=your-32-character-jwt-secret
```

Replace each placeholder with your actual values.

### Running the Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. View the database in real time using Prisma Studio:

   ```bash
   npx prisma studio
   ```

3. Alternatively, open `prisma/dev.db` directly with any SQLite client.

4. Open the application in your browser at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
secure-portal/
├── app/              # Next.js App Router pages and API routes
├── components/       # Reusable React components
├── lib/              # Utility functions and configurations
├── prisma/           # Prisma schema and migrations
├── public/           # Static assets (images, fonts, etc.)
├── styles/           # Global CSS and Tailwind configuration
├── .env              # Environment variables
├── package.json      # Project dependencies and scripts
└── readme.md         # Project documentation
```

## Security Features

- Password Hashing: All passwords are hashed using bcryptjs before storage
- Two-Factor Authentication: TOTP-based 2FA via speakeasy
- OTP Email Verification: Required during registration to confirm ownership of the email address
- Google reCAPTCHA v2: Protects key forms from automated bot submissions
- Account Lockout: Five failed login attempts trigger a fifteen-minute lockout period
- JWT Authentication: Secures API routes with signed tokens
- Activity Logging: Records key user actions, such as logins and security changes, in the database

## NPM Packages

### Runtime and Framework

```bash
npm install next
npm install react
npm install react-dom
```

### Styling and UI

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

### Database and ORM

```bash
npm install @prisma/client
npm install prisma --save-dev
npm install sqlite3
```

### Authentication and Security

```bash
npm install bcryptjs
npm install speakeasy
npm install nodemailer
npm install date-fns
npm install qrcode
npm install jwt-decode
```

## NPX Commands

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

## Development Notes

This project was built through a vibe coding approach: solutions and code were generated step by step, then manually copy-pasted, tested, and debugged rather than applied by an automated agent. Configuring the security layer, including 2FA, OTP verification, and reCAPTCHA, involved hands-on research and iteration to get each piece working correctly together.
