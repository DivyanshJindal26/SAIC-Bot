const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "welcome",
  execute: async (member) => {
    const welcomeChannel = member.guild.channels.cache.get(
      "1429429222782402728"
    );
    const userAvatarURL = member.user.displayAvatarURL({ dynamic: true });

    const embed = new EmbedBuilder()
      .setColor("#00ffff")
      .setTitle(`Welcome to ${member.guild.name}, ${member.user.username}!`)
      .setDescription(`We're thrilled to have you join our community!`)
      .setThumbnail(userAvatarURL);

    try {
      await welcomeChannel.send({
        content: `Welcome, ${member}! `,
        embeds: [embed],
      });
    } catch (error) {
      console.error("Error sending welcome message:", error);
    }
  },
};
