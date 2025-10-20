const { SlashCommandBuilder } = require("@discordjs/builders");
const { getDb } = require("../../helpers/mongodb");
const { startGiveaway, endGiveaway } = require("../../helpers/giveaway"); // Assume these functions exist as defined earlier
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Manage giveaways")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("start")
        .setDescription("Start a new giveaway")
        .addStringOption((option) =>
          option
            .setName("prize")
            .setDescription("The prize for the giveaway")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("duration")
            .setDescription("Duration of the giveaway (e.g., 1h, 1d)")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("donor")
            .setDescription("The donor of the giveaway")
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("winners")
            .setDescription("Number of winners")
            .setRequired(false)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel the giveaway to be started in.")
            .setRequired(false)
        )
        .addRoleOption((option) =>
          option
            .setName("rolereq")
            .setDescription("Role requirement for the giveaway")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("end")
        .setDescription("End a giveaway immediately")
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the giveaway to end")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("info")
        .setDescription("View giveaway details")
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the giveaway to view")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("cancel")
        .setDescription("Cancel a giveaway without announcing winners")
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the giveaway to cancel")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("List all active giveaways")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const db = await getDb();
    const giveawaysCollection = db.collection("giveaways");
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

    switch (subcommand) {
      case "start": {
        const prize = interaction.options.getString("prize");
        const duration = interaction.options.getString("duration");
        const winners = interaction.options.getInteger("winners") || 1;
        const rolereq = interaction.options.getRole("rolereq");
        const chan =
          interaction.options.getChannel("channel") || interaction.channel;
        const channel = interaction.guild.channels.cache.get(chan.id);
        const donor = interaction.options.getUser("donor") || null;
        await startGiveaway(
          interaction,
          prize,
          duration,
          channel,
          winners,
          donor ? donor.id : null,
          interaction.user.id,
          rolereq ? [rolereq.id] : null
        );
        await interaction.reply({
          content: `Giveaway for **${prize}** has started! 🎉`,
          ephemeral: true,
        });
        break;
      }
      case "end": {
        const giveawayId = interaction.options.getInteger("id");
        const giveaway = await giveawaysCollection.findOne({ giveawayId });

        if (!giveaway) {
          await interaction.reply({
            content: "Giveaway not found!",
            ephemeral: true,
          });
          return;
        }

        await endGiveaway(null, giveawayId, interaction.channel);
        await interaction.reply({
          content: `Giveaway with ID ${giveawayId} has ended.`,
          ephemeral: true,
        });
        break;
      }
      case "info": {
        const giveawayId = interaction.options.getInteger("id");
        const giveaway = await giveawaysCollection.findOne({ giveawayId });

        if (!giveaway) {
          await interaction.reply({
            content: "Giveaway not found!",
            ephemeral: true,
          });
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle(`Giveaway Info: ${giveaway.prize}`)
          .addFields(
            { name: "ID", value: String(giveawayId), inline: true },
            { name: "Host", value: `<@${giveaway.host}>`, inline: true },
            { name: "Prize", value: `${giveaway.prize}`, inline: false },
            { name: "Winners", value: `${giveaway.winners}`, inline: true },
            {
              name: "Participants",
              value: `${giveaway.participants.length}`,
              inline: true,
            },
            {
              name: "Ends",
              value: `<t:${Math.floor(giveaway.endTime / 1000)}:R>`,
              inline: true,
            }
          )
          .setColor("Random")
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case "cancel": {
        const giveawayId = interaction.options.getInteger("id");
        const giveaway = await giveawaysCollection.findOne({ giveawayId });

        if (!giveaway) {
          await interaction.reply({
            content: "Giveaway not found!",
            ephemeral: true,
          });
          return;
        }

        giveaway.ended = true;

        await giveawaysCollection.updateOne(
          { giveawayId },
          { $set: { ended: true } }
        );

        await interaction.reply(
          `Giveaway with ID ${giveawayId} has been marked as ended.`
        );
        break;
      }

      case "list": {
        const giveaways = await giveawaysCollection
          .find({ ended: { $ne: true } })
          .toArray();

        if (!giveaways.length) {
          await interaction.reply("No active giveaways found.");
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle("Active Giveaways")
          .setDescription(
            giveaways
              .map((g) => `**${g.prize}** (ID: ${g.giveawayId})`)
              .join("\n")
          )
          .setColor("Random")
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        break;
      }
      default:
        await interaction.reply({
          content: "Unknown subcommand!",
          ephemeral: true,
        });
    }
  },
};
