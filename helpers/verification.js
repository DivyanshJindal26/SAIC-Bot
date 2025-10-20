// helpers/verification.js
const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../config");
const { getDb } = require("./mongodb");

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Generate a random 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to student email
 * @param {string} rollNumber - Student roll number
 * @param {string} otp - Generated OTP
 * @returns {Promise<boolean>} - Success status
 */
async function sendOTPEmail(rollNumber, otp) {
  const email = `${rollNumber}@students.iitmandi.ac.in`;

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Student Verification OTP - IIT Mandi Discord",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">IIT Mandi Discord Verification</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for Discord verification is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Store OTP in database with expiration
 * @param {string} userId - Discord user ID
 * @param {string} rollNumber - Student roll number
 * @param {string} otp - Generated OTP
 */
async function storeOTP(userId, rollNumber, otp) {
  const db = await getDb();
  const collection = db.collection("verifications");

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  await collection.updateOne(
    { userId },
    {
      $set: {
        userId,
        rollNumber,
        otp,
        expiresAt,
        verified: false,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
}

/**
 * Verify OTP
 * @param {string} userId - Discord user ID
 * @param {string} otp - OTP to verify
 * @returns {Promise<{valid: boolean, rollNumber?: string, message: string}>}
 */
async function verifyOTP(userId, otp) {
  const db = await getDb();
  const collection = db.collection("verifications");

  const record = await collection.findOne({ userId });

  if (!record) {
    return {
      valid: false,
      message:
        "No verification request found. Please start the verification process again.",
    };
  }

  if (record.verified) {
    return { valid: false, message: "You are already verified!" };
  }

  if (new Date() > record.expiresAt) {
    return {
      valid: false,
      message: "OTP has expired. Please request a new one.",
    };
  }

  if (record.otp !== otp) {
    return { valid: false, message: "Invalid OTP. Please try again." };
  }

  // Mark as verified
  await collection.updateOne(
    { userId },
    { $set: { verified: true, verifiedAt: new Date() } }
  );

  return {
    valid: true,
    rollNumber: record.rollNumber,
    message: "Verification successful!",
  };
}

/**
 * Check if user is already verified
 * @param {string} userId - Discord user ID
 * @returns {Promise<boolean>}
 */
async function isUserVerified(userId) {
  const db = await getDb();
  const collection = db.collection("verifications");

  const record = await collection.findOne({ userId, verified: true });
  return !!record;
}

/**
 * Get user's roll number if verified
 * @param {string} userId - Discord user ID
 * @returns {Promise<string|null>}
 */
async function getUserRollNumber(userId) {
  const db = await getDb();
  const collection = db.collection("verifications");

  const record = await collection.findOne({ userId, verified: true });
  return record ? record.rollNumber : null;
}

module.exports = {
  generateOTP,
  sendOTPEmail,
  storeOTP,
  verifyOTP,
  isUserVerified,
  getUserRollNumber,
};
