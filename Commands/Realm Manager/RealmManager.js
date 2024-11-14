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
const { RealmAPI } = require("prismarine-realms");
const axios = require('axios');
require('colors');
let BanCase = 0
const RealmBans = editJsonFile(`./Database/RealmBans.json`)
const client = require('../../Cosmos.js');
const data = JSON.parse(fs.readFileSync(`./Database/PlayersDB/Lastseen/lastseen.json`));
const playerMap = new Map();

for (const playerId in data) {
    const player = data[playerId];
    const timestamp = player.time;
    const realm = player.realm;
    const username = player.username;
    const device = player.device;

    playerMap.set(username, { timestamp, realm, device, username });
}

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('realm')
        .setDescription(`Manage your realm with Cosmos Realm Manager!`)
        .addSubcommand(subcommand =>
            subcommand.setName('unban')
                .setDescription('Unban a player from your realm')
                .addStringOption(option =>
                    option.setName('gamertag')
                        .setDescription('Gamertag to unban')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription(`reason for unban`)))

        .addSubcommand(subcommand =>
            subcommand.setName('ban')
                .setDescription('Ban a player from your realm')
                .addStringOption(username =>
                    username.setName('gamertag')
                        .setDescription(`Gamertag To Ban`)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription(`reason for ban`))
                .addStringOption(option =>
                    option.setName('length')
                        .setDescription(`Ban Length`))
                .addBooleanOption(permission =>
                    permission.setName('silent')
                        .setDescription('Silent Ban | Dont Sent Xbox Message')))

        .addSubcommand(subcommand =>
            subcommand.setName('kick')
                .setDescription('Kick a player from your realm')
                .addStringOption(username =>
                    username.setName('gamertag')
                        .setDescription(`Gamertag To Kick`)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription(`reason for Kick`)))

        .addSubcommand(subcommand =>
            subcommand.setName('restore')
                .setDescription('Restore your realm with a backup'))

        .addSubcommand(subcommand =>
            subcommand.setName('slots')
                .setDescription(`Change your realm(s) slot via discord`)
                .addStringOption(option =>
                    option.setName('slots')
                        .setDescription('Realm Slots')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Slot 1', value: '1' },
                            { name: 'Slot 2', value: '2' },
                            { name: 'Slot 3', value: '3' }
                        )))

        .addSubcommand(subcommand =>
            subcommand.setName('invite')
                .setDescription(`Invite a member to your realm(s) via discord`)
                .addStringOption(option =>
                    option.setName('gamertag')
                        .setDescription(`gamertag to invite`)
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand.setName('open')
                .setDescription('Open your realm(s) via discord'))

        .addSubcommand(subcommand =>
            subcommand.setName('close')
                .setDescription('Close your realm(s) via discord'))

        .addSubcommand(subcommand =>
            subcommand.setName('rename')
                .setDescription(`Rename your realm(s) via discord`)
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription(`New Name for the realm`)
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand.setName('permissions')
                .setDescription(`Change a members perms in your realm(s) via discord`)
                .addStringOption(setting =>
                    setting.setName('gamertag')
                        .setDescription('gamertag to set the permission')
                        .setRequired(true))
                .addStringOption(permission =>
                    permission.setName('permissions')
                        .setDescription('Realm Permissions')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Visitor', value: 'VISITOR' },
                            { name: 'Member', value: 'MEMBER' },
                            { name: 'Operator', value: 'OPERATOR' }
                        )))

        .addSubcommand(subcommand =>
            subcommand.setName('code')
                .setDescription('Fetch your realm code(s)'))

        .addSubcommand(subcommand =>
            subcommand.setName('change-code')
                .setDescription('Change your realm code(s)'))

        .addSubcommand(subcommand =>
            subcommand.setName('players')
                .setDescription('Lookup your realm\'s current online players'))

        .addSubcommand(subcommand =>
            subcommand.setName('recents')
                .setDescription('Lookup your realm\'s recent players'))

        .addSubcommand(subcommand =>
            subcommand.setName('lastseen')
                .setDescription('Lookup a player\'s last seen')
                .addStringOption((gamertag) =>
                    gamertag.setName('gamertag')
                        .setDescription('Gamertag To Lookup')
                        .setRequired(true)
                )),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'unban') {
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            const Gamertag = interaction.options.getString('gamertag')
            const Reason = interaction.options.getString('reason') ?? 'Not Provided'
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmUnban.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmUnban')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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
                                const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                    flow: 'msal',
                                    relyingParty: "http://xboxlive.com",
                                })
                                authflow.getXboxToken()
                                    .then((Xbox) => {
                                        const MainAuth = JSON.parse(
                                            JSON.stringify({
                                                "x-xbl-contract-version": "2",
                                                Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                "Accept-Language": "en-US",
                                                maxRedirects: 1,
                                            })
                                        );
                                        const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                            flow: 'msal',
                                            relyingParty: "http://xboxlive.com",
                                        })
                                        authflow.getXboxToken()
                                            .then((Xbox) => {
                                                const XboxAuth = JSON.parse(
                                                    JSON.stringify({
                                                        "x-xbl-contract-version": "2",
                                                        Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                        "Accept-Language": "en-US",
                                                        maxRedirects: 1,
                                                    })
                                                );
                                                new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                                    flow: 'msal',
                                                    relyingParty: "https://pocket.realms.minecraft.net/",
                                                })
                                                    .getXboxToken()
                                                    .then(async (PocketRealm) => {
                                                        axios.get(`https://profile.xboxlive.com/users/gt(${(Gamertag)})/profile/settings?settings=GameDisplayPicRaw`, {
                                                            headers: XboxAuth,
                                                            timeout: 5000
                                                        })
                                                            .then((res) => {
                                                                const xuid = res?.data?.profileUsers[0]?.id
                                                                const pfp = res?.data?.profileUsers[0]?.settings[0]?.value
                                                                const File = editJsonFile(`./Database/Oauth/${interaction.guild.id}/realms.json`);
                                                                const realms = File.data[interaction.guild.id] || [];
                                                                const NonEmptySlots = [];

                                                                for (let i = 0; i < realms.length; i++) {
                                                                    const realmID = realms[i]?.[0];
                                                                    const realmName = realms[i]?.[1];

                                                                    if (realmName !== `Empty Slot ${i + 1}`) {
                                                                        NonEmptySlots.push({ id: realmID, name: realmName });
                                                                    }
                                                                }

                                                                const allRealmsOption = {
                                                                    label: 'All Realms',
                                                                    description: 'Select all realms',
                                                                    value: 'AllRealms',
                                                                };

                                                                const realmOptions = [allRealmsOption, ...realms.slice(0, 5).map(([realmId, realmName], index) => ({
                                                                    label: `Realm Name: ${realmName}`,
                                                                    description: `Realm ID: ${realmId}`,
                                                                    value: `${realmId}`,
                                                                }))];

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

*Select Which Realm You Want To Ban From!*
                        `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                                                const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                                                const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                                                RealmCollector.on('collect', async Realms => {
                                                                    const RealmSelect = Realms.values[0];
                                                                    if (interaction.user.id !== Realms.user.id) {
                                                                        const Embed = new EmbedBuilder()
                                                                            .setColor(corange)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
        `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        Realms.reply({ embeds: [Embed], ephemeral: true })
                                                                        return
                                                                    }
                                                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                                                    if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                                                        interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                                                        RealmCollector.stop();
                                                                        return;
                                                                    }
                                                                    if (RealmSelect === 'AllRealms') {
                                                                        const CloseRealmS = new EmbedBuilder()
                                                                            .setColor(cgreen)
                                                                            .setThumbnail(pfp)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${success} **Realm Unban**
${reply} **Gamertag:** \`${Gamertag}\`
${end} **Reason:** \`${Reason}\`

**__Realms User Banned On__**

                `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        const BannedLogs = new EmbedBuilder()
                                                                            .setColor(corange)
                                                                            .setThumbnail(pfp)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${success} **Realm Unban**
${reply} **Gamertag:** \`${Gamertag}\`
${end} **Reason:** \`${Reason}\`

**__Realms User Banned On__**

                `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        for (let i = 0; i < 5 && i < NonEmptySlots.length; i++) {
                                                                            const Realm = NonEmptySlots[i]
                                                                            const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`) ?? 'Non-Realm'
                                                                            const BanLogs = Config.get('Ban-Logs')
                                                                            var BanRequest = {
                                                                                method: "delete",
                                                                                url: `https://pocket.realms.minecraft.net/worlds/${Realm.id}/blocklist/${xuid}`,
                                                                                headers: {
                                                                                    "Cache-Control": "no-cache",
                                                                                    Charset: "utf-8",
                                                                                    "Client-Version": "1.17.41",
                                                                                    "User-Agent": "MCPE/UWP",
                                                                                    "Accept-Language": "en-US",
                                                                                    "Accept-Encoding": "gzip, deflate, br",
                                                                                    Host: "pocket.realms.minecraft.net",
                                                                                    Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                                },
                                                                            }
                                                                            axios(BanRequest)
                                                                                .then((res) => {
                                                                                    CloseRealmS.addFields({
                                                                                        name: `${success} Realm Name: ${Realm.name}`,
                                                                                        value: `${end} \`Successfully Unbanned Player\``
                                                                                    })
                                                                                    BannedLogs.addFields({
                                                                                        name: `${success} Realm Name: ${Realm.name}`,
                                                                                        value: `${end} \`Successfully Unbanned Player\``
                                                                                    })
                                                                                }).catch((error) => {
                                                                                    setTimeout(() => {
                                                                                        CloseRealmS.addFields({
                                                                                            name: `${denied} Realm Name: ${Realm.name}`,
                                                                                            value: `${end} \`${error.response.data.errorMsg}\``
                                                                                        })
                                                                                        BannedLogs.addFields({
                                                                                            name: `${denied} Realm Name: ${Realm.name}`,
                                                                                            value: `${end} \`${error.response.data.errorMsg}\``
                                                                                        })
                                                                                    }, 500)
                                                                                }).finally(() => {
                                                                                    setTimeout(() => {
                                                                                        if (i === NonEmptySlots.length - 1) {
                                                                                            interaction.editReply({ embeds: [CloseRealmS] });
                                                                                            if (BanLogs) {
                                                                                                client.channels
                                                                                                    .fetch(BanLogs)
                                                                                                    .then(async (channel) => await channel.send({ embeds: [BannedLogs] }))
                                                                                                    .catch((error) => {
                                                                                                        console.error(error);
                                                                                                    });
                                                                                            }
                                                                                        }
                                                                                    }, 500)
                                                                                })
                                                                        }
                                                                    } else {
                                                                        const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`) ?? 'Non-Realm'
                                                                        const realmname = Config.get('RealmName')
                                                                        const BanLogs = Config.get('Unban-Logs')
                                                                        const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                                                            flow: 'msal',
                                                                            relyingParty: "http://xboxlive.com",
                                                                        })
                                                                        authflow.getXboxToken()
                                                                            .then((Xbox) => {
                                                                                new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                                                                    flow: 'msal',
                                                                                    relyingParty: "https://pocket.realms.minecraft.net/",
                                                                                })
                                                                                    .getXboxToken()
                                                                                    .then(async (PocketRealm) => {
                                                                                        var BanRequest = {
                                                                                            method: "delete",
                                                                                            url: `https://pocket.realms.minecraft.net/worlds/${RealmSelect}/blocklist/${xuid}`,
                                                                                            headers: {
                                                                                                "Cache-Control": "no-cache",
                                                                                                Charset: "utf-8",
                                                                                                "Client-Version": "1.17.41",
                                                                                                "User-Agent": "MCPE/UWP",
                                                                                                "Accept-Language": "en-US",
                                                                                                "Accept-Encoding": "gzip, deflate, br",
                                                                                                Host: "pocket.realms.minecraft.net",
                                                                                                Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                                            },
                                                                                        };

                                                                                        axios(BanRequest)
                                                                                            .then((res) => {
                                                                                                const RealmBan = new EmbedBuilder()
                                                                                                    .setColor(cgreen)
                                                                                                    .setThumbnail(pfp)
                                                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                                                    .setDescription(`
${success} **Realm Unban**
${reply} **Gamertag:** \`${Gamertag}\`
${end} **Reason:** \`${Reason}\`

**__Realm Info__**
${end} **Name:** \`${realmname}\`

                `)
                                                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                                                    .setTimestamp()
                                                                                                interaction.editReply({ embeds: [RealmBan], components: [] })
                                                                                                const BanLogged = new EmbedBuilder()
                                                                                                    .setColor(cgreen)
                                                                                                    .setThumbnail(pfp)
                                                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                                                    .setDescription(`
${success} **Realm Unban**
${reply} **Gamertag:** \`${Gamertag}\`
${end} **Reason:** \`${Reason}\`

**__Realm Info__**
${end} **Name:** \`${realmname}\`

        `)
                                                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                                                    .setTimestamp()
                                                                                                if (BanLogs) {
                                                                                                    client.channels
                                                                                                        .fetch(BanLogs)
                                                                                                        .then(async (channel) => await channel.send({ embeds: [BanLogged] }))
                                                                                                        .catch((error) => {
                                                                                                            console.error(error);
                                                                                                        });
                                                                                                }
                                                                                            }).catch((error) => {
                                                                                                const failed = new EmbedBuilder()
                                                                                                    .setColor(corange)
                                                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                                                    .setDescription(`
${WARNING} **Notice**
${reply} An Error Has Occurred While Trying To Unban.
${reply} Please Retry This Command Again!
                                    `)
                                                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                                                    .setTimestamp()
                                                                                                interaction.editReply({ embeds: [failed], components: [] })
                                                                                            })
                                                                                    }).catch((error) => {
                                                                                        const failed = new EmbedBuilder()
                                                                                            .setColor(corange)
                                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                                            .setDescription(`
${WARNING} **Notice**
${reply} An Error Has Occurred While Trying To Unban.
${reply} Please Retry This Command Again!
                                    `)
                                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                                            .setTimestamp()
                                                                                        interaction.editReply({ embeds: [failed], components: [] })
                                                                                    })
                                                                            })
                                                                    }
                                                                    RealmCollector.stop()
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
                                                            }).catch((error) => {
                                                                const Ended = new EmbedBuilder()
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setColor(cred)
                                                                    .setDescription(`
${WARNING} **Notice**
${reply} **Gamertag:** \`${Gamertag}\`
${end} User not found!
                            `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                interaction.editReply({ embeds: [Ended], components: [] })
                                                            })
                                                    }).catch((error) => {
                                                        const Ended = new EmbedBuilder()
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setColor(cred)
                                                            .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
            `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [Ended], components: [] })
                                                    })
                                            }).catch((error) => {
                                                const Ended = new EmbedBuilder()
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setColor(cred)
                                                    .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
            `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [Ended], components: [] })
                                            })
                                    }).catch((error) => {
                                        const Ended = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cred)
                                            .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        interaction.editReply({ embeds: [Ended], components: [] })
                                    })
                            }, 1500)
                        } else {
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmBan')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'ban') {
            const Gamertag = interaction.options.getString('gamertag')
            const Reason = interaction.options.getString('reason') ?? 'Not Provided'
            const Length = interaction.options.getString('length') ?? 'Permanent'
            const BanType = interaction.options.getString('bantype')
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmBan.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmBan')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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
                                const validLengthFormat = /^(\d+\s*(y|M|w|d|h|m|s),\s*)*(\d+\s*(y|M|w|d|h|m|s))$/i;
                                if (Length !== 'Permanent') {
                                    if (!validLengthFormat.test(Length)) {
                                        const ErrorMenu = new EmbedBuilder()
                                            .setColor(corange)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${WARNING} **Notice**
${reply} Invalid Length Format!
${end} __Valid Length Formats__
> **Year:** \`y\` Ex: \`1y\`
> **Month:** \`M\` Ex: \`1m\`
> **Weeks:** \`w\` Ex: \`1w\`
> **Days:** \`d\` Ex: \`1d\`
> **Hours:** \`h\` Ex: \`1h\`
> **Minutes:** \`m\` Ex: \`1m\`
> **Seconds:** \`s\` Ex: \`1s\`
${end} No Length = Perm
                        `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        return interaction.reply({ embeds: [ErrorMenu], components: [] })
                                    }
                                }
                                //Ban Length
                                let LengthSeconds = 0;
                                if (Length !== 'Permanent') {
                                    const LengthArray = Length.split(', ')

                                    for (let i = 0; i < LengthArray.length; i++) {
                                        const LengthItem = LengthArray[i]
                                        const LengthValue = parseInt(LengthItem.slice(0, -1))
                                        const LengthUnit = LengthItem.slice(-1)

                                        switch (LengthUnit) {
                                            case 'y':
                                                LengthSeconds += LengthValue * 365 * 24 * 60 * 60;
                                                break;
                                            case 'M':
                                                LengthSeconds += LengthValue * 30 * 24 * 60 * 60;
                                                break;
                                            case 'w':
                                                LengthSeconds += LengthValue * 7 * 24 * 60 * 60;
                                                break;
                                            case 'd':
                                                LengthSeconds += LengthValue * 24 * 60 * 60;
                                                break;
                                            case 'h':
                                                LengthSeconds += LengthValue * 60 * 60;
                                                break;
                                            case 'm':
                                                LengthSeconds += LengthValue * 60;
                                                break;
                                            case 's':
                                                LengthSeconds += LengthValue
                                                break;
                                        }
                                    }
                                }
                                const now = new Date();
                                const UnbanDate = new Date(now.getTime() + LengthSeconds * 1000);
                                const UnbanDiscordUnix = Math.floor(UnbanDate.getTime() / 1000);

                                let LengthString = '';
                                let LengthStringDBSave = ''
                                if (Length === 'Permanent') {
                                    LengthString = 'Permanent'
                                    LengthStringDBSave = 'Permanent'
                                } else {
                                    LengthString = `<t:${UnbanDiscordUnix}:f>`
                                    LengthStringDBSave = UnbanDiscordUnix
                                }
                                const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                    flow: 'msal',
                                    relyingParty: "http://xboxlive.com",
                                })
                                authflow.getXboxToken()
                                    .then((Xbox) => {
                                        const MainAuth = JSON.parse(
                                            JSON.stringify({
                                                "x-xbl-contract-version": "2",
                                                Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                "Accept-Language": "en-US",
                                                maxRedirects: 1,
                                            })
                                        );
                                        const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                            flow: 'msal',
                                            relyingParty: "http://xboxlive.com",
                                        })
                                        authflow.getXboxToken()
                                            .then((Xbox) => {
                                                const XboxAuth = JSON.parse(
                                                    JSON.stringify({
                                                        "x-xbl-contract-version": "2",
                                                        Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                        "Accept-Language": "en-US",
                                                        maxRedirects: 1,
                                                    })
                                                );
                                                new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                                    flow: 'msal',
                                                    relyingParty: "https://pocket.realms.minecraft.net/",
                                                })
                                                    .getXboxToken()
                                                    .then(async (PocketRealm) => {
                                                        axios.get(`https://profile.xboxlive.com/users/gt(${(Gamertag)})/profile/settings?settings=GameDisplayPicRaw`, {
                                                            headers: XboxAuth,
                                                            timeout: 5000
                                                        })
                                                            .then((res) => {
                                                                const xuid = res?.data?.profileUsers[0]?.id
                                                                const pfp = res?.data?.profileUsers[0]?.settings[0]?.value
                                                                const File = editJsonFile(`./Database/Oauth/${interaction.guild.id}/realms.json`);
                                                                const realms = File.data[interaction.guild.id] || [];
                                                                const NonEmptySlots = [];

                                                                for (let i = 0; i < realms.length; i++) {
                                                                    const realmID = realms[i]?.[0];
                                                                    const realmName = realms[i]?.[1];

                                                                    if (realmName !== `Empty Slot ${i + 1}`) {
                                                                        NonEmptySlots.push({ id: realmID, name: realmName });
                                                                    }
                                                                }

                                                                const allRealmsOption = {
                                                                    label: 'All Realms',
                                                                    description: 'Select all realms',
                                                                    value: 'AllRealms',
                                                                };

                                                                const realmOptions = [allRealmsOption, ...realms.slice(0, 5).map(([realmId, realmName], index) => ({
                                                                    label: `Realm Name: ${realmName}`,
                                                                    description: `Realm ID: ${realmId}`,
                                                                    value: `${realmId}`,
                                                                }))];

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

*Select Which Realm You Want To Ban From!*
                        `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                                                const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                                                const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                                                RealmCollector.on('collect', async Realms => {
                                                                    const RealmSelect = Realms.values[0];
                                                                    if (interaction.user.id !== Realms.user.id) {
                                                                        const Embed = new EmbedBuilder()
                                                                            .setColor(corange)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
        `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        Realms.reply({ embeds: [Embed], ephemeral: true })
                                                                        return
                                                                    }
                                                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                                                    if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                                                        interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                                                        RealmCollector.stop();
                                                                        return;
                                                                    }
                                                                    if (RealmSelect === 'AllRealms') {

                                                                        const RealmIDs = [];
                                                                        for (let i = 0; i < 5 && i < NonEmptySlots.length; i++) {
                                                                            const Realm = NonEmptySlots[i];
                                                                            RealmIDs.push(Realm.id);
                                                                        }
                                                                        const RealmName = [];
                                                                        for (let i = 0; i < 5 && i < NonEmptySlots.length; i++) {
                                                                            const Realm = NonEmptySlots[i];
                                                                            RealmName.push(Realm.name);
                                                                        }

                                                                        if (LengthString === `<t:${UnbanDiscordUnix}:f>`) {
                                                                            const BanCaseNumber = BanCase++;
                                                                            const BanKey = `RealmBan#${BanCaseNumber}`

                                                                            RealmBans.set(`${BanKey}`, {
                                                                                Xuid: xuid,
                                                                                Gamertag: Gamertag,
                                                                                Reason: Reason,
                                                                                Length: LengthStringDBSave,
                                                                                RealmID: RealmIDs,
                                                                                Guild: interaction.guild.id,
                                                                                pfp: pfp,
                                                                                guildName: interaction.guild.name,
                                                                                guildPfp: interaction.guild.iconURL(),
                                                                                bannedBy: interaction.user.tag,
                                                                                bannedByPfp: interaction.user.displayAvatarURL(),
                                                                                RealmNames: RealmName
                                                                            });
                                                                            RealmBans.save();
                                                                        }
                                                                        const CloseRealmS = new EmbedBuilder()
                                                                            .setColor(cgreen)
                                                                            .setThumbnail(pfp)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${success} **Realm Ban**
${reply} **Gamertag:** \`${Gamertag}\`
${reply} **Xuid:** \`${xuid}\`

**__ Ban Info __**
${reply} **Reason:** \`${Reason}\`
${end} **Length:** ${LengthString}

**__Realms User Banned On__**

                `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        const BannedLogs = new EmbedBuilder()
                                                                            .setColor(corange)
                                                                            .setThumbnail(pfp)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${success} **Realm Ban**
${reply} **Gamertag:** \`${Gamertag}\`
${reply} **Xuid:** \`${xuid}\`

**__ Ban Info __**
${reply} **Reason:** \`${Reason}\`
${end} **Length:** ${LengthString}

**__Realms User Banned On__**

                `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        for (let i = 0; i < 5 && i < NonEmptySlots.length; i++) {
                                                                            const Realm = NonEmptySlots[i]
                                                                            const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`) ?? 'Non-Realm'
                                                                            const BanLogs = Config.get('Ban-Logs')
                                                                            var BanRequest = {
                                                                                method: "post",
                                                                                url: `https://pocket.realms.minecraft.net/worlds/${Realm.id}/blocklist/${xuid}`,
                                                                                headers: {
                                                                                    "Cache-Control": "no-cache",
                                                                                    Charset: "utf-8",
                                                                                    "Client-Version": "1.17.41",
                                                                                    "User-Agent": "MCPE/UWP",
                                                                                    "Accept-Language": "en-US",
                                                                                    "Accept-Encoding": "gzip, deflate, br",
                                                                                    Host: "pocket.realms.minecraft.net",
                                                                                    Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                                },
                                                                            }
                                                                            axios(BanRequest)
                                                                                .then((res) => {
                                                                                    CloseRealmS.addFields({
                                                                                        name: `${success} Realm Name: ${Realm.name}`,
                                                                                        value: `${end} \`Successfully Banned Player\``
                                                                                    })
                                                                                    BannedLogs.addFields({
                                                                                        name: `${success} Realm Name: ${Realm.name}`,
                                                                                        value: `${end} \`Successfully Banned Player\``
                                                                                    })
                                                                                }).catch((error) => {
                                                                                    setTimeout(() => {
                                                                                        CloseRealmS.addFields({
                                                                                            name: `${denied} Realm Name: ${Realm.name}`,
                                                                                            value: `${end} \`${error.response.data.errorMsg}\``
                                                                                        })
                                                                                        BannedLogs.addFields({
                                                                                            name: `${denied} Realm Name: ${Realm.name}`,
                                                                                            value: `${end} \`${error.response.data.errorMsg}\``
                                                                                        })
                                                                                    }, 500)
                                                                                }).finally(() => {
                                                                                    setTimeout(() => {
                                                                                        if (i === NonEmptySlots.length - 1) {
                                                                                            interaction.editReply({ embeds: [CloseRealmS] });
                                                                                            if (BanLogs) {
                                                                                                client.channels
                                                                                                    .fetch(BanLogs)
                                                                                                    .then(async (channel) => await channel.send({ embeds: [BannedLogs] }))
                                                                                                    .catch((error) => {
                                                                                                        console.error(error);
                                                                                                    });
                                                                                            }
                                                                                        }
                                                                                    }, 500)
                                                                                })
                                                                        }
                                                                        for (let i = 0; i < 1; i++) {
                                                                            const Realm = NonEmptySlots[i]
                                                                            const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`) ?? 'Non-Realm'
                                                                            const banMessage = Config.get('banMessage') ?? 'You have been banned!'
                                                                            let updatedBanMessage = banMessage

                                                                            // Check if the message includes {realmname}
                                                                            if (banMessage.includes('{realmname}')) {
                                                                                updatedBanMessage = updatedBanMessage.replace('{realmname}', realmname)
                                                                            }

                                                                            // Check if the message includes {reason}
                                                                            if (banMessage.includes('{reason}')) {
                                                                                updatedBanMessage = updatedBanMessage.replace('{reason}', Reason)
                                                                            }

                                                                            const SendMessage = {
                                                                                url: `https://xblmessaging.xboxlive.com:443/network/xbox/users/me/conversations/users/xuid(${xuid})`,
                                                                                method: 'POST',
                                                                                headers: MainAuth,
                                                                                data: {
                                                                                    parts: [
                                                                                        {
                                                                                            contentType: 'text',
                                                                                            version: 0,
                                                                                            text: updatedBanMessage
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            };
                                                                            if (BanType !== 'silent') {
                                                                                axios(SendMessage)
                                                                                    .then((res) => {
                                                                                        console.log(`Sent Ban Message: `.red + `${updatedBanMessage}`.yellow)
                                                                                    }).catch((error) => {
                                                                                        console.log(error.data)
                                                                                    })
                                                                            }
                                                                        }
                                                                    } else {
                                                                        const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                                                        var realmname = Config.get('RealmName')
                                                                        const banMessage = Config.get('banMessage') ?? 'You have been banned!'
                                                                        let updatedBanMessage = banMessage

                                                                        // Check if the message includes {realmname}
                                                                        if (banMessage.includes('{realmname}')) {
                                                                            updatedBanMessage = updatedBanMessage.replace('{realmname}', realmname)
                                                                        }

                                                                        // Check if the message includes {reason}
                                                                        if (banMessage.includes('{reason}')) {
                                                                            updatedBanMessage = updatedBanMessage.replace('{reason}', Reason)
                                                                        }
                                                                        const BanLogs = Config.get('Ban-Logs')
                                                                        if (LengthString === `<t:${UnbanDiscordUnix}:f>`) {
                                                                            const BanCaseNumber = BanCase++;
                                                                            const BanKey = `RealmBan#${BanCaseNumber}`

                                                                            RealmBans.set(`${BanKey}`, {
                                                                                Xuid: xuid,
                                                                                Gamertag: Gamertag,
                                                                                Reason: Reason,
                                                                                Length: LengthStringDBSave,
                                                                                RealmID: RealmSelect,
                                                                                Guild: interaction.guild.id,
                                                                                pfp: pfp,
                                                                                guildName: interaction.guild.name,
                                                                                guildPfp: interaction.guild.iconURL(),
                                                                                bannedBy: interaction.user.tag,
                                                                                bannedByPfp: interaction.user.displayAvatarURL(),
                                                                                RealmNames: realmname
                                                                            });
                                                                            RealmBans.save();
                                                                        }
                                                                        var SendMessage = {
                                                                            method: "post",
                                                                            url: `https://xblmessaging.xboxlive.com:443/network/xbox/users/me/conversations/users/xuid(${(xuid)})`,
                                                                            headers: {
                                                                                'x-xbl-contract-version': 1,
                                                                                accept: 'application/json',
                                                                                Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                                                'accept-language': 'en-US',
                                                                                Connection: 'Keep-Alive',
                                                                                'Accept-Encoding': 'gzip',
                                                                                'User-Agent': 'okhttp/4.9.1',
                                                                            },
                                                                            data: {
                                                                                parts: [
                                                                                    {
                                                                                        contentType: 'text',
                                                                                        version: 0,
                                                                                        text: updatedBanMessage
                                                                                    }
                                                                                ]
                                                                            }
                                                                        }
                                                                        var BanRequest = {
                                                                            method: "post",
                                                                            url: `https://pocket.realms.minecraft.net/worlds/${RealmSelect}/blocklist/${xuid}`,
                                                                            headers: {
                                                                                "Cache-Control": "no-cache",
                                                                                Charset: "utf-8",
                                                                                "Client-Version": "1.17.41",
                                                                                "User-Agent": "MCPE/UWP",
                                                                                "Accept-Language": "en-US",
                                                                                "Accept-Encoding": "gzip, deflate, br",
                                                                                Host: "pocket.realms.minecraft.net",
                                                                                Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                            },
                                                                        };
                                                                        axios(BanRequest)
                                                                            .then((res) => {
                                                                                const RealmBan = new EmbedBuilder()
                                                                                    .setColor(cgreen)
                                                                                    .setThumbnail(pfp)
                                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                                    .setDescription(`
${success} **Realm Ban**
${reply} **Gamertag:** \`${Gamertag}\`
${reply} **Xuid:** \`${xuid}\`
${end} **Realm:** \`${realmname}\`

**__ Ban Info __**
${reply} **Reason:** \`${Reason}\`
${end} **Length:** ${LengthString}

            `)
                                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                                    .setTimestamp()
                                                                                interaction.editReply({ embeds: [RealmBan], components: [] })
                                                                                const BanLogged = new EmbedBuilder()
                                                                                    .setColor(cgreen)
                                                                                    .setThumbnail(pfp)
                                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                                    .setDescription(`
${success} **Realm Ban**
${reply} **Gamertag:** \`${Gamertag}\`
${reply} **Xuid:** \`${xuid}\`
${end} **Realm:** \`${realmname}\`

**__ Ban Info __**
${reply} **Reason:** \`${Reason}\`
${end} **Length:** ${LengthString}

        `)
                                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                                    .setTimestamp()
                                                                                if (BanLogs) {
                                                                                    client.channels
                                                                                        .fetch(BanLogs)
                                                                                        .then(async (channel) => await channel.send({ embeds: [BanLogged] }))
                                                                                        .catch((error) => {
                                                                                            console.error(error);
                                                                                        });
                                                                                }
                                                                                if (BanType !== 'silent') {
                                                                                    axios(SendMessage)
                                                                                        .then((res) => {
                                                                                            console.log(`Sent Ban Message: `.red + `${updatedBanMessage}`.yellow)
                                                                                        }).catch((error) => {
                                                                                            console.log(error.data)
                                                                                        })
                                                                                }
                                                                            }).catch((error) => {
                                                                                console.log(error)
                                                                                const failed = new EmbedBuilder()
                                                                                    .setColor(corange)
                                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                                    .setDescription(`
${WARNING} **Notice**
${reply} An Error Has Occurred While Trying To Ban.
${reply} Please Retry This Command Again!
                                `)
                                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                                    .setTimestamp()
                                                                                interaction.editReply({ embeds: [failed], components: [] })
                                                                            })
                                                                    }
                                                                    RealmCollector.stop()
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
                                                            }).catch((error) => {
                                                                const Ended = new EmbedBuilder()
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setColor(cred)
                                                                    .setDescription(`
${WARNING} **Notice**
${reply} **Gamertag:** \`${Gamertag}\`
${end} User not found!
                            `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                interaction.editReply({ embeds: [Ended], components: [] })
                                                            })
                                                    }).catch((error) => {
                                                        const Ended = new EmbedBuilder()
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setColor(cred)
                                                            .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
            `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [Ended], components: [] })
                                                    })
                                            }).catch((error) => {
                                                const Ended = new EmbedBuilder()
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setColor(cred)
                                                    .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
            `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [Ended], components: [] })
                                            })
                                    }).catch((error) => {
                                        const Ended = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cred)
                                            .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        interaction.editReply({ embeds: [Ended], components: [] })
                                    })
                            }, 1500)
                        } else {
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmBan')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'restore') {
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmBackup.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmBackup')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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

*Select Which Realm You Want To Restore!*
                        `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                RealmCollector.on('collect', async Realms => {
                                    const RealmSelect = Realms.values[0];
                                    if (interaction.user.id !== Realms.user.id) {
                                        const Embed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
`)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        Realms.reply({ embeds: [Embed], ephemeral: true })
                                        return
                                    }
                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                    if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                        interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                        RealmCollector.stop();
                                        return;
                                    }
                                    const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                        flow: 'msal',
                                        relyingParty: "http://xboxlive.com",
                                    })
                                    authflow.getXboxToken()
                                        .then((Xbox) => {
                                            const XboxAuth = JSON.parse(
                                                JSON.stringify({
                                                    "x-xbl-contract-version": "2",
                                                    Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                    "Accept-Language": "en-US",
                                                    maxRedirects: 1,
                                                })
                                            );
                                            new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                                flow: 'msal',
                                                relyingParty: "https://pocket.realms.minecraft.net/",
                                            })
                                                .getXboxToken()
                                                .then(async (PocketRealm) => {
                                                    const PocketRealmAuth = JSON.parse(
                                                        JSON.stringify({
                                                            "x-xbl-contract-version": "2",
                                                            Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                            "Accept-Language": "en-US",
                                                            maxRedirects: 1,
                                                        })
                                                    )
                                                    var joinrequest = {
                                                        method: "get",
                                                        url: `https://pocket.realms.minecraft.net/worlds/${RealmSelect}/backups`,
                                                        headers: {
                                                            "Cache-Control": "no-cache",
                                                            Charset: "utf-8",
                                                            "Client-Version": "1.17.41",
                                                            "User-Agent": "MCPE/UWP",
                                                            "Accept-Language": "en-US",
                                                            "Accept-Encoding": "gzip, deflate, br",
                                                            Host: "pocket.realms.minecraft.net",
                                                            Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                        },
                                                    };
                                                    axios(joinrequest)
                                                        .then(function (response) {
                                                            const backups = response.data.backups;
                                                            if (backups.length === 0) {
                                                                const Backupembed = new EmbedBuilder()
                                                                    .setColor(corange)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${WARNING} **Notice**
${end} There are No Available Backups For This Realm!
                                        `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                interaction.editReply({ embeds: [Backupembed], components: [] });
                                                                return
                                                            }


                                                            backups.sort((a, b) => b.lastModifiedDate - a.lastModifiedDate);

                                                            // Create an array of options for the Select menu
                                                            const options = backups.slice(0, 25).map((backup, index) => {
                                                                const backupTimestamp = backup.lastModifiedDate;
                                                                const backupDate = new Date(backupTimestamp);
                                                                const backupDateString = backupDate.toLocaleDateString()
                                                                const now = new Date();
                                                                const diffInMs = now.getTime() - backupDate.getTime();
                                                                const diffInMinutes = Math.floor(diffInMs / 1000 / 60);

                                                                let description;
                                                                if (diffInMinutes < 60) {
                                                                    // Less than an hour ago
                                                                    description = `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago | ${backupDateString}`;
                                                                } else if (diffInMinutes < 24 * 60) {
                                                                    // Less than 24 hours ago
                                                                    const diffInHours = Math.floor(diffInMinutes / 60);
                                                                    description = `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago | ${backupDateString}`;
                                                                } else if (diffInMinutes < 30 * 24 * 60) {
                                                                    // Less than 30 days ago
                                                                    const diffInDays = Math.floor(diffInMinutes / (24 * 60));
                                                                    description = `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago | ${backupDateString}`;
                                                                } else {
                                                                    // More than 30 days ago
                                                                    const diffInMonths = Math.floor(diffInMinutes / (30 * 24 * 60));
                                                                    description = `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago | ${backupDateString}`;
                                                                }
                                                                const label = `${index + 1}) ${backup.metadata.name}`;
                                                                return {
                                                                    label: label,
                                                                    description: description,
                                                                    value: backup.backupId,
                                                                    backupTime: description
                                                                };
                                                            });

                                                            const BackupMenu = new EmbedBuilder()
                                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                .setDescription(`
${loading} **Realm Restoration**
${end} Choose Which Backup You Want To Use To Restore Your Realm!
                                        `)
                                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                .setTimestamp()
                                                            const Row = new ActionRowBuilder()
                                                                .addComponents(
                                                                    new StringSelectMenuBuilder()
                                                                        .setCustomId('backup')
                                                                        .setPlaceholder('Realm Backups')
                                                                        .addOptions(options)
                                                                );

                                                            interaction.editReply({ embeds: [BackupMenu], components: [Row] });

                                                            const filter = i => i.customId === 'backup' && i.user.id === interaction.user.id;
                                                            const BackupCollector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
                                                            const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                                            const realmname = Config.get('RealmName') ?? "Unable to fetch name"

                                                            BackupCollector.on('collect', async i => {
                                                                const selectedBackupId = i.values[0];
                                                                const selectedBackupOption = options.find(option => option.value === selectedBackupId);
                                                                const backupTime = selectedBackupOption.backupTime
                                                                const replaceRequest = {
                                                                    method: "put",
                                                                    url: `https://pocket.realms.minecraft.net/worlds/${RealmSelect}/backups?backupId=${selectedBackupId}&clientSupportsRetries=false`,
                                                                    headers: {
                                                                        "Cache-Control": "no-cache",
                                                                        Charset: "utf-8",
                                                                        "Client-Version": "1.17.41",
                                                                        "User-Agent": "MCPE/UWP",
                                                                        "Accept-Language": "en-US",
                                                                        "Accept-Encoding": "gzip, deflate, br",
                                                                        Host: "pocket.realms.minecraft.net",
                                                                        Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                    },
                                                                };
                                                                try {
                                                                    await axios(replaceRequest)
                                                                        .then((response) => {
                                                                            const Backupembed = new EmbedBuilder()
                                                                                .setColor(cgreen)
                                                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                                .setDescription(`
${success} **Realm Restored**
${reply} Realm Has Successfully Been Restored!
${reply} **Backup:** \`${backupTime}\`
${end} **Realm:** \`${realmname}\`
                                                    `)
                                                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                                .setTimestamp()
                                                                            interaction.editReply({ embeds: [Backupembed], components: [] });
                                                                        }).catch((error) => {
                                                                            const Backupembed = new EmbedBuilder()
                                                                                .setColor(cgreen)
                                                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                                .setDescription(`
${success} **Realm Restored**
${reply} Realm Has Successfully Been Restored!
${reply} **Backup:** \`${backupTime}\`
${end} **Realm:** \`${realmname}\`
                                                    `)
                                                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                                .setTimestamp()
                                                                            interaction.editReply({ embeds: [Backupembed], components: [] });
                                                                        });
                                                                } catch (error) {
                                                                    console.log(error)
                                                                }
                                                            });

                                                            BackupCollector.on('end', async collected => {
                                                                if (collected.size === 0) {
                                                                    const Backupembed = new EmbedBuilder()
                                                                        .setColor(cred)
                                                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                        .setDescription(`
${denied} **Usage Error**
${reply} No Backups Were Selected!
${end} Ending Menu.
                                                `)
                                                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                        .setTimestamp()
                                                                    interaction.editReply({ embeds: [Backupembed], components: [] });
                                                                }
                                                            });
                                                        })
                                                }).catch((error) => {
                                                    const Ended = new EmbedBuilder()
                                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                        .setColor(cred)
                                                        .setDescription(`
    ${WARNING} **Notice**
    ${reply} Account Error
    ${end} ${error}
                `)
                                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                        .setTimestamp()
                                                    interaction.editReply({ embeds: [Ended], components: [] })
                                                })
                                        }).catch((error) => {
                                            const Ended = new EmbedBuilder()
                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                .setColor(cred)
                                                .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
        `)
                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                .setTimestamp()
                                            interaction.editReply({ embeds: [Ended], components: [] })
                                        })
                                    RealmCollector.stop()
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
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmBackup')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'slots') {
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmSlots.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmSlots')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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
                                const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                    flow: 'msal',
                                    relyingParty: "http://xboxlive.com",
                                })
                                authflow.getXboxToken()
                                    .then((Xbox) => {
                                        const MainAuth = JSON.parse(
                                            JSON.stringify({
                                                "x-xbl-contract-version": "2",
                                                Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                "Accept-Language": "en-US",
                                                maxRedirects: 1,
                                            })
                                        );
                                        const authflow = new Authflow("", `./Database/BotAccounts/${interaction.guild.id}`, {
                                            flow: 'msal',
                                            relyingParty: "http://xboxlive.com",
                                        })
                                        authflow.getXboxToken()
                                            .then((Xbox) => {
                                                const XboxAuth = JSON.parse(
                                                    JSON.stringify({
                                                        "x-xbl-contract-version": "2",
                                                        Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                        "Accept-Language": "en-US",
                                                        maxRedirects: 1,
                                                    })
                                                );
                                                new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                                    flow: 'msal',
                                                    relyingParty: "https://pocket.realms.minecraft.net/",
                                                })
                                                    .getXboxToken()
                                                    .then(async (PocketRealm) => {
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

*Select Which Realm You Want To Change Slot!*
                        `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                                        const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                                        const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                                        RealmCollector.on('collect', async Realms => {
                                                            const RealmSelect = Realms.values[0];
                                                            if (interaction.user.id !== Realms.user.id) {
                                                                const Embed = new EmbedBuilder()
                                                                    .setColor(corange)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
        `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                Realms.reply({ embeds: [Embed], ephemeral: true })
                                                                return
                                                            }
                                                            interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                                            if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                                                interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                                                RealmCollector.stop();
                                                                return;
                                                            }
                                                            if (RealmSelect === 'AllRealms') {
                                                                const OpenRealmS = new EmbedBuilder()
                                                                    .setColor(cgreen)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${success} **Changed Slots For Realms**

**__Changed Slots For Realms__**

                    `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                const promises = NonEmptySlots.map((slot, i) => {
                                                                    return axios.put(`https://pocket.realms.minecraft.net/worlds/${slot.id}/slot/${RealmSlotVariable}`, {
                                                                        headers: {
                                                                            "Cache-Control": "no-cache",
                                                                            Charset: "utf-8",
                                                                            "Client-Version": "1.17.41",
                                                                            "User-Agent": "MCPE/UWP",
                                                                            "Accept-Language": "en-US",
                                                                            "Accept-Encoding": "gzip, deflate, br",
                                                                            Host: "pocket.realms.minecraft.net",
                                                                            Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                        },
                                                                        timeout: 5000
                                                                    }).then((res) => {
                                                                        OpenRealmS.addFields({
                                                                            name: `${success} Realm Name: ${slot.name}`,
                                                                            value: `${end} \`Successfully Changed To Slot ${RealmSlotVariable}\``
                                                                        });
                                                                    })
                                                                        .catch((error) => {
                                                                            OpenRealmS.addFields({
                                                                                name: `${denied} Realm Name: ${slot.name}`,
                                                                                value: `${end} \`${error.response.data.errorMsg}\``
                                                                            });
                                                                        });
                                                                })

                                                                Promise.all(promises)
                                                                    .then(() => {
                                                                        interaction.editReply({ embeds: [OpenRealmS] });
                                                                        RealmCollector.stop()
                                                                    })
                                                            } else {
                                                                const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                                                var realmname = Config.get('RealmName')
                                                                var getWorldData = {
                                                                    method: "get",
                                                                    url: `https://pocket.realms.minecraft.net/worlds/${RealmSelect}`,
                                                                    headers: {
                                                                        "Cache-Control": "no-cache",
                                                                        Charset: "utf-8",
                                                                        "Client-Version": "1.17.41",
                                                                        "User-Agent": "MCPE/UWP",
                                                                        "Accept-Language": "en-US",
                                                                        "Accept-Encoding": "gzip, deflate, br",
                                                                        Host: "pocket.realms.minecraft.net",
                                                                        Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                    },
                                                                    timeout: 5000
                                                                };
                                                                var close = {
                                                                    method: "put",
                                                                    url: `https://pocket.realms.minecraft.net/worlds/${RealmSelect}/slot/${RealmSlotVariable}`,
                                                                    headers: {
                                                                        "Cache-Control": "no-cache",
                                                                        Charset: "utf-8",
                                                                        "Client-Version": "1.17.41",
                                                                        "User-Agent": "MCPE/UWP",
                                                                        "Accept-Language": "en-US",
                                                                        "Accept-Encoding": "gzip, deflate, br",
                                                                        Host: "pocket.realms.minecraft.net",
                                                                        Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                    },
                                                                    timeout: 5000
                                                                };
                                                                axios(close)
                                                                    .then((res) => {
                                                                        axios(getWorldData)
                                                                            .then((GetWorldData) => {
                                                                                const realmname = GetWorldData.data.name
                                                                                const Loading = new EmbedBuilder()
                                                                                    .setColor(cgreen)
                                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                                    .setDescription(`
${success} **Changed Slots For Realms**
${reply} **Name:** \`${realmname}\`
${end} **Slot:** \`${RealmSlotVariable}\`
                                `)
                                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                                    .setTimestamp()
                                                                                interaction.editReply({ embeds: [Loading], components: [] })
                                                                            })
                                                                    }).catch((error) => {
                                                                        const Loading = new EmbedBuilder()
                                                                            .setColor(cred)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${denied} **Changing Slots Failed**
${reply} **Name:** \`${realmname}\`
${end} **Status:** \`${error.response.data.errorMsg}\`
                            `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        interaction.editReply({ embeds: [Loading], components: [] })
                                                                    })
                                                            }
                                                            RealmCollector.stop()
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

                                                    }).catch((error) => {
                                                        const Ended = new EmbedBuilder()
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setColor(cred)
                                                            .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
            `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [Ended], components: [] })
                                                    })
                                            }).catch((error) => {
                                                const Ended = new EmbedBuilder()
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setColor(cred)
                                                    .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
            `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [Ended], components: [] })
                                            })
                                    }).catch((error) => {
                                        const Ended = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cred)
                                            .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        interaction.editReply({ embeds: [Ended], components: [] })
                                    })
                            }, 1500)
                        } else {
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmSlots')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'invite') {
            const Gamertag = interaction.options.getString('gamertag')
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmInvite.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmInvite')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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
                                const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                    flow: 'msal',
                                    relyingParty: "http://xboxlive.com",
                                })
                                authflow.getXboxToken()
                                    .then((Xbox) => {
                                        const XboxAuth = JSON.parse(
                                            JSON.stringify({
                                                "x-xbl-contract-version": "2",
                                                Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                "Accept-Language": "en-US",
                                                maxRedirects: 1,
                                            })
                                        );
                                        new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                            flow: 'msal',
                                            relyingParty: "https://pocket.realms.minecraft.net/",
                                        })
                                            .getXboxToken()
                                            .then(async (PocketRealm) => {
                                                axios.get(`https://profile.xboxlive.com/users/gt(${(Gamertag)})/profile/settings?settings=GameDisplayPicRaw`, {
                                                    headers: XboxAuth,
                                                    timeout: 5000
                                                })
                                                    .then((res) => {
                                                        const xuid = res?.data?.profileUsers[0]?.id
                                                        const pfp = res?.data?.profileUsers[0]?.settings[0]?.value
                                                        const File = editJsonFile(`./Database/Oauth/${interaction.guild.id}/realms.json`);
                                                        const realms = File.data[interaction.guild.id] || [];
                                                        const NonEmptySlots = [];

                                                        for (let i = 0; i < realms.length; i++) {
                                                            const realmID = realms[i]?.[0];
                                                            const realmName = realms[i]?.[1];

                                                            if (realmName !== `Empty Slot ${i + 1}`) {
                                                                NonEmptySlots.push({ id: realmID, name: realmName });
                                                            }
                                                        }

                                                        const allRealmsOption = {
                                                            label: 'All Realms',
                                                            description: 'Select all realms',
                                                            value: 'AllRealms',
                                                        };

                                                        const realmOptions = [allRealmsOption, ...realms.slice(0, 5).map(([realmId, realmName], index) => ({
                                                            label: `Realm Name: ${realmName}`,
                                                            description: `Realm ID: ${realmId}`,
                                                            value: `${realmId}`,
                                                        }))];

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

*Select Which Realm You Want To Invite a Player to!*
                        `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                                        const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                                        const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                                        RealmCollector.on('collect', async Realms => {
                                                            const RealmSelect = Realms.values[0];
                                                            if (interaction.user.id !== Realms.user.id) {
                                                                const Embed = new EmbedBuilder()
                                                                    .setColor(corange)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
                `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                Realms.reply({ embeds: [Embed], ephemeral: true })
                                                                RealmCollector.stop()
                                                                return
                                                            }
                                                            interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                                            if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                                                interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                                                RealmCollector.stop();
                                                                return;
                                                            }
                                                            if (RealmSelect === 'AllRealms') {
                                                                const OpenRealmS = new EmbedBuilder()
                                                                    .setColor(cgreen)
                                                                    .setThumbnail(pfp)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${success} **Invited Player**
${end} **Username:** \`${Gamertag}\`

**__Invited Player To Realms__**

                    `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                const Invites = new EmbedBuilder()
                                                                    .setColor(cgreen)
                                                                    .setThumbnail(pfp)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${success} **Invited Player**
${end} **Username:** \`${Gamertag}\`

**__Invited Player To Realms__**

                    `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                for (let i = 0; i < 5 && i < NonEmptySlots.length; i++) {
                                                                    const Realm = NonEmptySlots[i]
                                                                    axios.put(`https://pocket.realms.minecraft.net/invites/${Realm.id}/invite/update`, {
                                                                        "invites": {
                                                                            [xuid]: "ADD"
                                                                        }
                                                                    }, {
                                                                        headers: {
                                                                            "Cache-Control": "no-cache",
                                                                            Charset: "utf-8",
                                                                            "Client-Version": "1.17.41",
                                                                            "User-Agent": "MCPE/UWP",
                                                                            "Accept-Language": "en-US",
                                                                            "Accept-Encoding": "gzip, deflate, br",
                                                                            Host: "pocket.realms.minecraft.net",
                                                                            Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                        },
                                                                        timeout: 5000
                                                                    }).then((res) => {
                                                                        OpenRealmS.addFields({
                                                                            name: `${success} Realm Name: ${Realm.name}`,
                                                                            value: `${end} \`Successfully Invited Player\``
                                                                        });
                                                                        Invites.addFields({
                                                                            name: `${success} Realm Name: ${Realm.name}`,
                                                                            value: `${end} \`Successfully Invited Player\``
                                                                        });
                                                                    })
                                                                        .catch((error) => {
                                                                            OpenRealmS.addFields({
                                                                                name: `${denied} Realm Name: ${Realm.name}`,
                                                                                value: `${end} \`${error.response.data.errorMsg}\``
                                                                            });
                                                                            Invites.addFields({
                                                                                name: `${denied} Realm Name: ${Realm.name}`,
                                                                                value: `${end} \`${error.response.data.errorMsg}\``
                                                                            });
                                                                        }).finally(() => {
                                                                            setTimeout(() => {
                                                                                if (i === NonEmptySlots.length - 1) {
                                                                                    interaction.editReply({ embeds: [OpenRealmS] });
                                                                                    const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`)
                                                                                    const CosmosLogs = ConfigEditor.get('Cosmos-Logs')
                                                                                    if (CosmosLogs) {
                                                                                        client.channels
                                                                                            .fetch(CosmosLogs)
                                                                                            .then(async (channel) => await channel.send({ embeds: [Invites] }))
                                                                                            .catch((error) => {
                                                                                                console.error(error);
                                                                                            });
                                                                                    }
                                                                                    RealmCollector.stop()
                                                                                }
                                                                            }, 750)
                                                                        });
                                                                }
                                                            } else {
                                                                const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                                                const CosmosLogs = ConfigEditor.get('Cosmos-Logs')
                                                                const realmname = ConfigEditor.get('RealmName') ?? "Unable to fetch"
                                                                axios.put(`https://pocket.realms.minecraft.net/invites/${RealmSelect}/invite/update`,
                                                                    {
                                                                        "invites": {
                                                                            [xuid]: "ADD"
                                                                        }
                                                                    },
                                                                    {
                                                                        headers: {
                                                                            "Cache-Control": "no-cache",
                                                                            Charset: "utf-8",
                                                                            "Client-Version": "1.17.41",
                                                                            "User-Agent": "MCPE/UWP",
                                                                            "Accept-Language": "en-US",
                                                                            "Accept-Encoding": "gzip, deflate, br",
                                                                            Host: "pocket.realms.minecraft.net",
                                                                            Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                        }
                                                                    },
                                                                )
                                                                    .then((res) => {
                                                                        const SingleRealmOpen = new EmbedBuilder()
                                                                            .setColor(cgreen)
                                                                            .setThumbnail(pfp)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${success} **Invited Player**
${reply} **Username:** \`${Gamertag}\`
${end} **Name:** \`${realmname}\`
                
                                    `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        interaction.editReply({ embeds: [SingleRealmOpen], components: [] })
                                                                        const InviteLig = new EmbedBuilder()
                                                                            .setColor(cgreen)
                                                                            .setThumbnail(pfp)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${success} **Invited Player**
${reply} **Username:** \`${Gamertag}\`
${end} **Name:** \`${realmname}\`
            
                                `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        if (CosmosLogs) {
                                                                            client.channels
                                                                                .fetch(CosmosLogs)
                                                                                .then(async (channel) => await channel.send({ embeds: [InviteLig] }))
                                                                                .catch((error) => {
                                                                                    console.error(error);
                                                                                });
                                                                        }
                                                                        RealmCollector.stop()
                                                                    }).catch((error) => {
                                                                        console.log(error)
                                                                        const SingleRealmOpenFail = new EmbedBuilder()
                                                                            .setColor(cred)
                                                                            .setThumbnail(pfp)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${denied} **Inviting Failed**
${reply} Unable To Invite \`${Gamertag}\`!
${end} **Error:** \`Internal Server Error\`
            
                                `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        interaction.editReply({ embeds: [SingleRealmOpenFail], components: [] })
                                                                        RealmCollector.stop()
                                                                    })
                                                            }
                                                            RealmCollector.stop()
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
                                                    }).catch((error) => {
                                                        const Ended = new EmbedBuilder()
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setColor(cred)
                                                            .setDescription(`
${WARNING} **Notice**
${reply} **Gamertag:** \`${Gamertag}\`
${end} User not found!
                            `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [Ended], components: [] })
                                                    })
                                            }).catch((error) => {
                                                const Ended = new EmbedBuilder()
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setColor(cred)
                                                    .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
            `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [Ended], components: [] })
                                            })
                                    }).catch((error) => {
                                        const Ended = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cred)
                                            .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        interaction.editReply({ embeds: [Ended], components: [] })
                                    })
                            }, 1500)
                        } else {
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmInvite')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'open') {
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmOpen.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmOpen')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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

*Select Which Realm You Want To Open!*
                        `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                RealmCollector.on('collect', async Realms => {
                                    const RealmSelect = Realms.values[0];
                                    if (interaction.user.id !== Realms.user.id) {
                                        const Embed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
`)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        Realms.reply({ embeds: [Embed], ephemeral: true })
                                        RealmCollector.stop()
                                        return
                                    }
                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                    if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                        interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                        RealmCollector.stop();
                                        return;
                                    }
                                    const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                        flow: 'msal',
                                        relyingParty: "http://xboxlive.com",
                                    })
                                    authflow.getXboxToken()
                                        .then((Xbox) => {
                                            const XboxAuth = JSON.parse(
                                                JSON.stringify({
                                                    "x-xbl-contract-version": "2",
                                                    Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                    "Accept-Language": "en-US",
                                                    maxRedirects: 1,
                                                })
                                            );
                                            new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                                flow: 'msal',
                                                relyingParty: "https://pocket.realms.minecraft.net/",
                                            })
                                                .getXboxToken()
                                                .then(async (PocketRealm) => {
                                                    const PocketRealmAuth = JSON.parse(
                                                        JSON.stringify({
                                                            "x-xbl-contract-version": "2",
                                                            Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                            "Accept-Language": "en-US",
                                                            maxRedirects: 1,
                                                        })
                                                    )
                                                    if (RealmSelect === 'AllRealms') {
                                                        const OpenRealmS = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setDescription(`
${success} **Opened Realms**
${end} ${load1}${load2}${load3}

**__Opened Realms__**

                    `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        const promises = NonEmptySlots.map((slot, i) => {
                                                            return axios.put(`https://pocket.realms.minecraft.net/worlds/${Realm.id}/open`, {
                                                                headers: {
                                                                    "Cache-Control": "no-cache",
                                                                    Charset: "utf-8",
                                                                    "Client-Version": "1.17.41",
                                                                    "User-Agent": "MCPE/UWP",
                                                                    "Accept-Language": "en-US",
                                                                    "Accept-Encoding": "gzip, deflate, br",
                                                                    Host: "pocket.realms.minecraft.net",
                                                                    Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                },
                                                                timeout: 5000
                                                            }).then((res) => {
                                                                OpenRealmS.addFields({
                                                                    name: `${success} Realm Name: ${slot.name}`,
                                                                    value: `${end} \`Successfully Opened Realm\``
                                                                });
                                                            }).catch((error) => {
                                                                OpenRealmS.addFields({
                                                                    name: `${denied} Realm Name: ${slot.name}`,
                                                                    value: `${end} \`${error.response.data.errorMsg}\``
                                                                });
                                                            });
                                                        })
                                                        Promise.all(promises)
                                                            .then(() => {
                                                                interaction.editReply({ embeds: [OpenRealmS] });
                                                                RealmCollector.stop()
                                                            })
                                                    } else {
                                                        const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                                        const realmname = Config.get('RealmName') ?? "Unable to fetch"
                                                        var close = {
                                                            method: "put",
                                                            url: `https://pocket.realms.minecraft.net/worlds/${RealmSelect}/open`,
                                                            headers: {
                                                                "Cache-Control": "no-cache",
                                                                Charset: "utf-8",
                                                                "Client-Version": "1.17.41",
                                                                "User-Agent": "MCPE/UWP",
                                                                "Accept-Language": "en-US",
                                                                "Accept-Encoding": "gzip, deflate, br",
                                                                Host: "pocket.realms.minecraft.net",
                                                                Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                            },
                                                            timeout: 5000
                                                        };
                                                        axios(close)
                                                            .then((res) => {
                                                                const SingleRealmOpen = new EmbedBuilder()
                                                                    .setColor(cgreen)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${success} **Opened Realm**
${reply} **Name:** \`${realmname}\`
${end} **Status:** \`Successfully Opened Realm\`
                                `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                interaction.editReply({ embeds: [SingleRealmOpen], components: [] })
                                                                RealmCollector.stop()
                                                            }).catch((error) => {
                                                                const SingleRealmOpenFail = new EmbedBuilder()
                                                                    .setColor(cred)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${denied} **Opening Realm Failed**
${end} **Status:** \`${error.response.data.errorMsg}\`
                            `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                interaction.editReply({ embeds: [SingleRealmOpenFail], components: [] })
                                                                RealmCollector.stop()
                                                            })
                                                    }
                                                }).catch((error) => {
                                                    const Ended = new EmbedBuilder()
                                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                        .setColor(cred)
                                                        .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
            `)
                                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                        .setTimestamp()
                                                    interaction.editReply({ embeds: [Ended], components: [] })
                                                })
                                        }).catch((error) => {
                                            const Ended = new EmbedBuilder()
                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                .setColor(cred)
                                                .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
        `)
                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                .setTimestamp()
                                            interaction.editReply({ embeds: [Ended], components: [] })
                                        })
                                    RealmCollector.stop()
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
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmOpen')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'close') {
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmClose.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmClose')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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

*Select Which Realm You Want To Close!*
                        `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                RealmCollector.on('collect', async Realms => {
                                    const RealmSelect = Realms.values[0];
                                    if (interaction.user.id !== Realms.user.id) {
                                        const Embed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
`)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        Realms.reply({ embeds: [Embed], ephemeral: true })
                                        RealmCollector.stop()
                                        return
                                    }
                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                    if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                        interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                        RealmCollector.stop();
                                        return;
                                    }
                                    const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                        flow: 'msal',
                                        relyingParty: "http://xboxlive.com",
                                    })
                                    authflow.getXboxToken()
                                        .then((Xbox) => {
                                            const XboxAuth = JSON.parse(
                                                JSON.stringify({
                                                    "x-xbl-contract-version": "2",
                                                    Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                    "Accept-Language": "en-US",
                                                    maxRedirects: 1,
                                                })
                                            );
                                            new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                                flow: 'msal',
                                                relyingParty: "https://pocket.realms.minecraft.net/",
                                            })
                                                .getXboxToken()
                                                .then(async (PocketRealm) => {
                                                    const PocketRealmAuth = JSON.parse(
                                                        JSON.stringify({
                                                            "x-xbl-contract-version": "2",
                                                            Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                            "Accept-Language": "en-US",
                                                            maxRedirects: 1,
                                                        })
                                                    )
                                                    if (RealmSelect === 'AllRealms') {
                                                        const OpenRealmS = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setDescription(`
${success} **Closed Realms**
${end} ${load1}${load2}${load3}

**__Closed Realms__**

                    `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        const promises = NonEmptySlots.map((slot, i) => {
                                                            return axios.put(`https://pocket.realms.minecraft.net/worlds/${Realm.id}/close`, {
                                                                headers: {
                                                                    "Cache-Control": "no-cache",
                                                                    Charset: "utf-8",
                                                                    "Client-Version": "1.17.41",
                                                                    "User-Agent": "MCPE/UWP",
                                                                    "Accept-Language": "en-US",
                                                                    "Accept-Encoding": "gzip, deflate, br",
                                                                    Host: "pocket.realms.minecraft.net",
                                                                    Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                },
                                                                timeout: 5000
                                                            }).then((res) => {
                                                                OpenRealmS.addFields({
                                                                    name: `${success} Realm Name: ${slot.name}`,
                                                                    value: `${end} \`Successfully Closed Realm\``
                                                                });
                                                            }).catch((error) => {
                                                                console.log(`Realm: ${slot.name} `, error.response.data.errorMsg);
                                                                OpenRealmS.addFields({
                                                                    name: `${denied} Realm Name: ${slot.name}`,
                                                                    value: `${end} \`${error.response.data.errorMsg}\``
                                                                });
                                                            });
                                                        })
                                                        Promise.all(promises)
                                                            .then(() => {
                                                                interaction.editReply({ embeds: [OpenRealmS] });
                                                                RealmCollector.stop()
                                                            })
                                                    } else {
                                                        const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                                        const realmname = Config.get('RealmName') ?? "Unable to fetch"
                                                        var close = {
                                                            method: "put",
                                                            url: `https://pocket.realms.minecraft.net/worlds/${RealmSelect}/close`,
                                                            headers: {
                                                                "Cache-Control": "no-cache",
                                                                Charset: "utf-8",
                                                                "Client-Version": "1.17.41",
                                                                "User-Agent": "MCPE/UWP",
                                                                "Accept-Language": "en-US",
                                                                "Accept-Encoding": "gzip, deflate, br",
                                                                Host: "pocket.realms.minecraft.net",
                                                                Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                            },
                                                            timeout: 5000
                                                        };
                                                        axios(close)
                                                            .then((res) => {
                                                                const SingleRealmOpen = new EmbedBuilder()
                                                                    .setColor(cgreen)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${success} **Closed Realm**
${reply} **Name:** \`${realmname}\`
${end} **Status:** \`Successfully Closed Realm\`
                                `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                interaction.editReply({ embeds: [SingleRealmOpen], components: [] })
                                                                RealmCollector.stop()
                                                            }).catch((error) => {
                                                                const SingleRealmOpenFail = new EmbedBuilder()
                                                                    .setColor(cred)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${denied} **Closing Realm Failed**
${end} **Status:** \`${error.response.data.errorMsg}\`
                            `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                interaction.editReply({ embeds: [SingleRealmOpenFail], components: [] })
                                                                RealmCollector.stop()
                                                            })
                                                    }
                                                }).catch((error) => {
                                                    const Ended = new EmbedBuilder()
                                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                        .setColor(cred)
                                                        .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
            `)
                                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                        .setTimestamp()
                                                    interaction.editReply({ embeds: [Ended], components: [] })
                                                })
                                        }).catch((error) => {
                                            const Ended = new EmbedBuilder()
                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                .setColor(cred)
                                                .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
        `)
                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                .setTimestamp()
                                            interaction.editReply({ embeds: [Ended], components: [] })
                                        })
                                    RealmCollector.stop()
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
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmOpen')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'rename') {
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmClose.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmRename')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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

*Select Which Realm You Want To Rename!*
                        `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                RealmCollector.on('collect', async Realms => {
                                    const RealmSelect = Realms.values[0];
                                    if (interaction.user.id !== Realms.user.id) {
                                        const Embed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
`)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        Realms.reply({ embeds: [Embed], ephemeral: true })
                                        RealmCollector.stop()
                                        return
                                    }
                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                    if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                        interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                        RealmCollector.stop();
                                        return;
                                    }
                                    new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                        flow: 'msal',
                                        relyingParty: "https://pocket.realms.minecraft.net/",
                                    })
                                        .getXboxToken()
                                        .then(async (PocketRealm) => {
                                            axios.post(`https://pocket.realms.minecraft.net/worlds/${RealmSelect}`,
                                                {
                                                    "name": `${interaction.options.getString('name')}`
                                                },
                                                {
                                                    headers: {
                                                        "Cache-Control": "no-cache",
                                                        Charset: "utf-8",
                                                        "Client-Version": "1.17.41",
                                                        "User-Agent": "MCPE/UWP",
                                                        "Accept-Language": "en-US",
                                                        "Accept-Encoding": "gzip, deflate, br",
                                                        Host: "pocket.realms.minecraft.net",
                                                        Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                    }
                                                }
                                            )
                                                .then((res) => {
                                                    const Rename = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                        .setDescription(`
${success} **Changed Realm Name**
${end} **Name:** \`${interaction.options.getString('name')}\`
        `)
                                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                        .setTimestamp()
                                                    interaction.editReply({ embeds: [Rename], components: [] })
                                                    const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                                    Config.set('RealmName', interaction.options.getString('name'))
                                                    Config.save()
                                                }).catch((error) => {
                                                    console.log(error)
                                                    const SingleRealmOpenFail = new EmbedBuilder()
                                                        .setColor(cred)
                                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                        .setDescription(`
${denied} **Changing Realm Name Failed**
${end} **Status:** \`${error.response.data.errorMsg}\`
    `)
                                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                        .setTimestamp()
                                                    interaction.editReply({ embeds: [SingleRealmOpenFail], components: [] })
                                                })
                                        }).catch((error) => {
                                            const Ended = new EmbedBuilder()
                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                .setColor(cred)
                                                .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
        `)
                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                .setTimestamp()
                                            interaction.editReply({ embeds: [Ended], components: [] })
                                        })
                                    RealmCollector.stop()
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
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmRename')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'permissions') {
            const permission = interaction.options.getString('permissions')
            const gamertag = interaction.options.getString('gamertag')
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmClose.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmPermissions')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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
                                const NonEmptySlots = [];

                                for (let i = 0; i < realms.length; i++) {
                                    const realmID = realms[i]?.[0];
                                    const realmName = realms[i]?.[1];

                                    if (realmName !== `Empty Slot ${i + 1}`) {
                                        NonEmptySlots.push({ id: realmID, name: realmName });
                                    }
                                }

                                const allRealmsOption = {
                                    label: 'All Realms',
                                    description: 'Select all realms',
                                    value: 'AllRealms',
                                };

                                const realmOptions = [allRealmsOption, ...realms.slice(0, 5).map(([realmId, realmName], index) => ({
                                    label: `Realm Name: ${realmName}`,
                                    description: `Realm ID: ${realmId}`,
                                    value: `${realmId}`,
                                }))];

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

*Select Which Realm You Want To Update a Player's Permission!*
                        `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                RealmCollector.on('collect', async Realms => {
                                    const RealmSelect = Realms.values[0];
                                    if (interaction.user.id !== Realms.user.id) {
                                        const Embed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
`)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        Realms.reply({ embeds: [Embed], ephemeral: true })
                                        RealmCollector.stop()
                                        return
                                    }
                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                    if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                        interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                        RealmCollector.stop();
                                        return;
                                    }
                                    if (RealmSelect === 'AllRealms') {
                                        const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                            flow: 'msal',
                                            relyingParty: "http://xboxlive.com",
                                        })
                                        authflow.getXboxToken()
                                            .then((Xbox) => {
                                                const XboxAuth = JSON.parse(
                                                    JSON.stringify({
                                                        "x-xbl-contract-version": "2",
                                                        Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                        "Accept-Language": "en-US",
                                                        maxRedirects: 1,
                                                    })
                                                );
                                                new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                                    flow: 'msal',
                                                    relyingParty: "https://pocket.realms.minecraft.net/",
                                                })
                                                    .getXboxToken()
                                                    .then(async (PocketRealm) => {
                                                        axios.get(`https://profile.xboxlive.com/users/gt(${(gamertag)})/profile/settings?settings=GameDisplayPicRaw`, {
                                                            headers: XboxAuth,
                                                            timeout: 5000
                                                        })
                                                            .then((res) => {
                                                                const xuid = res?.data?.profileUsers[0]?.id
                                                                const pfp = res?.data?.profileUsers[0]?.settings[0]?.value
                                                                const OpenRealmS = new EmbedBuilder()
                                                                    .setColor(cgreen)
                                                                    .setThumbnail(pfp)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${success} **Updated Player Perms**
${end} **Username:** \`${gamertag}\`

**__Updated Perms For Realms__**

    `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                for (let i = 0; i < 5 && i < NonEmptySlots.length; i++) {
                                                                    const Realm = NonEmptySlots[i]

                                                                    axios.put(`https://pocket.realms.minecraft.net/worlds/${Realm.id}/userPermission`,
                                                                        {
                                                                            "permission": `${permission}`,
                                                                            "xuid": `${xuid}`
                                                                        },
                                                                        {
                                                                            headers: {
                                                                                "Cache-Control": "no-cache",
                                                                                Charset: "utf-8",
                                                                                "Client-Version": "1.17.41",
                                                                                "User-Agent": "MCPE/UWP",
                                                                                "Accept-Language": "en-US",
                                                                                "Accept-Encoding": "gzip, deflate, br",
                                                                                Host: "pocket.realms.minecraft.net",
                                                                                Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                            }
                                                                        }
                                                                    )
                                                                        .then((res) => {
                                                                            OpenRealmS.addFields({
                                                                                name: `${success} Realm Name: ${Realm.name}`,
                                                                                value: `${reply} \`Successfully Updated Permission\`\n${end} \`Permissions: ${permission}\``
                                                                            })
                                                                        }).catch((error) => {
                                                                            setTimeout(() => {
                                                                                console.log(`Realm: ${Realm.name} `, error.response.data.errorMsg)
                                                                                OpenRealmS.addFields({
                                                                                    name: `${denied} Realm Name: ${Realm.name}`,
                                                                                    value: `${end} \`${error.response.data.errorMsg}\``
                                                                                })
                                                                            }, 500)
                                                                        }).finally(() => {
                                                                            setTimeout(() => {
                                                                                if (i === NonEmptySlots.length - 1) {
                                                                                    interaction.editReply({ embeds: [OpenRealmS] });
                                                                                }
                                                                            }, 750)
                                                                        });
                                                                }
                                                            }).catch((error) => {
                                                                const embed = new EmbedBuilder()
                                                                    .setColor(corange)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${WARNING} **Notice**
${reply} Is the gamertag correct?
${end} Please verify if that gamerag is correct!
                    `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                interaction.editReply({ embeds: [embed] })
                                                            })
                                                    }).catch((error) => {
                                                        const Ended = new EmbedBuilder()
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setColor(cred)
                                                            .setDescription(`
        ${WARNING} **Notice**
        ${reply} Account Error
        ${end} ${error}
                    `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [Ended], components: [] })
                                                    })
                                            }).catch((error) => {
                                                const Ended = new EmbedBuilder()
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setColor(cred)
                                                    .setDescription(`
${WARNING} **Notice**
${reply} Account Error
${end} ${error}
            `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [Ended], components: [] })
                                            })
                                    } else {
                                        new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                            flow: 'msal',
                                            relyingParty: "https://pocket.realms.minecraft.net/",
                                        })
                                            .getXboxToken()
                                            .then(async (PocketRealm) => {
                                                const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                                    flow: 'msal',
                                                    relyingParty: "http://xboxlive.com",
                                                })
                                                authflow.getXboxToken()
                                                    .then((Xbox) => {
                                                        const XboxAuth = JSON.parse(
                                                            JSON.stringify({
                                                                "x-xbl-contract-version": "2",
                                                                Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                                "Accept-Language": "en-US",
                                                                maxRedirects: 1,
                                                            })
                                                        );
                                                        axios.get(`https://profile.xboxlive.com/users/gt(${(gamertag)})/profile/settings?settings=GameDisplayPicRaw`, {
                                                            headers: XboxAuth,
                                                            timeout: 5000
                                                        })
                                                            .then((res) => {
                                                                const xuid = res?.data?.profileUsers[0]?.id
                                                                const pfp = res?.data?.profileUsers[0]?.settings[0]?.value
                                                                var getWorldData = {
                                                                    method: "get",
                                                                    url: `https://pocket.realms.minecraft.net/worlds/${RealmSelect}`,
                                                                    headers: {
                                                                        "Cache-Control": "no-cache",
                                                                        Charset: "utf-8",
                                                                        "Client-Version": "1.17.41",
                                                                        "User-Agent": "MCPE/UWP",
                                                                        "Accept-Language": "en-US",
                                                                        "Accept-Encoding": "gzip, deflate, br",
                                                                        Host: "pocket.realms.minecraft.net",
                                                                        Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                    },
                                                                    timeout: 5000
                                                                };

                                                                axios.put(`https://pocket.realms.minecraft.net/worlds/${RealmSelect}/userPermission`,
                                                                    {
                                                                        "permission": `${permission}`,
                                                                        "xuid": `${xuid}`
                                                                    },
                                                                    {
                                                                        headers: {
                                                                            "Cache-Control": "no-cache",
                                                                            Charset: "utf-8",
                                                                            "Client-Version": "1.17.41",
                                                                            "User-Agent": "MCPE/UWP",
                                                                            "Accept-Language": "en-US",
                                                                            "Accept-Encoding": "gzip, deflate, br",
                                                                            Host: "pocket.realms.minecraft.net",
                                                                            Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                        }
                                                                    }
                                                                )
                                                                    .then((res) => {
                                                                        axios(getWorldData)
                                                                            .then((GetWorldData) => {
                                                                                const realmname = GetWorldData.data.name
                                                                                const SingleRealmOpen = new EmbedBuilder()
                                                                                    .setColor(cgreen)
                                                                                    .setThumbnail(pfp)
                                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                                    .setDescription(`
${success} **Permissions Updated**
${reply} **Name:** \`${gamertag}\`
${end} **Realm:** \`${realmname}\`

**__ Permissions __**
${end} **Permission:** \`${permission}\`

                                    `)
                                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                                    .setTimestamp()
                                                                                interaction.editReply({ embeds: [SingleRealmOpen], components: [] })
                                                                            })
                                                                    }).catch((error) => {
                                                                        const SingleRealmOpenFail = new EmbedBuilder()
                                                                            .setColor(cred)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${denied} **Changing Permission Failed**
${end} **Status:** \`${error.response.data.errorMsg}\`
            `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        interaction.editReply({ embeds: [SingleRealmOpenFail], components: [] })
                                                                    })
                                                            }).catch((error) => {
                                                                const embed = new EmbedBuilder()
                                                                    .setColor(corange)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${WARNING} **Notice**
${reply} Is the gamertag correct?
${end} Please verify if that gamertag is correct!
                    `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                interaction.editReply({ embeds: [embed] })
                                                            })
                                                    }).catch((error) => {
                                                        console.log(error)
                                                        const embed = new EmbedBuilder()
                                                            .setColor(corange)
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setDescription(`
${WARNING} **Notice**
${reply} Auth Error!
${end} Please relink your Main Account!
            `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [embed] })
                                                    })
                                            }).catch((error) => {
                                                const embed = new EmbedBuilder()
                                                    .setColor(corange)
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setDescription(`
${WARNING} **Notice**
${reply} Auth Error!
${end} Please relink your Bot Account!
    `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [embed] })
                                            })
                                    }
                                    RealmCollector.stop()
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
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmPermissions')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'code') {
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmClose.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmCode')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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
                                const NonEmptySlots = [];

                                for (let i = 0; i < realms.length; i++) {
                                    const realmID = realms[i]?.[0];
                                    const realmName = realms[i]?.[1];

                                    if (realmName !== `Empty Slot ${i + 1}`) {
                                        NonEmptySlots.push({ id: realmID, name: realmName });
                                    }
                                }

                                const allRealmsOption = {
                                    label: 'All Realms',
                                    description: 'Select all realms',
                                    value: 'AllRealms',
                                };

                                const realmOptions = [allRealmsOption, ...realms.slice(0, 5).map(([realmId, realmName], index) => ({
                                    label: `Realm Name: ${realmName}`,
                                    description: `Realm ID: ${realmId}`,
                                    value: `${realmId}`,
                                }))];

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

*Select Which Realm You Want To Fetch Realm Codes!*
                        `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                RealmCollector.on('collect', async Realms => {
                                    const RealmSelect = Realms.values[0];
                                    if (interaction.user.id !== Realms.user.id) {
                                        const Embed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
`)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        Realms.reply({ embeds: [Embed], ephemeral: true })
                                        RealmCollector.stop()
                                        return
                                    }
                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                    if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                        interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                        RealmCollector.stop();
                                        return;
                                    }
                                    if (RealmSelect === 'AllRealms') {
                                        new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                            flow: 'msal',
                                            relyingParty: "https://pocket.realms.minecraft.net/",
                                        })
                                            .getXboxToken()
                                            .then(async (PocketRealm) => {
                                                const OpenRealmS = new EmbedBuilder()
                                                    .setColor(cgreen)
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setDescription(`
${success} **Fetched Realm Codes**
${end} ${load1}${load2}${load3}

**__Realm Codes__**

`)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                for (let i = 0; i < 5 && i < NonEmptySlots.length; i++) {
                                                    const Realm = NonEmptySlots[i]

                                                    var close = {
                                                        method: "get",
                                                        url: `https://pocket.realms.minecraft.net/links/v1?worldId=${Realm.id}`,
                                                        headers: {
                                                            "Cache-Control": "no-cache",
                                                            Charset: "utf-8",
                                                            "Client-Version": "1.17.41",
                                                            "User-Agent": "MCPE/UWP",
                                                            "Accept-Language": "en-US",
                                                            "Accept-Encoding": "gzip, deflate, br",
                                                            Host: "pocket.realms.minecraft.net",
                                                            Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                        },
                                                        timeout: 5000
                                                    };
                                                    axios(close)
                                                        .then((res) => {
                                                            OpenRealmS.addFields({
                                                                name: `${success} Realm Name: ${Realm.name}`,
                                                                value: `
${reply} \`Realm Code:\` ${res.data[0].linkId}
${end} \`Realm Url:\` ${res.data[0].url}`
                                                            })
                                                        }).catch((error) => {
                                                            setTimeout(() => {
                                                                console.log(`Realm: ${Realm.name} `, error.response.data.errorMsg)
                                                                OpenRealmS.addFields({
                                                                    name: `${denied} Realm Name: ${Realm.name}`,
                                                                    value: `${end} \`${error.response.data.errorMsg}\``
                                                                })
                                                            }, 500)
                                                        }).finally(() => {
                                                            setTimeout(() => {
                                                                if (i === NonEmptySlots.length - 1) {
                                                                    interaction.editReply({ embeds: [OpenRealmS] });
                                                                }
                                                            }, 500)
                                                        });
                                                }
                                            })
                                    } else {
                                        const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                        const realmname = Config.get('RealmName')
                                        new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                            flow: 'msal',
                                            relyingParty: "https://pocket.realms.minecraft.net/",
                                        })
                                            .getXboxToken()
                                            .then(async (PocketRealm) => {
                                                var close = {
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
                                                        Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                    },
                                                    timeout: 5000
                                                };
                                                axios(close)
                                                    .then((res) => {
                                                        const SingleRealmOpen = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setDescription(`
${success} **Fetched Realm Code**
${end} **Name:** \`${realmname}\`

**__ Realm Code __**
${reply} \`Realm Code:\` ${res.data[0].linkId}
${end} \`Realm Url:\` ${res.data[0].url}
        `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [SingleRealmOpen], components: [] })
                                                    }).catch((error) => {
                                                        const SingleRealmOpenFail = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setDescription(`
${denied} **Fetching Realm Code Failed**
${reply} **Name:** \`${realmname}\`
${end} **Status:** \`${error.response.data.errorMsg}\`
    `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [SingleRealmOpenFail], components: [] })
                                                    })
                                            })
                                    }
                                    RealmCollector.stop()
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
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmCode')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'change-code') {
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmClose.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmChangeCode')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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
                                const NonEmptySlots = [];

                                for (let i = 0; i < realms.length; i++) {
                                    const realmID = realms[i]?.[0];
                                    const realmName = realms[i]?.[1];

                                    if (realmName !== `Empty Slot ${i + 1}`) {
                                        NonEmptySlots.push({ id: realmID, name: realmName });
                                    }
                                }

                                const allRealmsOption = {
                                    label: 'All Realms',
                                    description: 'Select all realms',
                                    value: 'AllRealms',
                                };

                                const realmOptions = [allRealmsOption, ...realms.slice(0, 5).map(([realmId, realmName], index) => ({
                                    label: `Realm Name: ${realmName}`,
                                    description: `Realm ID: ${realmId}`,
                                    value: `${realmId}`,
                                }))];

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

*Select Which Realm You Want To Change Realm Codes!*
                        `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                RealmCollector.on('collect', async Realms => {
                                    const RealmSelect = Realms.values[0];
                                    if (interaction.user.id !== Realms.user.id) {
                                        const Embed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
`)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        Realms.reply({ embeds: [Embed], ephemeral: true })
                                        RealmCollector.stop()
                                        return
                                    }
                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                    if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                        interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                        RealmCollector.stop();
                                        return;
                                    }
                                    if (RealmSelect === 'AllRealms') {
                                        const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                            flow: 'msal',
                                            relyingParty: "http://xboxlive.com",
                                        })
                                        const OpenRealmS = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${success} **Changed Realm Codes**
${end} ${load1}${load2}${load3}

**__Updated Realm Codes__**

                    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        for (let i = 0; i < 5 && i < NonEmptySlots.length; i++) {
                                            const Realm = NonEmptySlots[i]

                                            const api = RealmAPI.from(authflow, 'bedrock')
                                            api.refreshRealmInvite(Realm.id).then((res) => {
                                                OpenRealmS.addFields({
                                                    name: `${success} Realm Name: ${Realm.name}`,
                                                    value: `
${reply} \`Realm Code:\` ${res.inviteLink}
${end} \`Time Creation:\` <t:${Math.round(res.createdOn / 1000)}:R>`
                                                })
                                            }).catch((error) => {
                                                setTimeout(() => {
                                                    console.log(`Realm: ${Realm.name} `, error)
                                                    OpenRealmS.addFields({
                                                        name: `${denied} Realm Name: ${Realm.name}`,
                                                        value: `${end} \`${error}\``
                                                    })
                                                }, 500)
                                            }).finally(() => {
                                                setTimeout(() => {
                                                    if (i === NonEmptySlots.length - 1) {
                                                        interaction.editReply({ embeds: [OpenRealmS] });
                                                    }
                                                }, 500)
                                            });
                                        }
                                    } else {
                                        new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                            flow: 'msal',
                                            relyingParty: "https://pocket.realms.minecraft.net/",
                                        })
                                            .getXboxToken()
                                            .then(async (PocketRealm) => {
                                                var getWorldData = {
                                                    method: "get",
                                                    url: `https://pocket.realms.minecraft.net/worlds/${RealmSelect}`,
                                                    headers: {
                                                        "Cache-Control": "no-cache",
                                                        Charset: "utf-8",
                                                        "Client-Version": "1.17.41",
                                                        "User-Agent": "MCPE/UWP",
                                                        "Accept-Language": "en-US",
                                                        "Accept-Encoding": "gzip, deflate, br",
                                                        Host: "pocket.realms.minecraft.net",
                                                        Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                    },
                                                    timeout: 5000
                                                };
                                                const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                                    flow: 'msal',
                                                    relyingParty: "http://xboxlive.com",
                                                })
                                                const api = RealmAPI.from(authflow, 'bedrock')
                                                api.refreshRealmInvite(RealmSelect).then((res) => {
                                                    axios(getWorldData)
                                                        .then((GetWorldData) => {
                                                            const realmname = GetWorldData.data.name
                                                            const SingleRealmOpen = new EmbedBuilder()
                                                                .setColor(cgreen)
                                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                .setDescription(`
${success} **Fetched Realm Code**
${end} **Name:** \`${realmname}\`

**__ Realm Code __**
${reply} \`Realm Code:\` ${res.inviteLink}
${end} \`Time Creation:\` <t:${Math.round(res.createdOn / 1000)}:R>
                                `)
                                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                .setTimestamp()
                                                            interaction.editReply({ embeds: [SingleRealmOpen], components: [] })
                                                        })
                                                }).catch((error) => {
                                                    const SingleRealmOpenFail = new EmbedBuilder()
                                                        .setColor(cred)
                                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                        .setDescription(`
${denied} **Fetching Realm Code Failed**
${reply} **Name:** \`${realmname}\`
${end} **Status:** \`${error.response.data.errorMsg}\`
                            `)
                                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                        .setTimestamp()
                                                    interaction.editReply({ embeds: [SingleRealmOpenFail], components: [] })
                                                })
                                            })
                                    }
                                    RealmCollector.stop()
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
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmChangeCode')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'players') {
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmClose.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmPlayers')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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

*Select Which Realm You Want To View Online Players!*
                        `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                RealmCollector.on('collect', async Realms => {
                                    const RealmSelect = Realms.values[0];
                                    if (interaction.user.id !== Realms.user.id) {
                                        const Embed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
`)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        Realms.reply({ embeds: [Embed], ephemeral: true })
                                        RealmCollector.stop()
                                        return
                                    }
                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                    if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                        interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                        RealmCollector.stop();
                                        return;
                                    }
                                    new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                        flow: 'msal',
                                        relyingParty: "https://pocket.realms.minecraft.net/",
                                    })
                                        .getXboxToken()
                                        .then(async (PocketRealm) => {
                                            var getWorldData = {
                                                method: "get",
                                                url: `https://pocket.realms.minecraft.net/worlds/${RealmSelect}`,
                                                headers: {
                                                    "Cache-Control": "no-cache",
                                                    Charset: "utf-8",
                                                    "Client-Version": "1.17.41",
                                                    "User-Agent": "MCPE/UWP",
                                                    "Accept-Language": "en-US",
                                                    "Accept-Encoding": "gzip, deflate, br",
                                                    Host: "pocket.realms.minecraft.net",
                                                    Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                },
                                            }
                                            var joinrequest = {
                                                method: "get",
                                                url: `https://pocket.realms.minecraft.net/activities/live/players`,
                                                headers: {
                                                    "Cache-Control": "no-cache",
                                                    Charset: "utf-8",
                                                    "Client-Version": "1.17.41",
                                                    "User-Agent": "MCPE/UWP",
                                                    "Accept-Language": "en-US",
                                                    "Accept-Encoding": "gzip, deflate, br",
                                                    Host: "pocket.realms.minecraft.net",
                                                    Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                },
                                            };
                                            try {
                                                axios(joinrequest)
                                                    .then(function (response) {
                                                        axios(getWorldData)
                                                            .then((GetWorldData) => {
                                                                const realmname = GetWorldData.data.name;
                                                                const deviceDB = editJsonFile('./Database/PlayersDB/DevicesDB.json');
                                                                const servers = response.data.servers;
                                                                let realmPlayers = null;

                                                                for (let i = 0; i < servers.length; i++) {
                                                                    const server = servers[i];
                                                                    if (server.id == RealmSelect) {
                                                                        realmPlayers = server.players;
                                                                        break;
                                                                    }
                                                                }

                                                                if (realmPlayers) {
                                                                    const embed = new EmbedBuilder()
                                                                        .setColor(cgreen)

                                                                    let description = '';
                                                                    description += `${success} **Current Playerlist** : (\`${realmPlayers.length}/11\`)\n`
                                                                    description += `${end} **Realm:** \`${realmname}\`\n\n`

                                                                    for (let i = 0; i < realmPlayers.length; i++) {
                                                                        const player = realmPlayers[i];
                                                                        const uuid = player.uuid;
                                                                        const perms = player.permission;

                                                                        const storedPlayer = deviceDB.get(uuid) || {};
                                                                        const storedDevice = storedPlayer.device || 'Unable to fetch';
                                                                        const storedName = storedPlayer.name || 'Unable to fetch';

                                                                        description += `**(${i + 1})** ${storedName} - ${storedDevice}\n`;
                                                                        description += `${end} Permission: \`${perms}\`\n`;
                                                                    }

                                                                    embed.setDescription(description);

                                                                    interaction.editReply({ embeds: [embed] });
                                                                } else {
                                                                    const embed = new EmbedBuilder()
                                                                        .setColor(cred)
                                                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                        .setDescription(`
${WARNING} **Notice**
${end} It seems this realm is empty...
                                                                    `)
                                                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                        .setTimestamp();

                                                                    interaction.editReply({ embeds: [embed] });
                                                                }
                                                            });
                                                    })
                                                    .catch((error) => {
                                                        console.log(error)
                                                        const embed = new EmbedBuilder()
                                                            .setColor(corange)
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setDescription(`
${WARNING} **Notice**
${reply} An Error Has Occurred!
${end} Please Retry The Command Later.
                                                `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [embed] })
                                                            .catch(console.error);
                                                    });
                                            } catch (error) {
                                                console.log(error)
                                            }
                                        })
                                    RealmCollector.stop()
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
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmPlayers')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'recents') {
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmClose.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmRecents')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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

*Select Which Realm You Want To View Recent Players!*
                        `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                RealmCollector.on('collect', async Realms => {
                                    const RealmSelect = Realms.values[0];
                                    if (interaction.user.id !== Realms.user.id) {
                                        const Embed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
`)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        Realms.reply({ embeds: [Embed], ephemeral: true })
                                        RealmCollector.stop()
                                        return
                                    }
                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                    if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                        interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                        RealmCollector.stop();
                                        return;
                                    }
                                    const data = JSON.parse(fs.readFileSync(`./Database/realm/${interaction.guild.id}/${RealmSelect}/recents.json`));

                                    let playerData = [];
                                    for (const playerId in data) {
                                        const player = data[playerId];
                                        const timestamp = player.time;
                                        playerData.push({ player, timestamp });
                                    }

                                    playerData.sort((a, b) => b.timestamp - a.timestamp);

                                    if (playerData.length === 0) {
                                        const Embed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${WARNING} **Notice**
${end} This Realm Has No Recent Players!
                                        `)
                                            .setFooter({ text: `Requested By ${Realms.user.tag}`, iconURL: Realms.user.displayAvatarURL() })
                                            .setTimestamp()
                                        interaction.editReply({ embeds: [Embed] });
                                        return
                                    }

                                    const Embed = new EmbedBuilder()
                                        .setColor(cgreen)
                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                        .setFooter({ text: `Requested By ${Realms.user.tag}`, iconURL: Realms.user.displayAvatarURL() })
                                        .setTimestamp()

                                    let i = 0;
                                    let gameInfo = '';
                                    for (let i = 0; i < 15; i++) {
                                        const player = playerData[i].player;
                                        const username = player.username;
                                        const device = player.device;
                                        const timestamp = playerData[i].timestamp;

                                        gameInfo += `**(${i + 1})** \`${username}\` - ${device}\n${end}<t:${timestamp}:f> (**<t:${timestamp}:R>**)\n`;
                                    }

                                    if (data.length < 15) {

                                        gameInfo += '\n';
                                    }

                                    let Message = `
${success} **Fetch Recent Players**

**__ Recent Players __**
                                                `
                                    Embed.setDescription(Message + gameInfo);

                                    interaction.editReply({ embeds: [Embed] });
                                    RealmCollector.stop()
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
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmRecents')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'lastseen') {
            const gamertag = interaction.options.getString('gamertag')
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmClose.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmLastseen')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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
                                if (!playerMap.has(gamertag)) {
                                    const Embed = new EmbedBuilder()
                                        .setColor(cred)
                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                        .setDescription(`
${denied} **User Not Found**
${reply} **Username:** \`${gamertag}\`
${end} That user has not been seen by Cosmos yet!
        `)
                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                        .setTimestamp()
                                    interaction.editReply({ embeds: [Embed] })
                                } else {
                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)] })
                                    setTimeout(() => {
                                        if (playerMap.has(gamertag)) {
                                            const { timestamp, realm, device, username } = playerMap.get(gamertag);
                                            const Embed = new EmbedBuilder()
                                                .setColor(cgreen)
                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                .setDescription(`
${success} **User Found**
${reply} **Username:** \`${username}\`
${end} **Device:** \`${device}\`

**__ Last Seen __**
${reply} **Realm:** \`${realm}\`
${end} **Time Ago:** <t:${timestamp}:f> (**<t:${timestamp}:R>**)
                `)
                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                .setTimestamp()
                                            interaction.editReply({ embeds: [Embed] })
                                        }
                                    }, 1000)
                                }
                            }, 1500)
                        } else {
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmLastseen')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'kick') {
            const Gamertag = interaction.options.getString('gamertag')
            interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
            setTimeout(() => {
                fs.readFile(
                    `./Database/realm/${interaction.guild.id}/perms.json`,
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dataperm = JSON.parse(data);
                        const manageConfigRoles = dataperm.RealmInvite.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'RealmKick')], components: [] })
                            return;
                        }
                        if (manageConfigRoles.some(roleId => interaction.member.roles.cache.has(roleId))) {
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
                                const authflow = new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                    flow: 'msal',
                                    relyingParty: "http://xboxlive.com",
                                })
                                authflow.getXboxToken()
                                    .then((Xbox) => {
                                        const XboxAuth = JSON.parse(
                                            JSON.stringify({
                                                "x-xbl-contract-version": "2",
                                                Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                                                "Accept-Language": "en-US",
                                                maxRedirects: 1,
                                            })
                                        );
                                        new Authflow("", `./Database/Oauth/${interaction.guild.id}`, {
                                            flow: 'msal',
                                            relyingParty: "https://pocket.realms.minecraft.net/",
                                        })
                                            .getXboxToken()
                                            .then(async (PocketRealm) => {
                                                axios.get(`https://profile.xboxlive.com/users/gt(${(Gamertag)})/profile/settings?settings=GameDisplayPicRaw`, {
                                                    headers: XboxAuth,
                                                    timeout: 5000
                                                })
                                                    .then((res) => {
                                                        const xuid = res?.data?.profileUsers[0]?.id
                                                        const pfp = res?.data?.profileUsers[0]?.settings[0]?.value
                                                        const File = editJsonFile(`./Database/Oauth/${interaction.guild.id}/realms.json`);
                                                        const realms = File.data[interaction.guild.id] || [];
                                                        const NonEmptySlots = [];

                                                        for (let i = 0; i < realms.length; i++) {
                                                            const realmID = realms[i]?.[0];
                                                            const realmName = realms[i]?.[1];

                                                            if (realmName !== `Empty Slot ${i + 1}`) {
                                                                NonEmptySlots.push({ id: realmID, name: realmName });
                                                            }
                                                        }

                                                        const allRealmsOption = {
                                                            label: 'All Realms',
                                                            description: 'Select all realms',
                                                            value: 'AllRealms',
                                                        };

                                                        const realmOptions = [allRealmsOption, ...realms.slice(0, 5).map(([realmId, realmName], index) => ({
                                                            label: `Realm Name: ${realmName}`,
                                                            description: `Realm ID: ${realmId}`,
                                                            value: `${realmId}`,
                                                        }))];

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

*Select Which Realm You Want To Kick a player from!*
                        `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                                                        const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                                                        const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                                                        RealmCollector.on('collect', async Realms => {
                                                            const RealmSelect = Realms.values[0];
                                                            if (interaction.user.id !== Realms.user.id) {
                                                                const Embed = new EmbedBuilder()
                                                                    .setColor(corange)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${WARNING} **Notice**
${end} This is not your command!
                `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                Realms.reply({ embeds: [Embed], ephemeral: true })
                                                                RealmCollector.stop()
                                                                return
                                                            }
                                                            interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] })
                                                            if (['Empty Slot 1', 'Empty Slot 2', 'Empty Slot 3', 'Empty Slot 4', 'Empty Slot 5'].includes(RealmSelect)) {
                                                                interaction.editReply({ embeds: [createMissingSlot(interaction.guild, interaction.user)], components: [] });
                                                                RealmCollector.stop();
                                                                return;
                                                            }
                                                            if (RealmSelect === 'AllRealms') {
                                                                const OpenRealmS = new EmbedBuilder()
                                                                    .setColor(cgreen)
                                                                    .setThumbnail(pfp)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${success} **Kicked Player**
${end} **Username:** \`${Gamertag}\`

**__IKicked Player From Realms__**

                    `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                const Kicked = new EmbedBuilder()
                                                                    .setColor(cgreen)
                                                                    .setThumbnail(pfp)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${success} **Kicked Player**
${end} **Username:** \`${Gamertag}\`

**__IKicked Player From Realms__**

                    `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                const promises = NonEmptySlots.map((slot, i) => {
                                                                    return axios.put(`https://pocket.realms.minecraft.net/invites/${slot.id}/invite/update`, {
                                                                        "invites": {
                                                                            [xuid]: "REMOVE"
                                                                        }
                                                                    }, {
                                                                        headers: {
                                                                            "Cache-Control": "no-cache",
                                                                            Charset: "utf-8",
                                                                            "Client-Version": "1.17.41",
                                                                            "User-Agent": "MCPE/UWP",
                                                                            "Accept-Language": "en-US",
                                                                            "Accept-Encoding": "gzip, deflate, br",
                                                                            Host: "pocket.realms.minecraft.net",
                                                                            Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                        },
                                                                        timeout: 5000
                                                                    }).then((res) => {
                                                                        OpenRealmS.addFields({
                                                                            name: `${success} Realm Name: ${slot.name}`,
                                                                            value: `${end} \`Successfully Kicked Player\``
                                                                        });
                                                                        Kicked.addFields({
                                                                            name: `${success} Realm Name: ${slot.name}`,
                                                                            value: `${end} \`Successfully Kicked Player\``
                                                                        });
                                                                    })
                                                                        .catch((error) => {
                                                                            OpenRealmS.addFields({
                                                                                name: `${denied} Realm Name: ${slot.name}`,
                                                                                value: `${end} \`${error.response.data.errorMsg}\``
                                                                            });
                                                                            Kicked.addFields({
                                                                                name: `${denied} Realm Name: ${slot.name}`,
                                                                                value: `${end} \`${error.response.data.errorMsg}\``
                                                                            });
                                                                        });
                                                                })

                                                                Promise.all(promises)
                                                                    .then(() => {
                                                                        if (i === NonEmptySlots.length - 1) {
                                                                            interaction.editReply({ embeds: [OpenRealmS] });
                                                                            const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`)
                                                                            const KickedChannel = ConfigEditor.get('KicksLogs')
                                                                            if (KickedChannel) {
                                                                                client.channels
                                                                                    .fetch(KickedChannel)
                                                                                    .then(async (channel) => await channel.send({ embeds: [Kicked] }))
                                                                                    .catch((error) => {
                                                                                        console.error(error);
                                                                                    });
                                                                            }
                                                                            RealmCollector.stop()
                                                                        }
                                                                    })
                                                            } else {
                                                                const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                                                const realmname = Config.get('RealmName') ?? "Unable to fetch"
                                                                const KickedChannel = Config.get('KicksLogs') ?? "Unable to fetch"
                                                                axios.put(`https://pocket.realms.minecraft.net/invites/${RealmSelect}/invite/update`,
                                                                    {
                                                                        "invites": {
                                                                            [xuid]: "REMOVE"
                                                                        }
                                                                    },
                                                                    {
                                                                        headers: {
                                                                            "Cache-Control": "no-cache",
                                                                            Charset: "utf-8",
                                                                            "Client-Version": "1.17.41",
                                                                            "User-Agent": "MCPE/UWP",
                                                                            "Accept-Language": "en-US",
                                                                            "Accept-Encoding": "gzip, deflate, br",
                                                                            Host: "pocket.realms.minecraft.net",
                                                                            Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                                                                        }
                                                                    },
                                                                )
                                                                    .then((res) => {
                                                                        const Kicked = new EmbedBuilder()
                                                                            .setColor(cgreen)
                                                                            .setThumbnail(pfp)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${success} **Kicked Player**
${reply} **Username:** \`${Gamertag}\`
${end} **Realm:** \`${realmname}\`
                
                                    `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        interaction.editReply({ embeds: [Kicked], components: [] })
                                                                        const KickedLogged = new EmbedBuilder()
                                                                            .setColor(cgreen)
                                                                            .setThumbnail(pfp)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${success} **Player Kicked**
${reply} **Username:** \`${Gamertag}\`
${end} **Realm:** \`${realmname}\`
            
                                `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        if (KickedChannel) {
                                                                            client.channels
                                                                                .fetch(KickedChannel)
                                                                                .then(async (channel) => await channel.send({ embeds: [KickedLogged] }))
                                                                                .catch((error) => {
                                                                                    console.error(error);
                                                                                });
                                                                        }
                                                                        RealmCollector.stop()
                                                                    }).catch((error) => {
                                                                        console.log("Failed Kicked Error:", error.data)
                                                                        const SingleRealmOpenFail = new EmbedBuilder()
                                                                            .setColor(cred)
                                                                            .setThumbnail(pfp)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${denied} **Kicking Failed**
${reply} Unable To Invite \`${Gamertag}\`!
${end} **Error:** \`Internal Server Error\`
            
                                `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        interaction.editReply({ embeds: [SingleRealmOpenFail], components: [] })
                                                                        RealmCollector.stop()
                                                                    })
                                                            }
                                                            RealmCollector.stop()
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
                                                    }).catch((error) => {
                                                        const Ended = new EmbedBuilder()
                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                            .setColor(cred)
                                                            .setDescription(`
${WARNING} **Notice**
${reply} **Gamertag:** \`${Gamertag}\`
${end} User not found!
                            `)
                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                            .setTimestamp()
                                                        interaction.editReply({ embeds: [Ended], components: [] })
                                                    })
                                            })
                                    })
                            }, 1500)
                        } else {
                            const rolesMention = manageConfigRoles.map(roleId => `<@&${roleId}>`).join(", ");
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'RealmKick')] })
                        }
                    })
            }, 1000)
        }
    }
}