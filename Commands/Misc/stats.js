const {
    cred,
    cgreen,
    corange,
    reply,
    end,
    success,
    denied,
    WARNING,
    Premium,
    Logging,
    Manager,
    loading,
    unload1,
    unload2,
    unload3,
    load1,
    load2,
    load3,
    createFirstEmbedLoad,
    createSecondEmbedLoad,
    createThirdEmbedLoad,
    createNotGuildOwnerEmbed,
    createNotInteractionCreator,
    createNonBotAccountSetup,
    createNonMainAccountSetup,
    createMissingSlot,
    createNoConfig,
    creatNoPermRole,
    createNoRolePermission,
    createSearchingUsername
} = require('../../constants.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');
const editJsonFile = require("edit-json-file");
const { Authflow } = require("prismarine-auth");
const axios = require('axios');
require('colors');
const path = require('path');
const client = require('../../Cosmos.js')
const osutils = require('os-utils');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View Cosmos stats'),

    async execute(interaction) {
        interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
        setTimeout(() => {
            interaction.editReply({ embeds: [createSecondEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)] })
                setTimeout(() => {
                    let kicks = editJsonFile(`./Database/Stats/kickCounts.json`);
                    const kickCount = kicks.get(`kickCount`);

                    let joins = editJsonFile(`./Database/Stats/joins.json`);
                    const joinCount = joins.get(`Join`);

                    let Gametest = editJsonFile(`./Database/Stats/Gametest.json`);
                    const GametestCount = Gametest.get(`Gametest`);

                    let Chats = editJsonFile(`./Database/Stats/chatRelayed.json`);
                    const ChatRelayed = Chats.get(`Chat`);

                    const global = fs.readFileSync('./Database/GlobalbanDB.json');
                    const parsedGlobal = JSON.parse(global);
                    const totalban = parsedGlobal.length

                    const mainACC = './Database/Oauth';
                    const itemsMAIN = fs.readdirSync(mainACC);
                    const MainAccFolder = itemsMAIN.filter(item => fs.statSync(`${mainACC}/${item}`).isDirectory());
                    const TotalMainAccounts = MainAccFolder.length;

                    const botACC = './Database/BotAccounts';
                    const itemsBOT = fs.readdirSync(botACC);
                    const BotAccFolder = itemsBOT.filter(item => fs.statSync(`${botACC}/${item}`).isDirectory());
                    const TotalBotAccounts = BotAccFolder.length;

                    const realms = './Database/realm';
                    const itemsRealms = fs.readdirSync(realms);
                    const Realms = itemsRealms.filter(item => fs.statSync(`${realms}/${item}`).isDirectory());
                    const TotalRealms = Realms.length;

                    const jsonData = fs.readFileSync(`./Database/PlayersDB/players.json`);
                    const data = JSON.parse(jsonData);
                    const uuidCount = Object.keys(data).length;

                    const TotalMembers = client.guilds.cache.reduce((acc, guild) => {
                        return acc + guild.memberCount;
                    }, 0);

                    const members = client.guilds.cache.reduce((acc, guild) => {
                        return acc + guild.memberCount;
                    }, 0);

                    const bots = client.guilds.cache.reduce((acc, guild) => {
                        return acc + guild.members.cache.filter(member => member.user.bot).size;
                    }, 0);

                    const skinsDir = 'Database/PlayersDB/Skins';
                    let totalCount = 0;

                    function countPNGFiles(dir) {
                        const files = fs.readdirSync(dir);

                        for (const file of files) {
                            const filePath = path.join(dir, file);
                            const stats = fs.statSync(filePath);

                            if (stats.isDirectory()) {
                                countPNGFiles(filePath); // Recursively count PNG files in subdirectories
                            } else if (path.extname(file) === '.png') {
                                totalCount++;
                            }
                        }
                    }

                    countPNGFiles(skinsDir);

                    const TotalGuilds = client.guilds.cache.size

                    const ban = new EmbedBuilder()
                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                        .setColor(cgreen)
                        .setDescription(`
${success} **Cosmos Stats**

**__ AutoMod Stats __**
${reply} **Joins:** \`${joinCount}\`
${reply} **Chats Relayed:** \`${ChatRelayed}\`
${reply} **Chat-Ranks Relayed:** \`${GametestCount}\`
${reply} **Kicks Sent:** \`${kickCount}\`
${end} **Global Bans:** \`${totalban}\`

**__ Cosmos Stats __**
${reply} **Main Accounts Linked:** \`${TotalMainAccounts}\`
${reply} **Bot Accounts Linked:** \`${TotalBotAccounts}\`
${reply} **Total Realms:** \`${TotalRealms}\`
${reply} **Total Cache Players:** \`${uuidCount}\`
${end} **Total Skins Decrypted:** \`${totalCount}\`

**__ Misc Stats __**
${reply} **Total Guilds:** \`${TotalGuilds}\`
${reply} **Total Members:** \`${TotalMembers}\`
${reply} **Total Humans:** \`${members - bots}\`
${end} **Total Bots:** \`${bots}\`
`)
                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                    interaction.editReply({ embeds: [ban] })
                    if (interaction.user.id === '667844353003356199') {
                        osutils.cpuUsage(function (v) {
                            const DebugEmbed = new EmbedBuilder()
                                .setDescription(`
**__ Debug Information __**

**CPU:** ${osutils.cpuCount()} Cores
**CPU Usage:** ${(v * 100).toString().split(".")[0] + "." + (v * 100).toString().split(".")[1].split('')[0] + (v * 100).toString().split(".")[1].split('')[1]}%
**Total Memory:** ${osutils.totalmem().toString().split(".")[0] + "." + osutils.totalmem().toString().split(".")[1].split('')[0] + osutils.totalmem().toString().split(".")[1].split('')[1]} MB
**VPS Memory Usage:** ${(osutils.totalmem() - osutils.freemem()).toString().split(".")[0] + "." + ( osutils.totalmem() - osutils.freemem()).toString().split(".")[1].split('')[0] + (osutils.totalmem() - osutils.freemem()).toString().split(".")[1].split('')[1]}/${osutils.totalmem().toString().split(".")[0] + "." + osutils.totalmem().toString().split(".")[1].split('')[0] + osutils.totalmem().toString().split(".")[1].split('')[1]} MB
**Bot Memory Usage:** ${(process.memoryUsage().heapUsed / 1024 / 1024 ).toFixed(2) + "MB/" + osutils.totalmem().toString().split(".")[0] + "." + osutils.totalmem().toString().split(".")[1].split('')[0] + osutils.totalmem().toString().split(".")[1].split('')[1] + "MB"}
**VPS Memory Percent:** ${(100 - osutils.freememPercentage() * 100).toString().split(".")[0] + "." + (100 - osutils.freememPercentage() * 100).toString().split(".")[1].split('')[0] + (100 - osutils.freememPercentage() * 100).toString().split(".")[1].split('')[1] + "%"}

`)
                            interaction.followUp({ embeds: [DebugEmbed], ephemeral: true })
                        })
                    }
                }, 1500)
            }, 1500)
        }, 1500)
    }
}