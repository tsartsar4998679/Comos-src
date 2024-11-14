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
        .setName('pcheck')
        .setDescription('Check your premium status'),

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

*Select Which Realm You Want To Check Your Cosmos Premium!*
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
                        const file = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`);
                        const now = Math.floor(Date.now() / 1000);
                        const Premium = file.get("PremiumTime") ?? 0;
                        const remainingTimeSeconds = Premium - now;

                        if (remainingTimeSeconds <= 0) {
                            const Embed = new EmbedBuilder()
                                .setColor(cred)
                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                .setDescription(`
${denied} **Premium Status**
${reply} You Have No Premium For This Guild!
${end} To get premium Go to https://cosmosbot.dev/premium
        `)
                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                .setTimestamp()
                            interaction.editReply({ embeds: [Embed], components: [] })
                            RealmCollector.stop()
                        } else {
                            let remainingTime = remainingTimeSeconds;
                            const years = Math.floor(remainingTime / (365 * 24 * 60 * 60));
                            remainingTime -= years * 365 * 24 * 60 * 60;
                            const months = Math.floor(remainingTime / (30 * 24 * 60 * 60));
                            remainingTime -= months * 30 * 24 * 60 * 60;
                            const weeks = Math.floor(remainingTime / (7 * 24 * 60 * 60));
                            remainingTime -= weeks * 7 * 24 * 60 * 60;
                            const days = Math.floor(remainingTime / (24 * 60 * 60));
                            remainingTime -= days * 24 * 60 * 60;
                            const hours = Math.floor(remainingTime / (60 * 60));
                            remainingTime -= hours * 60 * 60;
                            const minutes = Math.floor(remainingTime / 60);

                            let remainingTimeString = "";
                            if (years > 0) {
                                remainingTimeString += `${years} year${years > 1 ? "s" : ""} `;
                            }
                            if (months > 0) {
                                remainingTimeString += `${months} month${months > 1 ? "s" : ""} `;
                            }
                            if (weeks > 0) {
                                remainingTimeString += `${weeks} week${weeks > 1 ? "s" : ""} `;
                            }
                            if (days > 0) {
                                remainingTimeString += `${days} day${days > 1 ? "s" : ""} `;
                            }
                            if (hours > 0) {
                                remainingTimeString += `${hours} hour${hours > 1 ? "s" : ""} `;
                            }
                            if (minutes > 0) {
                                remainingTimeString += `${minutes} minute${minutes > 1 ? "s" : ""} `;
                            }
                            remainingTimeString += "left";


                            const Embed = new EmbedBuilder()
                                .setColor(cgreen)
                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                .setDescription(`
${success} **Premium Status**
${reply} **Date:** <t:${Premium}:f> 
${end} \`${remainingTimeString}\`
        `)
                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                .setTimestamp()
                            interaction.editReply({ embeds: [Embed], components: [] })
                            RealmCollector.stop()
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
                interaction.editReply({ embeds: [createNotGuildOwnerEmbed(interaction.guild, interaction.user)] })
            }
        }, 1000)
    }
}