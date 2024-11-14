const { Events, ActivityType, Embed, EmbedBuilder } = require('discord.js');
require('colors');
const fs = require('node:fs');
const editJsonFile = require("edit-json-file");
const path = require('path');
const client = require('../Cosmos.js')

const cred = `#800020`;
const cgreen = `#228B22`;
const corange = `#FF3131`;
const cpurple = `#800080`;

//Emojis
let reply = `<:reply:1068634523522306068>`;
let end = `<:replay_end:1068634568502026391>`;
let success = `<:5104yes:1082793438359072858>`;
let denied = `<:4330no:1082793436920422530>`;
let warning = `<:warning2:1071174519252856943>`

module.exports = {
    name: Events.GuildDelete,
    execute(guild) {
        if (fs.existsSync(`./Database/BotAccounts/${guild.id}`)) {
            fs.rmdir(`./Database/BotAccounts/${guild.id}`)
        }
        if (fs.existsSync(`./Database/Oauth/${guild.id}`)) {
            fs.rmdir(`./Database/Oauth/${guild.id}`)
        }
        if (fs.existsSync(`./Database/realm/${guild.id}`)) {
            fs.rmdir(`./Database/realm/${guild.id}`)
        }
        try {
            const automod = `1088258826958012416`
            const iconHash = guild.icon;
            const ee = new EmbedBuilder()
                .setColor(cred)
                .setDescription(`
${denied} **Cosmos Has Left a Server!**
	
**__ Server Info __**
${reply} **Name:** \`${guild.name}\`
${reply} **ID:** \`${guild.id}\`
${reply} **Owner:** <@${guild.ownerId}>
${reply} **Owner ID:** \`${guild.ownerId}\`
${end} **MemberCount:** \`${guild.memberCount}\`
	`)
            if (iconHash) {
                const isAnimated = iconHash.startsWith('a_');
                const iconUrl = `https://cdn.discordapp.com/icons/${guild.id}/${iconHash}.${isAnimated ? 'gif' : 'png'}?size=256`;
                ee.setThumbnail(iconUrl)
            }
            client.channels
                .fetch(automod)
                .then(async (channel) => await channel.send({ embeds: [ee] }))
                .catch((error) => {
                    console.error(error);
                });
        } catch (e) {
            console.log(e)
        }
    }
}