const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getServerInfo } = require('../utils/sampQuery');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playerinfo')
    .setDescription('Busca informações de um jogador no servidor')
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Nome do jogador')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== '993266662000304268') {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }
    await interaction.deferReply();

    const searchName = interaction.options.getString('nome').toLowerCase();

    try {
      const info = await getServerInfo();

      if (!info.playerList || info.playerList.length === 0) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('🔍 Jogador não encontrado')
              .setColor(0xED4245)
              .setDescription('Nenhum jogador online no momento.')
              .setTimestamp(),
          ],
        });
      }

      const found = info.playerList.find(p => p.name.toLowerCase().includes(searchName));

      if (!found) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('🔍 Jogador não encontrado')
              .setColor(0xED4245)
              .setDescription(`Nenhum jogador online com nome contendo "${interaction.options.getString('nome')}".`)
              .setTimestamp(),
          ],
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('🔍 Informações do Jogador')
        .setColor(0x5865F2)
        .addFields(
          { name: 'Nome', value: found.name, inline: true },
          { name: 'ID', value: String(found.id), inline: true },
          { name: 'Score', value: String(found.score ?? 'N/A'), inline: true },
          { name: 'Ping', value: found.ping ? `${found.ping}ms` : 'N/A', inline: true },
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🔍 Jogador não encontrado')
            .setColor(0xED4245)
            .setDescription('❌ Servidor offline ou não respondeu.')
            .setTimestamp(),
        ],
      });
    }
  },
};
