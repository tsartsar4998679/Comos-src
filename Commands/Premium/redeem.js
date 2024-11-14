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
        .setName('redeem')
        .setDescription('Redeem a code you\'ve purchased on Cosmos store!')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Redeem a premium code you purchased')
                .setRequired(true)),

    async execute(interaction) {
        const Code = interaction.options.getString('code')
        const MonthlyCodeBase = fs.readFileSync('./Database/MonthlyCodes.json');
        const threeMonthlyCodeBase = fs.readFileSync('./Database/3MonthlyCodes.json');
        const sixMonthlyCodeBase = fs.readFileSync('./Database/6MonthlyCodes.json');
        const YearlyCodeBase = fs.readFileSync('./Database/YearlyCodeBase.json');
        const twoYearlyCodeBase = fs.readFileSync('./Database/2YearCodes.json');
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

*Select Which Realm You Want To Redeem Cosmos Premium!*
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
                        let selectedCodeBase, duration;
                        if (MonthlyCodeBase.includes(Code)) {
                            selectedCodeBase = `./Database/MonthlyCodes.json`;
                            duration = `1 Month`
                        } else if (threeMonthlyCodeBase.includes(Code)) {
                            selectedCodeBase = `./Database/3MonthlyCodes.json`;
                            duration = `3 Months`
                        } else if (sixMonthlyCodeBase.includes(Code)) {
                            selectedCodeBase = `./Database/6MonthlyCodes.json`;
                            duration = `6 Months`
                        } else if (YearlyCodeBase.includes(Code)) {
                            selectedCodeBase = `./Database/YearlyCodeBase.json`;
                            duration = `1 Year`
                        } else if (twoYearlyCodeBase.includes(Code)) {
                            selectedCodeBase = `./Database/2YearCodes.json`;
                            duration = `2 Years`
                        }

                        if (selectedCodeBase) {
                            console.log(`[PREMIUM]`.bold.red + ` ${interaction.user.tag} Has Redeemed Premium in ${interaction.guild} for ${duration}`.bold.yellow + ` (ID: ${interaction.guild.id})!`.cyan);
                            let file = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`)
                            const Premium = file.get('PremiumTime') ?? 0
                            const now = new Date()
                            const expiryDate = new Date(now.getFullYear(), now.getMonth() + getMonthsFromDuration(duration), now.getDate())
                            const unixTimestamp = Math.floor(expiryDate.getTime() / 1000)
                            let data = fs.readFileSync(selectedCodeBase)

                            if (Premium) {
                                const premiumDate = new Date(Premium * 1000)
                                premiumDate.setMonth(premiumDate.getMonth() + getMonthsFromDuration(duration))
                                const newUnixTimestamp = Math.floor(premiumDate.getTime() / 1000)
                                const remainingTime = moment.unix(newUnixTimestamp).fromNow(true);
                                const Embed = new EmbedBuilder()
                                    .setColor(cgreen)
                                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                    .setDescription(`
${success} **Premium Upgraded**
${reply} You Have Added an Extra ${duration} to Your Premium!
${end} **Premium:** <t:${newUnixTimestamp}:f> (**<t:${remainingTime}:f>**)
                    `)
                                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                    .setTimestamp();
                                interaction.editReply({ embeds: [Embed], components: [] });
                                file.set('PremiumTime', newUnixTimestamp);
                                file.save();
                                var obj = JSON.parse(data);
                                for (let i = 0; i < obj.length; i++) {
                                    if (obj[i].includes(Code)) {
                                        obj.splice(i, 1);
                                    }
                                }
                                fs.writeFile(selectedCodeBase, JSON.stringify(obj, null, 2), (err) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                RealmCollector.stop()
                                return;
                            }
                            var obj = JSON.parse(data);
                            for (let i = 0; i < obj.length; i++) {
                                if (obj[i].includes(Code)) {
                                    obj.splice(i, 1);
                                }
                            }

                            const Embed = new EmbedBuilder()
                                .setColor(cgreen)
                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                .setDescription(`
${success} **Premium Activated**
${reply} You Have Successfully Enabled Premium!
${end} **Premium:** <t:${unixTimestamp}:f> (**<t:${remainingTime}:f>**)
                    `)
                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                .setTimestamp();
                            interaction.editReply({ embeds: [Embed], components: [] });
                            file.set('PremiumTime', unixTimestamp);
                            file.save();
                            fs.writeFile(selectedCodeBase, JSON.stringify(obj, null, 2), (err) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            RealmCollector.stop()
                            return;
                        } else {
                            console.log(`[PREMIUM]`.bold.red + ` ${interaction.user.tag} Has Tried a Premium Code (${duration}) in ${interaction.guild}, but it's invalid`.bold.yellow + ` (ID: ${interaction.guild.id})!`.cyan);
                            const Embed = new EmbedBuilder()
                                .setColor(corange)
                                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                .setDescription(`
${WARNING} **Redeem Notice**
${reply} You Have Entered an **Invalid** Code!
${reply} Please Re-Enter the Code Correctly.
${end} Or, You Have Never Paid to Receive Your Premium Code!
                        `)
                                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                .setTimestamp();
                            interaction.editReply({ embeds: [Embed], components: [] });
                            RealmCollector.stop()
                        }
                        function getMonthsFromDuration(duration) {
                            switch (duration) {
                                case '1 Month':
                                    return 1;
                                case '3 Months':
                                    return 3;
                                case '6 Months':
                                    return 6;
                                case '1 Year':
                                    return 12;
                                case '2 Years':
                                    return 24;
                                default:
                                    return 0;
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
                interaction.editReply({ embeds: [createNotGuildOwnerEmbed(interaction.guild, interaction.user)] })
            }
        }, 1000)
    }
}