const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getServerInfo } = require('../utils/sampQuery');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('players')
    .setDescription('Lista os jogadores online no servidor SAMP'),

  async execute(interaction) {
    if (interaction.user.id !== '993266662000304268') {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }
    await interaction.deferReply();

    try {
      const info = await getServerInfo();

      if (!info.playerList || info.playerList.length === 0) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('👥 Jogadores Online')
              .setColor(0x5865F2)
              .setDescription('Nenhum jogador online no momento.')
              .setTimestamp(),
          ],
        });
      }

      const chunks = [];
      let current = [];

      for (const p of info.playerList) {
        const line = `\`${String(p.id).padStart(2, '0')}\` ${p.name} ${p.score !== undefined ? `- Score: ${p.score}` : ''}`;
        if (current.join('\n').length + line.length > 1024) {
          chunks.push(current);
          current = [line];
        } else {
          current.push(line);
        }
      }
      if (current.length > 0) chunks.push(current);

      const embed = new EmbedBuilder()
        .setTitle('👥 Jogadores Online')
        .setColor(0x5865F2)
        .setDescription(`**${info.players}/${info.maxplayers}** jogadores conectados`)
        .setTimestamp();

      for (let i = 0; i < chunks.length; i++) {
        embed.addFields({ name: `Players (${i + 1})`, value: chunks[i].join('\n'), inline: false });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('👥 Jogadores Online')
            .setColor(0xED4245)
            .setDescription('❌ Servidor offline ou não respondeu.')
            .setTimestamp(),
        ],
      });
    }
  },
};
