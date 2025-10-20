// commands/buttons/verifyStart.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const { isUserVerified } = require("../../helpers/verification");

module.exports = {
  name: "verifyStart",
  async execute(interaction) {
    // Check if user is already verified
    const alreadyVerified = await isUserVerified(interaction.user.id);

    if (alreadyVerified) {
      return await interaction.reply({
        content: "✅ You are already verified!",
        ephemeral: true,
      });
    }

    // Create modal for roll number input
    const modal = new ModalBuilder()
      .setCustomId("verifyRollModal")
      .setTitle("Student Verification");

    const rollNumberInput = new TextInputBuilder()
      .setCustomId("rollNumber")
      .setLabel("Enter Your Roll Number")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("e.g., b21001")
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(20);

    const firstActionRow = new ActionRowBuilder().addComponents(
      rollNumberInput
    );
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  },
};
