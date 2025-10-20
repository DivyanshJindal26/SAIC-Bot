const { getDb } = require("./mongodb");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ms = require("ms");

async function startGiveaway(
  interaction,
  prize,
  duration,
  channel,
  winners = 1,
  donor = null,
  host = null,
  rolereq = null,
  levelreq = null,
  weeklyreq = null
) {
  const db = await getDb();
  const giveawaysCollection = db.collection("giveaways");
  const gaws = await giveawaysCollection.find().toArray();

  // Parse duration into milliseconds
  const durationMs = ms(duration);
  if (!durationMs) throw new Error("Invalid duration format");

  // Generate a unique ID for the giveaway
  const giveawayId = gaws.length + 1;
  const endTime = Math.floor((Date.now() + durationMs) / 1000);
  // Create the initial embed
  const embed = new EmbedBuilder()
    .setTitle(prize)
    .setDescription(
      `
            Click the button below to enter.
            Ends <t:${endTime}:R> (<t:${endTime}:F>)
            Hosted by: <@${host}>
            ${donor ? `Donated by: <@${donor}>` : ""}
        `
    )
    .setColor("Random")
    .setFooter({ text: `ID: ${giveawayId} | Ends` })
    .setTimestamp(Date.now() + durationMs);

  if (rolereq) {
    embed.addFields({
      name: "Role Requirement",
      value: rolereq.map((role) => `<@&${role}>`).join(", "),
    });
  }

  if (levelreq) {
    embed.addFields({ name: "Level Requirement", value: `Level ${levelreq}` });
  }

  if (weeklyreq) {
    embed.addFields({
      name: "Weekly XP Requirement",
      value: `XP: ${weeklyreq}`,
    });
  }

  // Send the giveaway message
  const message = await channel.send({
    content: `<@&1225882054370000968>`,
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`joinGaw|${giveawayId}`)
          .setLabel("Join")
          .setStyle(ButtonStyle.Success)
          .setEmoji("🎉")
      ),
    ],
  });

  const timeoutId = setTimeout(async () => {
    await endGiveaway(null, giveawayId, channel);
  }, durationMs);

  // Store the giveaway in the database
  const giveawayData = {
    giveawayId,
    prize,
    winners,
    host,
    donor,
    channelId: channel.id,
    messageId: message.id,
    endTime: Date.now() + durationMs,
    rolereq,
    levelreq,
    weeklyreq,
    participants: [],
  };

  await giveawaysCollection.insertOne(giveawayData);

  console.log(`Giveaway started with ID: ${giveawayId}`);
}

async function giveawayJoin(interaction) {
  const db = await getDb();
  const giveawaysCollection = db.collection("giveaways");

  const giveawayId = parseInt(interaction.customId.split("|")[1]);
  const giveaway = await giveawaysCollection.findOne({ giveawayId });

  if (!giveaway) {
    return interaction.reply({
      content: "This giveaway does not exist or has already ended.",
      ephemeral: true,
    });
  }

  const user = interaction.user;
  const member = interaction.guild.members.cache.get(user.id);

  // Check role requirements
  if (
    giveaway.rolereq &&
    !giveaway.rolereq.every((roleId) => member.roles.cache.has(roleId))
  ) {
    return interaction.reply({
      content: "You do not meet the role requirements for this giveaway.",
      ephemeral: true,
    });
  }

  // Add user to participants
  if (giveaway.participants.includes(user.id)) {
    return interaction.reply({
      content: "You have already joined this giveaway.",
      ephemeral: true,
    });
  }

  giveaway.participants.push(user.id);
  await giveawaysCollection.updateOne(
    { giveawayId },
    { $set: { participants: giveaway.participants } }
  );

  // Update the button label
  const message = await interaction.channel.messages.fetch(giveaway.messageId);
  const button = message.components[0].components[0];
  const newLabel = `Join  (${giveaway.participants.length})`;

  // Create a new ButtonBuilder based on the existing button and update the label
  const updatedButton = ButtonBuilder.from(button).setLabel(newLabel);

  // Create a new ActionRowBuilder with the updated button
  const row = new ActionRowBuilder().addComponents(updatedButton);

  // Edit the message with the updated components
  await message.edit({ components: [row] });

  interaction.reply({
    content: "You have successfully joined the giveaway!",
    ephemeral: true,
  });
}

async function endGiveaway(interaction, giveawayId, channel) {
  const db = await getDb();
  const giveawaysCollection = db.collection("giveaways");

  const giveaway = await giveawaysCollection.findOne({ giveawayId });
  if (!giveaway || giveaway.ended) return;
  const message = await channel.messages.fetch(giveaway.messageId);
  const participants = giveaway.participants;
  let winners;
  if (participants.length < giveaway.winners) {
    winners = participants;
  } else {
    winners = participants
      .sort(() => 0.5 - Math.random())
      .slice(0, giveaway.winners);
  }
  const urlButton = new ButtonBuilder()
    .setLabel("Jump to Giveaway")
    .setStyle(ButtonStyle.Link)
    .setURL(message.url);

  const row = new ActionRowBuilder().addComponents(urlButton);

  if (winners.length > 0) {
    channel.send({
      content: `🎉 Congratulations ${winners
        .map((w) => `<@${w}>`)
        .join(", ")}! You won the giveaway of **${giveaway.prize}**!`,
      components: [row],
    });
  } else {
    channel.send({
      content: "😔 No one participated in the giveaway.",
      components: [row],
    });
  }

  const updatedEmbed = EmbedBuilder.from(message.embeds[0]) // Clone existing embed
    .setTitle(`${giveaway.prize}`)
    .setDescription(
      `${
        winners.length > 0
          ? `Winners: ${winners.map((w) => `<@${w}>`).join(", ")}`
          : "No participants entered the giveaway. 😔"
      }
            Hosted by: <@${giveaway.host}>
            ${giveaway.donor ? `Donated by: <@${giveaway.donor}>` : ""}`
    )
    .setFooter({ text: "Thank you for participating! Ended" })
    .setTimestamp(giveaway.endTime)
    .setColor("Random"); // Change to a different color for ended giveaways

  // Disable the button
  const disabledButton = ButtonBuilder.from(
    message.components[0].components[0]
  ).setDisabled(true);

  const updatedRow = new ActionRowBuilder().addComponents(disabledButton);

  // Edit the message
  await message.edit({
    embeds: [updatedEmbed],
    components: [updatedRow],
  });

  // Update the giveaway in the database with winners
  await giveawaysCollection.updateOne(
    { giveawayId },
    { $set: { ended: true, winners } }
  );

  // Mark the giveaway as ended
  console.log(`Giveaway ended with ID: ${giveawayId}`);
}

async function recreateGiveawayTimers(guild) {
  const db = await getDb();
  const giveawaysCollection = db.collection("giveaways");
  const currentTime = Date.now();

  // Fetch all pending giveaways that haven't ended
  const pendingGiveaways = await giveawaysCollection
    .find({ ended: { $ne: true } })
    .toArray();

  pendingGiveaways.forEach(async (giveaway) => {
    const { giveawayId, endTime, channelId, messageId } = giveaway;
    const timeLeft = endTime - currentTime; // Calculate how much time is left

    // If the giveaway should have already ended, end it immediately
    const channel = await guild.channels.fetch(channelId);
    if (timeLeft <= 0) {
      await endGiveaway(null, giveawayId, channel);
    } else {
      // Otherwise, recreate the timeout for this giveaway
      setTimeout(async () => {
        const channel = await guild.channels.fetch(channelId);
        await endGiveaway(null, giveawayId, channel);
      }, timeLeft);
    }
  });
}

module.exports = {
  startGiveaway,
  giveawayJoin,
  endGiveaway,
  recreateGiveawayTimers,
};
