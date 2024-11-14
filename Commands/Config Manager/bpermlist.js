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
        .setName('bpermlist')
        .setDescription('View your guild\'s permissions list'),

    async execute(interaction) {
        interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
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

*Select Which Realm You Want To Check Cosmos Permissions!*
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
                        fs.readFile(`./Database/realm/${interaction.guild.id}/perms.json`, (err, data) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            const dataperm = JSON.parse(data);

                            const permissionDescriptions = [
                                { name: 'Reconnect', description: 'Reconnect' },
                                { name: 'ConfigManager', description: 'ConfigManager' },
                                { name: 'WhitelistManager', description: 'WhitelistManager' },
                                { name: 'RealmBan', description: 'RealmBan' },
                                { name: 'RealmUnban', description: 'RealmUnban' },
                                { name: 'RealmInvite', description: 'RealmInvite' },
                                { name: 'RealmOpen', description: 'RealmOpen' },
                                { name: 'RealmClose', description: 'RealmClose' },
                                { name: 'RealmBackup', description: 'RealmBackup' },
                                { name: 'RealmCode', description: 'RealmCode' },
                                { name: 'RealmChangeCode', description: 'RealmChangeCode' },
                                { name: 'RealmPermissions', description: 'RealmPermissions' },
                                { name: 'RealmPlayers', description: 'RealmPlayers' },
                                { name: 'RealmRecents', description: 'RealmRecents' },
                                { name: 'RealmRename', description: 'RealmRename' },
                                { name: 'RealmSlots', description: 'RealmSlots' }
                            ];

                            function generatePermissionDescription(permissionName, permissionIds) {
                                const permission = permissionIds.map(id => `<@&${id}>`).join(', ');
                                return `**__ ${permissionName} __**\n${end} ${permission}`;
                            }

                            permissionDescriptions.sort(({ name: nameA }, { name: nameB }) => {
                                const permissionAExists = dataperm[nameA] ? 1 : 0
                                const permissionBExists = dataperm[nameB] ? 1 : 0
                                return permissionBExists - permissionAExists
                            })
                            const description = permissionDescriptions
                                .map(({ name, description }) => {
                                    if (dataperm[name]) {
                                        return generatePermissionDescription(description, dataperm[name]);
                                    } else {
                                        const File = editJsonFile(`./Database/realm/${interaction.guild.id}/perms.json`)
                                        File.set(`${description}`, [])
                                        File.save()
                                        return `\`${description}\` doesn't exist | Auto Creating Initiated`;
                                    }
                                }).join('\n');

                            const ConfigEmbed = new EmbedBuilder()
                                .setColor(cgreen)
                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                .setDescription(`
${success} **Guild's Permissions**

${description}

*If You Want To Edit These Permissions*
*Please Use The Command \`/bperms <role> <permission> <setting>\`* (</bperms:1100019296622628939>)
                        `)
                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                .setTimestamp();

                            interaction.editReply({ embeds: [ConfigEmbed], components: [] });
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
                interaction.editReply({ embeds: [createNotGuildOwnerEmbed(interaction.guild, interaction.user)] })
            }
        }, 1000)
    }
}