const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Mostra a lista de comandos disponíveis'),

  async execute(interaction) {
    if (interaction.user.id !== '993266662000304268') {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setTitle('📋 Comandos do Bot SAMP')
      .setColor(0x5865F2)
      .setDescription('Aqui estão todos os comandos disponíveis:')
      .addFields(
        { name: '/status', value: 'Mostra o status atual do servidor SAMP (online/offline, players, etc.)', inline: false },
        { name: '/players', value: 'Lista todos os jogadores conectados no momento', inline: false },
        { name: '/playerinfo <nome>', value: 'Busca informações de um jogador específico pelo nome', inline: false },
        { name: '/help', value: 'Mostra esta mensagem de ajuda', inline: false },
      )
      .setFooter({ text: `IP: ${process.env.SAMP_IP}:${process.env.SAMP_PORT}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
