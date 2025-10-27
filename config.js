// Load environment variables from .env
require("dotenv").config();

const {
  BOT_TOKEN,
  PREFIX,
  MONGODB,
  CLIENT_ID,
  EMAIL_USER,
  EMAIL_PASS,
  STUDENT_ROLE_ID,
  ANON_CHANNEL_ID,
  ANON_WEBHOOK_URL,
  UNVERIFIED_ROLE_ID,
} = process.env;

// Optional warnings for missing critical envs
if (!BOT_TOKEN) {
  console.warn("[config] Warning: BOT_TOKEN is not set in .env");
}
if (!CLIENT_ID) {
  console.warn("[config] Warning: CLIENT_ID is not set in .env");
}

module.exports = {
  BOT_TOKEN,
  PREFIX,
  MONGODB,
  CLIENT_ID,
  EMAIL_USER,
  EMAIL_PASS,
  STUDENT_ROLE_ID,
  ANON_CHANNEL_ID,
  ANON_WEBHOOK_URL,
};
