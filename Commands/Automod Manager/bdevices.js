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
        .setName('bdevices')
        .setDescription('Set the banned devices for your realm'),

    async execute(interaction) {
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
            
*Select Which Realm You Want To Edit Cosmos Config!*
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
                                    const DevicesMenu = new ActionRowBuilder()
                                        .addComponents(
                                            new StringSelectMenuBuilder()
                                                .setCustomId('devicesselection')
                                                .setPlaceholder('Devices Selection')
                                                .setMaxValues(5)
                                                .addOptions(
                                                    {
                                                        label: `Minecraft Launcher`,
                                                        description: `Ban Players Who Are On Minecraft Launcher`,
                                                        value: `Minecraft Launcher`,
                                                    },
                                                    {
                                                        label: `Minecraft for iOS`,
                                                        description: `Ban Players Who Are On Minecraft for iOS`,
                                                        value: `Minecraft for iOS`,
                                                    },
                                                    {
                                                        label: `Minecraft for Android`,
                                                        description: `Ban Players Who Are On Minecraft for Android`,
                                                        value: `Minecraft for Android`,
                                                    },
                                                    {
                                                        label: `Minecraft for Nintendo Switch`,
                                                        description: `Ban Players Who Are On Minecraft for Nintendo Switch`,
                                                        value: `Minecraft for Nintendo Switch`,
                                                    },
                                                    {
                                                        label: `Minecraft for Windows`,
                                                        description: `Ban Players Who Are On Minecraft for Windows`,
                                                        value: `Minecraft for Windows`,
                                                    },
                                                    {
                                                        label: `No Banned Devices`,
                                                        description: `Disable Banned Devices Automod`,
                                                        value: `Disabled`,
                                                    }
                                                ),
                                        );
                                    setTimeout(() => {
                                        const Secondload2 = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${loading} **Loading Devices Configuration...**
${end} ${load1}${load2}${unload3}

*Select Which Devices You Want To Apply*
*To Edit The Banned Device Configuration*

*Note: If You See \`Interaction Failed\`, Just Ignore It*
`)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        interaction.editReply({ embeds: [Secondload2], components: [DevicesMenu] })

                                        const LogsFilter = Logs => Logs.customId === 'devicesselection' && Logs.user.id === interaction.user.id;
                                        const DevicesCollector = interaction.channel.createMessageComponentCollector({ LogsFilter, time: 15000 });

                                        DevicesCollector.on('collect', async Devices => {
                                            const DeviceSelect = Devices.values;
                                            const data = JSON.stringify(DeviceSelect);
                                            if (DeviceSelect.includes('Disabled')) {
                                                const SetG = new EmbedBuilder()
                                                    .setColor(cgreen)
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setDescription(`
${success} **Banned Devices Updated**
${end} Applied To All Realms

**__ Update Info __**
${reply} Successfully Updated Banned Devices.
${end} **You Have Disabled Banned Device Automod.**
            `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [SetG], components: [] })
                                                for (let i = 0; i < 5; i++) {
                                                    const RealmId = File.data[interaction.guild.id]?.[i]?.[0] ?? `Empty Slot ${i + 1}`;

                                                    const configExists = fs.existsSync(`./Database/realm/${interaction.guild.id}/${RealmId}/config.json`);

                                                    if (configExists === true) {
                                                        fs.writeFile(`./Database/realm/${interaction.guild.id}/${RealmId}/BannedDevices.json`, '[]', err => {
                                                            if (err) {
                                                                console.error(err);
                                                            }
                                                        });
                                                    }
                                                }
                                                RealmCollector.stop()
                                                DevicesCollector.stop()
                                            } else {
                                                const SetG = new EmbedBuilder()
                                                    .setColor(cgreen)
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setDescription(`
${success} **Banned Devices Updated**
${end} Applied To All Realms

**__ Update Info __**
${reply} Successfully Updated Banned Devices.
${end} **Banned All Selected Devices!**

**__ Devices __**
${end} ${DeviceSelect}
            `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [SetG], components: [] })
                                                for (let i = 0; i < 5; i++) {
                                                    const RealmId = File.data[interaction.guild.id]?.[i]?.[0] ?? `Empty Slot ${i + 1}`;

                                                    const configExists = fs.existsSync(`./Database/realm/${interaction.guild.id}/${RealmId}/config.json`);

                                                    if (configExists === true) {
                                                        fs.writeFile(`./Database/realm/${interaction.guild.id}/${RealmId}/BannedDevices.json`, data, err => {
                                                            if (err) {
                                                                console.error(err);
                                                            }
                                                        });
                                                    }
                                                }
                                                RealmCollector.stop()
                                                DevicesCollector.stop()
                                            }
                                        })
                                        DevicesCollector.on('end', async (collected) => {
                                            if (collected.size === 0) {
                                                const Ended = new EmbedBuilder()
                                                    .setColor(cred)
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setDescription(`
${WARNING} **Menu Ended**
${end} \`You Haven't Selected Your Devices Configuration!\`
                                        `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                await interaction.editReply({ embeds: [Ended], components: [] })
                                            }
                                        })
                                        RealmCollector.stop()
                                    }, 2500)
                                } else {
                                    const Loading = new EmbedBuilder()
                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                        .setDescription(`
${loading} **Loading Configurations...**
${end} ${load1}${load2}${unload3}
    `)
                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                        .setTimestamp()
                                    interaction.editReply({ embeds: [Loading], components: [] })

                                    if (!fs.existsSync(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)) {
                                        const ErrorMenu = new EmbedBuilder()
                                            .setColor(cred)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${denied} **Usage Error**
${reply} You Have Selected a Realm You Have Not Yet Setup!
${end} Please Run \`/csetup\` To Setup That Realm You Selected!
`)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        interaction.editReply({ embeds: [ErrorMenu], components: [] })
                                        return
                                    }

                                    const DevicesMenu = new ActionRowBuilder()
                                        .addComponents(
                                            new StringSelectMenuBuilder()
                                                .setCustomId('devicesselection')
                                                .setPlaceholder('Devices Selection')
                                                .setMaxValues(5)
                                                .addOptions(
                                                    {
                                                        label: `Minecraft Launcher`,
                                                        description: `Ban Players Who Are On Minecraft Launcher`,
                                                        value: `Minecraft Launcher`,
                                                    },
                                                    {
                                                        label: `Minecraft for iOS`,
                                                        description: `Ban Players Who Are On Minecraft for iOS`,
                                                        value: `Minecraft for iOS`,
                                                    },
                                                    {
                                                        label: `Minecraft for Android`,
                                                        description: `Ban Players Who Are On Minecraft for Android`,
                                                        value: `Minecraft for Android`,
                                                    },
                                                    {
                                                        label: `Minecraft for Nintendo Switch`,
                                                        description: `Ban Players Who Are On Minecraft for Nintendo Switch`,
                                                        value: `Minecraft for Nintendo Switch`,
                                                    },
                                                    {
                                                        label: `Minecraft for Windows`,
                                                        description: `Ban Players Who Are On Minecraft for Windows`,
                                                        value: `Minecraft for Windows`,
                                                    },
                                                    {
                                                        label: `No Banned Devices`,
                                                        description: `Disable Banned Devices Automod`,
                                                        value: `Disabled`,
                                                    }
                                                ),
                                        );
                                    setTimeout(() => {
                                        const Secondload2 = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setDescription(`
${loading} **Loading Devices Configuration...**
${end} ${load1}${load2}${unload3}

*Select Which Configuration You Want To Apply*
*To Edit The Configuration*

*Note: If You See \`Interaction Failed\`, Just Ignore It*
        `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        interaction.editReply({ embeds: [Secondload2], components: [DevicesMenu] })

                                        const LogsFilter = Logs => Logs.customId === 'devicesselection' && Logs.user.id === interaction.user.id;
                                        const DevicesCollector = interaction.channel.createMessageComponentCollector({ LogsFilter, time: 15000 });

                                        DevicesCollector.on('collect', async Devices => {
                                            const DeviceSelect = Devices.values;
                                            const data = JSON.stringify(DeviceSelect);
                                            if (DeviceSelect.includes('Disabled')) {
                                                const SetG = new EmbedBuilder()
                                                    .setColor(cgreen)
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setDescription(`
${success} **Successfully Updated Banned Devices**
${end} You Have Disabled Device Automod.
                        `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [SetG], components: [] })
                                                fs.writeFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/BannedDevices.json`, '[]', err => {
                                                    if (err) {
                                                        console.error(err);
                                                        return;
                                                    }
                                                });
                                                RealmCollector.stop()
                                                DevicesCollector.stop()
                                                return
                                            } else {
                                                const SetG = new EmbedBuilder()
                                                    .setColor(cgreen)
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setDescription(`
${success} **Successfully Updated Banned Devices**
${end} **Banned All Selected Devices!**

**__ Devices __**
${end} ${DeviceSelect}
                        `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [SetG], components: [] })
                                                fs.writeFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/BannedDevices.json`, data, err => {
                                                    if (err) {
                                                        console.error(err);
                                                        return;
                                                    }
                                                });
                                                RealmCollector.stop()
                                                DevicesCollector.stop()
                                            }
                                        })
                                        DevicesCollector.on('end', async (collected) => {
                                            if (collected.size === 0) {
                                                const Ended = new EmbedBuilder()
                                                    .setColor(cred)
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setDescription(`
${WARNING} **Menu Ended**
${end} \`You Haven't Selected Your Devices Configuration!\`
                                        `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                await interaction.editReply({ embeds: [Ended], components: [] })
                                            }
                                        })
                                        RealmCollector.stop()
                                    }, 1500)
                                }
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