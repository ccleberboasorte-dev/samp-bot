const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Envia uma mensagem como se fosse o bot')
    .addStringOption(option =>
      option.setName('mensagem')
        .setDescription('Texto que o bot vai enviar')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== '993266662000304268') {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }

    const mensagem = interaction.options.getString('mensagem');

    await interaction.channel.send(mensagem);
    await interaction.reply({ content: '✅ Mensagem enviada!', ephemeral: true });
  },
};
