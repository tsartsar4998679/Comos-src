const { EmbedBuilder } = require("discord.js")
const fs = require('fs')
const { Authflow } = require('prismarine-auth')
const client = require('./Cosmos.js')
const editJsonFile = require("edit-json-file")
const { default: axios } = require("axios")
const { success, end, cred, denied, cgreen } = require("./constants.js")

class LivePlayerlist {
    constructor(realmId, guildId) {
        this.RealmId = realmId
        this.GuildId = guildId
        this.MainClient()
    }

    async MainClient() {
        new Authflow("", `./Database/Oauth/${this.GuildId}`, {
            flow: 'msal',
            relyingParty: "https://pocket.realms.minecraft.net/",
        })
            .getXboxToken()
            .then(async (PocketRealm) => {
                let file = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/config.json`);
                //Caches
                let players = editJsonFile(`./Database/PlayersDB/players.json`);
                let realmname = file.get(`RealmName`)
                let ClubPfp = file.get(`ClubPfp`)
                var ChannelId = file.get(`playerlist-live-embed`)
                var RealmId = this.RealmId
                var GuildId = this.GuildId

                var joinrequest = {
                    method: "get",
                    url: `https://pocket.realms.minecraft.net/activities/live/players`,
                    headers: {
                        "Cache-Control": "no-cache",
                        Charset: "utf-8",
                        "Client-Version": "1.17.41",
                        "User-Agent": "MCPE/UWP",
                        "Accept-Language": "en-US",
                        "Accept-Encoding": "gzip, deflate, br",
                        Host: "pocket.realms.minecraft.net",
                        Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
                    },
                };

                if (ChannelId) {
                    const interval = setInterval(() => {
                        axios(joinrequest)
                            .then(function (response) {
                                const deviceDB = editJsonFile('./Database/PlayersDB/DevicesDB.json');
                                const servers = response.data.servers;
                                let realmPlayers = null;

                                for (let i = 0; i < servers.length; i++) {
                                    const server = servers[i];
                                    if (server.id == RealmId) {
                                        realmPlayers = server.players;
                                        break;
                                    }
                                }

                                if (!realmPlayers) {
                                    const embed = new EmbedBuilder()
                                        .setColor(cgreen)
                                        .setThumbnail(ClubPfp)
                                        .setFooter({ text: `Cosmos Live Playerlist`})
                                        .setDescription(`
${success} **Current Playerlist** : (\`0/11\`)
${end} **Realm:** \`${realmname}\`

> Realm is empty...
                                    `)
                                    const guild = client.guilds.cache.get(GuildId);
                                    const channel = guild.channels.cache.get(ChannelId);
                                    channel.messages.fetch({ limit: 1 }).then(messages => {
                                        if (messages.author.id !== '1013898856653664317') {
                                            channel.send({ embeds: [embed] })
                                            .catch(console.error);
                                        }
                                        const lastMessage = messages.first();
                                        if (lastMessage) {
                                            lastMessage.edit({ embeds: [embed] })
                                                .catch(console.error);
                                        } else {
                                            channel.send({ embeds: [embed] })
                                                .catch(console.error);
                                        }
                                    });
                                }

                                if (realmPlayers) {
                                    const embed = new EmbedBuilder()
                                        .setColor(cgreen)
                                        .setThumbnail(ClubPfp)

                                    let description = '';
                                    description += `${success} **Current Playerlist** : (\`${realmPlayers.length}/11\`)\n`;
                                    description += `${end} **Realm:** \`${realmname}\`\n\n`;

                                    for (let i = 0; i < realmPlayers.length; i++) {
                                        let Permission = ``
                                        const player = realmPlayers[i];
                                        const uuid = player.uuid;
                                        const perms = player.permission;

                                        if (perms === 'OPERATOR') {
                                            Permission = `\`Operator\` <:operator:1123019994435956857> `
                                        } else if (perms === 'MEMBER') {
                                            Permission = `\`Member\` <:member:1123020045438701598> `
                                        } else if (perms === 'VISITOR') {
                                            Permission = `\`Visitor\` <:visitor:1123020112639836190> `
                                        }

                                        const storedPlayer = deviceDB.get(uuid) || {};
                                        const storedDevice = storedPlayer.device || 'Unable to fetch';
                                        const storedName = storedPlayer.name || 'Unable to fetch';

                                        description += `**(${i + 1})** ${storedName} - ${storedDevice}\n`;
                                        description += `${end} Permission: ${Permission}\n\n`;
                                    }

                                    embed.setDescription(description)
                                    embed.setFooter({ text: `Cosmos Live Playerlist`})

                                    const guild = client.guilds.cache.get(GuildId);
                                    const channel = guild.channels.cache.get(ChannelId);
                                    channel.messages.fetch({ limit: 1 }).then(messages => {
                                        const lastMessage = messages.first();
                                        if (lastMessage) {
                                            lastMessage.edit({ embeds: [embed] })
                                                .catch(console.error);
                                        } else {
                                            channel.send({ embeds: [embed] })
                                                .catch(console.error);
                                        }
                                    });
                                }
                            })
                            .catch((error) => {
                                fs.appendFileSync(`Error.txt`, `Realm: ${realmname} | ${error}\n`, err => {
                                    console.warn(err)
                                })
                            });
                    }, 10000);
                }
            }).catch((error) => {
                fs.appendFileSync(`Error.txt`, `Realm: ${realmname} | ${error}\n`, err => {
                    console.warn(err)
                })
            })
    }
}

module.exports = {
    LivePlayerlist
}