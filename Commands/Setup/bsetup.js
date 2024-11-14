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
const { Titles, Authflow } = require("prismarine-auth");
const axios = require('axios');
require('colors');
const ncp = require('ncp').ncp;
ncp.limit = 16;

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('bsetup')
        .setDescription('Link your Alt/Bot account that does not own the realm with Cosmos'),

    async execute(interaction) {
        interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)], ephemeral: true })
        setTimeout(() => {
            if (interaction.user.id === interaction.guild.ownerId || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                interaction.editReply({ embeds: [createSecondEmbedLoad(interaction.guild, interaction.user)] })
                const row1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Privacy Policy')
                            .setStyle(5)
                            .setURL('https://privacy-policy.cosmosbot.dev')
                            .setEmoji('1082798541493252196'),
                        new ButtonBuilder()
                            .setCustomId('agree')
                            .setLabel('Agree')
                            .setStyle(3)
                            .setEmoji('1082793438359072858'),
                    );

                const onLiveCode = (code) => {
                    if (!code) {
                        const FirstLoad1 = new EmbedBuilder()
                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                            .setDescription(`
${denied} **Setup Failed**
${end} Failed to fetch \`Verification Code\`, please retry again!
                `)
                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                            .setTimestamp()
                        interaction.editReply({ embeds: [FirstLoad1], components: [row1] })
                        return
                    }
                    let userCode = code.user_code
                    console.log(`[SETUP]`.bold.red + ` ${interaction.user.tag} Has Started Account Linking Process In ${interaction.guild}`.bold.yellow + `(ID: ${interaction.guild.id})!`.cyan)
                    const linking1 = new EmbedBuilder()
                        .setColor(cred)
                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                        .setDescription(`
${loading} **Bot Account Setup Process**
${end} ${load1}${load2}${unload3}

**__ Linking Account... __**
${reply} **Link:** https://microsoft.com/link
${end} **Code:** ${userCode}

*Make sure you are linking your Alt/Bot Account*
                    `)
                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTimestamp()
                    interaction.editReply({ embeds: [linking1], components: [] })
                }

                const VerifiactionProcess = new EmbedBuilder()
                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                    .setDescription(`
${loading} **Verification Process...**
${end} ${load1}${load2}${unload3}
    
*Do You Agree To Cosmos's Privacy Policy?*
            `)
                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()
                interaction.editReply({ embeds: [VerifiactionProcess], components: [row1] })

                const collector = interaction.channel.createMessageComponentCollector(
                    { time: 120000 }
                );

                collector.on("collect", async (i) => {
                    if (i.user.id === interaction.user.id) {
                        await interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] });
                        setTimeout(() => {
                            const authflow1 = new Authflow("", `./Database/BotAccounts/${interaction.guild.id}`, {
                                flow: 'live',
                                relyingParty: "http://xboxlive.com",
                                authTitle: Titles.MinecraftNintendoSwitch,
                                deviceType: 'Nintendo'
                            }, onLiveCode);
                            authflow1.getXboxToken()
                                .then((t) => {
                                    const auth = JSON.parse(
                                        JSON.stringify({
                                            "x-xbl-contract-version": "2",
                                            Authorization: `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
                                            "Accept-Language": "en-US",
                                            maxRedirects: 1,
                                        })
                                    );
                                    interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)], components: [] });
                                    axios.get(`https://profile.xboxlive.com/users/xuid(${t.userXUID})/profile/settings?settings=Gamertag,GameDisplayPicRaw`, {
                                        headers: auth
                                    }).then((data) => {
                                        const username = data?.data?.profileUsers[0]?.settings[0]?.value;
                                        const pfp = data?.data?.profileUsers[0]?.settings[1]?.value;
                                        const linked = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                            .setThumbnail(pfp)
                                            .setDescription(`
${success} **Bot Setup Process Finished**
${reply} **Username:** ${username}
${end} **Xuid:** ${t.userXUID}

**__ Guild Info __**
${reply} **Name:** ${interaction.guild}
${end} **ID:** ${interaction.guild.id}

*If you need to unlink, run \`/disconnect\`*
                                    `)
                                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                            .setTimestamp()
                                        interaction.editReply({ embeds: [linked], components: [] })
                                        collector.stop()
                                    })
                                        .catch((error) => {
                                            console.log(error.data)
                                            if (error.response.status === 404) {
                                                const NotFound = new EmbedBuilder()
                                                    .setColor(cred)
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setDescription(`
${WARNING} **Notice**
${reply} Does This Account Have A Xbox Profile?
${end} Please create a [Xbox Profile](https://signup.live.com).
                                    `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [NotFound] })
                                                collector.stop()
                                            } else if (error.response.status === 403) {
                                                const Banned = new EmbedBuilder()
                                                    .setColor(cred)
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setDescription(`
${WARNING} **Notice**
${reply} Is Your Xbox Account Banned?
${end} Please check your [Enforcement History](https://support.xbox.com/en-US/help/family-online-safety/enforcement/enforcement-history).
                                    `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [Banned] })
                                                collector.stop()
                                            } else {
                                                const ErrorMessage = new EmbedBuilder()
                                                    .setColor(cred)
                                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                    .setDescription(`
${WARNING} **Notice**
${end} An error Has Occured While Checking Your Profile
                                    `)
                                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                                    .setTimestamp()
                                                interaction.editReply({ embeds: [ErrorMessage] })
                                                collector.stop()
                                            }
                                        })
                                })
                        }, 1500)
                    }
                })
                collector.on('end', async (collected) => {
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
            } else {
                interaction.editReply({ embeds: [createNotGuildOwnerEmbed(interaction.guild, interaction.user)] })
            }
        }, 1000)
    }
}