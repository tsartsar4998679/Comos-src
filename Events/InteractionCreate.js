const { Events, Collection, EmbedBuilder } = require('discord.js');
const { cooldowns } = require('../Cosmos.js')
const client = require('../Cosmos.js')
const fs = require('node:fs');
const { WARNING, denied, reply, end, success, cred } = require('../constants.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        const BlackListed = fs.readFileSync(`./Database/Blacklisted.json`);
        if (BlackListed.includes(interaction.user.id)) {
            const e = new EmbedBuilder()
                .setColor(cred)
                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                .setDescription(`
${denied} **__Blacklisted__**
${reply} You Have Been **Blacklisted** From Cosmos!
${end} You May Not Able To Use Cosmos Anymore!
        `)
                .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
            await interaction.reply({ embeds: [e], ephemeral: true });
            return
        }

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }
        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                const CooldownEmbed = new EmbedBuilder()
                    .setColor(cred)
                    .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()
                    .setDescription(`
${WARNING} **__ Command Cooldown __**
${reply} Command: \`${command.data.name}\`
${reply} Time Remaining: <t:${expiredTimestamp}:R>
${end} You are on a cooldown!
                    `)
                return interaction.reply({ embeds: [CooldownEmbed], ephemeral: true });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            await command.execute(interaction);

            const CommandLoggings = `1093234187957444628`
            const guild = interaction.guild;
            const iconHash = guild.icon;
            const ee = new EmbedBuilder()
                .setColor(cred)
                .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
                .setDescription(`
${success} **Command Execution**
${reply} **Name:** \`${interaction.commandName} ${interaction.options._subcommand}\`
${end} **Id:** \`${interaction.commandId}\`
    
**__ Guild Info __**
${reply} **Name:** \`${guild}\`
${end} **Id:** \`${guild.id}\`
    `)
            if (iconHash) {
                const isAnimated = iconHash.startsWith('a_');
                const iconUrl = `https://cdn.discordapp.com/icons/${guild.id}/${iconHash}.${isAnimated ? 'gif' : 'png'}?size=256`;
                ee.setThumbnail(iconUrl)
            }
            client.channels
                .fetch(CommandLoggings)
                .then(async (channel) => await channel.send({ embeds: [ee] }))
                .catch((error) => {
                    console.error(error);
                });
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};