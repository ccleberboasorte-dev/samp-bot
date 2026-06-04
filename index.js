require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const SampQuery = require('samp-query');

function queryServer(ip, port) {
  return new Promise((resolve, reject) => {
    SampQuery({ host: ip, port }, (error, data) => {
      if (error) return reject(error);
      resolve(data);
    });
  });
}

async function getServerInfo() {
  const data = await queryServer(process.env.SAMP_IP, parseInt(process.env.SAMP_PORT));
  return {
    online: true,
    hostname: data.hostname,
    gamemode: data.gamemode,
    mapname: data.mapname,
    passworded: data.password,
    players: data.online,
    maxplayers: data.maxplayers,
    playerList: data.players || [],
    rules: data.rules || {},
  };
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const ALLOWED_USER = '993266662000304268';

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Bot logado como ${client.user.tag}`);
  updateStatus();
  updateIpEmbed();
  updatePresence();
  setInterval(() => {
    updateStatus();
    updateIpEmbed();
    updatePresence();
  }, 30000);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.user.id !== ALLOWED_USER) {
    return interaction.reply({ content: 'Você não tem permissão.', ephemeral: true });
  }
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const reply = { content: 'Erro ao executar.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
    else await interaction.reply(reply);
  }
});

client.login(process.env.DISCORD_TOKEN);

const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot online!');
});
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server listening on 0.0.0.0:${PORT}`);
});
server.on('error', err => console.error('HTTP server error:', err.message));

const msgCache = {};

async function updateMessage(channelId, cacheKey, buildEmbed) {
  if (!channelId) return;
  const channel = client.channels.cache.get(channelId);
  if (!channel) return;
  try {
    const embed = await buildEmbed(true);
    if (msgCache[cacheKey]) {
      try {
        const msg = await channel.messages.fetch(msgCache[cacheKey]);
        await msg.edit({ embeds: [embed] });
        return;
      } catch {
        delete msgCache[cacheKey];
      }
    }
    const msg = await channel.send({ embeds: [embed] });
    msgCache[cacheKey] = msg.id;
  } catch {
    const embed = await buildEmbed(false);
    if (msgCache[cacheKey]) {
      try {
        const msg = await channel.messages.fetch(msgCache[cacheKey]);
        await msg.edit({ embeds: [embed] });
        return;
      } catch {
        delete msgCache[cacheKey];
      }
    }
    const msg = await channel.send({ embeds: [embed] });
    msgCache[cacheKey] = msg.id;
  }
}

async function updatePresence() {
  try {
    const info = await getServerInfo();
    client.user.setActivity(`${info.hostname || 'São Caetano Roleplay'} - ${info.players}/${info.maxplayers}`, { type: 0 });
  } catch {
    client.user.setActivity('São Caetano Roleplay - Offline', { type: 0 });
  }
}

async function updateStatus() {
  await updateMessage(process.env.TEXT_CHANNEL_ID, 'statusMessageId', async (online) => {
    if (!online) {
      return new EmbedBuilder()
        .setTitle('São Caetano Roleplay')
        .setColor(0xED4245)
        .addFields(
          { name: 'Servidor', value: '🔴 Offline', inline: false },
          { name: 'IP', value: `${process.env.SAMP_IP}:${process.env.SAMP_PORT}`, inline: true }
        )
        .setFooter({ text: 'Servidor offline' })
        .setTimestamp();
    }
    const info = await getServerInfo();
    return new EmbedBuilder()
      .setTitle('São Caetano Roleplay')
      .setColor(0x5865F2)
      .addFields(
        { name: 'Servidor', value: info.hostname || 'São Caetano Roleplay', inline: false },
        { name: '👥 Jogadores', value: `${info.players}/${info.maxplayers}`, inline: true },
        { name: '🎮 Modo', value: info.mapname || 'N/A', inline: true },
        { name: '🟢 Status', value: 'Online', inline: true }
      )
      .setFooter({ text: `IP: ${process.env.SAMP_IP}:${process.env.SAMP_PORT}` })
      .setTimestamp();
  });
}

async function updateIpEmbed() {
  await updateMessage(process.env.IP_CHANNEL_ID, 'ipMessageId', async () => {
    return new EmbedBuilder()
      .setTitle('São Caetano Roleplay')
      .setColor(0x5865F2)
      .setDescription('🎯 **Conecte-se agora!**')
      .addFields(
        { name: '📌 IP do Servidor', value: `\`\`\`${process.env.SAMP_IP}:${process.env.SAMP_PORT}\`\`\``, inline: false }
      )
      .setFooter({ text: 'Copie o IP e entre no jogo' })
      .setTimestamp();
  });
}
