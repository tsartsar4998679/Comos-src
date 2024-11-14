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
const { Authflow } = require("prismarine-auth");
const axios = require('axios');
require('colors');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnect Your Accounts From Cosmos')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type Of Disconnection')
                .setRequired(true)
                .addChoices(
                    { name: 'Main Account', value: 'main' },
                    { name: 'Alt Account', value: 'alt' }
                )),

    async execute(interaction) {
        const Type = interaction.options.getString('type')
        interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)], ephemeral: true })
        setTimeout(() => {
            if (interaction.user.id === interaction.guild.ownerId || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                interaction.editReply({ embeds: [createSecondEmbedLoad(interaction.guild, interaction.user)] })
                if (Type === 'main') {
                    if (!fs.existsSync(`./Database/Oauth/${interaction.guild.id}`)) {
                        const Embed = new EmbedBuilder()
                            .setColor(corange)
                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                            .setDescription(`
${WARNING} **Notice**
${end} This Guild Hasn't Linked Their **Main Account** To Cosmos!
        `)
                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                            .setTimestamp()
                        interaction.editReply({ embeds: [Embed] })
                        return
                    }
                }
                if (Type === 'alt') {
                    if (!fs.existsSync(`./Database/BotAccounts/${interaction.guild.id}`)) {
                        const Embed = new EmbedBuilder()
                            .setColor(corange)
                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                            .setDescription(`
${WARNING} **Notice**
${end} This Guild Hasn't Linked Their **Alt Account** To Cosmos!
        `)
                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                            .setTimestamp()
                        interaction.editReply({ embeds: [Embed] })
                        return
                    }
                }
                setTimeout(() => {
                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)] })
                    if (Type === 'main') {
                        fs.rm(`./Database/Oauth/${interaction.guild.id}`, { recursive: true }, (err) => {
                            if (err) {
                                const ErrorMenu = new EmbedBuilder()
                                    .setColor(cred)
                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                    .setDescription(`
${denied} **Deleting Error**
${end} An Error Has Occurred While Deleting Account!
            `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [ErrorMenu], components: [] })
                                return
                            } else {
                                const ErrorMenu = new EmbedBuilder()
                                .setColor(cgreen)
                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                .setDescription(`
${success} **Deleted Account Successful**
${end} You Have Successfully Removed Your Main Account From Cosmos!
            `)
                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                .setTimestamp()
                            interaction.editReply({ embeds: [ErrorMenu], components: [] })
                            return
                            }
                        })
                    }
                    if (Type === 'alt') {
                        fs.rm(`./Database/BotAccounts/${interaction.guild.id}`, { recursive: true }, (err) => {
                            if (err) {
                                const ErrorMenu = new EmbedBuilder()
                                    .setColor(cred)
                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                    .setDescription(`
${denied} **Deleting Error**
${end} An Error Has Occurred While Deleting Account!
            `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [ErrorMenu], components: [] })
                                return
                            } else {
                                const ErrorMenu = new EmbedBuilder()
                                .setColor(cgreen)
                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                .setDescription(`
${success} **Deleted Account Successful**
${end} You Have Successfully Removed Your Alt Account From Cosmos!
            `)
                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                .setTimestamp()
                            interaction.editReply({ embeds: [ErrorMenu], components: [] })
                            return
                            }
                        })
                    }
                }, 1500)
            } else {
                interaction.editReply({ embeds: [createNotGuildOwnerEmbed(interaction.guild, interaction.user)] })
            }
        }, 1000)
    }
}