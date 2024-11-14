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
        .setName('bconfig')
        .setDescription('View your realm\'s config'),

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

*Select Which Realm You Want To View Cosmos Config!*
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
                                    let file = editJsonFile(`./Database/realm/${interaction.guild.id}/${RealmSelect}/config.json`);
                                    let rawData = fs.readFileSync(`./Database/realm/${interaction.guild.id}/${RealmSelect}/BannedDevices.json`);
                                    const bd = JSON.parse(rawData);
                                    let realmname = file.get(`RealmName`)
            
                                    //Automod
                                    let fl = file.get(`Followers`) ?? 'Unconfigured';
                                    let fr = file.get(`Friends`) ?? 'Unconfigured';
                                    let g = file.get(`Games`) ?? 'Unconfigured';
                                    let gs = file.get(`Gamerscore`) ?? 'Unconfigured';
            
                                    //Loggings
                                    let chat = file.get(`Chat-Relay-Logs`) ?? 'Unconfigured';
                                    let logs = file.get(`Join-Leave-Logs`) ?? 'Unconfigured';
                                    let automod = file.get(`Automod-Logs`) ?? 'Unconfigured';
                                    let banlogs = file.get('Ban-Logs') ?? 'Unconfigured';
                                    let Deathlogs = file.get(`Death-Logs`) ?? 'Unconfigured';
                                    let dislogs = file.get(`Disconnection-Logs`) ?? 'Unconfigured';
            
                                    //Core
                                    let format = file.get(`embedformat`) ?? 'Unconfigured'
                                    let globalDB = file.get(`globalStatus`) ?? 'Unconfigured';
                                    let chattype = file.get(`chattype`) ?? 'Unconfigured';
            
                                    //Premium
                                    let chatSpamTime = file.get('antiSpam-Time') ?? 10
                                    let chatSpamMessage = file.get('antiSpam-Messages') ?? 5
                                    let AntiUnfairSkin = file.get('antiinvis') ?? 'Disabled'
                                    let autoreconnect = file.get('autoreconnect') ?? 'Disabled'
                                    let ConsoleChannel = file.get('ConsoleChannel') ?? 'Unconfigured'
            
                                    const ConfigEmbed = new EmbedBuilder()
                                        .setColor(cgreen)
                                        .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                                        .setDescription(`
${success} **Fetched Guild's Config**
${end} **Realm:** ${realmname}
            
${WARNING} **__Cosmos Automod__**
${reply} Gamerscore: \`${gs}\`
${reply} Friends: \`${fr}\`
${reply} Followers: \`${fl}\`
${end} Games: \`${g}\`
            
${Manager} **__Cosmos Manager__**
${reply} Format: \`${format}\`
${reply} Global Ban: \`${globalDB}\`
${reply} Chat Type: \`${chattype}\`
${end} __Banned Devices__
${bd.join(' \n')}
            
${Logging} **__Cosmos Logging__**
${reply} Chat-Relay: <#${chat}>
${reply} Join/Leave Logs: <#${logs}>
${reply} Automod Logs: <#${automod}>
${reply} Ban Logs: <#${banlogs}>
${end} Death Logs: <#${Deathlogs}>
            
${Premium} **__Cosmos Premium__**
${reply} Anti-Spam Time: \`${chatSpamTime}\`
${reply} Anti-Spam Amount: \`${chatSpamMessage}\`
${reply} Anti-Unfair Skin: \`${AntiUnfairSkin}\`
${reply} Auto-Reconnect: \`${autoreconnect}\`
${reply} Console Channel: <#${ConsoleChannel}>
${end} Disconnection Logs: <#${dislogs}>
                `)
                                        .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                                        .setTimestamp()
                                    interaction.editReply({ embeds: [ConfigEmbed], components: [] })
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