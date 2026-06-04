const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getServerInfo } = require('../utils/sampQuery');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Status do servidor São Caetano Roleplay'),

  async execute(interaction) {
    if (interaction.user.id !== '993266662000304268') {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }
    await interaction.deferReply();

    try {
      const info = await getServerInfo();

      const embed = new EmbedBuilder()
        .setTitle('São Caetano Roleplay')
        .setColor(0x5865F2)
        .addFields(
          { name: 'Servidor', value: info.hostname || 'São Caetano Roleplay', inline: false },
          { name: 'Jogadores', value: `${info.players}/${info.maxplayers}`, inline: true },
          { name: 'Modo', value: info.mapname || 'N/A', inline: true },
          { name: 'Status', value: '🟢 Online', inline: true },
        )
        .setFooter({ text: `IP: ${process.env.SAMP_IP}:${process.env.SAMP_PORT}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      const embed = new EmbedBuilder()
        .setTitle('São Caetano Roleplay')
        .setColor(0xED4245)
        .addFields(
          { name: 'Servidor', value: '🔴 Offline', inline: false },
          { name: 'IP', value: `${process.env.SAMP_IP}:${process.env.SAMP_PORT}`, inline: true },
        )
        .setFooter({ text: 'Tente novamente mais tarde' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
