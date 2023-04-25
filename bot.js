const { Client, Intents, MessageEmbed } = require('discord.js');
const configs = require('./configs/bot.json');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.login(configs.token);
module.exports = { client };
