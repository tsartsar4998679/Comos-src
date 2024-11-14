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
const { exec } = require('child_process');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restart Cosmos | Dev Only Command!'),

    async execute(interaction) {
        if (interaction.user.id !== "667844353003356199") {
            interaction.reply(`You are not my developer!`)
        } else {
            interaction.reply(`Initiated Restart Protocol...`).then(() => {
                exec('pm2 restart 14', (error) => {
                    if (error) {
                        interaction.editReply(`Failed to restart!`, error)
                    }
                });
            });
        }
    }
}