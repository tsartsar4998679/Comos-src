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
    createSearchingUsername,
    createUserNotFound
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
        .setName('unwhitelist')
        .setDescription('Unwhitelist a player from Cosmos Automod')
        .addSubcommand(subcommand =>
            subcommand.setName('gamertag')
                .setDescription('Gamertag to Unwhitelist')
                .addStringOption(option => 
                    option.setName('gamertag')
                    .setDescription('Gamertag to Unwhitelist')
                    .setRequired(true))),

    async execute(interaction) {
        const username = interaction.options.getString('username')
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
                    try {
                        var manageConfigRoles = dataperm.WhitelistManager.map(id => id)
                    } catch (error) {console.log(error)}
                    if (manageConfigRoles.length === 0) {
                        interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'WhitelistManager')], components: [] })
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

                            while (realmOptions.length < 6) {
                                realmOptions.push({
                                    label: `Empty Slot ${realmOptions.length}`,
                                    description: `Empty Slot ${realmOptions.length}`,
                                    value: `Empty Slot ${realmOptions.length}`,
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
            
*Select Which Realm You Want To Unwhitelist!*
                    `)
                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                .setTimestamp()
                            interaction.editReply({ embeds: [FirstLoad1], components: [RealmMenu] })

                            const RealmFilter = Realms => Realms.customId === 'realmselection' && Realms.user.id === interaction.user.id;
                            const RealmCollector = interaction.channel.createMessageComponentCollector({ RealmFilter, time: 120000 });

                            RealmCollector.on('collect', async Realms => {
                                const RealmSelect = Realms.values[0];
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
                                                axios.get(`https://profile.xboxlive.com/users/gt(${(username)})/profile/settings?settings=GameDisplayPicRaw`, {
                                                    headers: XboxAuth,
                                                    timeout: 5000
                                                })
                                                    .then((res) => {
                                                        const xuid = res?.data?.profileUsers[0]?.id
                                                        const pfp = res?.data?.profileUsers[0]?.settings[0]?.value
                                                        const Config = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                                        let realmname = Config.get('RealmName')
                                                        if (RealmSelect === 'AllRealms') {
                                                            const EmbedUpdate = new EmbedBuilder()
                                                                .setColor(cgreen)
                                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                .setDescription(`
${success} **Unwhitelisted**
${end} **Username:** \`${username}\`
        
**__ Realms Updated __**
                                `)
                                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                .setTimestamp();
                                                            const updatePromises = NonEmptySlots.slice(0, 5).map(async (Realm) => {
                                                                if (!fs.existsSync(`./Database/realm/${interaction.guild.id}/${Realm.id}/whitelist.json`)) {
                                                                    EmbedUpdate.addFields({
                                                                        name: `${denied} Realm Name: ${Realm.name}`,
                                                                        value: `${end} \`Cannot Unwhitelist User\``
                                                                    })
                                                                    return
                                                                }
                                                                const data = fs.readFileSync(
                                                                    `./Database/realm/${interaction.guild.id}/${Realm.id}/whitelist.json`
                                                                );
                                                                if (!data.includes(xuid)) {
                                                                    EmbedUpdate.addFields({
                                                                        name: `${WARNING} Realm Name: ${Realm.name}`,
                                                                        value: `${end} \`Not Whitelisted\``
                                                                    })
                                                                    return
                                                                }
                                                                const obj = JSON.parse(data);
                                                                for (let i = 0; i < obj.length; i++) {
                                                                    if (obj[i].includes(xuid)) {
                                                                        obj.splice(i, 1);
                                                                    }
                                                                }
                                                                const json = JSON.stringify(obj);
                                                                await new Promise((resolve, reject) => {
                                                                    fs.writeFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/whitelist.json`, json, (err) => {
                                                                        if (err) {
                                                                            const error = new EmbedBuilder()
                                                                                .setColor(corange)
                                                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                                .setDescription(`
${WARNING} **Notice**
${end} An Error Occurred While Saving Unwhitelist
                                    `)
                                                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                                .setTimestamp()
                                                                            interaction.editReply({ embeds: [error] });
                                                                            reject(err)
                                                                        } else {
                                                                            resolve()
                                                                        }
                                                                    })
                                                                })
                                                                EmbedUpdate.addFields({
                                                                    name: `${success} Realm Name: ${Realm.name}`,
                                                                    value: `${end} \`Successfully Unwhitelisted\``
                                                                })
                                                            })
                                                            Promise.all(updatePromises).then(() => {
                                                                interaction.editReply({ embeds: [EmbedUpdate], components: [] });
                                                                RealmCollector.stop();
                                                            })
                                                        } else {
                                                            if (!fs.existsSync(`./Database/realm/${interaction.guild.id}/${RealmSelect}/whitelist.json`)) {
                                                                interaction.editReply({ embeds: [createNoConfig(interaction.guild, interaction.user)] })
                                                                RealmCollector.stop();
                                                                return
                                                            }
                                                            const data = fs.readFileSync(
                                                                `./Database/realm/${interaction.guild.id}/${RealmSelect}/whitelist.json`
                                                            );
                                                            if (!data.includes(xuid)) {
                                                                const whitelisted = new EmbedBuilder()
                                                                    .setColor(corange)
                                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                    .setDescription(`
${WARNING} **Notice**
${end} User is not whitelisted
                                        `)
                                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                    .setTimestamp()
                                                                interaction.editReply({ embeds: [whitelisted], components: [] });
                                                                RealmCollector.stop();
                                                                return;
                                                            }
                                                            const obj = JSON.parse(data);
                                                            for (let i = 0; i < obj.length; i++) {
                                                                if (obj[i].includes(xuid)) {
                                                                    obj.splice(i, 1);
                                                                }
                                                            }
                                                            const json = JSON.stringify(obj);
                                                            fs.writeFile(
                                                                `./Database/realm/${interaction.guild.id}/${RealmSelect}/whitelist.json`,
                                                                json,
                                                                (err) => {
                                                                    if (err) {
                                                                        const error = new EmbedBuilder()
                                                                            .setColor(corange)
                                                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                            .setDescription(`
${WARNING} **Notice**
${end} An error occurred while saving Unwhitelist!
                                                `)
                                                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                            .setTimestamp()
                                                                        interaction.editReply({ embeds: [error], components: [] });
                                                                        RealmCollector.stop();
                                                                    }
                                                                    const whitelist = new EmbedBuilder()
                                                                        .setColor(cgreen)
                                                                        .setThumbnail(pfp)
                                                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                                        .setDescription(`
${success} **Unwhitelisted**
${reply} **Username:** \`${username}\`
${end} **Realm:** \`${realmname}\`
                                            `)
                                                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                                        .setTimestamp()
                                                                    interaction.editReply({ embeds: [whitelist], components: [] });
                                                                    RealmCollector.stop();
                                                                }
                                                            )
                                                        }
                                                    }).catch((err) => {
                                                        interaction.editReply({ embeds: [createUserNotFound(interaction.guild, interaction.user)] })
                                                        RealmCollector.stop();
                                                    })
                                            })
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
                        interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'WhitelistManager')] })
                    }
                })
        }, 1000)
    }
}