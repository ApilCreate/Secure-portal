### Secure Portal

This project is a  modern, secure authentication portal built with Next.js, Prisma, and SQLite, featuring advanced security measures such as Two-Factor Authentication (2FA), OTP-based Email verification, Realtime Email Notification, Google reCAPTCHA, and account lockout. The application provides a responsive, dark-themed user interface with a glassmorphism design and animated background, ensuring an engaging user experience along with all the security assuring features.

### Table of Contents

- Project Overview
- Features
- Technologies Used
- Utilities
- Getting Started
- Prerequisites
- Environment Configuration
- Running the Application
- Project Structure
- Security Features
- NPM Packages
- NPX Commands

# 1. Project Overview

The Secure Auth Portal is a full-stack web application designed to provide a robust and user-friendly authentication system. It incorporates industry-standard security practices to protect user data and prevent unauthorized access. The project is designed demonstrating proficiency in modern web development, security implementation, and responsive UI design.

Key highlights:

- Registration with OTP-based email verification
- 2 Factor Authentication (2FA) using Time-Based One-Time Passwords (TOTP)
- Google reCAPTCHA v2 to prevent bot registrations
- Account lockout after multiple failed login attempts
- Activity logging for tracking user actions with Email notification
- Responsive UI with Tailwind CSS and glassmorphism design

# 2. Features

- User Registration: Secure sign-up with OTP email verification to ensure valid email addresses.
- User Login: Optional 2FA with TOTP for enhanced security.
- Password Reset: Includes strength validation and matching checks.
- Account Deletion: Requires password or 2FA confirmation, followed by a confirmation email.
- Google reCAPTCHA: Protects against automated bot registrations.
- Password Strength Meter: Visual feedback for password complexity.
- Activity Log: Tracks user actions (login, logout, password changes, 2FA events) and sends email if any changes made.
- Account Lockout: Temporarily locks accounts after consecutive failed login attempts with a countdown timer.
- Password Visibility Toggle: Enhances user experience on password inputs.
- Toast Notifications: Provides real-time feedback for user actions.
- Responsive Design: Dark-themed UI with animated backgrounds and glassmorphism effects.

# 3. Technologies Used

i. Frontend:

- Next.js 14 (App Router)
- React
- Tailwind CSS
- Lucide React (Icons)
- react-hot-toast (Notifications)
- react-google-recaptcha (CAPTCHA)

ii. Backend:

- Node.js
- Prisma ORM
- SQLite (configurable for PostgreSQL, MySQL, etc.)

iii. Security:

- bcryptjs (Password hashing)
- speakeasy (TOTP for 2FA)
- Nodemailer (Email service via Gmail SMTP)
- qrcode (QR code generation for 2FA setup)


# 4. Utilities:

- date-fns (Date manipulation)
- PostCSS & Autoprefixer (CSS processing)


# 5. Getting Started
Follow these steps to set up and run the project locally.

# Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- A Gmail account for Nodemailer (with an App Password for SMTP)
- Google reCAPTCHA API keys (Site Key and Secret Key)

# 6. Install dependencies:
- Open the folder inside your IDE and open terminal.
- Type cd secure-portal
- Type npm install

# Initialize Prisma:
- npx prisma init
- npx prisma migrate dev --name init
- npx prisma generate


# 7. Environment Configuration
- Create a .env file in the root directory and add the following variables:

DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM="Secure Portal <your-gmail-address@gmail.com>"
JWT_SECRET=your-32-character-jwt-secret


- Replace your-recaptcha-site-key and your-recaptcha-secret-key with your Google reCAPTCHA v2 keys.
- Replace your-gmail-address@gmail.com and your-gmail-app-password with your Gmail credentials. Generate an App Password from your Google Account settings.
- Generate a secure JWT_SECRET (e.g., using a random string generator).

# 8. Running the Application

Start the development server:
- Type npm run dev

To See realtime database:
- Type npx prisma studio

Or

Import prisma/dev.db file inside SQLite


# Open the application in your browser:

http://localhost:3000


# 9. Project Structure

├── app/                    - Next.js App Router pages and API routes
├── components/             - Reusable React components
├── lib/                    - Utility functions and configurations
├── prisma/                 - Prisma schema and migrations
├── public/                 - Static assets (images, fonts, etc.)
├── styles/                 - Global CSS and Tailwind configurations
├── .env                    - Environment variables
├── package.json            - Project dependencies and scripts
├── README.md               - Project documentation

# 10. Security Features
- Password Hashing: Uses bcryptjs for secure password storage.
- 2FA: Implements TOTP with speakeasy for optional two-factor authentication.
- OTP Verification: Sends one-time passwords via email for registration.
- CAPTCHA: Integrates Google reCAPTCHA v2 to prevent bot registrations.
- Account Lockout: Locks accounts after 5 failed login attempts for 15 minutes.
- JWT Authentication: Secures API routes with JSON Web Tokens.
- Activity Logging: Records user actions in the database for auditing.

# 11. NPM Packages

### Runtime & Framework
- npm install next react react-dom

### Styling & UI
- npm install tailwindcss postcss autoprefixer 
- npm install lucide-react 
- npm install react-hot-toast 
- npm install react-google-recaptcha

### Database & ORM
- npm install @prisma/client
- npm install prisma --save-dev
- npm install sqlite3

### Authentication & Security
- npm install bcryptjs
- npm install speakeasy 
- npm install nodemailer
- npm install date-fns 
- npm install qrcode
- npm install jwt-decode


# 12. NPX Commands

# Initialize Prisma:
- npx prisma init

# Apply migrations:
- npx prisma migrate dev --name init

# Generate Prisma client:
- npx prisma generate

