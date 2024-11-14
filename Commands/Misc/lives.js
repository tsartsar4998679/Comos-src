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
        .setName('live-embed')
        .setDescription('Send a live embed of your realm')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the live-embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of Embed you want to create')
                .addChoices(
                    { name: 'Playerlist', value: 'pl' },
                    { name: 'Objective', value: 'obj' }
                )),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel')
        const type = interaction.options.getString('type')
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
            
*Select Which Realm You Want To Send a Live Embed!*
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
                                const ConfigEditor = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                                const RealmName = ConfigEditor.get('RealmName')

                                const now = Math.floor(Date.now() / 1000);
                                const Premium = ConfigEditor.get("PremiumTime") ?? 0
                                if (Premium === 0) {
                                    const Embed = new EmbedBuilder()
                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                        .setColor(cgreen)
                                        .setDescription(`
${WARNING} **Notice**
${end} You do not have premium for this realm!
                                    `)
                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                        .setTimestamp()
                                    await interaction.editReply({ embeds: [Embed], components: [] })
                                } else {
                                    if (now < Premium) {
                                        if (type === 'pl') {
                                            const LiveEmbeds = editJsonFile(`./Database/LiveEmbeds.json`)
                                            LiveEmbeds.append(`${interaction.guild.id}`, RealmSelect)
                                            LiveEmbeds.save()
                                            const Embed = new EmbedBuilder()
                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                .setColor(cgreen)
                                                .setDescription(`
${success} **Config Updated**
${reply} Playerlist Live-Embed: ${channel}
${reply} Channel Id: \`${channel.id}\`
${end} Realm: \`${RealmName}\`
                                    `)
                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                .setTimestamp()
                                            await interaction.editReply({ embeds: [Embed], components: [] })
                                            RealmCollector.stop()
                                        } else if (type === 'obj') {
                                            const LiveEmbeds = editJsonFile(`./Database/LiveEmbeds.json`)
                                            LiveEmbeds.append(`${interaction.guild.id}`, RealmSelect)
                                            LiveEmbeds.save()
                                            const Embed = new EmbedBuilder()
                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                .setColor(cgreen)
                                                .setDescription(`
${success} **Config Updated**
${reply} Objective Live-Embed: ${channel}
${reply} Channel Id: \`${channel.id}\`
${end} Realm: \`${RealmName}\`
                                    `)
                                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                .setTimestamp()
                                            await interaction.editReply({ embeds: [Embed], components: [] })
                                            RealmCollector.stop()
                                        }
                                    } else {
                                        const Embed = new EmbedBuilder()
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setColor(cgreen)
                                            .setDescription(`
${WARNING} **Notice**
${end} You do not have premium for this realm!
                                    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        await interaction.editReply({ embeds: [Embed], components: [] })
                                    }
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