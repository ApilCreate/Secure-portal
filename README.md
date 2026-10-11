# Secure Portal

Secure Portal is a full-stack authentication application built with Next.js, Prisma, and PostgreSQL. It combines a security-focused authentication flow with a polished split-screen interface: a product-style security panel on desktop and a focused, responsive form experience on mobile.

The project supports email verification, password protection, optional TOTP two-factor authentication, CAPTCHA validation, account lockout safeguards, activity logging, and email notifications.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2E3440?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)](https://neon.tech/)

## Highlights

- Responsive split-screen login and registration experience
- Dark security-console visual language with lime/emerald accents
- OTP-based email verification during registration
- Optional TOTP two-factor authentication
- Google reCAPTCHA protection for authentication flows
- Password strength feedback and password visibility controls
- Account lockout after repeated failed login attempts
- Activity logging for security-related events
- SMTP email notifications for verification, lockout, and login events
- Prisma migrations for repeatable database setup
- Vercel-ready deployment with Neon PostgreSQL

## Authentication flow

### Registration

1. Enter a username, email address, and password.
2. Request an email OTP.
3. Verify the OTP sent to the email address.
4. Complete the CAPTCHA challenge.
5. Create the account.

### Login

1. Sign in with a username or email address.
2. Complete the CAPTCHA challenge.
3. If enabled, enter the six-digit TOTP code.
4. Continue to the account area.

Failed login attempts are tracked. Five consecutive failed attempts temporarily lock the account for five minutes.

## Technology stack

### Application

- Next.js 15 with the App Router
- React 19
- Tailwind CSS
- Geist font through `next/font`
- Vanta and Three.js background effects
- `react-hot-toast` notifications
- `react-google-recaptcha`

### Backend and data

- Node.js
- Prisma ORM
- PostgreSQL
- Neon recommended for hosted deployments
- Prisma migrations for schema management

### Security and messaging

- `bcryptjs` for password hashing
- `speakeasy` for TOTP generation and verification
- `qrcode` for 2FA setup
- `jsonwebtoken` for signed tokens
- Nodemailer for SMTP email delivery
- Google reCAPTCHA for bot protection

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- A PostgreSQL database
- A Google reCAPTCHA site key and secret key
- An SMTP account for sending email

Neon is recommended for PostgreSQL because it works well with Vercel serverless deployments.

## Local setup

### 1. Install dependencies

```powershell
cd secure-portal
npm install
```

### 2. Configure environment variables

Create `secure-portal/.env` using `.env.example` as a template:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@DIRECT_HOST/DATABASE?sslmode=require"

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

EMAIL_USER=your-email@example.com
EMAIL_PASS=your-smtp-app-password
EMAIL_FROM="Secure Portal <your-email@example.com>"
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=465
EMAIL_SECURE=true

JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Use a pooled Neon connection for `DATABASE_URL` and a direct Neon connection for `DIRECT_URL` when both are available. Never commit `.env` or place real credentials in `.env.example`.

### 3. Generate Prisma Client and apply migrations

```powershell
npx prisma generate
npx prisma migrate deploy
```

The repository already contains the required migrations. `migrate deploy` applies them to the configured PostgreSQL database without creating development-only migration files.

### 4. Start the application

```powershell
npm run dev
```

Open:

- [http://localhost:3000/login](http://localhost:3000/login)
- [http://localhost:3000/register](http://localhost:3000/register)

To inspect the database locally:

```powershell
npx prisma studio
```

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server with Turbopack |
| `npm run build` | Generate Prisma Client, apply migrations, and build Next.js |
| `npm run start` | Start the production server |
| `npm run lint` | Run Next.js ESLint checks |
| `npm run db:setup` | Generate Prisma Client and apply migrations |
| `npm run test:services` | Run the service test script |

## Project structure

```text
secure-portal/
├── app/
│   ├── account/             # Authenticated account experience
│   ├── api/                 # Authentication, OTP, email, and 2FA routes
│   ├── forgot-password/    # Password recovery UI
│   ├── login/              # Login and 2FA interface
│   ├── register/           # Registration and email OTP interface
│   ├── globals.css         # Global styles and authentication UI system
│   └── layout.js           # Root layout and font configuration
├── lib/                    # Prisma, mailer, activity, and Vanta helpers
├── prisma/
│   ├── migrations/         # PostgreSQL schema migrations
│   └── schema.prisma       # Prisma data model
├── public/                 # Static assets
├── scripts/                # Service and setup scripts
├── .env.example            # Safe environment variable template
├── next.config.mjs         # Next.js configuration
└── package.json            # Dependencies and project scripts
```

## Security model

- Passwords are stored as bcrypt hashes, never as plaintext.
- Registration requires email OTP verification.
- Login is protected by Google reCAPTCHA.
- Optional TOTP 2FA adds a second authentication factor.
- Failed login attempts are counted and temporary lockout is enforced.
- Login and security events are written to the activity log.
- Email notifications are sent for important account events.
- Secrets are loaded from environment variables.
- Database schema changes are managed through Prisma migrations.

## Deploy to Vercel with Neon

### 1. Create a Neon project

Create a project in the [Neon Console](https://console.neon.tech/) and copy the PostgreSQL connection strings.

Use:

- Pooled connection as `DATABASE_URL`
- Direct connection as `DIRECT_URL`

### 2. Configure Vercel environment variables

In Vercel, open **Settings → Environment Variables** and add the variables from the environment configuration section. Configure them for the environments you use:

- Production
- Preview
- Development

Set `NEXT_PUBLIC_APP_URL` to the deployed HTTPS URL.

### 3. Deploy

Set the Vercel project root to `secure-portal` if the repository contains this folder as a subdirectory. The build script already runs:

```text
prisma generate && prisma migrate deploy && next build
```

After adding or changing environment variables, redeploy the project.

## Environment and secret hygiene

- Never commit `.env`.
- Never paste database passwords, SMTP passwords, CAPTCHA secrets, or JWT secrets into source control.
- Rotate credentials immediately if they are exposed.
- Use a long, randomly generated `JWT_SECRET`.
- Use a Gmail App Password or another SMTP credential rather than a personal email password.
- Use separate credentials for development and production where possible.

## License

This project is intended for learning, prototyping, and portfolio use. Add a project-specific license before distributing it publicly.
