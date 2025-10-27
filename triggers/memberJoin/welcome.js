const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "welcome",
  execute: async (member) => {
    try {
      // DM the user to verify
      const dmEmbed = new EmbedBuilder()
        .setColor("#00ffff")
        .setTitle("Welcome! Please Verify Your Account")
        .setDescription(
          `Thank you for joining **${member.guild.name}**!\n\n` +
            `To access all channels and features, please verify your account by going to the <#1429552987088355329> channel and following the verification process.\n\n` +
            `This helps us maintain a safe and authentic community.`
        )
        .setThumbnail(member.guild.iconURL({ dynamic: true }))
        .setFooter({ text: "If you need help, please contact a moderator." });

      await member.send({ embeds: [dmEmbed] });
    } catch (error) {
      if (error.code === 50007) {
        console.log(`Cannot send DM to ${member.user.tag} - DMs are disabled`);
      } else {
        console.error("Error sending welcome message:", error);
      }
    }
  },
};
