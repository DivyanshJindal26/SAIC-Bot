// defining the variables for the data
const {
  Client,
  GatewayIntentBits,
  ActivityType,
  MessageActionRow,
  MessageSelectMenu,
  PermissionsBitField,
  Permissions,
} = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { giveawayJoin, recreateGiveawayTimers } = require("./helpers/giveaway");

const { BOT_TOKEN, PREFIX, MONGODB, CLIENT_ID } = require("./config");
const fs = require("fs");
const path = require("path");

// setting up the client and the status
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
  presence: {
    status: "dnd",
    activities: [
      {
        name: "over IIT Mandi",
        type: ActivityType.Watching,
      },
    ],
  },
});

// importing stuff from handlers n helpers
const { connectMongo, getDb } = require("./helpers/mongodb");
const commandHandler = require("./helpers/commandHelper");
const messageHelper = require("./helpers/messageHelper");
// registering modals
const modalHandlerFiles = fs
  .readdirSync("./commands/modal")
  .filter((file) => file.endsWith(".js"));
for (const file of modalHandlerFiles) {
  const modalHandler = require(`./commands/modal/${file}`);
  div = file.split(".")[0];
  commandHandler.registerModalHandler(div, modalHandler.execute); // Register modal handler with its customId
}

// registering modals
const buttonFiles = fs
  .readdirSync("./commands/buttons")
  .filter((file) => file.endsWith(".js"));
for (const file of buttonFiles) {
  const buttonHandler = require(`./commands/buttons/${file}`);
  div = file.split(".")[0];
  commandHandler.registerButtonHandler(div, buttonHandler); // Register modal handler with its customId
}

// setting up slash commands from ./commands/slash
// Load slash commands
const slashCommandsPath = path.join(__dirname, "commands/slash");
const slashCommandFiles = fs
  .readdirSync(slashCommandsPath)
  .filter((file) => file.endsWith(".js"));
for (const file of slashCommandFiles) {
  const command = require(path.join(slashCommandsPath, file));
  commandHandler.registerSlashCommand(command);
}

// Register slash commands with Discord
const commands = [];
for (const file of slashCommandFiles) {
  const command = require(path.join(slashCommandsPath, file));
  commands.push(command.data);
}

const rest = new REST().setToken(BOT_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

// turning on the bot
client.once("clientReady", async () => {
  console.log(`Bot is turned on successfully!`);
  await connectMongo();
  await recreateGiveawayTimers(client.guilds.cache.get("1429429222035685489"));
});

// // Load message create triggers
// const triggersPath = path.join(__dirname, "triggers/messageCreate");
// const triggerFiles = fs
//   .readdirSync(triggersPath)
//   .filter((file) => file.endsWith(".js"));
// for (const file of triggerFiles) {
//   const trigger = require(path.join(triggersPath, file));
//   messageHelper.addMsgCreate(trigger);
// }

// accepting interactions
client.on("interactionCreate", async (interaction) => {
  await commandHandler.handleInteraction(interaction);
});

// client.on("messageCreate", async (message) => {
//   await messageHelper.handleCreate(message, client);
//   try {
//     if (!message.author.bot) {
//       const member = await message.guild.members.fetch(
//         message.interactionMetadata
//           ? message.interactionMetadata.user.id
//           : message.author.id
//       );
//     }
//   } catch {}
// });

// const triggersPath1 = path.join(__dirname, 'triggers/messageUpdate');
// const triggerFiles1 = fs.readdirSync(triggersPath1).filter(file => file.endsWith('.js'));
// for (const file of triggerFiles1) {
//     const trigger = require(path.join(triggersPath1, file));
//     messageHelper.addMsgUpdate(trigger);
// }

// client.on('messageUpdate', async (oldMessage, newMessage) => {
//   await messageHelper.handleUpdate(oldMessage, newMessage);
// });

// Load member join triggers
const triggersPath2 = path.join(__dirname, "triggers/memberJoin");
const triggerFiles2 = fs
  .readdirSync(triggersPath2)
  .filter((file) => file.endsWith(".js"));
for (const file of triggerFiles2) {
  const trigger = require(path.join(triggersPath2, file));
  messageHelper.addMemJoin(trigger);
}
client.on("guildMemberAdd", async (member) => {
  await messageHelper.handleJoin(member);
});

module.exports = client;

client.login(BOT_TOKEN);
