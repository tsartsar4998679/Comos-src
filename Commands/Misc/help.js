const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const client = require('../../Cosmos.js')
const { success, end, reply, WARNING, denied, corange, cgreen, cred } = require('../../constants');
require('colors');

const blogs = `</blogs:1100019296622628938>`;
const bautomod = `</bautomod:1100019296622628936>`;
const bdeathlogs = `</bdeathlogs:1105068426961092661>`;
const bbanlogs = `</bbanlogs:1105068426961092659>`;
const bchatrelay = `</bchatrelay:1105068426961092660>`;
const bconsole = `</bconsole:1102139338378186862>`;
const blastseen = `</blastseen:1105068426961092667>`;
const bmingamerscore = `</bmingamerscore:1105068426961092665>`;
const bminfollowers = `</bminfollowers:1105068426961092663>`;
const bmingames = `</bmingames:1105068426961092666>`;
const bminfriends = `</bminfriends:1105068426961092664>`;
const whitelistslist = `</whitelists-list:1105068427124686858>`;
const reconnect = `</reconnect:1100019296735870991>`;
const bconfig = `</bconfig:1093731016880955472>`;
const whitelist = `</whitelist:1093731017673678882>`;
const setup = `</setup:1100019296735870994>`;
const bsetup = `</bsetup:1100019296622628941>`;
const csetup = `</csetup:1094657613817446401>`;
const bchattype = `</bchattype:1100019296622628942>`
const xlookup = `</xlookup:1100019296903639071>`
const bdevices = `</bdevices:1100019296622628937>`
const stats = `</stats:1100019296735870995>`
const disconnect = `</disconnect:1093731016880955475>`
const logsformat = `</embedformat:1100019296622628943>`
const pcheck = `</pcheck:1100019296735870989>`
const premium = `</premium:1100019296735870990>`
const bpermlist = `</bpermlist:1100019296622628940>`
const bskinlookup = `</bskinlookup:1093731017380069477>`
const xlastplayed = `</xlastplayed:1100019296903639070>`
const bantiinvis = `</bantiinvis:1100019296622628934>`
const bglobal = `</bglobal:1100019296735870987>`
const graph = `</graph:1093731016880955480>`
const banmessage = `</banmessage:1100035473415618651>`
const liveEmbedSet = `</live-embed-set:1124366961783099449>`
const liveEmbed = `</live-embed:1124366961783099448>`
const discordCode = `</discordcode:1124366961783099443>`



module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get All The Commands Info And Help With Setting It Up'),
    async execute(interaction) {
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("aa")
                    .setLabel("Cosmos AutoMod")
                    .setStyle("4"),
                new ButtonBuilder()
                    .setCustomId("gm")
                    .setLabel("Manage Cosmos Bot")
                    .setStyle("2"),
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("logs")
                    .setLabel("Cosmos Logging")
                    .setStyle("2"),
                new ButtonBuilder()
                    .setCustomId("oth")
                    .setLabel("Other Commands")
                    .setStyle("3"),
                new ButtonBuilder()
                    .setCustomId("pr")
                    .setLabel("Premium Commands")
                    .setStyle("4")
            );

        let start = new EmbedBuilder()
            .setColor(cgreen)
            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
            .setDescription(`
${success} **__ Cosmos Help __**

${reply} **Cosmos** Is a MCPE Realm Anticheat Bot With Features
${reply} Like, Managing Your Realm, Seeing Realm Logs, And See What's
${end} Happening In Your Realm, Get **Cosmos** To Protect Your Realm!

__To Be Able To Use Cosmo__
*Note: Run These Commands In Your Realm's Discord Server/Guild*
> Run \`/setup\` With Your Account That Owns Your Realms
> Run \`/bsetup\` With Your Alt Account That Will Sit In Your Realm(s)
> Run \`/csetup\` To Get Cosmos To Finalize Your Realm To Be Ready To Edit With

${end} And Cosmos Setup is Complete, Just Customize Your Realm/Config All You Want!

__Want To Disconnect Your Accounts?__
*Note: Run These Commands In Your Realm's Discord Server/Guild*
> Run \`/disconnect\` Then You Should be Good To Go.

${reply} If You Have Any Questions Or Concerns.
${end} Please Join Support Server And As In <#1068479860726562858> \`AlterSaber#1000\`, I'll Be Happy To Help!

${end} Select a option below for help commands!
`)

        await interaction.reply({
            embeds: [start],
            ephemeral: false,
            components: [row1, row2],
        });
        const filter = (i) => i.customId;
        const other = new EmbedBuilder()
            .setColor(cgreen)
            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
            .setDescription(`
**__ Cosmos Others __**

__To Be Able To Use Cosmos Commands__
*Note: Run These Commands In Your Realm's Discord Server/Guild*
> Run \`/setup\` With Your Account That Owns Your Realms
> Run \`/bsetup\` With Your Alt Account That Will Sit In Your Realm(s)
> Run \`/csetup\` To Get Cosmos To Finalize Your Realm To Be Ready To Edit With

${end} And Cosmos Setup is Complete, Just Customize Your Realm/Config All You Want!

If You Haven't Already, Make Sure You Have Permissions
In Order To Use These Commands!
> **Usage: /bperms <role> <permission>**

${reply} ${xlookup}
${end} Look up a player's Xbox info

${reply} ${stats}
${end} Check Cosmos Global Stats

${reply} ${bskinlookup}
${end} Lookup a player's Skin from Cosmos DB

${reply} ${xlastplayed}
${end} Lookup a player's last played games

${reply} ${blastseen}
${end} Lookup a player's last seen played realm

${reply} ${graph}
${end} Generate a graph from Cosmos
`)
            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
        const PremiumHelp = new EmbedBuilder()
            .setColor(cgreen)
            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
            .setDescription(`
**__ Cosmos Premium __**

__To Be Able To Use Cosmos Commands__
*Note: Run These Commands In Your Realm's Discord Server/Guild*
> Run \`/setup\` With Your Account That Owns Your Realms
> Run \`/bsetup\` With Your Alt Account That Will Sit In Your Realm(s)
> Run \`/csetup\` To Get Cosmos To Finalize Your Realm To Be Ready To Edit With

${end} And Cosmos Setup is Complete, Just Customize Your Realm/Config All You Want!

If You Haven't Already, Make Sure You Have Permissions
In Order To Use These Commands!
> **Usage: /bperms <role> <permission>**

${reply} ${pcheck}
${reply} *Usage: \`/pcheck\` Select Your Realm You Want To check Premium*
${end} Check Your Current Premium Status

${reply} ${premium}
${reply} *Usage: \`/redeem <code>\` Select Your Realm You Want To Redeem Code For*
${end} Redeem Your Premium Code

${reply} ${bantiinvis}
${reply} *Usage: \`/bantiinvis <type> (enable? or disable?)\` Select Your Realm*
${end} Edit Cosmos Anti-Invis Feature In Your Realm!

${reply} ${discordCode}
${end} Edit Cosmos Kick Message's Discord Code With yours!

${reply} ${liveEmbed}
${end} Setup a Live Embed For Your Realm!

${reply} ${liveEmbedSet}
${end} Start your Live Embed for your realm!

If you want to make config editor a lot easier?
Go to [Cosmos Dashboard!](https://dashboard.cosmosbot.dev)
`)
            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
        const aa = new EmbedBuilder()
            .setColor(cgreen)
            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
            .setDescription(`
**__ Cosmos AutoMod __**

__To Be Able To Use Cosmos Commands__
*Note: Run These Commands In Your Realm's Discord Server/Guild*
> Run \`/setup\` With Your Account That Owns Your Realms
> Run \`/bsetup\` With Your Alt Account That Will Sit In Your Realm(s)
> Run \`/csetup\` To Get Cosmos To Finalize Your Realm To Be Ready To Edit With

${end} And **Cosmos Setup** is Complete, Just Customize Your Realm/Config All You Want!

If You Haven't Already, Make Sure You Have Permissions
In Order To Use These Commands!
> **Usage: \`/bperms <role> <permission>\`**

${reply} ${bminfollowers}
${reply} *Usage: \`/bminfollowers <amount>\` Select Your Realm You Want To Configure*
${end} Edit Your Cosmos Automod Followers

${reply} ${bmingamerscore}
${reply} *Usage: \`/bmingamerscore <amount>\` Select Your Realm You Want To Configure*
${end} Edit Your Cosmos Automod Gamerscore

${reply} ${bmingames}
${reply} *Usage: \`/bmingames <amount>\` Select Your Realm You Want To Configure*
${end} Edit Your Cosmos Automod Games

${reply} ${bminfriends}
${reply} *Usage: \`/bminfriends <amount>\` Select Your Realm You Want To Configure*
${end} Edit Your Cosmos Automod Friends

${reply} ${bdevices}
${reply} *Usage: \`/bdevices\` Select Your Realm You Want To Configure*
${end} Configure Your Realm's Banned Devices

${reply} ${whitelist}
${reply} *Usage: \`/whitelist <gamertag> <type> (Add? or Remove?)\` Select Your Realm You Want To Configure*
${end} Whitelist / Unwhitelist a player from Cosmos Automod

${reply} ${whitelistslist}
${reply} *Usage: \`/whitelists-list\` Select Your Realm You Want To Check*
${end} View Your Realm's Whitelisted Players

${reply} ${bglobal}
${end} Enable or Disable Cosmos Global Ban Database

If you want to make config editor a lot easier?
Go to [Cosmos Dashboard!](https://dashboard.cosmosbot.dev)
`)
            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
        const gm = new EmbedBuilder()
            .setColor(cgreen)
            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
            .setDescription(`
**__ Manage Cosmos Bot __**

__To Be Able To Use Cosmos Commands__
*Note: Run These Commands In Your Realm's Discord Server/Guild*
> Run \`/setup\` With Your Account That Owns Your Realms
> Run \`/bsetup\` With Your Alt Account That Will Sit In Your Realm(s)
> Run \`/csetup\` To Get Cosmos To Finalize Your Realm To Be Ready To Edit With

${end} And **Cosmos Setup** is Complete, Just Customize Your Realm/Config All You Want!

If You Haven't Already, Make Sure You Have Permissions
In Order To Use These Commands!
> **Usage: \`/bperms <role> <permission>\`**


${reply} ${bpermlist}
${reply} *Usage: \`/bpermlist\` Check your guild's current permissions list*
${end} View your guild's current permissions list

${reply} ${reconnect}
${reply} *Usage: \`/reconnect\` Select Your Realm You Want To allow the bot to join*
${end} Allow the bot to join your realm

${reply} ${bconfig}
${reply} *Usage: \`/bconfig\` Select Your Realm You Want To see the current config*
${end} View your realm's current config

${reply} ${bchattype}
${reply} *Usage: \`/bchattype <chattype>\` Select Your Realm You Want To Change Chat-Relay Type*
${end} Change your realm(s) Chat-Relay Type

${reply} ${logsformat}
${reply} *Usage: \`/embedformat <format>\` Select Your Realm You Want To Change Your Join-Leave Logs*
${end} Change your realm(s) Join-Leave Embed Logs

${reply} ${banmessage}
${reply} *Usage: \`/banmessage <message>\` Select Your Realm You Want To edit your \`/rban\`*
${end} Change your realm(s) Join-Leave Embed Logs

If you want to make config editor a lot easier?
Go to [Cosmos Dashboard!](https://dashboard.cosmosbot.dev)
`)
            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()

        const logs = new EmbedBuilder()
            .setColor(cgreen)
            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
            .setDescription(`
**__ Cosmos Logging __**

__To Be Able To Use Cosmos Commands__
*Note: Run These Commands In Your Realm's Discord Server/Guild*
> Run \`/setup\` With Your Account That Owns Your Realms
> Run \`/bsetup\` With Your Alt Account That Will Sit In Your Realm(s)
> Run \`/csetup\` To Get Cosmos To Finalize Your Realm To Be Ready To Edit With

${end} And Cosmos Setup is Complete, Just Customize Your Realm/Config All You Want!

If You Haven't Already, Make Sure You Have Permissions
In Order To Use These Commands!
> **Usage: /bperms <role> <permission>**

${reply} ${blogs}
${reply} *Usage: \`/blogs <channel>\` Select Your Realm You Want To Put Join/Leave Logs*
${end} Edit Your Realm's Join/Leave Logs To Go

${reply} ${bautomod}
${reply} *Usage: \`/bautomod <channel>\` Select Your Realm You Want To Put Cosmos Automos Logs*
${end} Edit Cosmos Automod Logs To Go

${reply} ${bchatrelay}
${reply} *Usage: \`/bchatrelay <channel>\` Select Your Realm You Want To Put Chat-Relay*
${end} Edit Your Realm's Chat-Relay To Go

${reply} ${bbanlogs}
${reply} *Usage: \`/bbanlogs <channel>\` Select Your Realm You Want To Put Bans/Unbans Logs*
${end} Edit Your Realm's Bans/Unbans Logs To Go

${reply} ${bdeathlogs}
${reply} *Usage: \`/bdeathlogs <channel>\` Select Your Realm You Want To Put Realm Death Logs*
${end} Edit Your Realm's Death Logs To Go

If you want to make config editor a lot easier?
Go to [Cosmos Dashboard!](https://dashboard.cosmosbot.dev)
`)
            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
        const errors = new EmbedBuilder()
            .setColor(cgreen)
            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
            .setDescription(`
${WARNING} **Notice**
${end} This Is Not Your Command!
                            `)
            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
        const collector = interaction.channel.createMessageComponentCollector(
            { filter, time: 120000 }
        );
        collector.on("collect", async (i) => {
            if (i.customId === "aa" && i.user.id === interaction.user.id) {
                await i.deferUpdate();
                await i.editReply({ embeds: [aa], components: [] });
                collector.stop()
                return;
            } else if (
                i.customId === "gm" &&
                i.user.id === interaction.user.id
            ) {
                await i.deferUpdate();
                await i.editReply({ embeds: [gm], components: [] });
                collector.stop()
            } else if (
                i.customId === "oth" &&
                i.user.id === interaction.user.id
            ) {
                await i.deferUpdate();
                await i.editReply({ embeds: [other], components: [] });
                collector.stop()
            } else if (
                i.customId === "pr" &&
                i.user.id === interaction.user.id
            ) {
                await i.deferUpdate();
                await i.editReply({ embeds: [PremiumHelp], components: [] });
                collector.stop()
            } else if (
                i.customId === "logs" &&
                i.user.id === interaction.user.id
            ) {
                await i.deferUpdate();
                await i.editReply({ embeds: [logs], components: [] });
                collector.stop()
            } else {
                await i.deferUpdate();
                await i.editReply({ embeds: [errors], components: [] });
                collector.stop()
            }
        });
        collector.on("end", (collected) => {
            console.log(`Collected ${collected.size} items`)
            if (collected.size === 0) {
                const failed = new EmbedBuilder()
                    .setColor(cred)
                    .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                    .setDescription(`
${WARNING} **Ending Help Menu**
${end} You Have Not Clicked Any Of The Buttons
`)
                    .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()
                interaction.editReply({ embeds: [failed], components: [] })
            }
        });
    }
}