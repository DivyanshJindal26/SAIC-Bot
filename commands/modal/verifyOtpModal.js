// commands/modal/verifyOtpModal.js
const { EmbedBuilder } = require("discord.js");
const { verifyOTP } = require("../../helpers/verification");
const { STUDENT_ROLE_ID, UNVERIFIED_ROLE_ID } = require("../../config");

module.exports = {
  name: "verifyOtpModal",
  async execute(interaction) {
    // Get the OTP from modal input
    const otp = interaction.fields.getTextInputValue("otp").trim();

    await interaction.deferReply({ ephemeral: true });

    try {
      // Verify OTP
      const result = await verifyOTP(interaction.user.id, otp);

      if (!result.valid) {
        const embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("❌ Verification Failed")
          .setDescription(result.message)
          .setFooter({ text: "IIT Mandi Discord Server" })
          .setTimestamp();

        return await interaction.editReply({
          embeds: [embed],
        });
      }

      // OTP is valid - assign Student role
      try {
        const member = interaction.member;
        const role = interaction.guild.roles.cache.get(STUDENT_ROLE_ID);
        const remrole = interaction.guild.roles.cache.get(UNVERIFIED_ROLE_ID);

        if (!role || !remrole) {
          console.error(
            "Student role not found! Check STUDENT_ROLE_ID in .env"
          );
          return await interaction.editReply({
            content:
              "❌ Student role configuration error. Please contact an administrator.",
          });
        }

        // Add role to member
        await member.roles.add(role);
        await member.roles.remove(remrole);

        // Success embed
        const successEmbed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("✅ Verification Successful!")
          .setDescription(
            `Welcome, **${result.rollNumber}**!\n\n` +
              `You have been verified and assigned the **${role.name}** role.\n\n` +
              "🎉 You now have access to all student channels!\n" +
              "📚 Enjoy your time in the IIT Mandi Discord server!"
          )
          .setFooter({ text: "IIT Mandi Discord Server" })
          .setTimestamp();

        await interaction.editReply({
          embeds: [successEmbed],
        });

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

        // Log successful verification
        console.log(
          `User ${interaction.user.tag} (${interaction.user.id}) verified as ${result.rollNumber}`
        );
      } catch (roleError) {
        console.error("Error assigning role:", roleError);
        await interaction.editReply({
          content:
            "❌ Verification successful but failed to assign role. Please contact an administrator.",
        });
      }
    } catch (error) {
      console.error("Error in verifyOtpModal:", error);
      await interaction.editReply({
        content: "❌ An error occurred during verification. Please try again.",
      });
    }
  },
};
