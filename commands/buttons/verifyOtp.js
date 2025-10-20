// commands/buttons/verifyOtp.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  name: "verifyOtp",
  async execute(interaction) {
    // Create modal for OTP input
    const modal = new ModalBuilder()
      .setCustomId("verifyOtpModal")
      .setTitle("Enter Verification OTP");

    const otpInput = new TextInputBuilder()
      .setCustomId("otp")
      .setLabel("Enter the 6-digit OTP")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("123456")
      .setRequired(true)
      .setMinLength(6)
      .setMaxLength(6);

    const firstActionRow = new ActionRowBuilder().addComponents(otpInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  },
};
