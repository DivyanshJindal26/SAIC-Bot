// commands/modal/verifyRollModal.js
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const {
  generateOTP,
  sendOTPEmail,
  storeOTP,
} = require("../../helpers/verification");

module.exports = {
  name: "verifyRollModal",
  async execute(interaction) {
    // Get the roll number from modal input
    const rollNumber = interaction.fields
      .getTextInputValue("rollNumber")
      .toLowerCase()
      .trim();

    // Validate roll number format (basic validation)
    if (!/^[a-z0-9]+$/.test(rollNumber)) {
      return await interaction.reply({
        content:
          "❌ Invalid roll number format. Please use only letters and numbers.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // Generate OTP
      const otp = generateOTP();

      // Send email
      const emailSent = await sendOTPEmail(rollNumber, otp);

      if (!emailSent) {
        return await interaction.editReply({
          content:
            "❌ Failed to send email. Please check your roll number and try again.",
        });
      }

      // Store OTP in database
      await storeOTP(interaction.user.id, rollNumber, otp);

      // Create embed with OTP button
      const embed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("📧 OTP Sent!")
        .setDescription(
          `An OTP has been sent to **${rollNumber}@students.iitmandi.ac.in**\n\n` +
            "**Next Steps:**\n" +
            "1️⃣ Check your IIT Mandi email inbox\n" +
            "2️⃣ Copy the 6-digit OTP\n" +
            '3️⃣ Click "Enter OTP" below\n' +
            "4️⃣ Paste the OTP and submit\n\n" +
            "⏱️ *OTP expires in 10 minutes*\n" +
            "📬 *Check spam folder if not received*"
        )
        .setFooter({ text: "IIT Mandi Discord Server" })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("verifyOtp")
          .setLabel("Enter OTP")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🔑")
      );

      await interaction.editReply({
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      console.error("Error in verifyRollModal:", error);
      await interaction.editReply({
        content: "❌ An error occurred. Please try again later.",
      });
    }
  },
};
