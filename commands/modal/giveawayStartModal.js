const { startGiveaway } = require("../../helpers/giveaway");

module.exports = {
  name: "giveawayStartModal",
  async execute(interaction) {
    // Extract data from the submitted modal inputs
    const donor = interaction.customId.split("|")[1];
    const prize = interaction.customId.split("|")[2];
    const duration = interaction.fields.getTextInputValue("duration");
    const winners = interaction.fields.getTextInputValue("winners") || 1;
    const rolereq = interaction.fields.getTextInputValue("rolereq");
    const channel = interaction.guild.channels.cache.get("1429429222782402725");

    // Run the giveaway using the extracted data
    await startGiveaway(
      null,
      prize,
      duration,
      channel,
      parseInt(winners),
      donor, // No donor field in modal submission
      interaction.user.id,
      rolereq ? [rolereq] : null
    );

    // Confirm the giveaway start to the user
    await interaction.reply({
      content: `Giveaway for **${prize}** has been successfully started in ${channel}!`,
      ephemeral: true,
    });
  },
};
