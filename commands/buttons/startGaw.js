const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const { getDb } = require("../../helpers/mongodb");

module.exports = {
  name: "giveawayStart",
  async execute(interaction) {
    db = await getDb();
    const stuff = db.collection("donationConfig");
    const config = await stuff.findOne({});
    const managerRoles = config.managerRoles;
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const hasManagerRole = managerRoles.some((roleId) =>
      member.roles.cache.has(roleId)
    );

    if (!hasManagerRole) {
      interaction.reply({
        content: "You aren't allowed to run this command",
        ephemeral: true,
      });
      return;
    }
    // Create the modal
    const donor = interaction.customId.split("|")[1];
    const prize = interaction.customId.split("|")[2];
    const modal = new ModalBuilder()
      .setCustomId(`giveawayStartModal|${donor}|${prize}`)
      .setTitle("Start a Giveaway");

    // Add inputs for all required options

    const durationInput = new TextInputBuilder()
      .setCustomId("duration")
      .setLabel("Duration")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Duration (e.g., 1h, 2d)")
      .setRequired(true);

    const winnersInput = new TextInputBuilder()
      .setCustomId("winners")
      .setLabel("Number of Winners")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Number of winners (default: 1)")
      .setRequired(false);

    const rolereqInput = new TextInputBuilder()
      .setCustomId("rolereq")
      .setLabel("Role Requirement (Role ID)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Optional: Role ID for requirement")
      .setRequired(false);

    // Add all inputs to the modal
    modal.addComponents(
      new ActionRowBuilder().addComponents(durationInput),
      new ActionRowBuilder().addComponents(winnersInput),
      new ActionRowBuilder().addComponents(rolereqInput)
    );

    // Show the modal to the user
    await interaction.showModal(modal);
  },
};
