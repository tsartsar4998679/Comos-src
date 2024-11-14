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
const { sub } = require('date-fns');
require('colors');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('loggings')
        .setDescription('All the logging settings for Cosmos')

        .addSubcommand(subcommand =>
            subcommand.setName('automod')
                .setDescription(`Edit Cosmos Automod logs`)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription(`channel for loggings`)
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand.setName('kicks')
                .setDescription(`Edit Cosmos Kicks logs`)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription(`channel for loggings`)
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand.setName('deaths')
                .setDescription(`Edit Cosmos Deaths logs`)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription(`channel for loggings`)
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand.setName('invites')
                .setDescription(`Edit Cosmos Invite logs`)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription(`channel for loggings`)
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand.setName('join-leaves')
                .setDescription(`Edit Cosmos Join&Leave logs`)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription(`channel for loggings`)
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand.setName('console')
                .setDescription(`Edit Cosmos Console logs`)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription(`channel for loggings`)
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand.setName('chat-relay')
                .setDescription(`Edit Cosmos Relay logs`)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription(`channel for loggings`)
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand.setName('bans')
                .setDescription(`Edit Cosmos Ban logs`)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription(`channel for loggings`)
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand.setName('unbans')
                .setDescription(`Edit Cosmos Unban logs`)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription(`channel for loggings`)
                        .setRequired(true))),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'automod') {
            const channel = interaction.options.getChannel('channel')
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
                        const manageConfigRoles = dataperm.ConfigManager.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'Config Manager')], components: [] })
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
            
*Select Which Realm You Want To Edit Cosmos Automod Logs!*
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
                                    if (RealmSelect === 'AllRealms') {
                                        const EmbedUpdate = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${success} **Config Updated**
            
**__ Realms Updated __**
            `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp();
                                        const updatePromises = NonEmptySlots.slice(0, 5).map(async (Realm) => {
                                            const configExists = fs.existsSync(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                            if (configExists) {
                                                const ConfigUpdate = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                                EmbedUpdate.addFields({
                                                    name: `${success} Realm Name: ${Realm.name}`,
                                                    value: `${reply} Channel: ${channel}\n${end} Channel Id: \`${channel.id}\``
                                                });
                                                ConfigUpdate.set("Automod-Logs", channel.id);
                                                ConfigUpdate.save();
                                            } else {
                                                EmbedUpdate.addFields({
                                                    name: `${denied} Realm Name: ${Realm.name}`,
                                                    value: `${end} \`Could Not Update Automod Logs\``
                                                });
                                            }
                                        });
                                        Promise.all(updatePromises).then(() => {
                                            interaction.editReply({ embeds: [EmbedUpdate], components: [] });
                                            RealmCollector.stop();
                                        })
                                    } else {
                                        const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                        const RealmName = ConfigEditor.get('RealmName')
                                        ConfigEditor.set("Automod-Logs", channel.id);
                                        ConfigEditor.save();
                                        const Embed = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cgreen)
                                            .setDescription(`
${success} **Config Updated**
${reply} Channel: ${channel}
${reply} Channel Id: \`${channel.id}\`
${end} Realm: \`${RealmName}\`
                                    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        await interaction.editReply({ embeds: [Embed], components: [] })
                                        RealmCollector.stop()
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
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'Config Manager')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'kicks') {
            const channel = interaction.options.getChannel('channel')
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
                        const manageConfigRoles = dataperm.ConfigManager.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'Config Manager')], components: [] })
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
            
*Select Which Realm You Want To Edit Cosmos Loggings!*
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
                                    if (RealmSelect === 'AllRealms') {
                                        const EmbedUpdate = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${success} **Config Updated**
            
**__ Realms Updated __**
            `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp();
                                        const updatePromises = NonEmptySlots.slice(0, 5).map(async (Realm) => {
                                            const configExists = fs.existsSync(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                            if (configExists) {
                                                const ConfigUpdate = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                                EmbedUpdate.addFields({
                                                    name: `${success} Realm Name: ${Realm.name}`,
                                                    value: `${reply} Channel: ${channel}\n${end} Channel Id: \`${channel.id}\``
                                                });
                                                ConfigUpdate.set("KicksLogs", channel.id);
                                                ConfigUpdate.save();
                                            } else {
                                                EmbedUpdate.addFields({
                                                    name: `${denied} Realm Name: ${Realm.name}`,
                                                    value: `${end} \`Could Not Update Cosmos Loggings\``
                                                });
                                            }
                                        });
                                        Promise.all(updatePromises).then(() => {
                                            interaction.editReply({ embeds: [EmbedUpdate], components: [] });
                                            RealmCollector.stop();
                                        })
                                    } else {
                                        const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                        const RealmName = ConfigEditor.get('RealmName')
                                        ConfigEditor.set("KicksLogs", channel.id);
                                        ConfigEditor.save();
                                        const Embed = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cgreen)
                                            .setDescription(`
${success} **Config Updated**
${reply} Channel: ${channel}
${reply} Channel Id: \`${channel.id}\`
${end} Realm: \`${RealmName}\`
                                    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        await interaction.editReply({ embeds: [Embed], components: [] })
                                        RealmCollector.stop()
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
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'Config Manager')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'deaths') {
            const channel = interaction.options.getChannel('channel')
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
                        const manageConfigRoles = dataperm.ConfigManager.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'Config Manager')], components: [] })
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
            
*Select Which Realm You Want To Edit Cosmos Death Logs!*
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
                                    if (RealmSelect === 'AllRealms') {
                                        const EmbedUpdate = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${success} **Config Updated**
            
**__ Realms Updated __**
            `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp();
                                        const updatePromises = NonEmptySlots.slice(0, 5).map(async (Realm) => {
                                            const configExists = fs.existsSync(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                            if (configExists) {
                                                const ConfigUpdate = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                                EmbedUpdate.addFields({
                                                    name: `${success} Realm Name: ${Realm.name}`,
                                                    value: `${reply} Channel: ${channel}\n${end} Channel Id: \`${channel.id}\``
                                                });
                                                ConfigUpdate.set("Death-Logs", channel.id);
                                                ConfigUpdate.save();
                                            } else {
                                                EmbedUpdate.addFields({
                                                    name: `${denied} Realm Name: ${Realm.name}`,
                                                    value: `${end} \`Could Not Update Death Logs\``
                                                });
                                            }
                                        });
                                        Promise.all(updatePromises).then(() => {
                                            interaction.editReply({ embeds: [EmbedUpdate], components: [] });
                                            RealmCollector.stop();
                                        })
                                    } else {
                                        const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                        const RealmName = ConfigEditor.get('RealmName')
                                        ConfigEditor.set("Death-Logs", channel.id);
                                        ConfigEditor.save();
                                        const Embed = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cgreen)
                                            .setDescription(`
${success} **Config Updated**
${reply} Channel: ${channel}
${reply} Channel Id: \`${channel.id}\`
${end} Realm: \`${RealmName}\`
                                    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        await interaction.editReply({ embeds: [Embed], components: [] })
                                        RealmCollector.stop()
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
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'Config Manager')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'invites') {
            const channel = interaction.options.getChannel('channel')
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
                        const manageConfigRoles = dataperm.ConfigManager.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'Config Manager')], components: [] })
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
            
*Select Which Realm You Want To Edit Cosmos Loggings!*
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
                                    if (RealmSelect === 'AllRealms') {
                                        const EmbedUpdate = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${success} **Config Updated**
            
**__ Realms Updated __**
            `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp();
                                        const updatePromises = NonEmptySlots.slice(0, 5).map(async (Realm) => {
                                            const configExists = fs.existsSync(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                            if (configExists) {
                                                const ConfigUpdate = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                                EmbedUpdate.addFields({
                                                    name: `${success} Realm Name: ${Realm.name}`,
                                                    value: `${reply} Channel: ${channel}\n${end} Channel Id: \`${channel.id}\``
                                                });
                                                ConfigUpdate.set("Cosmos-Logs", channel.id);
                                                ConfigUpdate.save();
                                            } else {
                                                EmbedUpdate.addFields({
                                                    name: `${denied} Realm Name: ${Realm.name}`,
                                                    value: `${end} \`Could Not Update Cosmos Loggings\``
                                                });
                                            }
                                        });
                                        Promise.all(updatePromises).then(() => {
                                            interaction.editReply({ embeds: [EmbedUpdate], components: [] });
                                            RealmCollector.stop();
                                        })
                                    } else {
                                        const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                        const RealmName = ConfigEditor.get('RealmName')
                                        ConfigEditor.set("Cosmos-Logs", channel.id);
                                        ConfigEditor.save();
                                        const Embed = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cgreen)
                                            .setDescription(`
${success} **Config Updated**
${reply} Channel: ${channel}
${reply} Channel Id: \`${channel.id}\`
${end} Realm: \`${RealmName}\`
                                    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        await interaction.editReply({ embeds: [Embed], components: [] })
                                        RealmCollector.stop()
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
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'Config Manager')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'join-leaves') {
            const channel = interaction.options.getChannel('channel')
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
                        const manageConfigRoles = dataperm.ConfigManager.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'Config Manager')], components: [] })
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
            
*Select Which Realm You Want To Edit Cosmos Join&Leave Logs!*
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
                                    if (RealmSelect === 'AllRealms') {
                                        const EmbedUpdate = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${success} **Config Updated**
${end} **Note:** Do \`/embedformat\`
            
**__ Realms Updated __**
            `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp();
                                        const updatePromises = NonEmptySlots.slice(0, 5).map(async (Realm) => {
                                            const configExists = fs.existsSync(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                            if (configExists) {
                                                const ConfigUpdate = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                                EmbedUpdate.addFields({
                                                    name: `${success} Realm Name: ${Realm.name}`,
                                                    value: `${reply} Channel: ${channel}\n${end} Channel Id: \`${channel.id}\``
                                                });
                                                ConfigUpdate.set("Join-Leave-Logs", channel.id);
                                                ConfigUpdate.save();
                                            } else {
                                                EmbedUpdate.addFields({
                                                    name: `${denied} Realm Name: ${Realm.name}`,
                                                    value: `${end} \`Could Not Update Join & Leaves\``
                                                });
                                            }
                                        });
                                        Promise.all(updatePromises).then(() => {
                                            interaction.editReply({ embeds: [EmbedUpdate], components: [] });
                                            RealmCollector.stop();
                                        })
                                    } else {
                                        const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                        const RealmName = ConfigEditor.get('RealmName')
                                        ConfigEditor.set("Join-Leave-Logs", channel.id);
                                        ConfigEditor.save();
                                        const Embed = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cgreen)
                                            .setDescription(`
${success} **Config Updated**
${reply} Channel: ${channel}
${reply} Channel Id: \`${channel.id}\`
${end} Realm: \`${RealmName}\`

**Note:** Do \`/embedformat\`
                                    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        await interaction.editReply({ embeds: [Embed], components: [] })
                                        RealmCollector.stop()
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
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'Config Manager')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'console') {
            const channel = interaction.options.getChannel('channel')
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
                        const manageConfigRoles = dataperm.ConfigManager.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'Config Manager')], components: [] })
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
            
*Select Which Realm You Want To Edit Cosmos Console!*
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
                                    if (RealmSelect === 'AllRealms') {
                                        const EmbedUpdate = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${success} **Config Updated**
            
**__ Realms Updated __**
            `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp();
                                        const updatePromises = NonEmptySlots.slice(0, 5).map(async (Realm) => {
                                            const configExists = fs.existsSync(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                            if (configExists) {
                                                const ConfigUpdate = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                                EmbedUpdate.addFields({
                                                    name: `${success} Realm Name: ${Realm.name}`,
                                                    value: `${reply} Channel: ${channel}\n${end} Channel Id: \`${channel.id}\``
                                                });
                                                ConfigUpdate.set("ConsoleChannel", channel.id);
                                                ConfigUpdate.save();
                                            } else {
                                                EmbedUpdate.addFields({
                                                    name: `${denied} Realm Name: ${Realm.name}`,
                                                    value: `${end} \`Could Not Update Console\``
                                                });
                                            }
                                        });
                                        Promise.all(updatePromises).then(() => {
                                            interaction.editReply({ embeds: [EmbedUpdate], components: [] });
                                            RealmCollector.stop();
                                        })
                                    } else {
                                        const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                        const RealmName = ConfigEditor.get('RealmName')
                                        ConfigEditor.set("ConsoleChannel", channel.id);
                                        ConfigEditor.save();
                                        const Embed = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cgreen)
                                            .setDescription(`
${success} **Config Updated**
${reply} Channel: ${channel}
${reply} Channel Id: \`${channel.id}\`
${end} Realm: \`${RealmName}\`
                                    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        await interaction.editReply({ embeds: [Embed], components: [] })
                                        RealmCollector.stop()
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
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'Config Manager')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'chat-relay') {
            const channel = interaction.options.getChannel('channel')
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
                        const manageConfigRoles = dataperm.ConfigManager.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'Config Manager')], components: [] })
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
            
*Select Which Realm You Want To Edit Cosmos Chat-Relay!*
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
                                    if (RealmSelect === 'AllRealms') {
                                        const EmbedUpdate = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${success} **Config Updated**
${end} **Note:** Do \`/bchattype\`

**__ Realms Updated __**
            `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp();
                                        const updatePromises = NonEmptySlots.slice(0, 5).map(async (Realm) => {
                                            const configExists = fs.existsSync(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                            if (configExists) {
                                                const ConfigUpdate = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                                EmbedUpdate.addFields({
                                                    name: `${success} Realm Name: ${Realm.name}`,
                                                    value: `${reply} Channel: ${channel}\n${end} Channel Id: \`${channel.id}\``
                                                });
                                                ConfigUpdate.set("Chat-Relay-Logs", channel.id);
                                                ConfigUpdate.save();
                                            } else {
                                                EmbedUpdate.addFields({
                                                    name: `${denied} Realm Name: ${Realm.name}`,
                                                    value: `${end} \`Could Not Update Chat-Relay\``
                                                });
                                            }
                                        });
                                        Promise.all(updatePromises).then(() => {
                                            interaction.editReply({ embeds: [EmbedUpdate], components: [] });
                                            RealmCollector.stop();
                                        })
                                    } else {
                                        const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                        const RealmName = ConfigEditor.get('RealmName')
                                        ConfigEditor.set("Chat-Relay-Logs", channel.id);
                                        ConfigEditor.save();
                                        const Embed = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cgreen)
                                            .setDescription(`
${success} **Config Updated**
${reply} Channel: ${channel}
${reply} Channel Id: \`${channel.id}\`
${end} Realm: \`${RealmName}\`

**Note:** Do \`/bchattype\`
                                    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        await interaction.editReply({ embeds: [Embed], components: [] })
                                        RealmCollector.stop()
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
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'Config Manager')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'bans') {
            const channel = interaction.options.getChannel('channel')
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
                        const manageConfigRoles = dataperm.ConfigManager.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'Config Manager')], components: [] })
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
            
*Select Which Realm You Want To Edit Cosmos Ban Logs!*
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
                                    if (RealmSelect === 'AllRealms') {
                                        const EmbedUpdate = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${success} **Config Updated**
            
**__ Realms Updated __**
            `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp();
                                        const updatePromises = NonEmptySlots.slice(0, 5).map(async (Realm) => {
                                            const configExists = fs.existsSync(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                            if (configExists) {
                                                const ConfigUpdate = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                                EmbedUpdate.addFields({
                                                    name: `${success} Realm Name: ${Realm.name}`,
                                                    value: `${reply} Channel: ${channel}\n${end} Channel Id: \`${channel.id}\``
                                                });
                                                ConfigUpdate.set("Ban-Logs", channel.id);
                                                ConfigUpdate.save();
                                            } else {
                                                EmbedUpdate.addFields({
                                                    name: `${denied} Realm Name: ${Realm.name}`,
                                                    value: `${end} \`Could Not Update Ban Logs\``
                                                });
                                            }
                                        });
                                        Promise.all(updatePromises).then(() => {
                                            interaction.editReply({ embeds: [EmbedUpdate], components: [] });
                                            RealmCollector.stop();
                                        })
                                    } else {
                                        const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                        const RealmName = ConfigEditor.get('RealmName')
                                        ConfigEditor.set("Ban-Logs", channel.id);
                                        ConfigEditor.save();
                                        const Embed = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cgreen)
                                            .setDescription(`
${success} **Config Updated**
${reply} Channel: ${channel}
${reply} Channel Id: \`${channel.id}\`
${end} Realm: \`${RealmName}\`
                                    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        await interaction.editReply({ embeds: [Embed], components: [] })
                                        RealmCollector.stop()
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
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'Config Manager')] })
                        }
                    })
            }, 1000)
        } else if (interaction.options.getSubcommand() === 'unbans') {
            const channel = interaction.options.getChannel('channel')
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
                        const manageConfigRoles = dataperm.ConfigManager.map(id => id)
                        if (manageConfigRoles.length === 0) {
                            interaction.editReply({ embeds: [creatNoPermRole(interaction.guild, interaction.user, 'Config Manager')], components: [] })
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
            
*Select Which Realm You Want To Edit Cosmos Unban Logs!*
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
                                    if (RealmSelect === 'AllRealms') {
                                        const EmbedUpdate = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${success} **Config Updated**
            
**__ Realms Updated __**
            `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp();
                                        const updatePromises = NonEmptySlots.slice(0, 5).map(async (Realm) => {
                                            const configExists = fs.existsSync(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                            if (configExists) {
                                                const ConfigUpdate = editJsonFile(`./Database/realm/${interaction.guild.id}/${Realm.id}/config.json`);
                                                EmbedUpdate.addFields({
                                                    name: `${success} Realm Name: ${Realm.name}`,
                                                    value: `${reply} Channel: ${channel}\n${end} Channel Id: \`${channel.id}\``
                                                });
                                                ConfigUpdate.set("Unban-Logs", channel.id);
                                                ConfigUpdate.save();
                                            } else {
                                                EmbedUpdate.addFields({
                                                    name: `${denied} Realm Name: ${Realm.name}`,
                                                    value: `${end} \`Could Not Update Unban Logs\``
                                                });
                                            }
                                        });
                                        Promise.all(updatePromises).then(() => {
                                            interaction.editReply({ embeds: [EmbedUpdate], components: [] });
                                            RealmCollector.stop();
                                        })
                                    } else {
                                        const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                        const RealmName = ConfigEditor.get('RealmName')
                                        ConfigEditor.set("Unban-Logs", channel.id);
                                        ConfigEditor.save();
                                        const Embed = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cgreen)
                                            .setDescription(`
${success} **Config Updated**
${reply} Channel: ${channel}
${reply} Channel Id: \`${channel.id}\`
${end} Realm: \`${RealmName}\`
                                    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        await interaction.editReply({ embeds: [Embed], components: [] })
                                        RealmCollector.stop()
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
                            interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'Config Manager')] })
                        }
                    })
            }, 1000)
        }
    }
}