const { EmbedBuilder } = require('discord.js');
const { getServerInfo } = require('./utils/sampQuery');

const messageCache = {};

async function updateMessage(channelId, cacheKey, buildEmbed) {
  if (!channelId) return;
  const channel = client.channels.cache.get(channelId);
  if (!channel) return;

  try {
    const embed = await buildEmbed(true);
    if (messageCache[cacheKey]) {
      try {
        const msg = await channel.messages.fetch(messageCache[cacheKey]);
        await msg.edit({ embeds: [embed] });
        return;
      } catch {
        delete messageCache[cacheKey];
      }
    }
    const msg = await channel.send({ embeds: [embed] });
    messageCache[cacheKey] = msg.id;
  } catch {
    const embed = await buildEmbed(false);
    if (messageCache[cacheKey]) {
      try {
        const msg = await channel.messages.fetch(messageCache[cacheKey]);
        await msg.edit({ embeds: [embed] });
        return;
      } catch {
        delete messageCache[cacheKey];
      }
    }
    const msg = await channel.send({ embeds: [embed] });
    messageCache[cacheKey] = msg.id;
  }
}

let client = null;

function startAutoStatus(c) {
  client = c;
  updateStatus();
  updateIpEmbed();
  updatePresence();
  setInterval(() => {
    updateStatus();
    updateIpEmbed();
    updatePresence();
  }, 30000);
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
          { name: 'IP', value: `${process.env.SAMP_IP}:${process.env.SAMP_PORT}`, inline: true },
        )
        .setFooter({ text: 'Servidor offline | Atualizado a cada 30s' })
        .setTimestamp();
    }
    const info = await getServerInfo();
    return new EmbedBuilder()
      .setTitle('São Caetano Roleplay')
      .setColor(0x5865F2)
      .addFields(
        { name: 'Servidor', value: info.hostname || 'São Caetano Roleplay', inline: false },
        { name: 'Jogadores', value: `${info.players}/${info.maxplayers}`, inline: true },
        { name: 'Modo', value: info.mapname || 'N/A', inline: true },
        { name: 'Status', value: '🟢 Online', inline: true },
      )
      .setFooter({ text: `IP: ${process.env.SAMP_IP}:${process.env.SAMP_PORT} | Atualizado a cada 30s` })
      .setTimestamp();
  });
}

async function updateIpEmbed() {
  await updateMessage(process.env.IP_CHANNEL_ID, 'ipMessageId', async () => {
    return new EmbedBuilder()
      .setTitle('São Caetano Roleplay')
      .setColor(0x5865F2)
      .addFields(
        { name: '📌 Conecte-se agora', value: '```' + `${process.env.SAMP_IP}:${process.env.SAMP_PORT}` + '```', inline: false },
      )
      .setFooter({ text: 'Copie o IP e conecte no servidor' })
      .setTimestamp();
  });
}

module.exports = { startAutoStatus };
