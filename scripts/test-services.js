const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

async function testDatabase() {
  const prisma = new PrismaClient();
  const count = await prisma.user.count();
  console.log("DATABASE OK - user count:", count);
  await prisma.$disconnect();
}

async function testEmail() {
  const pass = (process.env.EMAIL_PASS || "").replace(/\s/g, "");
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_SERVER_PORT) || 465,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass,
    },
  });
  await transporter.verify();
  console.log("EMAIL OK - SMTP connection verified");
}

async function testRecaptcha() {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    throw new Error("RECAPTCHA_SECRET_KEY is missing");
  }
  console.log("RECAPTCHA OK - secret key is set");
}

async function main() {
  const checks = [
    ["Database", testDatabase],
    ["Email SMTP", testEmail],
    ["reCAPTCHA env", testRecaptcha],
  ];

  for (const [name, fn] of checks) {
    try {
      await fn();
    } catch (err) {
      console.error(`${name} FAILED:`, err.message);
    }
  }
}

main();
