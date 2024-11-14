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
        .setName('whitelists-list')
        .setDescription('View your realm\'s whitelisted players'),

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
                    const manageConfigRoles = dataperm.WhitelistManager.map(id => id)
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
            
*Select Which Realm You Want To View Whitelisted Players!*
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
                                const whitelistData = fs.readFileSync(`./Database/realm/${interaction.guild.id}/${RealmSelect}/whitelist.json`);
                                const whitelistArray = JSON.parse(whitelistData);

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
                                        if (whitelistArray.length === 0) {
                                            const failed = new EmbedBuilder()
                                                .setColor(corange)
                                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                                .setDescription(`
${WARNING} **Notice**
${end} This realm has no whitelisted players!
`)
                                                .setFooter({ text: `Executed By ${Realms.user.tag}`, iconURL: Realms.user.displayAvatarURL() })
                                                .setTimestamp()
                                            interaction.editReply({ embeds: [failed], components: [] })
                                            return
                                        }

                                        const promises = whitelistArray.map((xuid, index) => {
                                            const getGamertag = {
                                                method: "get",
                                                url: `https://profile.xboxlive.com/users/xuid(${xuid})/profile/settings?settings=Gamertag`,
                                                headers: XboxAuth,
                                            };
                                            return new Promise((resolve) => {
                                                setTimeout(() => {
                                                    axios(getGamertag)
                                                        .then((response) => {
                                                            const xuid = response?.data?.profileUsers[0]?.id;
                                                            const gamertag = response?.data?.profileUsers[0]?.settings[0]?.value;
                                                            resolve({ xuid, gamertag });
                                                        })
                                                        .catch(() => resolve({ xuid: 'Unable To Fetch Xuid', gamertag: 'Unable To Fetch Gamertag' }));
                                                }, index * 1000);
                                            });
                                        });

                                        Promise.all(promises)
                                            .then((users) => {
                                                let playersList = "";
                                                users.forEach((user, index) => {
                                                    playersList += `(**${index + 1}**) \`${user.gamertag}\`\n`;
                                                });

                                                const embed = new EmbedBuilder()
                                                    .setColor(cgreen)
                                                    .setDescription(`
${success} **Whitelisted Players**
${playersList}`);
                                                interaction.editReply({ embeds: [embed] });
                                            })
                                            .catch((error) => {
                                                console.error(error);
                                                const embed = new EmbedBuilder()
                                                    .setColor(cred)
                                                    .setDescription(`
${denied} **Error**
${end} An error has occurred while fetching whitelisted players!
                                                    `);
                                                interaction.editReply({ embeds: [embed] });
                                            });
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