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
const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');
const editJsonFile = require("edit-json-file");
const { Authflow } = require("prismarine-auth");
const axios = require('axios');
require('colors');
const path = require('path');
const client = require('../../Cosmos.js')

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('xlastplayed')
        .setDescription('Lookup a player\'s Xbox Last Played Games')
        .addStringOption(option =>
            option.setName('gamertag')
                .setDescription('Gamertag to lookup')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('amount')
                .setDescription('Gamertag to lookup')
                .setRequired(true)
                .addChoices(
                    { name: '5 Games', value: '5' },
                    { name: '10 Games', value: '10' },
                    { name: '15 Games', value: '15' },
                    { name: '20 Games', value: '20' },
                ))
    ,

    async execute(interaction) {
        const gamertag = interaction.options.getString('gamertag')
        const amount = interaction.options.getString('amount')
        interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
        setTimeout(() => {
            interaction.editReply({ embeds: [createSecondEmbedLoad(interaction.guild, interaction.user)] })
            new Authflow("", `./Database/BotAccounts/${interaction.guild.id}`, {
                flow: 'msal',
                relyingParty: "http://xboxlive.com",
            })
                .getXboxToken()
                .then(async (Xbox) => {
                    const XboxAuth = JSON.parse(JSON.stringify({
                        'x-xbl-contract-version': '2',
                        'Authorization': `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                        'Accept-Language': "en-US",
                        maxRedirects: 1,
                    }))
                    axios.get(`https://profile.xboxlive.com/users/gt(${(gamertag)})/profile/settings?settings=GameDisplayPicRaw`, {
                        headers: XboxAuth,
                        timeout: 5000
                    })
                        .then((res) => {
                            const pfp = res?.data?.profileUsers[0]?.settings[0]?.value
                            const xuid = res?.data?.profileUsers[0]?.id
                            interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)] })
                            var GetGames = {
                                method: "get",
                                url: `https://titlehub.xboxlive.com:443/users/xuid(${(xuid)})/titles/titlehistory/decoration/achievement,image,scid`,
                                headers: {
                                    'x-xbl-contract-version': 1,
                                    accept: 'application/json',
                                    Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                    'accept-language': 'en-US',
                                    Connection: 'Keep-Alive',
                                    'Accept-Encoding': 'gzip',
                                    'User-Agent': 'okhttp/4.9.1',
                                },
                            }
                            axios(GetGames)
                                .then(function (Games) {
                                    const GameList = Games.data.titles.slice(0, amount);
                                    const games = Games.data.titles
                                    const GameAmount = games.length
                                    if (GameAmount === 0) {
                                        const Embed = new EmbedBuilder()
                                            .setColor(cred)
                                            .setThumbnail(pfp)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${denied} **Unable To Fetch User's Games**
${reply} **Gamertag:** \`${gamertag}\`
${end} User's Profile Is Private
            `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        interaction.editReply({ embeds: [Embed] })
                                    } else {
                                        const embed = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setThumbnail(pfp)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()

                                        if (GameList.length > amount) {
                                            GameList = GameList.slice(0, amount);
                                        }
                                        let gameInfo = '';
                                        for (let i = 0; i < GameList.length; i++) {
                                            const lastTimePlayed = new Date(GameList[i].titleHistory.lastPlayed);
                                            const timestamp = Math.floor(lastTimePlayed.getTime() / 1000);

                                            gameInfo += `**(${i + 1})** \`${GameList[i].name}\`\n${end} <t:${timestamp}:f> (**<t:${timestamp}:R>**)\n`;
                                        }

                                        if (GameList.length < amount) {

                                            gameInfo += '\n';
                                        }

                                        let Message = `
${success} **Fetched User's Games**
${reply} **Gamertag:** \`${gamertag}\`
${end} **Total Games:** \`${GameAmount}\`

                                        `
                                        embed.setDescription(Message + gameInfo);

                                        interaction.editReply({ embeds: [embed] });
                                    }
                                })
                                .catch((error) => {
                                    const Embed = new EmbedBuilder()
                                        .setColor(cred)
                                        .setThumbnail(pfp)
                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                        .setDescription(`
${denied} **Unable To Fetch User's Games**
${reply} **Gamertag:** \`${gamertag}\`
${end} User's Profile Is Private
            `)
                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                        .setTimestamp()
                                    interaction.editReply({ embeds: [Embed] })
                                })
                        })
                        .catch((error) => {
                            const errorEmbed = new EmbedBuilder()
                                .setColor(corange)
                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                .setDescription(`
${WARNING} **Notice**
${reply} **Username:** \`${gamertag}\`
${end} User Not Found!
                                        `)
                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                .setTimestamp()
                            interaction.editReply({ embeds: [errorEmbed] })
                                .catch(console.error);
                        });
                })
        }, 1500)
    }
}