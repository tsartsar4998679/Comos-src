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
        .setName('bmingames')
        .setDescription('Set a minimum games required for players to join the realm')
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('Amount to set for requirement')
                .setRequired(true)),

    async execute(interaction) {
        const amount = interaction.options.getNumber('amount')
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
                                                value: `${end} Games: \`${amount}\``
                                            });
                                            ConfigUpdate.set("Games", amount);
                                            ConfigUpdate.save();
                                        } else {
                                            EmbedUpdate.addFields({
                                                name: `${denied} Realm Name: ${Realm.name}`,
                                                value: `${end} \`Could Not Update Games Amount\``
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
                                    ConfigEditor.set("Games", amount);
                                    ConfigEditor.save();
                                    const Embed = new EmbedBuilder()
                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                        .setColor(cgreen)
                                        .setDescription(`
${success} **Config Updated**
${reply} Games: \`${amount}\`
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