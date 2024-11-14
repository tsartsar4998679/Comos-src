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
const { Authflow, Titles } = require("prismarine-auth");
const axios = require('axios');
require('colors');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('csetup')
        .setDescription('Setup your realm with Cosmos'),

    async execute(interaction) {
        interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)], ephemeral: true })
        setTimeout(() => {
            if (interaction.user.id === interaction.guild.ownerId || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                interaction.editReply({ embeds: [createSecondEmbedLoad(interaction.guild, interaction.user)] })
                setTimeout(() => {
                    if (!fs.existsSync(`./Database/Oauth/${interaction.guild.id}/realms.json`)) {
                        interaction.editReply({ embeds: [createNonMainAccountSetup(interaction.guild, interaction.user)], components: [] })
                        return
                    }
                    if (!fs.existsSync(`./Database/BotAccounts/${interaction.guild.id}`)) {
                        interaction.editReply({ embeds: [createNonBotAccountSetup(interaction.guild, interaction.user)], components: [] })
                        return
                    }
                    const File = editJsonFile(`./Database/Oauth/${interaction.guild.id}/realms.json`);
                    const realms = File.data[interaction.guild.id] || [];

                    const realmOptions = realms.slice(0, 5).map(([realmId, realmName], index) => ({
                        label: `Realm Name: ${realmName}`,
                        description: `Realm ID: ${realmId}`,
                        value: `${realmId}`,
                    }));

                    while (realmOptions.length < 5) {
                        realmOptions.push({
                            label: `Empty Slot ${realmOptions.length + 1}`,
                            description: `Empty Slot ${realmOptions.length + 1}`,
                            value: `Empty Slot ${realmOptions.length + 1}`,
                        });
                    }

                    const RealmMenu = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('realmselection')
                                .setPlaceholder('Realm Selection')
                                .addOptions(realmOptions),
                        );
                    const FirstLoad1 = new EmbedBuilder()
                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                        .setDescription(`
${loading} **Loading Realm...**
${end} ${load1}${load2}${unload3}

*Select Which Realm You Want To Setup Cosmos!*
*If you don't see your realm, rerun \`/setup\`*
        `)
                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                    interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                    const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                    const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                    RealmCollector.on('collect', async Realms => {
                        const RealmSelect = Realms.values[0];
                        interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                        if (RealmSelect === 'Empty Slot 1' || RealmSelect === 'Empty Slot 2' || RealmSelect === 'Empty Slot 3' || RealmSelect === 'Empty Slot 4' || RealmSelect === 'Empty Slot 5') {
                            interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] })
                            RealmCollector.stop()
                            return;
                        }

                        new Authflow("", `./Database/BotAccounts/${interaction.guild.id}`, {
                            flow: 'live',
                            relyingParty: "https://pocket.realms.minecraft.net/",
                            authTitle: Titles.MinecraftNintendoSwitch,
                            deviceType: 'Nintendo'
                        })
                            .getXboxToken()
                            .then(async (Bot) => {
                                new Authflow("", `./Database/BotAccounts/${interaction.guild.id}`, {
                                    flow: 'msal',
                                    relyingParty: "http://xboxlive.com",
                                })
                                    .getXboxToken()
                                    .then(async (Xbox) => {
                                        const auth = JSON.parse(JSON.stringify({
                                            'x-xbl-contract-version': '2',
                                            'Authorization': `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                            'Accept-Language': "en-US",
                                            maxRedirects: 1,
                                        }))
                                        new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                            flow: 'msal',
                                            relyingParty: "https://pocket.realms.minecraft.net/",
                                        })
                                            .getXboxToken()
                                            .then(async (User) => {

                                                var GetCode = {
                                                    method: "get",
                                                    url: `https://pocket.realms.minecraft.net/links/v1?worldId=${RealmSelect}`,
                                                    headers: {
                                                        "Cache-Control": "no-cache",
                                                        Charset: "utf-8",
                                                        "Client-Version": "1.17.41",
                                                        "User-Agent": "MCPE/UWP",
                                                        "Accept-Language": "en-US",
                                                        "Accept-Encoding": "gzip, deflate, br",
                                                        Host: "pocket.realms.minecraft.net",
                                                        Authorization: `XBL3.0 x=${User.userHash};${User.XSTSToken}`,
                                                    },
                                                }
                                                        var joinrequest = {
                                                            method: "post",
                                                            url: `https://pocket.realms.minecraft.net/invites/v1/link/accept/edGRU6PoFKQ`,
                                                            headers: {
                                                                "Cache-Control": "no-cache",
                                                                Charset: "utf-8",
                                                                "Client-Version": "1.17.41",
                                                                "User-Agent": "MCPE/UWP",
                                                                "Accept-Language": "en-US",
                                                                "Accept-Encoding": "gzip, deflate, br",
                                                                Host: "pocket.realms.minecraft.net",
                                                                Authorization: `XBL3.0 x=${Bot.userHash};${Bot.XSTSToken}`,
                                                            },
                                                        }
                                                        axios(joinrequest)
                                                            .then(function (JoinRequest) {
                                                                var GetClubPfp = {
                                                                    method: "get",
                                                                    url: `https://clubhub.xboxlive.com:443/clubs/ids(${JoinRequest.data.clubId})/decoration/ClubPresence,Roster,Settings`,
                                                                    headers: auth,
                                                                }
                                                                axios(GetClubPfp)
                                                                    .then(function (ClubRequest) {
                                                                        const clubid = JoinRequest.data.clubId;
                                                                        const realmname = JoinRequest.data.name;
                                                                        const realmid = JoinRequest.data.id
                                                                        const ClubPfp = ClubRequest.data.clubs[0].displayImageUrl
                                                                        const JoinedClub = new EmbedBuilder()
                                                                            .setColor(cgreen)
                                                                            .setThumbnail(ClubPfp)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${success} **Joined Realm**
${end} *Note: This Joins The Member List*

**__ Realm Info __**
${reply} **Name:** ${realmname}
${reply} **ID:** ${RealmSelect}
${end} **Club Id:** ${clubid}
        `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        interaction.editReply({ embeds: [JoinedClub], components: [] })
                                                                        axios.get(`https://profile.xboxlive.com/users/xuid(${(Xbox.userXUID)})/profile/settings?settings=Gamertag`, {
                                                                            headers: auth,
                                                                            timeout: 5000
                                                                        })
                                                                            .then((res) => {
                                                                                const gamertag = res?.data?.profileUsers[0]?.settings[0]?.value
                                                                                const Config = {
                                                                                    "RealmName": realmname,
                                                                                    "ClubID": clubid,
                                                                                    "owner": interaction.user.id,
                                                                                    "realmID": realmid,
                                                                                    "BotUsername": gamertag,
                                                                                    "ClubPfp": ClubPfp
                                                                                }
                                                                                const Perms = {
                                                                                    "Reconnect": [

                                                                                    ],
                                                                                    "ConfigManager": [

                                                                                    ],
                                                                                    "RealmUnban": [

                                                                                    ],
                                                                                    "RealmBan": [

                                                                                    ],
                                                                                    "RealmInvite": [

                                                                                    ],
                                                                                    "RealmOpen": [

                                                                                    ],
                                                                                    "RealmClose": [

                                                                                    ],
                                                                                    "RealmBackup": [

                                                                                    ],
                                                                                    "RealmCode": [

                                                                                    ],
                                                                                    "RealmPermissions": [

                                                                                    ],
                                                                                    "RealmPlayers": [

                                                                                    ],
                                                                                    "RealmRecents": [

                                                                                    ],
                                                                                    "RealmRename": [

                                                                                    ],
                                                                                    "RealmSlots": [

                                                                                    ],
                                                                                    "owner": interaction.user.id
                                                                                }
                                                                                if (!fs.existsSync(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)) {
                                                                                    fs.writeFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`, JSON.stringify(Config, null, 2), (err) => {
                                                                                        if (err) {
                                                                                            console.log(err)
                                                                                        }
                                                                                    })
                                                                                } else {
                                                                                    const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                                                                    Config.set("ClubPfp", ClubPfp)
                                                                                    Config.set("BotUsername", gamertag)
                                                                                    Config.save()
                                                                                }
                                                                                if (!fs.existsSync(`./Database/realm/${interaction.guild.id}/${RealmSelect}/BannedDevices.json`)) {
                                                                                    fs.writeFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/BannedDevices.json`, '[]', (err) => {
                                                                                        if (err) {
                                                                                            console.log(err)
                                                                                        }
                                                                                    })
                                                                                }
                                                                                if (!fs.existsSync(`./Database/realm/${interaction.guild.id}/perms.json`)) {
                                                                                    fs.writeFile(`./Database/realm/${interaction.guild.id}/perms.json`, JSON.stringify(Perms, null, 2), (err) => {
                                                                                        if (err) {
                                                                                            console.log(err)
                                                                                        }
                                                                                    })
                                                                                }
                                                                                if (!fs.existsSync(`./Database/realm/${interaction.guild.id}/${RealmSelect}/whitelist.json`)) {
                                                                                    fs.writeFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/whitelist.json`, `["${Xbox.userXUID}"]`, (err) => {
                                                                                        if (err) {
                                                                                            console.log(err)
                                                                                        }
                                                                                    })
                                                                                }
                                                                            })
                                                                    }).catch((error) => {
                                                                        console.log(error.data)
                                                                        const ErrorMenu = new EmbedBuilder()
                                                                            .setColor(cred)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${success} **Joined Realm**
${reply} *Note: This Joins The Member List*
${end} Unable to fetch other info...
        `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        interaction.editReply({ embeds: [ErrorMenu], components: [] })
                                                            })
                                                    })
                                                    .catch((error) => {
                                                        const ErrorMenu = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setDescription(`
${denied} **Joining Realm Failed**
${reply} Unable To Join Realm!
${reply} Did you use an **ALT** Account with \`/bsetup\`?
${end} ${error.response.data.errorMsg}
        `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [ErrorMenu], components: [] })
                                                    })
                                            
                                    })
                                    .catch((error) => {
                                        const ErrorMenu = new EmbedBuilder()
                                            .setColor(cred)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${denied} **Fetching Failed**
${end} Failed Fetching Oauth!
        `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        interaction.editReply({ embeds: [ErrorMenu], components: [] })
                                    })
                            })
                            .catch((error) => {
                                const ErrorMenu = new EmbedBuilder()
                                    .setColor(cred)
                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                    .setDescription(`
${denied} **Fetching Failed**
${end}  Failed Fetching auth!
        `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [ErrorMenu], components: [] })
                            })
                    })
                        .catch((error) => {
                            const ErrorMenu = new EmbedBuilder()
                                .setColor(cred)
                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                .setDescription(`
${denied} **Auth Error**
${reply} Authentication Failed
${end} Timed Out
        `)
                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                .setTimestamp()
                            interaction.editReply({ embeds: [ErrorMenu], components: [] })
                        })
                })
                RealmCollector.on('end', async (collected) => {
                    if (collected.size === 0) {
                        const Ended = new EmbedBuilder()
                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                            .setColor(cred)
                            .setDescription(`
${WARNING} **Menu Ended**
${end} 2 Minute Time has exceeded!
                        `)
                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                            .setTimestamp()
                        await interaction.editReply({ embeds: [Ended], components: [] })
                    }
                })
            }, 1500)
    } else {
        interaction.editReply({ embeds: [createNotGuildOwnerEmbed(interaction.guild, interaction.user)] })
    }
}, 1000)
    }
}