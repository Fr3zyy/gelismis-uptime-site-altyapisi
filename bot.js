const { Client, Intents, MessageEmbed } = require('discord.js');
const configs = require('./configs/bot.json');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.channel.id === '1086408253413523537') {
    if (message.content.includes('http')) {
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Link eklendi:')
        .setDescription(message.content);
      
      const channel = await client.channels.fetch('1086408253413523537');
      channel.send({ embeds: [embed] });
    }
  }
});

client.login(configs.token);
module.exports = { client };
