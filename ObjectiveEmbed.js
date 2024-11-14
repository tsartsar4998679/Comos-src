const { EmbedBuilder } = require("discord.js")
const fs = require('fs')
const { Authflow } = require('prismarine-auth')
const client = require('./Cosmos.js')
const editJsonFile = require("edit-json-file")
const { default: axios } = require("axios")

class LiveObjective {
    constructor(realmId, guildId) {
        this.RealmId = realmId
        this.GuildId = guildId
        this.PocketProfile = null
        new Authflow("", `./Database/Oauth/${this.GuildId}`, {
            flow: 'msal',
            relyingParty: "https://pocket.realms.minecraft.net/",
        })
            .getXboxToken()
            .then(async (PocketRealm) => {
                this.PocketProfile = PocketRealm
                this.MainClient()
            }).catch((error) => {
                console.log(error)
                if (!fs.existsSync(`./Database/realm/${this.GuildId}/errors.txt`)) {
                    fs.writeFileSync(`./Database/realm/${this.GuildId}/errors.txt`, `Realm: ${realmname} | ${error.errorCode}\n`)
                } else {
                    fs.appendFileSync(`./Database/realm/${this.GuildId}/errors.txt`, `Realm: ${realmname} | ${error.errorCode}\n`, err => {
                        console.warn(err)
                        return
                    })
                }
            })
    }

    async MainClient() {
        let file = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/config.json`);
        //Caches
        let players = editJsonFile(`./Database/PlayersDB/players.json`);
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
                Authorization: `XBL3.0 x=${this.PocketProfile.userHash};${this.PocketProfile.XSTSToken}`,
            },
        };

        if (ChannelId) {
            console.log(`Channel Processed: ${ChannelId}`)
            const interval = setInterval(() => {
                console.log(`Initiating Interval`)
                axios(joinrequest)
                    .then(function (response) {
                        console.log(`Realm Processed: ${RealmId}`)
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

                        if (realmPlayers) {
                            const embed = new EmbedBuilder()
                                .setColor("Green")
                                .setThumbnail(ClubPfp)

                            let description = '';
                            description += `✅ **Current Playerlist** : (\`${realmPlayers.length}/11\`)\n`;
                            description += `🌐 **Realm:** \n\n`;

                            for (let i = 0; i < realmPlayers.length; i++) {
                                const player = realmPlayers[i];
                                const uuid = player.uuid;
                                const perms = player.permission;

                                const storedPlayer = deviceDB.get(uuid) || {};
                                const storedDevice = storedPlayer.device || 'Unable to fetch';
                                const storedName = storedPlayer.name || 'Unable to fetch';

                                description += `**(${i + 1})** ${storedName} - ${storedDevice}\n`;
                                description += `🔒 Permission: \`${perms}\`\n`;
                            }

                            embed.setDescription(description);

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
                    .catch(console.error);
            }, 10000);
        }
    }
}

module.exports = {
    LiveObjective
}