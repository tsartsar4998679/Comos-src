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
const XboxLiveAPI = require('@xboxreplay/xboxlive-api')

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('xlookup')
        .setDescription('Lookup a player\'s Xbox info')
        .addStringOption(option =>
            option.setName('gamertag')
                .setDescription('Gamertag to lookup')
                .setRequired(true))
    ,

    async execute(interaction) {
        const gamertag = interaction.options.getString('gamertag')
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
                    axios.get(`https://profile.xboxlive.com/users/gt(${(gamertag)})/profile/settings?settings=GameDisplayPicRaw,Gamerscore`, {
                        headers: XboxAuth,
                        timeout: 5000
                    })
                        .then((res) => {
                            const pfp = res?.data?.profileUsers[0]?.settings[0]?.value
                            const gamerscore = res?.data?.profileUsers[0]?.settings[1]?.value
                            const xuid = res?.data?.profileUsers[0]?.id
                            interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)] })
                            const header = {
                                'x-xbl-contract-version': 1,
                                accept: 'application/json',
                                Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                'accept-language': 'en-US',
                                Connection: 'Keep-Alive',
                                'Accept-Encoding': 'gzip',
                                'User-Agent': 'okhttp/4.9.1',
                            }
                            var GetGames = {
                                method: "get",
                                url: `https://titlehub.xboxlive.com:443/users/xuid(${(xuid)})/titles/titlehistory/decoration/achievement,image,scid`,
                                headers: header
                            }
                            var GetFollowers = {
                                method: "get",
                                url: `https://social.xboxlive.com:443/users/xuid(${(xuid)})/summary`,
                                headers: header
                            }
                            var GetSocials = {
                                method: "get",
                                url: `https://peoplehub.xboxlive.com:443/users/xuid(${(xuid)})/people/social/decoration/multiplayersummary,preferredcolor`,
                                headers: header
                            }
                            var global = fs.readFileSync(
                                `./Database/GlobalbanDB.json`
                            );
                            const filePath = `./Database/PlayersDB/KicksDB/${gamertag}.json`;
                            Promise.all([axios(GetSocials), axios(GetFollowers), axios(GetGames)])
                                .then(function (results) {
                                    const fra = results[0].data.people;
                                    const fr = fra.length;
                                    const fl = results[1].data.targetFollowerCount;
                                    const g = results[2].data.titles;
                                    const ga = g.length;
                                    const Embed = new EmbedBuilder()
                                        .setColor(cgreen)
                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                        .setTimestamp()
                                        .setThumbnail(pfp)
                                        .setDescription(`
${success} **Found User**
${reply} **Username:** \`${gamertag}\`
${end} **Xuid:** \`${xuid}\`

**__ Information __**
${reply} **Gamerscore:** \`${gamerscore}\`
${reply} **Friends:** \`${fr}\`
${reply} **Followers:** \`${fl}\`
${end} **Games:** \`${ga}\`
                                    `)
                                    if (global.includes(xuid)) {
                                        Embed.addFields({
                                            name: `${WARNING} Cosmos Global Ban`,
                                            value: `${end} User Is Global Banned`
                                        })
                                    }
                                    if (fs.existsSync(filePath)) {
                                        const dataJson = fs.readFileSync(filePath);
                                        const data = JSON.parse(dataJson);
                                        const { Data, xuid, reason, realm, time = 'Unknown' } = data;

                                        const embedFields = {
                                            'Recently Played Banned Device': {
                                                name: `${WARNING} Cosmos Automod`,
                                                value: `${reply} User Found In Cache\n${reply} Reason: \`Recently Played Banned Device\`\n${reply} Time Ago: \`${time} Hour(s) Ago\`\n${reply} Device: \`${Data}\`\n${end} Kicked From: \`${realm}\``
                                            },
                                            'Not Enough Gamerscore': {
                                                name: `${WARNING} Cosmos Automod`,
                                                value: `${reply} User Found In Cache\n${reply} Reason: \`Not Enough Gamerscore\`\n${reply} Gamerscore: \`${Data}\`\n${end} Kicked From: \`${realm}\``
                                            },
                                            'Not Enough Followers': {
                                                name: `${WARNING} Cosmos Automod`,
                                                value: `${reply} User Found In Cache\n${reply} Reason: \`Not Enough Followers\`\n${reply} Followers: \`${Data}\`\n${end} Kicked From: \`${realm}\``
                                            },
                                            'Not Enough Friends': {
                                                name: `${WARNING} Cosmos Automod`,
                                                value: `${reply} User Found In Cache\n${reply} Reason: \`Not Enough Friends\`\n${reply} Friends: \`${Data}\`\n${end} Kicked From: \`${realm}\``
                                            },
                                            'Not Enough Games': {
                                                name: `${WARNING} Cosmos Automod`,
                                                value: `${reply} User Found In Cache\n${reply} Reason: \`Not Enough Games\`\n${reply} Games: \`${Data}\`\n${end} Kicked From: \`${realm}\``
                                            },
                                            'Profile Is Private': {
                                                name: `${WARNING} Cosmos Automod`,
                                                value: `${reply} User Found In Cache\n${reply} Reason: \`Profile Is Private\`\n${end} Kicked From: \`${realm}\``
                                            }
                                        };

                                        const embedField = embedFields[reason];
                                        if (embedField) {
                                            Embed.addFields(embedField);
                                        }
                                    }

                                    interaction.editReply({ embeds: [Embed] })
                                })
                                .catch((error) => {
                                    console.log(error)
                                    const Embed = new EmbedBuilder()
                                        .setColor(cred)
                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                        .setDescription(`
${denied} **Unable To Fetch Information**
${reply} **Gamertag:** \`${gamertag}\`
${end} User's Profile Is Private
    `)
                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                        .setTimestamp()
                                    interaction.editReply({ embeds: [Embed] })
                                })
                        })
                        .catch((error) => {
                            console.log(error)
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