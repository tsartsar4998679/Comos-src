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
        .setName("bperms")
        .setDescription("Edit Your Guild's Permissions For Cosmos")
        .addRoleOption((role) =>
            role.setName("role")
                .setDescription("Role Mention")
                .setRequired(true)
        )
        .addStringOption((permission) =>
            permission
                .setName("permissions")
                .setDescription("Permissions To Edit/Change")
                .setRequired(true)
                .addChoices({
                    name: "All Permissions",
                    value: "all"
                }, {
                    name: "Reconnect",
                    value: "reconnect"
                }, {
                    name: "Whitelist Manager",
                    value: "whitelist"
                }, {
                    name: "Config Manager",
                    value: "Config"
                }, {
                    name: "Realm Ban",
                    value: "Ban"
                }, {
                    name: "Realm Unban",
                    value: "Unban"
                }, {
                    name: "Realm Invite",
                    value: "Invite"
                }, {
                    name: "Realm Open",
                    value: "Open"
                }, {
                    name: "Realm Close",
                    value: "Close"
                }, {
                    name: "Realm Backup",
                    value: "Backup"
                }, {
                    name: "Realm Code",
                    value: "Code"
                }, {
                    name: "Realm Change Code",
                    value: "ChangeCode"
                }, {
                    name: "Realm Permissions",
                    value: "Permissions"
                }, {
                    name: "Realm Players",
                    value: "Players"
                }, {
                    name: "Realm Recents",
                    value: "Recents"
                }, {
                    name: "Realm Slots",
                    value: "Slots"
                }, {
                    name: "Realm Rename",
                    value: "Rename"
                }, {
                    name: "Realm Lastseen",
                    value: "Lastseen"
                }, {
                    name: "Realm Kick",
                    value: "Kick"
                }
                )
        )
        .addStringOption((setting) =>
            setting
                .setName("setting")
                .setDescription("Permissions Whether To Add Or Remove")
                .setRequired(true)
                .addChoices({
                    name: "Add Permission",
                    value: "Add"
                }, {
                    name: "Remove Permission",
                    value: "Remove"
                })
        ),

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

*Select Which Realm You Want To Edit Cosmos Permissions!*
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
                                let permission = interaction.options.getString("permissions");
                                let setting = interaction.options.getString("setting");
                                let role = interaction.options.getRole("role").id;
                                const PermUpdate = editJsonFile(
                                    `./Database/realm/${interaction.guild.id}/perms.json`
                                );
                                fs.readFile(
                                    `./Database/realm/${interaction.guild.id}/perms.json`,
                                    (err, data) => {
                                        if (err) {
                                            console.error(err);
                                            return;
                                        }
                                        if (permission === "all") {
                                            const permissions = [
                                                "Reconnect",
                                                "WhitelistManager",
                                                "ConfigManager",
                                                "RealmBan",
                                                "RealmUnban",
                                                "RealmInvite",
                                                "RealmOpen",
                                                "RealmClose",
                                                "RealmBackup",
                                                "RealmCode",
                                                "RealmChangeCode",
                                                "RealmPermissions",
                                                "RealmPlayers",
                                                "RealmRecents",
                                                "RealmSlots",
                                                "RealmRename",
                                                "RealmKick",
                                                "RealmLastseen"
                                            ];

                                            const permissionStatus = {};
                                            const logEmbed = new EmbedBuilder()
                                                .setColor(cgreen)
                                                .setAuthor({
                                                    name: `${interaction.guild}`,
                                                    iconURL: interaction.guild.iconURL(),
                                                })
                                                .setFooter({
                                                    text: `Requested By ${interaction.user.tag}`,
                                                    iconURL: interaction.user.displayAvatarURL(),
                                                })
                                                .setTimestamp();
                                            let description = `
**__ Permissions Updated __**

                                            `;

                                            for (const permission of permissions) {
                                                const roles = JSON.parse(data);
                                                const realmManagerRoleIds = roles[permission] || [];
                                                const roleCount = realmManagerRoleIds.length;

                                                if (setting === "Add") {
                                                    if (realmManagerRoleIds.includes(role)) {
                                                        permissionStatus[permission] = `<@&${role}> is already added!`;
                                                    } else {
                                                        if (roleCount === 3) {
                                                            permissionStatus[permission] = `Max capacity has been reached for ${permission}`;
                                                        } else {
                                                            // Add role to current permission
                                                            realmManagerRoleIds.push(role);
                                                            PermUpdate.set(permission, realmManagerRoleIds);
                                                            PermUpdate.save();
                                                            permissionStatus[permission] = `<@&${role}> has been added successfully`;
                                                        }
                                                    }
                                                } else if (setting === "Remove") {
                                                    if (realmManagerRoleIds.includes(role)) {
                                                        // Remove role from current permission
                                                        const newRealmManagerRoleIds = realmManagerRoleIds.filter(id => id !== role);
                                                        PermUpdate.set(permission, newRealmManagerRoleIds);
                                                        PermUpdate.save();
                                                        permissionStatus[permission] = `<@&${role}> successfully removed!`;
                                                    } else {
                                                        permissionStatus[permission] = `<@&${role}> not found!`;
                                                    }
                                                }
                                            }

                                            for (const permission in permissionStatus) {
                                                description += `**__${permission}__**\n${end} ${permissionStatus[permission]}\n`;
                                            }

                                            logEmbed.setDescription(description);

                                            interaction.editReply({
                                                embeds: [logEmbed]
                                            });
                                        }
                                        if (permission === "reconnect") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.Reconnect || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`Reconnect\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(corange)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${WARNING} **Notice**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`Reconnect\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("Reconnect", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("Reconnect", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`Reconnect\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`Reconnect\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Config") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.ConfigManager || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`ConfigManager\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(corange)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${WARNING} **Notice**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`ConfigManager\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("ConfigManager", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("ConfigManager", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`ConfigManager\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`ConfigManager\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "whitelist") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.WhitelistManager || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`WhitelistManager\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(corange)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${WARNING} **Notice**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`WhitelistManager\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("WhitelistManager", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("WhitelistManager", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`WhitelistManager\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`WhitelistManager\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Ban") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmBan || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`Realm Ban\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(corange)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${WARNING} **Notice**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`Realm Ban\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmBan", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmBan", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`Realm Ban\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`Realm Ban\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Unban") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmUnban || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`Realm Unban\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**

**__ Error Info __**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`Realm Unban\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmUnban", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmUnban", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`Realm Unban\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`Realm Unban\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Invite") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmInvite || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmInvite\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**

**__ Error Info __**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmInvite\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmInvite", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmInvite", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmInvite\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmInvite\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Open") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmOpen || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmOpen\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**

**__ Error Info __**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmOpen\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmOpen", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmOpen", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmOpen\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmOpenClose\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Close") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmClose || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmClose\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**

**__ Error Info __**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmClose\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmClose", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmClose", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmClose\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmOpenClose\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Backup") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmBackup || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmBackup\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**

**__ Error Info __**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmBackup\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmBackup", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmBackup", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmBackup\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmBackup\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Code") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmCode || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmCode\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**

**__ Error Info __**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmCode\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmCode", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmCode", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmCode\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmCode\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "ChangeCode") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmChangeCode || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmChangeCode\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**

**__ Error Info __**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmChangeCode\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmChangeCode", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmChangeCode", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmChangeCode\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmCode\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Permissions") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmPermissions || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmPermissions\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**

**__ Error Info __**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmPermissions\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmPermissions", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmPermissions", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmPermissions\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmPermissions\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Players") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmPlayers || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmPlayers\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**

**__ Error Info __**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmPlayers\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmPlayers", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmPlayers", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmPlayers\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmPlayers\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Recents") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmRecents || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmRecents\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**

**__ Error Info __**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmRecents\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmRecents", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmRecents", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmRecents\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmRecents\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Rename") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmRename || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmRename\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**

**__ Error Info __**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmRename\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmRename", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmRename", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmRename\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmRecents\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Slots") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmSlots || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmSlots\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**

**__ Error Info __**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmSlots\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmSlots", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmSlots", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmRecents\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmRecents\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Lastseen") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmLastseen || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmLastseen\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmLastseen\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmLastseen", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmLastseen", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmLastseen\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmLastseen\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                        if (permission === "Kick") {
                                            const roles = JSON.parse(data);
                                            const realmManagerRoleIds = roles.RealmKick || [];
                                            const roleCount = realmManagerRoleIds.length;
                                            if (setting === "Add") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Role Is Already In The \`RealmKick\` Database!
${end} **Role:** <@&${role}>
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                } else {
                                                    if (roleCount === 3) {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cred)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${denied} **Usage Error**
${reply} You Have Reached Your Max Capacity Of 3!
${end} Please Replace Any Role In The Database.
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        return;
                                                    } else {
                                                        const added = new EmbedBuilder()
                                                            .setColor(cgreen)
                                                            .setAuthor({
                                                                name: `${interaction.guild}`,
                                                                iconURL: interaction.guild.iconURL(),
                                                            })
                                                            .setDescription(
                                                                `
${success} **Role Added**
${reply} Successfully Added Role In \`RealmKick\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
                `
                                                            )
                                                            .setFooter({
                                                                text: `Requested By ${interaction.user.tag}`,
                                                                iconURL: interaction.user.displayAvatarURL(),
                                                            })
                                                            .setTimestamp();
                                                        interaction.editReply({
                                                            embeds: [added]
                                                        });
                                                        PermUpdate.append("RealmKick", `${role}`);
                                                        PermUpdate.save();
                                                    }
                                                }
                                            }
                                            if (setting === "Remove") {
                                                if (realmManagerRoleIds.includes(role)) {
                                                    const newRealmManagerRoleIds = realmManagerRoleIds.filter(
                                                        (id) => id !== role
                                                    );
                                                    PermUpdate.set("RealmKick", newRealmManagerRoleIds);
                                                    PermUpdate.save();
                                                    const removed = new EmbedBuilder()
                                                        .setColor(cgreen)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${success} **Role Removed**
${reply} Successfully Removed Role In \`RealmKick\` Database!
${reply} **Role:** <@&${role}>
${end} **Role ID:** \`${role}\`
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [removed]
                                                    });
                                                } else {
                                                    const added = new EmbedBuilder()
                                                        .setColor(corange)
                                                        .setAuthor({
                                                            name: `${interaction.guild}`,
                                                            iconURL: interaction.guild.iconURL(),
                                                        })
                                                        .setDescription(
                                                            `
${WARNING} **Notice**
${reply} Unable To Remove Role!
${end} <@&${role}> Not Found In \`RealmKick\` Database.
            `
                                                        )
                                                        .setFooter({
                                                            text: `Requested By ${interaction.user.tag}`,
                                                            iconURL: interaction.user.displayAvatarURL(),
                                                        })
                                                        .setTimestamp();
                                                    interaction.editReply({
                                                        embeds: [added]
                                                    });
                                                    return;
                                                }
                                            }
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
                        interaction.editReply({ embeds: [createNoRolePermission(interaction.guild, interaction.user, rolesMention, 'Config Manager')] })
                    }
                })
        }, 1000)
    }
}