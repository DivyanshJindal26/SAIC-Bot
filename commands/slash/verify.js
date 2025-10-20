// commands/slash/verify.js
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: {
    name: "verify",
    description: "Send the student verification button",
  },
  async execute(interaction) {
    // Create embed
    const embed = new EmbedBuilder()
      .setColor("#4CAF50")
      .setTitle("🎓 Student Verification")
      .setDescription(
        "Click the button below to verify your IIT Mandi student status.\n\n" +
          "**Verification Process:**\n" +
          '1️⃣ Click "Start Verification"\n' +
          "2️⃣ Enter your roll number\n" +
          "3️⃣ Check your IIT Mandi email for OTP\n" +
          '4️⃣ Click "Enter OTP" and submit the code\n' +
          "5️⃣ Get the Student role!\n\n" +
          "⏱️ *OTP expires in 10 minutes*"
      )
      .setFooter({ text: "IIT Mandi Discord Server" })
      .setTimestamp();

    // Create button
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("verifyStart")
        .setLabel("Start Verification")
        .setStyle(ButtonStyle.Success)
        .setEmoji("✅")
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
