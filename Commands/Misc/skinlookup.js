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
const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');
const editJsonFile = require("edit-json-file");
const { Authflow } = require("prismarine-auth");
const axios = require('axios');
require('colors');
const path = require('path');
const client = require('../../Cosmos.js')

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('bskinlookup')
        .setDescription('Lookup a user\'s Skin')
        .addStringOption(option =>
            option.setName('gamertag')
                .setDescription('Gamertag to lookup')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('skintype')
                .setDescription('Skin Type For lookup')
                .setRequired(true)
                .addChoices(
                    { name: 'Face', value: 'face' },
                )),

    async execute(interaction) {
        const gamertag = interaction.options.getString('gamertag')
        const skinType = interaction.options.getString('skintype')
        interaction.reply({ embeds: [createFirstEmbedLoad(interaction.guild, interaction.user)] })
        setTimeout(() => {
            interaction.editReply({ embeds: [createSecondEmbedLoad(interaction.guild, interaction.user)] })
            new Authflow("", `./Database/BotAccounts/${interaction.guild.id}`, {
                flow: 'msal',
                relyingParty: "http://xboxlive.com",
            })
                .getXboxToken()
                .then(async (Xbox) => {
                    const XboxAuth = JSON.parse(JSON.stringify({
                        'x-xbl-contract-version': '2',
                        'Authorization': `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
                        'Accept-Language': "en-US",
                        maxRedirects: 1,
                    }))
                    axios.get(`https://profile.xboxlive.com/users/gt(${(gamertag)})/profile/settings?settings=GameDisplayPicRaw`, {
                        headers: XboxAuth,
                        timeout: 5000
                    })
                        .then((res) => {
                            const pfp = res?.data?.profileUsers[0]?.settings[0]?.value
                            const xuid = res?.data?.profileUsers[0]?.id
                            interaction.editReply({ embeds: [createThirdEmbedLoad(interaction.guild, interaction.user)] })
                            if (skinType === 'face') {
                                const skinDirectory = path.join(__dirname, '../Database/PlayersDB/Skins', gamertag);
                                if (!fs.existsSync(skinDirectory)) {
                                    const error1 = new EmbedBuilder()
                                        .setColor(corange)
                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                        .setDescription(`
${WARNING} **Notice**
${reply} **Gamertag:** \`${gamertag}\`
${reply} Unable To Fetch User's Skin
${end} User Has Not Joined a Realm With Cosmos!
                                                `)
                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                        .setTimestamp()
                                    interaction.editReply({ embeds: [error1] })
                                    return;
                                }
                                const skinFilename = `${xuid}.png`;
                                const skinPath = path.join(skinDirectory, skinFilename);
                                const buffer = fs.readFileSync(skinPath);
                                const skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                const thumbnailUrl = `attachment://${skinFilename}`;
                                const bodyReply = new EmbedBuilder()
                                    .setColor(cgreen)
                                    .setThumbnail(pfp)
                                    .setImage(thumbnailUrl)
                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                    .setDescription(`
${success} **Retrieved Skin Data**
${end} **Gamertag:** ${gamertag}
                                                `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp()
                                interaction.editReply({ embeds: [bodyReply], files: [skinAttachment] })
                            }
                        })
                        .catch((error) => {
                            const errorEmbed = new EmbedBuilder()
                                .setColor(corange)
                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                .setDescription(`
${WARNING} **Notice**
${reply} **Username:** \`${gamertag}\`
${end} User Not Found!
                                        `)
                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                .setTimestamp()
                            interaction.editReply({ embeds: [errorEmbed] })
                                .catch(console.error);
                        });
                })
        }, 1500)
    }
}