const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const client = require('../../Cosmos.js')
const { success } = require('../../constants');
require('colors');

const cred = `#800020`;
const cgreen = `#228B22`;
const corange = `#FF3131`;

let reply = `<:reply:1068634523522306068>`;
let end = `<:replay_end:1068634568502026391>`;

function getUptime() {
    const uptime = process.uptime();
    const days = Math.floor(uptime / (60 * 60 * 24));
    const hours = Math.floor((uptime / (60 * 60)) % 24);
    const minutes = Math.floor((uptime / 60) % 60);
    const seconds = Math.floor(uptime % 60);
    
    return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping Cosmos'),

    async execute(interaction) {
        await interaction.deferReply();
        const inter = await interaction.fetchReply();
        const ping = inter.createdTimestamp - interaction.createdTimestamp;
        const embed = new EmbedBuilder()
            .setColor(cgreen)
            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
            .setDescription(`
${success}
${reply} **Client**: \`${ping}ms\` 
${reply} **Server**: \`${client.ws.ping}ms\`
${end} **Uptime:** \`${getUptime()}\`
        `);
        interaction.editReply({ embeds: [embed] })
    }
}