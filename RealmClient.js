const devices = [
    "Unknown",
    "Android",
    "IOS",
    "OSX",
    "FireOS",
    "GearVR",
    "Hololens",
    "Windows 10",
    "Windows 32",
    "Dedicated",
    "TVOS",
    "Playstation",
    "NintendoSwitch",
    "Xbox",
    "WindowsPhone",
    "Linux",
];
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
} = require('./constants.js');
const removed = `<:4805_red_minus:1082798537877770370>`;
const add = `<:8090_green_plus:1082798539379331102>`;
const editJsonFile = require("edit-json-file");
const axios = require("axios");
const { createClient } = require("bedrock-protocol");
const { Authflow } = require("prismarine-auth");
const fs = require("fs");
const path = require('path');
const Canvas = require('canvas');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { performance } = require('perf_hooks');
const prefix = '!'
const Jimp = require('jimp')
const DiscordClient = require('./Cosmos.js')
require('colors');
const moment = require('moment-timezone');
const EST = 'America/New_York';
moment.tz.setDefault(EST);

const logs = `1088270010176249876`

let rA = 1
let max = 3

class ClientStart {
    constructor(realmId, guildId, interaction) {
        this.RealmId = realmId
        this.GuildId = guildId
        this.CR = false
        this.Client = null
        this.Interaction = interaction
        this.date = new Date().toLocaleString(undefined, { hour12: true })
        this.XboxProfile = null
        this.StartClient()
        new Authflow("", `./Database/BotAccounts/${this.GuildId}`, {
            flow: 'msal',
            relyingParty: "http://xboxlive.com",
        })
            .getXboxToken()
            .then(async (Xbox) => {
                this.XboxProfile = Xbox
            }).catch((error) => {
                fs.appendFileSync(`Error.txt`, `Realm: ${this.realmId} | ${error}\n`, err => {
                    console.warn(err)
                })
                return
            })
    }

    async StartClient() {
        this.Client = await this.CreateMainClient()
        let file = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/config.json`);
        let realmname = file.get(`RealmName`)
        console.log(`[+]`.bold.yellow + ` Bot Created `.bold.red + ` | Realm Name: ${realmname} (${this.RealmId})`.green + ` Time: ${this.date}`.cyan)
        this.MainClient()
    }

    async CreateMainClient() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let file = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/config.json`);
                let realmname = file.get(`RealmName`)
                try {
                    const c = createClient({
                        profilesFolder: `./Database/BotAccounts/${this.GuildId}`,
                        connectTimeout: 10000,
                        autoInitPlayer: true,
                        skipPing: true,
                        realms: {
                            realmId: this.RealmId
                        }
                    })
                    resolve(c)
                } catch (error) {
                    if (!fs.existsSync(`./Database/realm/${this.GuildId}/errors.txt`)) {
                        fs.mkdir(`./Database/realm/${this.GuildId}/errors.txt`)
                    } else {
                        fs.appendFileSync(`./Database/realm/${this.GuildId}/errors.txt`, `Realm: ${realmname} | ${error.message}`, err => {
                            console.warn(err)
                        })
                    }
                    reject(e)
                }
            }, 1500)
        })
    }

    async MainClient() {
        const XboxAuth = JSON.parse(JSON.stringify({
            'x-xbl-contract-version': '2',
            'Authorization': `XBL3.0 x=${this.XboxProfile.userHash};${this.XboxProfile.XSTSToken}`,
            'Accept-Language': "en-US",
            maxRedirects: 1,
        }))

        this.Client.on('play_status', (packet) => {
            let file = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/config.json`);
            //Caches
            let players = editJsonFile(`./Database/PlayersDB/players.json`);
            let devicesDB = editJsonFile(`./Database/PlayersDB/DevicesDB.json`);
            let RecentsDB = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/recents.json`)
            let LastSeenDB = editJsonFile(`./Database/PlayersDB/Lastseen/lastseen.json`)

            //Configs
            let JoinLeaves = file.get('Join-Leave-Logs')
            let ConsoleChat = file.get(`ConsoleChannel`);
            let realmname = file.get(`RealmName`)
            let logs = file.get(`Join-Leave-Logs`);
            let discordCode = ''
            let automod = file.get(`Automod-Logs`)
            let format = file.get(`embedformat`);
            let antiinvis = file.get(`antiinvis`);
            let ClubPfp = file.get(`ClubPfp`)
            let ChatLogs = file.get(`Chat-Relay-Logs`);
            let ChatType = file.get(`chattype`);
            let DeathLogs = file.get(`Death-Logs`);
            const PremiumNow = Math.floor(Date.now() / 1000);
            const Premium = file.get("PremiumTime") ?? 0
            if (packet.status === 'player_spawn') {
                const ClientData = {
                    X: this.Client.startGameData.player_position.x.toFixed(),
                    Y: this.Client.startGameData.player_position.y.toFixed(),
                    Z: this.Client.startGameData.player_position.z.toFixed(),
                    username: this.Client.profile.name,
                    Clubpfp: ClubPfp
                }
                const Embed = new EmbedBuilder()
                    .setAuthor({ name: `Realm: ${realmname}`, iconURL: ClientData.Clubpfp })
                    .setDescription(`
${success} **Connection Established**
${reply} Username: \`${ClientData.username}\`
${end} Location: \`X: ${ClientData.X}, Y: ${ClientData.Y}, Z: ${ClientData.Z}\`
                `)
                    .setFooter({ text: `Requested By ${this.Interaction.user.tag}`, iconURL: this.Interaction.user.displayAvatarURL() })
                    .setTimestamp()
                this.Interaction.editReply({ embeds: [Embed], components: [] })
                console.log(`[+]`.bold.green + ` Bot Spawned `.bold.red + ` | Realm Name: ${realmname} (${this.RealmId})`.green + ` Time: ${this.date}`.cyan)
                const LOGS = `1088270010176249876`
                const embed = new EmbedBuilder()
                    .setColor(cgreen)
                    .setDescription(`
${success} **New Connection**

**__ Realm Info __**
${reply} **Name:** ${realmname}
${reply} **ID:** ${this.RealmId}
${end} Successfully Connected
`)
                    .setTimestamp();
                DiscordClient.channels
                    .fetch(LOGS)
                    .then(async (channel) => await channel.send({ embeds: [embed] }))
                    .catch((error) => {
                        fs.appendFileSync(`Error.txt`, `Realm: ${realmname} | ${error}\n`, err => {
                            console.warn(err)
                        })
                    });
            }
        })

        this.Client.on('player_list', (packet) => {
            let file = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/config.json`);
            //Caches
            let players = editJsonFile(`./Database/PlayersDB/players.json`);
            let devicesDB = editJsonFile(`./Database/PlayersDB/DevicesDB.json`);
            let RecentsDB = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/recents.json`)
            let LastSeenDB = editJsonFile(`./Database/PlayersDB/Lastseen/lastseen.json`)

            //Configs
            let JoinLeaves = file.get('Join-Leave-Logs')
            let ConsoleChat = file.get(`ConsoleChannel`);
            let realmname = file.get(`RealmName`)
            let logs = file.get(`Join-Leave-Logs`);
            let discordCode = ''
            let automod = file.get(`Automod-Logs`)
            let format = file.get(`embedformat`);
            let antiinvis = file.get(`antiinvis`);
            let ClubPfp = file.get(`ClubPfp`)
            let ChatLogs = file.get(`Chat-Relay-Logs`);
            let ChatType = file.get(`chattype`);
            let DeathLogs = file.get(`Death-Logs`);
            const PremiumNow = Math.floor(Date.now() / 1000);
            const Premium = file.get("PremiumTime") ?? 0
            if (Premium === 0) {
                discordCode = 'discord.gg/kNUVpUJNzC'
            } else {
                if (PremiumNow > Premium) {
                    discordCode = file.get('discordCode')
                } else {
                    discordCode = 'discord.gg/kNUVpUJNzC'
                }
            }
            const now = moment();
            const unixTimestamp = now.unix();
            const startTime = performance.now();
            if (packet.records.type === "add") {
                packet.records.records.forEach((player) => {
                    this.IncreaseJoins()
                    devicesDB.set(`${player.xbox_user_id}`, {
                        device: devices[player.build_platform],
                        name: player.username
                    });
                    devicesDB.save();

                    RecentsDB.set(`${player.xbox_user_id}`, {
                        time: unixTimestamp,
                        username: player.username,
                        device: devices[player.build_platform]
                    });
                    RecentsDB.save();

                    LastSeenDB.set(`${player.xbox_user_id}`, {
                        time: unixTimestamp,
                        username: player.username,
                        device: devices[player.build_platform],
                        realm: realmname
                    });
                    LastSeenDB.save();
                    this.Client.write("command_request", {
                        command: `tellraw @a {"rawtext":[{"text":"§7[§5CosmosAC§7] | ${player.username} has joined! (Device: ${devices[player.build_platform]})"}]}`,
                        version: 2,
                        origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                        },
                    })
                    if (format === "Gamerpic") {
                        if (players.get(player.uuid)) {
                            const storedPlayer = players.get(player.uuid);
                            const storedName = storedPlayer.name
                            const storedPfp = storedPlayer.pfp;
                            const storedXuid = storedPlayer.xuid
                            if (storedName !== player.username) {
                                players.set(`${player.uuid}`, {
                                    xuid: player.xbox_user_id,
                                    pfp: storedPfp,
                                    name: player.username
                                });
                                players.save();
                            }
                            this.CosmosAutomod(
                                player.username,
                                player.xbox_user_id,
                                storedPfp,
                                devices[player.build_platform]
                            )

                            console.log(`[+]`.bold.green + ` Username: ${player.username} - ${player.xbox_user_id} | ${realmname} `.yellow + ` Time: ${this.date}`.cyan)
                            if (logs) {
                                const ConnectedEmbed = new EmbedBuilder()
                                    .setColor(cgreen)
                                    .setThumbnail(storedPfp)
                                    .setDescription(`
${add} ${player.username} __Connected__

**__ Player Info __**
${reply} **Xuid:** \`${player.xbox_user_id}\`
${end} **Device:** \`${devices[player.build_platform]}\`
`)
                                    .setFooter({ text: `Realm: ${realmname}` })
                                    .setTimestamp();
                                this.SendEmbed(JoinLeaves, ConnectedEmbed)
                            }
                        } else {
                            console.log(`[+]`.bold.green + ` Username: ${player.username} - ${player.xbox_user_id} | ${realmname} `.yellow + ` Time: ${this.date}`.cyan)
                            axios
                                .get(`https://profile.xboxlive.com/users/gt(${(player.username)})/profile/settings?settings=GameDisplayPicRaw`, {
                                    headers: XboxAuth,
                                    timeout: 5000
                                })
                                .then((res) => {
                                    const pfp = res?.data?.profileUsers[0]?.settings[0]?.value
                                    players.set(`${player.uuid}`, {
                                        xuid: player.xbox_user_id,
                                        pfp: pfp,
                                        name: player.username
                                    });
                                    players.save();
                                    this.CosmosAutomod(
                                        player.username,
                                        player.xbox_user_id,
                                        pfp,
                                        devices[player.build_platform]
                                    )
                                    if (logs) {
                                        const ConnectedEmbed = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setThumbnail(storedPfp)
                                            .setDescription(`
${add} ${player.username} __Connected__

**__ Player Info __**
${reply} **Xuid:** \`${player.xbox_user_id}\`
${end} **Device:** \`${devices[player.build_platform]}\`
`)
                                            .setFooter({ text: `Realm: ${realmname}` })
                                            .setTimestamp();
                                        this.SendEmbed(JoinLeaves, ConnectedEmbed)
                                    }
                                })
                                .catch((error) => {
                                    fs.appendFileSync(`Error.txt`, `Realm: ${realmname} | ${error}\n`, err => {
                                        console.warn(err)
                                    })
                                });
                        }
                    }
                    if (format === "SkinFace") {
                        if (players.get(player.uuid)) {
                            console.log(`[+]`.bold.green + ` Username: ${player.username} - ${player.xbox_user_id} | ${realmname} `.yellow + ` Time: ${this.date}`.cyan)
                            const storedPlayer = players.get(player.uuid);
                            const storedName = storedPlayer.name
                            const storedPfp = storedPlayer.pfp;
                            const storedXuid = storedPlayer.xuid
                            this.CosmosAutomod(
                                player.username,
                                player.xbox_user_id,
                                storedPfp,
                                devices[player.build_platform]
                            )
                            if (logs) {
                                //Face Save
                                if (player.skin_data?.skin_data?.width == 256 && player.skin_data?.skin_data?.height == 256) {
                                    const skin_data = player.skin_data.skin_data.data;
                                    const headTexture = skin_data.slice(0, 32768);
                                    const canvas = Canvas.createCanvas(256, 256);
                                    const ctx = canvas.getContext('2d');
                                    const headImageData = ctx.createImageData(256, 256);

                                    // Decode the skin data and draw it onto the canvas
                                    for (let i = 0; i < 32768; i++) {
                                        headImageData.data[i * 4] = headTexture[i * 4];
                                        headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                        headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                        headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                    }
                                    ctx.putImageData(headImageData, 0, 0);

                                    // Create a new canvas to hold the combined face
                                    const faceCanvas = Canvas.createCanvas(16, 16);
                                    const faceCtx = faceCanvas.getContext('2d');
                                    const faceImageData = faceCtx.createImageData(16, 16);

                                    // Extract the first layer face data from the head image data
                                    for (let y = 0; y < 16; y++) {
                                        for (let x = 0; x < 16; x++) {
                                            const i = ((y * 16) + x) * 4;
                                            const j = ((y + 16) * 256 + x + 16) * 4;
                                            faceImageData.data[i] = headImageData.data[j];
                                            faceImageData.data[i + 1] = headImageData.data[j + 1];
                                            faceImageData.data[i + 2] = headImageData.data[j + 2];
                                            faceImageData.data[i + 3] = headImageData.data[j + 3];
                                        }
                                    }
                                    faceCtx.putImageData(faceImageData, 0, 0);

                                    // Extract the second layer face data from the head image data
                                    const face2Canvas = Canvas.createCanvas(16, 16);
                                    const face2Ctx = face2Canvas.getContext('2d');
                                    const face2ImageData = face2Ctx.createImageData(16, 16);

                                    for (let y = 0; y < 16; y++) {
                                        for (let x = 0; x < 16; x++) {
                                            const i = ((y * 16) + x) * 4;
                                            const j = ((y + 16) * 256 + x + 16 + 64) * 4;
                                            face2ImageData.data[i] = headImageData.data[j];
                                            face2ImageData.data[i + 1] = headImageData.data[j + 1];
                                            face2ImageData.data[i + 2] = headImageData.data[j + 2];
                                            face2ImageData.data[i + 3] = headImageData.data[j + 3];
                                        }
                                    }
                                    face2Ctx.putImageData(face2ImageData, 0, 0);

                                    // Create a new canvas to hold the combined face
                                    const combinedCanvas = Canvas.createCanvas(16, 16);
                                    const combinedCtx = combinedCanvas.getContext('2d');

                                    // Set the blend mode to 'source-over' to draw the second layer on top of the first layer
                                    combinedCtx.globalCompositeOperation = 'source-over';

                                    // Draw the first layer on the canvas
                                    combinedCtx.drawImage(faceCanvas, 0, 0);

                                    // Draw the second layer on top of the first layer
                                    combinedCtx.drawImage(face2Canvas, 0, 0);

                                    // Resize the combined face image to embed thumbnail size (Discord default is 80x80)
                                    const thumbCanvas = Canvas.createCanvas(80, 80);
                                    const thumbCtx = thumbCanvas.getContext('2d');
                                    thumbCtx.imageSmoothingEnabled = false;
                                    thumbCtx.drawImage(combinedCanvas, 0, 0, 16, 16, 0, 0, 80, 80);
                                    const pngStream = thumbCanvas.createPNGStream();
                                    const chunks = [];
                                    pngStream.on('data', (chunk) => chunks.push(chunk));
                                    pngStream.on('end', () => {
                                        const buffer = Buffer.concat(chunks);
                                        const skinDirectory = path.join(__dirname, 'Database/PlayersDB/Skins', player.username);

                                        if (!fs.existsSync(skinDirectory)) {
                                            fs.mkdirSync(skinDirectory, { recursive: true });
                                        }

                                        // Check if the skin already exists
                                        let skinExists = false;
                                        let skinPath, skinFilename, thumbnailUrl, skinAttachment;

                                        fs.readdirSync(skinDirectory).forEach((filename) => {
                                            const filePath = path.join(skinDirectory, filename);
                                            if (fs.lstatSync(filePath).isFile()) {
                                                const fileData = fs.readFileSync(filePath);
                                                if (buffer.equals(fileData)) {
                                                    skinExists = true;
                                                    skinPath = filePath;
                                                    skinFilename = filename;
                                                    thumbnailUrl = `attachment://${filename}`;
                                                    skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                                }
                                            }
                                        });

                                        if (!skinExists) {
                                            skinFilename = `${player.xbox_user_id}.png`;
                                            skinPath = path.join(skinDirectory, skinFilename);

                                            fs.writeFile(skinPath, buffer, (err) => {
                                                if (err) throw err;

                                            });

                                            thumbnailUrl = `attachment://${skinFilename}`;
                                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                        } else {
                                            // Update the file name and path of the new skin file
                                            skinFilename = `${player.xbox_user_id}.png`;
                                            skinPath = path.join(skinDirectory, skinFilename);

                                            fs.writeFile(skinPath, buffer, (err) => {
                                                if (err) throw err;

                                            });

                                            thumbnailUrl = `attachment://${skinFilename}`;
                                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                            // Delete the old skin file
                                            fs.unlinkSync(skinPath);
                                        }

                                        const ConnectedEmbed = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setThumbnail(thumbnailUrl)
                                            .setDescription(`
${add} ${player.username} __Connected__

**__ Player Info __**
${reply} **Xuid:** \`${player.xbox_user_id}\`
${end} **Device:** \`${devices[player.build_platform]}\`
`)
                                            .setFooter({ text: `Realm: ${realmname}` })
                                            .setTimestamp();

                                        this.SendEmbed(JoinLeaves, ConnectedEmbed, skinAttachment)
                                    })
                                }
                                if (player.skin_data?.skin_data?.width == 128 && player.skin_data?.skin_data?.height == 128) {
                                    const skin_data = player.skin_data.skin_data.data;
                                    const headTexture = skin_data.slice(0, 16384);
                                    const canvas = Canvas.createCanvas(128, 128);
                                    const ctx = canvas.getContext('2d');
                                    const headImageData = ctx.createImageData(128, 128);

                                    // Decode the skin data and draw it onto the canvas
                                    for (let i = 0; i < 16384; i++) {
                                        headImageData.data[i * 4] = headTexture[i * 4];
                                        headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                        headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                        headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                    }
                                    ctx.putImageData(headImageData, 0, 0);

                                    // Create a new canvas to hold the combined face
                                    const faceCanvas = Canvas.createCanvas(16, 16);
                                    const faceCtx = faceCanvas.getContext('2d');
                                    const faceImageData = faceCtx.createImageData(16, 16);

                                    // Extract the first layer face data from the head image data
                                    for (let y = 0; y < 16; y++) {
                                        for (let x = 0; x < 16; x++) {
                                            const i = ((y * 16) + x) * 4;
                                            const j = ((y + 16) * 128 + x + 16) * 4;
                                            faceImageData.data[i] = headImageData.data[j];
                                            faceImageData.data[i + 1] = headImageData.data[j + 1];
                                            faceImageData.data[i + 2] = headImageData.data[j + 2];
                                            faceImageData.data[i + 3] = headImageData.data[j + 3];
                                        }
                                    }
                                    faceCtx.putImageData(faceImageData, 0, 0);

                                    // Extract the second layer face data from the head image data
                                    const face2Canvas = Canvas.createCanvas(16, 16);
                                    const face2Ctx = face2Canvas.getContext('2d');
                                    const face2ImageData = face2Ctx.createImageData(16, 16);

                                    for (let y = 0; y < 16; y++) {
                                        for (let x = 0; x < 16; x++) {
                                            const i = ((y * 16) + x) * 4;
                                            const j = ((y + 16) * 128 + x + 16 + 64) * 4;
                                            face2ImageData.data[i] = headImageData.data[j];
                                            face2ImageData.data[i + 1] = headImageData.data[j + 1];
                                            face2ImageData.data[i + 2] = headImageData.data[j + 2];
                                            face2ImageData.data[i + 3] = headImageData.data[j + 3];
                                        }
                                    }
                                    face2Ctx.putImageData(face2ImageData, 0, 0);

                                    // Create a new canvas to hold the combined face
                                    const combinedCanvas = Canvas.createCanvas(16, 16);
                                    const combinedCtx = combinedCanvas.getContext('2d');

                                    // Set the blend mode to 'source-over' to draw the second layer on top of the first layer
                                    combinedCtx.globalCompositeOperation = 'source-over';

                                    // Draw the first layer on the canvas
                                    combinedCtx.drawImage(faceCanvas, 0, 0);

                                    // Draw the second layer on top of the first layer
                                    combinedCtx.drawImage(face2Canvas, 0, 0);

                                    // Resize the combined face image to embed thumbnail size (Discord default is 80x80)
                                    const thumbCanvas = Canvas.createCanvas(80, 80);
                                    const thumbCtx = thumbCanvas.getContext('2d');
                                    thumbCtx.imageSmoothingEnabled = false;
                                    thumbCtx.drawImage(combinedCanvas, 0, 0, 16, 16, 0, 0, 80, 80);
                                    // Convert the thumbnail canvas to a PNG stream
                                    const pngStream = thumbCanvas.createPNGStream();
                                    const chunks = [];
                                    pngStream.on('data', (chunk) => chunks.push(chunk));
                                    pngStream.on('end', () => {
                                        const buffer = Buffer.concat(chunks);
                                        const skinDirectory = path.join(__dirname, 'Database/PlayersDB/Skins', player.username);

                                        if (!fs.existsSync(skinDirectory)) {
                                            fs.mkdirSync(skinDirectory, { recursive: true });
                                        }

                                        // Check if the skin already exists
                                        let skinExists = false;
                                        let skinPath, skinFilename, thumbnailUrl, skinAttachment;

                                        fs.readdirSync(skinDirectory).forEach((filename) => {
                                            const filePath = path.join(skinDirectory, filename);
                                            if (fs.lstatSync(filePath).isFile()) {
                                                const fileData = fs.readFileSync(filePath);
                                                if (buffer.equals(fileData)) {
                                                    skinExists = true;
                                                    skinPath = filePath;
                                                    skinFilename = filename;
                                                    thumbnailUrl = `attachment://${filename}`;
                                                    skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                                }
                                            }
                                        });

                                        if (!skinExists) {
                                            skinFilename = `${player.xbox_user_id}.png`;
                                            skinPath = path.join(skinDirectory, skinFilename);

                                            fs.writeFile(skinPath, buffer, (err) => {
                                                if (err) throw err;

                                            });

                                            thumbnailUrl = `attachment://${skinFilename}`;
                                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                        } else {
                                            // Update the file name and path of the new skin file
                                            skinFilename = `${player.xbox_user_id}.png`;
                                            skinPath = path.join(skinDirectory, skinFilename);

                                            fs.writeFile(skinPath, buffer, (err) => {
                                                if (err) throw err;

                                            });

                                            thumbnailUrl = `attachment://${skinFilename}`;
                                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                            // Delete the old skin file
                                            fs.unlinkSync(skinPath);
                                        }

                                        const ConnectedEmbed = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setThumbnail(thumbnailUrl)
                                            .setDescription(`
${add} ${player.username} __Connected__

**__ Player Info __**
${reply} **Xuid:** \`${player.xbox_user_id}\`
${end} **Device:** \`${devices[player.build_platform]}\`
`)
                                            .setFooter({ text: `Realm: ${realmname}` })
                                            .setTimestamp();

                                        this.SendEmbed(JoinLeaves, ConnectedEmbed, skinAttachment)
                                    })
                                }
                                if (player.skin_data?.skin_data?.width == 64 && player.skin_data?.skin_data?.height == 64) {
                                    const skin_data = player.skin_data.skin_data.data;
                                    const headTexture = skin_data.slice(0, 4096);
                                    const canvas = Canvas.createCanvas(64, 64);
                                    const ctx = canvas.getContext('2d');
                                    const headImageData = ctx.createImageData(64, 64);

                                    // Decode the skin data and draw it onto the canvas
                                    for (let i = 0; i < 4096; i++) {
                                        headImageData.data[i * 4] = headTexture[i * 4];
                                        headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                        headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                        headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                    }
                                    ctx.putImageData(headImageData, 0, 0);

                                    // Create a new canvas to hold the combined face
                                    const faceCanvas = Canvas.createCanvas(8, 8);
                                    const faceCtx = faceCanvas.getContext('2d');
                                    const faceImageData = faceCtx.createImageData(8, 8);

                                    // Extract the first layer face data from the head image data
                                    const invisibleFacePixels = [];
                                    for (let y = 0; y < 8; y++) {
                                        for (let x = 0; x < 8; x++) {
                                            const i = ((y * 8) + x) * 4;
                                            const j = ((y + 8) * 64 + x + 8) * 4;
                                            if (headImageData.data[j + 3] === 0) {
                                                invisibleFacePixels.push([x, y]);
                                            }
                                            faceImageData.data[i] = headImageData.data[j];
                                            faceImageData.data[i + 1] = headImageData.data[j + 1];
                                            faceImageData.data[i + 2] = headImageData.data[j + 2];
                                            faceImageData.data[i + 3] = headImageData.data[j + 3];
                                        }
                                    }
                                    faceCtx.putImageData(faceImageData, 0, 0);

                                    // Extract the second layer face data from the head image data
                                    const face2Canvas = Canvas.createCanvas(8, 8);
                                    const face2Ctx = face2Canvas.getContext('2d');
                                    const face2ImageData = face2Ctx.createImageData(8, 8);

                                    for (let y = 0; y < 8; y++) {
                                        for (let x = 0; x < 8; x++) {
                                            const i = ((y * 8) + x) * 4;
                                            const j = ((y + 8) * 64 + x + 8 + 32) * 4;
                                            face2ImageData.data[i] = headImageData.data[j];
                                            face2ImageData.data[i + 1] = headImageData.data[j + 1];
                                            face2ImageData.data[i + 2] = headImageData.data[j + 2];
                                            face2ImageData.data[i + 3] = headImageData.data[j + 3];
                                        }
                                    }
                                    face2Ctx.putImageData(face2ImageData, 0, 0);

                                    // Create a new canvas to hold the combined face
                                    const combinedCanvas = Canvas.createCanvas(8, 8);
                                    const combinedCtx = combinedCanvas.getContext('2d');

                                    // Set the blend mode to 'source-over' to draw the second layer on top of the first layer
                                    combinedCtx.globalCompositeOperation = 'source-over';

                                    // Draw the first layer on the canvas
                                    combinedCtx.drawImage(faceCanvas, 0, 0, 8, 8);
                                    combinedCtx.drawImage(face2Canvas, 0, 0, 8, 8);

                                    // Resize the combined face image to embed thumbnail size (Discord default is 80x80)
                                    const thumbCanvas = Canvas.createCanvas(80, 80);
                                    const thumbCtx = thumbCanvas.getContext('2d');
                                    thumbCtx.imageSmoothingEnabled = false;
                                    thumbCtx.drawImage(combinedCanvas, 0, 0, 8, 8, 0, 0, 80, 80);

                                    const pngStream = thumbCanvas.createPNGStream();
                                    const chunks = [];
                                    pngStream.on('data', (chunk) => chunks.push(chunk));
                                    pngStream.on('end', () => {
                                        const buffer = Buffer.concat(chunks);
                                        const skinDirectory = path.join(__dirname, 'Database/PlayersDB/Skins', player.username);

                                        if (!fs.existsSync(skinDirectory)) {
                                            fs.mkdirSync(skinDirectory, { recursive: true });
                                        }

                                        // Check if the skin already exists
                                        let skinExists = false;
                                        let skinPath, skinFilename, thumbnailUrl, skinAttachment;

                                        fs.readdirSync(skinDirectory).forEach((filename) => {
                                            const filePath = path.join(skinDirectory, filename);
                                            if (fs.lstatSync(filePath).isFile()) {
                                                const fileData = fs.readFileSync(filePath);
                                                if (buffer.equals(fileData)) {
                                                    skinExists = true;
                                                    skinPath = filePath;
                                                    skinFilename = filename;
                                                    thumbnailUrl = `attachment://${filename}`;
                                                    skinAttachment = new AttachmentBuilder(fileData, { name: filename });

                                                }
                                            }
                                        });

                                        if (!skinExists) {
                                            skinFilename = `${player.xbox_user_id}.png`;
                                            skinPath = path.join(skinDirectory, skinFilename);

                                            fs.writeFile(skinPath, buffer, (err) => {
                                                if (err) throw err;

                                            });

                                            thumbnailUrl = `attachment://${skinFilename}`;
                                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                        } else {
                                            // Update the file name and path of the new skin file
                                            skinFilename = `${player.xbox_user_id}.png`;
                                            skinPath = path.join(skinDirectory, skinFilename);

                                            fs.writeFile(skinPath, buffer, (err) => {
                                                if (err) throw err;

                                            });

                                            thumbnailUrl = `attachment://${skinFilename}`;
                                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                            // Delete the old skin file
                                            fs.unlinkSync(skinPath);
                                        }
                                        const ConnectedEmbed = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setThumbnail(thumbnailUrl)
                                            .setDescription(`
${add} ${player.username} __Connected__

**__ Player Info __**
${reply} **Xuid:** \`${player.xbox_user_id}\`
${end} **Device:** \`${devices[player.build_platform]}\`
`)
                                            .setFooter({ text: `Realm: ${realmname}` })
                                            .setTimestamp();

                                        this.SendEmbed(JoinLeaves, ConnectedEmbed, skinAttachment)

                                    })
                                }
                                if (player.skin_data?.skin_data?.width == 32 && player.skin_data?.skin_data?.height == 32) {
                                    console.log(player.username, "32x32")
                                    const skin_data = player.skin_data.skin_data.data;
                                    const headTexture = skin_data.slice(0, 1024);
                                    const canvas = Canvas.createCanvas(32, 32);
                                    const ctx = canvas.getContext('2d');
                                    const headImageData = ctx.createImageData(32, 32);

                                    // Decode the skin data and draw it onto the canvas
                                    for (let i = 0; i < 1024; i++) {
                                        headImageData.data[i * 4] = headTexture[i * 4];
                                        headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                        headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                        headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                    }
                                    ctx.putImageData(headImageData, 0, 0);

                                    // Create a new canvas to hold the combined face
                                    const faceCanvas = Canvas.createCanvas(8, 8);
                                    const faceCtx = faceCanvas.getContext('2d');
                                    const faceImageData = faceCtx.createImageData(8, 8);

                                    // Extract the first layer face data from the head image data
                                    for (let y = 0; y < 8; y++) {
                                        for (let x = 0; x < 8; x++) {
                                            const i = ((y * 8) + x) * 4;
                                            const j = ((y + 8) * 64 + x + 8) * 4;
                                            faceImageData.data[i] = headImageData.data[j];
                                            faceImageData.data[i + 1] = headImageData.data[j + 1];
                                            faceImageData.data[i + 2] = headImageData.data[j + 2];
                                            faceImageData.data[i + 3] = headImageData.data[j + 3];
                                        }
                                    }
                                    faceCtx.putImageData(faceImageData, 0, 0);

                                    // Extract the second layer face data from the head image data
                                    const face2Canvas = Canvas.createCanvas(8, 8);
                                    const face2Ctx = face2Canvas.getContext('2d');
                                    const face2ImageData = face2Ctx.createImageData(8, 8);

                                    for (let y = 0; y < 8; y++) {
                                        for (let x = 0; x < 8; x++) {
                                            const i = ((y * 8) + x) * 4;
                                            const j = ((y + 8) * 64 + x + 8 + 32) * 4;
                                            face2ImageData.data[i] = headImageData.data[j];
                                            face2ImageData.data[i + 1] = headImageData.data[j + 1];
                                            face2ImageData.data[i + 2] = headImageData.data[j + 2];
                                            face2ImageData.data[i + 3] = headImageData.data[j + 3];
                                        }
                                    }
                                    face2Ctx.putImageData(face2ImageData, 0, 0);

                                    // Create a new canvas to hold the combined face
                                    const combinedCanvas = Canvas.createCanvas(8, 8);
                                    const combinedCtx = combinedCanvas.getContext('2d');

                                    // Set the blend mode to 'source-over' to draw the second layer on top of the first layer
                                    combinedCtx.globalCompositeOperation = 'source-over';

                                    // Draw the first layer on the canvas
                                    combinedCtx.drawImage(faceCanvas, 0, 0, 8, 8);
                                    combinedCtx.drawImage(face2Canvas, 0, 0, 8, 8);

                                    // Resize the combined face image to embed thumbnail size (Discord default is 80x80)
                                    const thumbCanvas = Canvas.createCanvas(80, 80);
                                    const thumbCtx = thumbCanvas.getContext('2d');
                                    thumbCtx.imageSmoothingEnabled = false;
                                    thumbCtx.drawImage(combinedCanvas, 0, 0, 8, 8, 0, 0, 80, 80);
                                    const pngStream = thumbCanvas.createPNGStream();
                                    const chunks = [];
                                    pngStream.on('data', (chunk) => chunks.push(chunk));
                                    pngStream.on('end', () => {
                                        const buffer = Buffer.concat(chunks);
                                        const skinDirectory = path.join(__dirname, 'Database/PlayersDB/Skins', player.username);

                                        if (!fs.existsSync(skinDirectory)) {
                                            fs.mkdirSync(skinDirectory, { recursive: true });
                                        }

                                        // Check if the skin already exists
                                        let skinExists = false;
                                        let skinPath, skinFilename, thumbnailUrl, skinAttachment;

                                        fs.readdirSync(skinDirectory).forEach((filename) => {
                                            const filePath = path.join(skinDirectory, filename);
                                            if (fs.lstatSync(filePath).isFile()) {
                                                const fileData = fs.readFileSync(filePath);
                                                if (buffer.equals(fileData)) {
                                                    skinExists = true;
                                                    skinPath = filePath;
                                                    skinFilename = filename;
                                                    thumbnailUrl = `attachment://${filename}`;
                                                    skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                                }
                                            }
                                        });

                                        if (!skinExists) {
                                            skinFilename = `${player.xbox_user_id}.png`;
                                            skinPath = path.join(skinDirectory, skinFilename);

                                            fs.writeFile(skinPath, buffer, (err) => {
                                                if (err) throw err;

                                            });

                                            thumbnailUrl = `attachment://${skinFilename}`;
                                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                        } else {
                                            // Update the file name and path of the new skin file
                                            skinFilename = `${player.xbox_user_id}.png`;
                                            skinPath = path.join(skinDirectory, skinFilename);

                                            fs.writeFile(skinPath, buffer, (err) => {
                                                if (err) throw err;

                                            });

                                            thumbnailUrl = `attachment://${skinFilename}`;
                                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                            // Delete the old skin file
                                            fs.unlinkSync(skinPath);
                                        }

                                        const ConnectedEmbed = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setThumbnail(thumbnailUrl)
                                            .setDescription(`
${add} ${player.username} __Connected__

**__ Player Info __**
${reply} **Xuid:** \`${player.xbox_user_id}\`
${end} **Device:** \`${devices[player.build_platform]}\`
`)
                                            .setFooter({ text: `Realm: ${realmname}` })
                                            .setTimestamp();

                                        this.SendEmbed(JoinLeaves, ConnectedEmbed, skinAttachment)
                                    })
                                }
                                if (player.skin_data?.skin_data?.width == 16 && player.skin_data?.skin_data?.height == 16) {
                                    console.log(player.username, "16x16")
                                    const skin_data = player.skin_data.skin_data.data;
                                    const headTexture = skin_data.slice(0, 64);
                                    const canvas = Canvas.createCanvas(16, 16);
                                    const ctx = canvas.getContext('2d');
                                    const headImageData = ctx.createImageData(16, 16);

                                    // Decode the skin data and draw it onto the canvas
                                    for (let i = 0; i < 64; i++) {
                                        headImageData.data[i * 4] = headTexture[i * 4];
                                        headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                        headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                        headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                    }
                                    ctx.putImageData(headImageData, 0, 0);

                                    // Create a new canvas to hold the combined face
                                    const faceCanvas = Canvas.createCanvas(8, 8);
                                    const faceCtx = faceCanvas.getContext('2d');
                                    const faceImageData = faceCtx.createImageData(8, 8);

                                    // Extract the first layer face data from the head image data
                                    for (let y = 0; y < 8; y++) {
                                        for (let x = 0; x < 8; x++) {
                                            const i = ((y * 8) + x) * 4;
                                            const j = ((y + 8) * 64 + x + 8) * 4;
                                            faceImageData.data[i] = headImageData.data[j];
                                            faceImageData.data[i + 1] = headImageData.data[j + 1];
                                            faceImageData.data[i + 2] = headImageData.data[j + 2];
                                            faceImageData.data[i + 3] = headImageData.data[j + 3];
                                        }
                                    }
                                    faceCtx.putImageData(faceImageData, 0, 0);


                                    // Extract the second layer face data from the head image data
                                    const face2Canvas = Canvas.createCanvas(8, 8);
                                    const face2Ctx = face2Canvas.getContext('2d');
                                    const face2ImageData = face2Ctx.createImageData(8, 8);

                                    for (let y = 0; y < 8; y++) {
                                        for (let x = 0; x < 8; x++) {
                                            const i = ((y * 8) + x) * 4;
                                            const j = ((y + 8) * 64 + x + 8 + 32) * 4;
                                            face2ImageData.data[i] = headImageData.data[j];
                                            face2ImageData.data[i + 1] = headImageData.data[j + 1];
                                            face2ImageData.data[i + 2] = headImageData.data[j + 2];
                                            face2ImageData.data[i + 3] = headImageData.data[j + 3];
                                        }
                                    }
                                    face2Ctx.putImageData(face2ImageData, 0, 0);

                                    // Create a new canvas to hold the combined face
                                    const combinedCanvas = Canvas.createCanvas(8, 8);
                                    const combinedCtx = combinedCanvas.getContext('2d');

                                    // Set the blend mode to 'source-over' to draw the second layer on top of the first layer
                                    combinedCtx.globalCompositeOperation = 'source-over';

                                    // Draw the first layer on the canvas
                                    combinedCtx.drawImage(faceCanvas, 0, 0, 8, 8);
                                    combinedCtx.drawImage(face2Canvas, 0, 0, 8, 8);

                                    // Resize the combined face image to embed thumbnail size (Discord default is 80x80)
                                    const thumbCanvas = Canvas.createCanvas(80, 80);
                                    const thumbCtx = thumbCanvas.getContext('2d');
                                    thumbCtx.imageSmoothingEnabled = false;
                                    thumbCtx.drawImage(combinedCanvas, 0, 0, 8, 8, 0, 0, 80, 80);
                                    const pngStream = thumbCanvas.createPNGStream();
                                    const chunks = [];
                                    pngStream.on('data', (chunk) => chunks.push(chunk));
                                    pngStream.on('end', () => {
                                        const buffer = Buffer.concat(chunks);
                                        const skinDirectory = path.join(__dirname, 'Database/PlayersDB/Skins', player.username);

                                        if (!fs.existsSync(skinDirectory)) {
                                            fs.mkdirSync(skinDirectory, { recursive: true });
                                        }

                                        // Check if the skin already exists
                                        let skinExists = false;
                                        let skinPath, skinFilename, thumbnailUrl, skinAttachment;

                                        fs.readdirSync(skinDirectory).forEach((filename) => {
                                            const filePath = path.join(skinDirectory, filename);
                                            if (fs.lstatSync(filePath).isFile()) {
                                                const fileData = fs.readFileSync(filePath);
                                                if (buffer.equals(fileData)) {
                                                    skinExists = true;
                                                    skinPath = filePath;
                                                    skinFilename = filename;
                                                    thumbnailUrl = `attachment://${filename}`;
                                                    skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                                }
                                            }
                                        });

                                        if (!skinExists) {
                                            skinFilename = `${player.xbox_user_id}.png`;
                                            skinPath = path.join(skinDirectory, skinFilename);

                                            fs.writeFile(skinPath, buffer, (err) => {
                                                if (err) throw err;

                                            });

                                            thumbnailUrl = `attachment://${skinFilename}`;
                                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                        } else {
                                            // Update the file name and path of the new skin file
                                            skinFilename = `${player.xbox_user_id}.png`;
                                            skinPath = path.join(skinDirectory, skinFilename);

                                            fs.writeFile(skinPath, buffer, (err) => {
                                                if (err) throw err;

                                            });

                                            thumbnailUrl = `attachment://${skinFilename}`;
                                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                            // Delete the old skin file
                                            fs.unlinkSync(skinPath);
                                        }

                                        const ConnectedEmbed = new EmbedBuilder()
                                            .setColor(cgreen)
                                            .setThumbnail(thumbnailUrl)
                                            .setDescription(`
${add} ${player.username} __Connected__

**__ Player Info __**
${reply} **Xuid:** \`${player.xbox_user_id}\`
${end} **Device:** \`${devices[player.build_platform]}\`
`)
                                            .setFooter({ text: `Realm: ${realmname}` })
                                            .setTimestamp();

                                        this.SendEmbed(JoinLeaves, ConnectedEmbed, skinAttachment)
                                    })
                                }
                            }
                        } else {
                            console.log(`[+]`.bold.green + ` Username: ${player.username} - ${player.xbox_user_id} | ${realmname} `.yellow + ` Time: ${this.date}`.cyan)
                            axios.get(`https://profile.xboxlive.com/users/gt(${(player.username)})/profile/settings?settings=GameDisplayPicRaw`, {
                                headers: XboxAuth,
                                timeout: 5000
                            })
                                .then((res) => {
                                    const pfp = res?.data?.profileUsers[0]?.settings[0]?.value
                                    players.set(`${player.uuid}`, {
                                        xuid: player.xbox_user_id,
                                        pfp: pfp,
                                        name: player.username
                                    });
                                    players.save()
                                    this.CosmosAutomod(
                                        player.username,
                                        player.xbox_user_id,
                                        pfp,
                                        devices[player.build_platform]
                                    )
                                    if (logs) {
                                        //Face Save
                                        if (player.skin_data?.skin_data?.width == 256 && player.skin_data?.skin_data?.height == 256) {
                                            const skin_data = player.skin_data.skin_data.data;
                                            const headTexture = skin_data.slice(0, 32768);
                                            const canvas = Canvas.createCanvas(256, 256);
                                            const ctx = canvas.getContext('2d');
                                            const headImageData = ctx.createImageData(256, 256);

                                            // Decode the skin data and draw it onto the canvas
                                            for (let i = 0; i < 32768; i++) {
                                                headImageData.data[i * 4] = headTexture[i * 4];
                                                headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                                headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                                headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                            }
                                            ctx.putImageData(headImageData, 0, 0);

                                            // Create a new canvas to hold the combined face
                                            const faceCanvas = Canvas.createCanvas(16, 16);
                                            const faceCtx = faceCanvas.getContext('2d');
                                            const faceImageData = faceCtx.createImageData(16, 16);

                                            // Extract the first layer face data from the head image data
                                            for (let y = 0; y < 16; y++) {
                                                for (let x = 0; x < 16; x++) {
                                                    const i = ((y * 16) + x) * 4;
                                                    const j = ((y + 16) * 256 + x + 16) * 4;
                                                    faceImageData.data[i] = headImageData.data[j];
                                                    faceImageData.data[i + 1] = headImageData.data[j + 1];
                                                    faceImageData.data[i + 2] = headImageData.data[j + 2];
                                                    faceImageData.data[i + 3] = headImageData.data[j + 3];
                                                }
                                            }
                                            faceCtx.putImageData(faceImageData, 0, 0);

                                            // Extract the second layer face data from the head image data
                                            const face2Canvas = Canvas.createCanvas(16, 16);
                                            const face2Ctx = face2Canvas.getContext('2d');
                                            const face2ImageData = face2Ctx.createImageData(16, 16);

                                            for (let y = 0; y < 16; y++) {
                                                for (let x = 0; x < 16; x++) {
                                                    const i = ((y * 16) + x) * 4;
                                                    const j = ((y + 16) * 256 + x + 16 + 64) * 4;
                                                    face2ImageData.data[i] = headImageData.data[j];
                                                    face2ImageData.data[i + 1] = headImageData.data[j + 1];
                                                    face2ImageData.data[i + 2] = headImageData.data[j + 2];
                                                    face2ImageData.data[i + 3] = headImageData.data[j + 3];
                                                }
                                            }
                                            face2Ctx.putImageData(face2ImageData, 0, 0);

                                            // Create a new canvas to hold the combined face
                                            const combinedCanvas = Canvas.createCanvas(16, 16);
                                            const combinedCtx = combinedCanvas.getContext('2d');

                                            // Set the blend mode to 'source-over' to draw the second layer on top of the first layer
                                            combinedCtx.globalCompositeOperation = 'source-over';

                                            // Draw the first layer on the canvas
                                            combinedCtx.drawImage(faceCanvas, 0, 0);

                                            // Draw the second layer on top of the first layer
                                            combinedCtx.drawImage(face2Canvas, 0, 0);

                                            // Resize the combined face image to embed thumbnail size (Discord default is 80x80)
                                            const thumbCanvas = Canvas.createCanvas(80, 80);
                                            const thumbCtx = thumbCanvas.getContext('2d');
                                            thumbCtx.imageSmoothingEnabled = false;
                                            thumbCtx.drawImage(combinedCanvas, 0, 0, 16, 16, 0, 0, 80, 80);
                                            const pngStream = thumbCanvas.createPNGStream();
                                            const chunks = [];
                                            pngStream.on('data', (chunk) => chunks.push(chunk));
                                            pngStream.on('end', () => {
                                                const buffer = Buffer.concat(chunks);
                                                const skinDirectory = path.join(__dirname, 'Database/PlayersDB/Skins', player.username);

                                                if (!fs.existsSync(skinDirectory)) {
                                                    fs.mkdirSync(skinDirectory, { recursive: true });
                                                }

                                                // Check if the skin already exists
                                                let skinExists = false;
                                                let skinPath, skinFilename, thumbnailUrl, skinAttachment;

                                                fs.readdirSync(skinDirectory).forEach((filename) => {
                                                    const filePath = path.join(skinDirectory, filename);
                                                    if (fs.lstatSync(filePath).isFile()) {
                                                        const fileData = fs.readFileSync(filePath);
                                                        if (buffer.equals(fileData)) {
                                                            skinExists = true;
                                                            skinPath = filePath;
                                                            skinFilename = filename;
                                                            thumbnailUrl = `attachment://${filename}`;
                                                            skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                                        }
                                                    }
                                                });

                                                if (!skinExists) {
                                                    skinFilename = `${player.xbox_user_id}.png`;
                                                    skinPath = path.join(skinDirectory, skinFilename);

                                                    fs.writeFile(skinPath, buffer, (err) => {
                                                        if (err) throw err;

                                                    });

                                                    thumbnailUrl = `attachment://${skinFilename}`;
                                                    skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                                } else {
                                                    // Update the file name and path of the new skin file
                                                    skinFilename = `${player.xbox_user_id}.png`;
                                                    skinPath = path.join(skinDirectory, skinFilename);

                                                    fs.writeFile(skinPath, buffer, (err) => {
                                                        if (err) throw err;

                                                    });

                                                    thumbnailUrl = `attachment://${skinFilename}`;
                                                    skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                                    // Delete the old skin file
                                                    fs.unlinkSync(skinPath);
                                                }

                                                const ConnectedEmbed = new EmbedBuilder()
                                                    .setColor(cgreen)
                                                    .setThumbnail(thumbnailUrl)
                                                    .setDescription(`
${add} ${player.username} __Connected__

**__ Player Info __**
${reply} **Xuid:** \`${player.xbox_user_id}\`
${end} **Device:** \`${devices[player.build_platform]}\`
`)
                                                    .setFooter({ text: `Realm: ${realmname}` })
                                                    .setTimestamp();

                                                this.SendEmbed(JoinLeaves, ConnectedEmbed, skinAttachment)
                                            })
                                        }
                                        if (player.skin_data?.skin_data?.width == 128 && player.skin_data?.skin_data?.height == 128) {
                                            const skin_data = player.skin_data.skin_data.data;
                                            const headTexture = skin_data.slice(0, 16384);
                                            const canvas = Canvas.createCanvas(128, 128);
                                            const ctx = canvas.getContext('2d');
                                            const headImageData = ctx.createImageData(128, 128);

                                            // Decode the skin data and draw it onto the canvas
                                            for (let i = 0; i < 16384; i++) {
                                                headImageData.data[i * 4] = headTexture[i * 4];
                                                headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                                headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                                headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                            }
                                            ctx.putImageData(headImageData, 0, 0);

                                            // Create a new canvas to hold the combined face
                                            const faceCanvas = Canvas.createCanvas(16, 16);
                                            const faceCtx = faceCanvas.getContext('2d');
                                            const faceImageData = faceCtx.createImageData(16, 16);

                                            // Extract the first layer face data from the head image data
                                            for (let y = 0; y < 16; y++) {
                                                for (let x = 0; x < 16; x++) {
                                                    const i = ((y * 16) + x) * 4;
                                                    const j = ((y + 16) * 128 + x + 16) * 4;
                                                    faceImageData.data[i] = headImageData.data[j];
                                                    faceImageData.data[i + 1] = headImageData.data[j + 1];
                                                    faceImageData.data[i + 2] = headImageData.data[j + 2];
                                                    faceImageData.data[i + 3] = headImageData.data[j + 3];
                                                }
                                            }
                                            faceCtx.putImageData(faceImageData, 0, 0);

                                            // Extract the second layer face data from the head image data
                                            const face2Canvas = Canvas.createCanvas(16, 16);
                                            const face2Ctx = face2Canvas.getContext('2d');
                                            const face2ImageData = face2Ctx.createImageData(16, 16);

                                            for (let y = 0; y < 16; y++) {
                                                for (let x = 0; x < 16; x++) {
                                                    const i = ((y * 16) + x) * 4;
                                                    const j = ((y + 16) * 128 + x + 16 + 64) * 4;
                                                    face2ImageData.data[i] = headImageData.data[j];
                                                    face2ImageData.data[i + 1] = headImageData.data[j + 1];
                                                    face2ImageData.data[i + 2] = headImageData.data[j + 2];
                                                    face2ImageData.data[i + 3] = headImageData.data[j + 3];
                                                }
                                            }
                                            face2Ctx.putImageData(face2ImageData, 0, 0);

                                            // Create a new canvas to hold the combined face
                                            const combinedCanvas = Canvas.createCanvas(16, 16);
                                            const combinedCtx = combinedCanvas.getContext('2d');

                                            // Set the blend mode to 'source-over' to draw the second layer on top of the first layer
                                            combinedCtx.globalCompositeOperation = 'source-over';

                                            // Draw the first layer on the canvas
                                            combinedCtx.drawImage(faceCanvas, 0, 0);

                                            // Draw the second layer on top of the first layer
                                            combinedCtx.drawImage(face2Canvas, 0, 0);

                                            // Resize the combined face image to embed thumbnail size (Discord default is 80x80)
                                            const thumbCanvas = Canvas.createCanvas(80, 80);
                                            const thumbCtx = thumbCanvas.getContext('2d');
                                            thumbCtx.imageSmoothingEnabled = false;
                                            thumbCtx.drawImage(combinedCanvas, 0, 0, 16, 16, 0, 0, 80, 80);
                                            // Convert the thumbnail canvas to a PNG stream
                                            const pngStream = thumbCanvas.createPNGStream();
                                            const chunks = [];
                                            pngStream.on('data', (chunk) => chunks.push(chunk));
                                            pngStream.on('end', () => {
                                                const buffer = Buffer.concat(chunks);
                                                const skinDirectory = path.join(__dirname, 'Database/PlayersDB/Skins', player.username);

                                                if (!fs.existsSync(skinDirectory)) {
                                                    fs.mkdirSync(skinDirectory, { recursive: true });
                                                }

                                                // Check if the skin already exists
                                                let skinExists = false;
                                                let skinPath, skinFilename, thumbnailUrl, skinAttachment;

                                                fs.readdirSync(skinDirectory).forEach((filename) => {
                                                    const filePath = path.join(skinDirectory, filename);
                                                    if (fs.lstatSync(filePath).isFile()) {
                                                        const fileData = fs.readFileSync(filePath);
                                                        if (buffer.equals(fileData)) {
                                                            skinExists = true;
                                                            skinPath = filePath;
                                                            skinFilename = filename;
                                                            thumbnailUrl = `attachment://${filename}`;
                                                            skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                                        }
                                                    }
                                                });

                                                if (!skinExists) {
                                                    skinFilename = `${player.xbox_user_id}.png`;
                                                    skinPath = path.join(skinDirectory, skinFilename);

                                                    fs.writeFile(skinPath, buffer, (err) => {
                                                        if (err) throw err;

                                                    });

                                                    thumbnailUrl = `attachment://${skinFilename}`;
                                                    skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                                } else {
                                                    // Update the file name and path of the new skin file
                                                    skinFilename = `${player.xbox_user_id}.png`;
                                                    skinPath = path.join(skinDirectory, skinFilename);

                                                    fs.writeFile(skinPath, buffer, (err) => {
                                                        if (err) throw err;

                                                    });

                                                    thumbnailUrl = `attachment://${skinFilename}`;
                                                    skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                                    // Delete the old skin file
                                                    fs.unlinkSync(skinPath);
                                                }
                                                const ConnectedEmbed = new EmbedBuilder()
                                                    .setColor(cgreen)
                                                    .setThumbnail(thumbnailUrl)
                                                    .setDescription(`
${add} ${player.username} __Connected__

**__ Player Info __**
${reply} **Xuid:** \`${player.xbox_user_id}\`
${end} **Device:** \`${devices[player.build_platform]}\`
`)
                                                    .setFooter({ text: `Realm: ${realmname}` })
                                                    .setTimestamp();

                                                this.SendEmbed(JoinLeaves, ConnectedEmbed, skinAttachment)
                                            })
                                        }
                                        if (player.skin_data?.skin_data?.width == 64 && player.skin_data?.skin_data?.height == 64) {
                                            const skin_data = player.skin_data.skin_data.data;
                                            const headTexture = skin_data.slice(0, 4096);
                                            const canvas = Canvas.createCanvas(64, 64);
                                            const ctx = canvas.getContext('2d');
                                            const headImageData = ctx.createImageData(64, 64);

                                            // Decode the skin data and draw it onto the canvas
                                            for (let i = 0; i < 4096; i++) {
                                                headImageData.data[i * 4] = headTexture[i * 4];
                                                headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                                headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                                headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                            }
                                            ctx.putImageData(headImageData, 0, 0);

                                            // Create a new canvas to hold the combined face
                                            const faceCanvas = Canvas.createCanvas(8, 8);
                                            const faceCtx = faceCanvas.getContext('2d');
                                            const faceImageData = faceCtx.createImageData(8, 8);

                                            // Extract the first layer face data from the head image data
                                            for (let y = 0; y < 8; y++) {
                                                for (let x = 0; x < 8; x++) {
                                                    const i = ((y * 8) + x) * 4;
                                                    const j = ((y + 8) * 64 + x + 8) * 4;
                                                    faceImageData.data[i] = headImageData.data[j];
                                                    faceImageData.data[i + 1] = headImageData.data[j + 1];
                                                    faceImageData.data[i + 2] = headImageData.data[j + 2];
                                                    faceImageData.data[i + 3] = headImageData.data[j + 3];
                                                }
                                            }
                                            faceCtx.putImageData(faceImageData, 0, 0);

                                            // Extract the second layer face data from the head image data
                                            const face2Canvas = Canvas.createCanvas(8, 8);
                                            const face2Ctx = face2Canvas.getContext('2d');
                                            const face2ImageData = face2Ctx.createImageData(8, 8);

                                            for (let y = 0; y < 8; y++) {
                                                for (let x = 0; x < 8; x++) {
                                                    const i = ((y * 8) + x) * 4;
                                                    const j = ((y + 8) * 64 + x + 8 + 32) * 4;
                                                    face2ImageData.data[i] = headImageData.data[j];
                                                    face2ImageData.data[i + 1] = headImageData.data[j + 1];
                                                    face2ImageData.data[i + 2] = headImageData.data[j + 2];
                                                    face2ImageData.data[i + 3] = headImageData.data[j + 3];
                                                }
                                            }
                                            face2Ctx.putImageData(face2ImageData, 0, 0);

                                            // Create a new canvas to hold the combined face
                                            const combinedCanvas = Canvas.createCanvas(8, 8);
                                            const combinedCtx = combinedCanvas.getContext('2d');

                                            // Set the blend mode to 'source-over' to draw the second layer on top of the first layer
                                            combinedCtx.globalCompositeOperation = 'source-over';

                                            // Draw the first layer on the canvas
                                            combinedCtx.drawImage(faceCanvas, 0, 0, 8, 8);
                                            combinedCtx.drawImage(face2Canvas, 0, 0, 8, 8);

                                            // Resize the combined face image to embed thumbnail size (Discord default is 80x80)
                                            const thumbCanvas = Canvas.createCanvas(80, 80);
                                            const thumbCtx = thumbCanvas.getContext('2d');
                                            thumbCtx.imageSmoothingEnabled = false;
                                            thumbCtx.drawImage(combinedCanvas, 0, 0, 8, 8, 0, 0, 80, 80);

                                            const pngStream = thumbCanvas.createPNGStream();
                                            const chunks = [];
                                            pngStream.on('data', (chunk) => chunks.push(chunk));
                                            pngStream.on('end', () => {
                                                const buffer = Buffer.concat(chunks);
                                                const skinDirectory = path.join(__dirname, 'Database/PlayersDB/Skins', player.username);

                                                if (!fs.existsSync(skinDirectory)) {
                                                    fs.mkdirSync(skinDirectory, { recursive: true });
                                                }

                                                // Check if the skin already exists
                                                let skinExists = false;
                                                let skinPath, skinFilename, thumbnailUrl, skinAttachment;

                                                fs.readdirSync(skinDirectory).forEach((filename) => {
                                                    const filePath = path.join(skinDirectory, filename);
                                                    if (fs.lstatSync(filePath).isFile()) {
                                                        const fileData = fs.readFileSync(filePath);
                                                        if (buffer.equals(fileData)) {
                                                            skinExists = true;
                                                            skinPath = filePath;
                                                            skinFilename = filename;
                                                            thumbnailUrl = `attachment://${filename}`;
                                                            skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                                        }
                                                    }
                                                });

                                                if (!skinExists) {
                                                    skinFilename = `${player.xbox_user_id}.png`;
                                                    skinPath = path.join(skinDirectory, skinFilename);

                                                    fs.writeFile(skinPath, buffer, (err) => {
                                                        if (err) throw err;

                                                    });

                                                    thumbnailUrl = `attachment://${skinFilename}`;
                                                    skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                                } else {
                                                    // Update the file name and path of the new skin file
                                                    skinFilename = `${player.xbox_user_id}.png`;
                                                    skinPath = path.join(skinDirectory, skinFilename);

                                                    fs.writeFile(skinPath, buffer, (err) => {
                                                        if (err) throw err;

                                                    });

                                                    thumbnailUrl = `attachment://${skinFilename}`;
                                                    skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                                    // Delete the old skin file
                                                    fs.unlinkSync(skinPath);
                                                }

                                                const ConnectedEmbed = new EmbedBuilder()
                                                    .setColor(cgreen)
                                                    .setThumbnail(thumbnailUrl)
                                                    .setDescription(`
${add} ${player.username} __Connected__

**__ Player Info __**
${reply} **Xuid:** \`${player.xbox_user_id}\`
${end} **Device:** \`${devices[player.build_platform]}\`
`)
                                                    .setFooter({ text: `Realm: ${realmname}` })
                                                    .setTimestamp();

                                                this.SendEmbed(JoinLeaves, ConnectedEmbed, skinAttachment)
                                            })
                                        }
                                        if (player.skin_data?.skin_data?.width == 32 && player.skin_data?.skin_data?.height == 32) {
                                            const skin_data = player.skin_data.skin_data.data;
                                            const headTexture = skin_data.slice(0, 1024);
                                            const canvas = Canvas.createCanvas(32, 32);
                                            const ctx = canvas.getContext('2d');
                                            const headImageData = ctx.createImageData(32, 32);

                                            // Decode the skin data and draw it onto the canvas
                                            for (let i = 0; i < 1024; i++) {
                                                headImageData.data[i * 4] = headTexture[i * 4];
                                                headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                                headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                                headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                            }
                                            ctx.putImageData(headImageData, 0, 0);

                                            // Create a new canvas to hold the combined face
                                            const faceCanvas = Canvas.createCanvas(8, 8);
                                            const faceCtx = faceCanvas.getContext('2d');
                                            const faceImageData = faceCtx.createImageData(8, 8);

                                            // Extract the first layer face data from the head image data
                                            for (let y = 0; y < 8; y++) {
                                                for (let x = 0; x < 8; x++) {
                                                    const i = ((y * 8) + x) * 4;
                                                    const j = ((y + 8) * 64 + x + 8) * 4;
                                                    faceImageData.data[i] = headImageData.data[j];
                                                    faceImageData.data[i + 1] = headImageData.data[j + 1];
                                                    faceImageData.data[i + 2] = headImageData.data[j + 2];
                                                    faceImageData.data[i + 3] = headImageData.data[j + 3];
                                                }
                                            }
                                            faceCtx.putImageData(faceImageData, 0, 0);

                                            // Extract the second layer face data from the head image data
                                            const face2Canvas = Canvas.createCanvas(8, 8);
                                            const face2Ctx = face2Canvas.getContext('2d');
                                            const face2ImageData = face2Ctx.createImageData(8, 8);

                                            for (let y = 0; y < 8; y++) {
                                                for (let x = 0; x < 8; x++) {
                                                    const i = ((y * 8) + x) * 4;
                                                    const j = ((y + 8) * 64 + x + 8 + 32) * 4;
                                                    face2ImageData.data[i] = headImageData.data[j];
                                                    face2ImageData.data[i + 1] = headImageData.data[j + 1];
                                                    face2ImageData.data[i + 2] = headImageData.data[j + 2];
                                                    face2ImageData.data[i + 3] = headImageData.data[j + 3];
                                                }
                                            }
                                            face2Ctx.putImageData(face2ImageData, 0, 0);

                                            // Create a new canvas to hold the combined face
                                            const combinedCanvas = Canvas.createCanvas(8, 8);
                                            const combinedCtx = combinedCanvas.getContext('2d');

                                            // Set the blend mode to 'source-over' to draw the second layer on top of the first layer
                                            combinedCtx.globalCompositeOperation = 'source-over';

                                            // Draw the first layer on the canvas
                                            combinedCtx.drawImage(faceCanvas, 0, 0, 8, 8);
                                            combinedCtx.drawImage(face2Canvas, 0, 0, 8, 8);

                                            // Resize the combined face image to embed thumbnail size (Discord default is 80x80)
                                            const thumbCanvas = Canvas.createCanvas(80, 80);
                                            const thumbCtx = thumbCanvas.getContext('2d');
                                            thumbCtx.imageSmoothingEnabled = false;
                                            thumbCtx.drawImage(combinedCanvas, 0, 0, 8, 8, 0, 0, 80, 80);
                                            const pngStream = thumbCanvas.createPNGStream();
                                            const chunks = [];
                                            pngStream.on('data', (chunk) => chunks.push(chunk));
                                            pngStream.on('end', () => {
                                                const buffer = Buffer.concat(chunks);
                                                const skinDirectory = path.join(__dirname, 'Database/PlayersDB/Skins', player.username);

                                                if (!fs.existsSync(skinDirectory)) {
                                                    fs.mkdirSync(skinDirectory, { recursive: true });
                                                }

                                                // Check if the skin already exists
                                                let skinExists = false;
                                                let skinPath, skinFilename, thumbnailUrl, skinAttachment;

                                                fs.readdirSync(skinDirectory).forEach((filename) => {
                                                    const filePath = path.join(skinDirectory, filename);
                                                    if (fs.lstatSync(filePath).isFile()) {
                                                        const fileData = fs.readFileSync(filePath);
                                                        if (buffer.equals(fileData)) {
                                                            skinExists = true;
                                                            skinPath = filePath;
                                                            skinFilename = filename;
                                                            thumbnailUrl = `attachment://${filename}`;
                                                            skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                                        }
                                                    }
                                                });

                                                if (!skinExists) {
                                                    skinFilename = `${player.xbox_user_id}.png`;
                                                    skinPath = path.join(skinDirectory, skinFilename);

                                                    fs.writeFile(skinPath, buffer, (err) => {
                                                        if (err) throw err;

                                                    });

                                                    thumbnailUrl = `attachment://${skinFilename}`;
                                                    skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                                } else {
                                                    // Update the file name and path of the new skin file
                                                    skinFilename = `${player.xbox_user_id}.png`;
                                                    skinPath = path.join(skinDirectory, skinFilename);

                                                    fs.writeFile(skinPath, buffer, (err) => {
                                                        if (err) throw err;

                                                    });

                                                    thumbnailUrl = `attachment://${skinFilename}`;
                                                    skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                                    // Delete the old skin file
                                                    fs.unlinkSync(skinPath);
                                                }

                                                const ConnectedEmbed = new EmbedBuilder()
                                                    .setColor(cgreen)
                                                    .setThumbnail(thumbnailUrl)
                                                    .setDescription(`
${add} ${player.username} __Connected__

**__ Player Info __**
${reply} **Xuid:** \`${player.xbox_user_id}\`
${end} **Device:** \`${devices[player.build_platform]}\`
`)
                                                    .setFooter({ text: `Realm: ${realmname}` })
                                                    .setTimestamp();

                                                this.SendEmbed(JoinLeaves, ConnectedEmbed, skinAttachment)
                                            })
                                        }
                                        if (player.skin_data?.skin_data?.width == 16 && player.skin_data?.skin_data?.height == 16) {
                                            const skin_data = player.skin_data.skin_data.data;
                                            const headTexture = skin_data.slice(0, 64);
                                            const canvas = Canvas.createCanvas(16, 16);
                                            const ctx = canvas.getContext('2d');
                                            const headImageData = ctx.createImageData(16, 16);

                                            // Decode the skin data and draw it onto the canvas
                                            for (let i = 0; i < 64; i++) {
                                                headImageData.data[i * 4] = headTexture[i * 4];
                                                headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                                headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                                headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                            }
                                            ctx.putImageData(headImageData, 0, 0);

                                            // Create a new canvas to hold the combined face
                                            const faceCanvas = Canvas.createCanvas(8, 8);
                                            const faceCtx = faceCanvas.getContext('2d');
                                            const faceImageData = faceCtx.createImageData(8, 8);

                                            // Extract the first layer face data from the head image data
                                            for (let y = 0; y < 8; y++) {
                                                for (let x = 0; x < 8; x++) {
                                                    const i = ((y * 8) + x) * 4;
                                                    const j = ((y + 8) * 64 + x + 8) * 4;
                                                    faceImageData.data[i] = headImageData.data[j];
                                                    faceImageData.data[i + 1] = headImageData.data[j + 1];
                                                    faceImageData.data[i + 2] = headImageData.data[j + 2];
                                                    faceImageData.data[i + 3] = headImageData.data[j + 3];
                                                }
                                            }
                                            faceCtx.putImageData(faceImageData, 0, 0);

                                            // Extract the second layer face data from the head image data
                                            const face2Canvas = Canvas.createCanvas(8, 8);
                                            const face2Ctx = face2Canvas.getContext('2d');
                                            const face2ImageData = face2Ctx.createImageData(8, 8);

                                            for (let y = 0; y < 8; y++) {
                                                for (let x = 0; x < 8; x++) {
                                                    const i = ((y * 8) + x) * 4;
                                                    const j = ((y + 8) * 64 + x + 8 + 32) * 4;
                                                    face2ImageData.data[i] = headImageData.data[j];
                                                    face2ImageData.data[i + 1] = headImageData.data[j + 1];
                                                    face2ImageData.data[i + 2] = headImageData.data[j + 2];
                                                    face2ImageData.data[i + 3] = headImageData.data[j + 3];
                                                }
                                            }
                                            face2Ctx.putImageData(face2ImageData, 0, 0);

                                            // Create a new canvas to hold the combined face
                                            const combinedCanvas = Canvas.createCanvas(8, 8);
                                            const combinedCtx = combinedCanvas.getContext('2d');

                                            // Set the blend mode to 'source-over' to draw the second layer on top of the first layer
                                            combinedCtx.globalCompositeOperation = 'source-over';

                                            // Draw the first layer on the canvas
                                            combinedCtx.drawImage(faceCanvas, 0, 0, 8, 8);
                                            combinedCtx.drawImage(face2Canvas, 0, 0, 8, 8);

                                            // Resize the combined face image to embed thumbnail size (Discord default is 80x80)
                                            const thumbCanvas = Canvas.createCanvas(80, 80);
                                            const thumbCtx = thumbCanvas.getContext('2d');
                                            thumbCtx.imageSmoothingEnabled = false;
                                            thumbCtx.drawImage(combinedCanvas, 0, 0, 8, 8, 0, 0, 80, 80);
                                            const pngStream = thumbCanvas.createPNGStream();
                                            const chunks = [];
                                            pngStream.on('data', (chunk) => chunks.push(chunk));
                                            pngStream.on('end', () => {
                                                const buffer = Buffer.concat(chunks);
                                                const skinDirectory = path.join(__dirname, 'Database/PlayersDB/Skins', player.username);

                                                if (!fs.existsSync(skinDirectory)) {
                                                    fs.mkdirSync(skinDirectory, { recursive: true });
                                                }

                                                // Check if the skin already exists
                                                let skinExists = false;
                                                let skinPath, skinFilename, thumbnailUrl, skinAttachment;

                                                fs.readdirSync(skinDirectory).forEach((filename) => {
                                                    const filePath = path.join(skinDirectory, filename);
                                                    if (fs.lstatSync(filePath).isFile()) {
                                                        const fileData = fs.readFileSync(filePath);
                                                        if (buffer.equals(fileData)) {
                                                            skinExists = true;
                                                            skinPath = filePath;
                                                            skinFilename = filename;
                                                            thumbnailUrl = `attachment://${filename}`;
                                                            skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                                        }
                                                    }
                                                });

                                                if (!skinExists) {
                                                    skinFilename = `${player.xbox_user_id}.png`;
                                                    skinPath = path.join(skinDirectory, skinFilename);

                                                    fs.writeFile(skinPath, buffer, (err) => {
                                                        if (err) throw err;

                                                    });

                                                    thumbnailUrl = `attachment://${skinFilename}`;
                                                    skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                                } else {
                                                    // Update the file name and path of the new skin file
                                                    skinFilename = `${player.xbox_user_id}.png`;
                                                    skinPath = path.join(skinDirectory, skinFilename);

                                                    fs.writeFile(skinPath, buffer, (err) => {
                                                        if (err) throw err;

                                                    });

                                                    thumbnailUrl = `attachment://${skinFilename}`;
                                                    skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                                    // Delete the old skin file
                                                    fs.unlinkSync(skinPath);
                                                }
                                                const ConnectedEmbed = new EmbedBuilder()
                                                    .setColor(cgreen)
                                                    .setThumbnail(thumbnailUrl)
                                                    .setDescription(`
${add} ${player.username} __Connected__

**__ Player Info __**
${reply} **Xuid:** \`${player.xbox_user_id}\`
${end} **Device:** \`${devices[player.build_platform]}\`
`)
                                                    .setFooter({ text: `Realm: ${realmname}` })
                                                    .setTimestamp();

                                                this.SendEmbed(JoinLeaves, ConnectedEmbed, skinAttachment)
                                            })
                                        }
                                    }
                                })
                                .catch((error) => {
                                    fs.appendFileSync(`Error.txt`, `Realm: ${realmname} | ${error}\n`, err => {
                                        console.warn(err)
                                    })
                                });
                        }
                    }
                    if (Premium === 0) {
                    } else {
                        if (now > Premium) {
                            if (antiinvis) {
                                if (players.get(player.uuid)) {
                                    const startTime = performance.now();
                                    const storedPlayer = players.get(player.uuid);
                                    const storedName = storedPlayer.name
                                    const storedPfp = storedPlayer.pfp;
                                    const storedXuid = storedPlayer.xuid
                                    if (player.skin_data?.skin_data?.width == 128 && player.skin_data?.skin_data?.height == 128) {
                                        const skin_data = player.skin_data.skin_data.data;
                                        const headTexture = skin_data.slice(0, 16384);
                                        const canvas = Canvas.createCanvas(128, 128);
                                        const ctx = canvas.getContext('2d');
                                        const headImageData = ctx.createImageData(128, 128);

                                        // Decode the skin data and draw it onto the canvas
                                        for (let i = 0; i < 16384; i++) {
                                            headImageData.data[i * 4] = headTexture[i * 4];
                                            headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                            headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                            headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                        }
                                        ctx.putImageData(headImageData, 0, 0);

                                        let invisiblePixelsCount = 0;
                                        let totalAlphaValue = 0;
                                        for (let i = 0; i < headImageData.data.length; i += 4) {
                                            if (headImageData.data[i + 3] === 0) {
                                                invisiblePixelsCount++;
                                            }
                                            totalAlphaValue += headImageData.data[i + 3];
                                        }
                                        if (totalAlphaValue < 10000) {
                                            console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmname} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                                            this.Client.write("command_request", {
                                                command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                                                version: 2,
                                                origin: {
                                                    type: 0,
                                                    uuid: "",
                                                    request_id: "",
                                                },
                                            })
                                            this.Client.write("command_request", {
                                                command: `tellraw @a {"rawtext":[{"text":"§7[§9CosmosAC§7]\n=- §bUsername: ${storedName}\n§7=- §bReason: §3Using Unfair Skin"}]}`,
                                                version: 2,
                                                origin: {
                                                    type: 0,
                                                    uuid: "",
                                                    request_id: "",
                                                },
                                            })
                                            this.IncreaseKicks()
                                            if (automod) {
                                                const AutomodEmbed = new EmbedBuilder()
                                                    .setColor(corange)
                                                    .setThumbnail(storedPfp)
                                                    .setDescription(`
${WARNING} __Kicked__ ${storedName}
${end} **Reason:** \`Using Unfair Skin\`
`)
                                                    .setFooter({ text: `Realm: ${realmname}` })
                                                    .setTimestamp()
                                                this.SendEmbed(JoinLeaves, AutomodEmbed)
                                                const endTime = performance.now();
                                                const elapsedTime = endTime - startTime;
                                                console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                                            }
                                        }
                                    }
                                    if (player.skin_data?.skin_data?.width == 64 && player.skin_data?.skin_data?.height == 64) {
                                        const skin_data = player.skin_data.skin_data.data;
                                        const headTexture = skin_data.slice(0, 4096);
                                        const canvas = Canvas.createCanvas(64, 64);
                                        const ctx = canvas.getContext('2d');
                                        const headImageData = ctx.createImageData(64, 64);

                                        // Decode the skin data and draw it onto the canvas
                                        for (let i = 0; i < 4096; i++) {
                                            headImageData.data[i * 4] = headTexture[i * 4];
                                            headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                            headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                            headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                        }
                                        ctx.putImageData(headImageData, 0, 0);

                                        let invisiblePixelsCount = 0;
                                        let totalAlphaValue = 0;
                                        for (let i = 0; i < headImageData.data.length; i += 4) {
                                            if (headImageData.data[i + 3] === 0) {
                                                invisiblePixelsCount++;
                                            }
                                            totalAlphaValue += headImageData.data[i + 3];
                                        }
                                        if (totalAlphaValue < 10000) {
                                            console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmname} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                                            this.Client.write("command_request", {
                                                command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                                                version: 2,
                                                origin: {
                                                    type: 0,
                                                    uuid: "",
                                                    request_id: "",
                                                },
                                            })
                                            this.Client.write("command_request", {
                                                command: `tellraw @a {"rawtext":[{"text":"§7[§9CosmosAC§7]\n=- §bUsername: ${storedName}\n§7=- §bReason: §3Using Unfair Skin"}]}`,
                                                version: 2,
                                                origin: {
                                                    type: 0,
                                                    uuid: "",
                                                    request_id: "",
                                                },
                                            })
                                            this.IncreaseKicks()
                                            if (automod) {
                                                const AutomodEmbed = new EmbedBuilder()
                                                    .setColor(corange)
                                                    .setThumbnail(storedPfp)
                                                    .setDescription(`
${WARNING} __Kicked__ ${storedName}
${end} **Reason:** \`Using Unfair Skin\`
`)
                                                    .setFooter({ text: `Realm: ${realmname}` })
                                                    .setTimestamp()
                                                this.SendEmbed(JoinLeaves, AutomodEmbed)
                                                const endTime = performance.now();
                                                const elapsedTime = endTime - startTime;
                                                console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                                            }
                                        }
                                    }
                                    if (player.skin_data?.skin_data?.width == 32 && player.skin_data?.skin_data?.height == 32) {
                                        const skin_data = player.skin_data.skin_data.data;
                                        const headTexture = skin_data.slice(0, 1024);
                                        const canvas = Canvas.createCanvas(32, 32);
                                        const ctx = canvas.getContext('2d');
                                        const headImageData = ctx.createImageData(32, 32);

                                        // Decode the skin data and draw it onto the canvas
                                        for (let i = 0; i < 1024; i++) {
                                            headImageData.data[i * 4] = headTexture[i * 4];
                                            headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                            headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                            headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                        }
                                        ctx.putImageData(headImageData, 0, 0);


                                        let invisiblePixelsCount = 0;
                                        let totalAlphaValue = 0;
                                        for (let i = 0; i < headImageData.data.length; i += 4) {
                                            if (headImageData.data[i + 3] === 0) {
                                                invisiblePixelsCount++;
                                            }
                                            totalAlphaValue += headImageData.data[i + 3];
                                        }
                                        if (totalAlphaValue < 10000) {
                                            console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmname} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                                            this.Client.write("command_request", {
                                                command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                                                version: 2,
                                                origin: {
                                                    type: 0,
                                                    uuid: "",
                                                    request_id: "",
                                                },
                                            })
                                            this.Client.write("command_request", {
                                                command: `tellraw @a {"rawtext":[{"text":"§7[§9CosmosAC§7]\n=- §bUsername: ${storedName}\n§7=- §bReason: §3Using Unfair Skin"}]}`,
                                                version: 2,
                                                origin: {
                                                    type: 0,
                                                    uuid: "",
                                                    request_id: "",
                                                },
                                            })
                                            this.IncreaseKicks()
                                            if (automod) {
                                                const AutomodEmbed = new EmbedBuilder()
                                                    .setColor(corange)
                                                    .setThumbnail(storedPfp)
                                                    .setDescription(`
${WARNING} __Kicked__ ${storedName}
${end} **Reason:** \`Using Unfair Skin\`
`)
                                                    .setFooter({ text: `Realm: ${realmname}` })
                                                    .setTimestamp()
                                                this.SendEmbed(JoinLeaves, AutomodEmbed)
                                                const endTime = performance.now();
                                                const elapsedTime = endTime - startTime;
                                                console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                                            }
                                        }
                                    }
                                    if (player.skin_data?.skin_data?.width == 16 && player.skin_data?.skin_data?.height == 16) {
                                        const skin_data = player.skin_data.skin_data.data;
                                        const headTexture = skin_data.slice(0, 64);
                                        const canvas = Canvas.createCanvas(16, 16);
                                        const ctx = canvas.getContext('2d');
                                        const headImageData = ctx.createImageData(16, 16);

                                        // Decode the skin data and draw it onto the canvas
                                        for (let i = 0; i < 64; i++) {
                                            headImageData.data[i * 4] = headTexture[i * 4];
                                            headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                            headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                            headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                        }
                                        ctx.putImageData(headImageData, 0, 0);


                                        let invisiblePixelsCount = 0;
                                        let totalAlphaValue = 0;
                                        for (let i = 0; i < headImageData.data.length; i += 4) {
                                            if (headImageData.data[i + 3] === 0) {
                                                invisiblePixelsCount++;
                                            }
                                            totalAlphaValue += headImageData.data[i + 3];
                                        }
                                        if (totalAlphaValue < 10000) {
                                            console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmname} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                                            this.Client.write("command_request", {
                                                command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                                                version: 2,
                                                origin: {
                                                    type: 0,
                                                    uuid: "",
                                                    request_id: "",
                                                },
                                            })
                                            this.Client.write("command_request", {
                                                command: `tellraw @a {"rawtext":[{"text":"§7[§9CosmosAC§7]\n=- §bUsername: ${storedName}\n§7=- §bReason: §3Using Unfair Skin"}]}`,
                                                version: 2,
                                                origin: {
                                                    type: 0,
                                                    uuid: "",
                                                    request_id: "",
                                                },
                                            })
                                            this.IncreaseKicks()
                                            if (automod) {
                                                const AutomodEmbed = new EmbedBuilder()
                                                    .setColor(corange)
                                                    .setThumbnail(storedPfp)
                                                    .setDescription(`
${WARNING} __Kicked__ ${storedName}
${end} **Reason:** \`Using Unfair Skin\`
`)
                                                    .setFooter({ text: `Realm: ${realmname}` })
                                                    .setTimestamp()
                                                this.SendEmbed(JoinLeaves, AutomodEmbed)
                                                const endTime = performance.now();
                                                const elapsedTime = endTime - startTime;
                                                console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            }
            if (packet.records.type === "remove") {
                packet.records.records.forEach((player) => {
                    try {
                        const storedPlayer = players.get(player.uuid);
                        const storedName = storedPlayer.name
                        const storedXuid = storedPlayer.xuid
                        const storedPfp = storedPlayer.pfp

                        console.log(`[-]`.bold.red + ` Username: ${storedName} - ${storedXuid} | ${realmname} `.yellow + ` Time: ${this.date}`.cyan)
                        if (logs) {
                            const DisconnectedEmbed = new EmbedBuilder()
                                .setColor(cred)
                                .setThumbnail(storedPfp)
                                .setDescription(`
${add} ${storedName} __Disconnected__

**__ Player Info __**
${end} **Xuid:** \`${storedXuid}\`
`)
                                .setFooter({ text: `Realm: ${realmname}` })
                                .setTimestamp();
                            this.SendEmbed(JoinLeaves, DisconnectedEmbed)
                        }
                    } catch (error) {
                        fs.appendFileSync(`Error.txt`, `Realm: ${realmname} | ${error}\n`, err => {
                            console.warn(err)
                        })
                    }
                });
            }
        })

        this.Client.on('disconnect', (packet) => {
            let file = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/config.json`);
            //Caches
            let players = editJsonFile(`./Database/PlayersDB/players.json`);
            let devicesDB = editJsonFile(`./Database/PlayersDB/DevicesDB.json`);
            let RecentsDB = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/recents.json`)
            let LastSeenDB = editJsonFile(`./Database/PlayersDB/Lastseen/lastseen.json`)

            //Configs
            let JoinLeaves = file.get('Join-Leave-Logs')
            let ConsoleChat = file.get(`ConsoleChannel`);
            let realmname = file.get(`RealmName`)
            let logs = file.get(`Join-Leave-Logs`);
            let discordCode = ''
            let automod = file.get(`Automod-Logs`)
            let format = file.get(`embedformat`);
            let antiinvis = file.get(`antiinvis`);
            let ClubPfp = file.get(`ClubPfp`)
            let ChatLogs = file.get(`Chat-Relay-Logs`);
            let ChatType = file.get(`chattype`);
            let DeathLogs = file.get(`Death-Logs`);
            const PremiumNow = Math.floor(Date.now() / 1000);
            const Premium = file.get("PremiumTime") ?? 0
            if (Premium === 0) {
                discordCode = 'discord.gg/kNUVpUJNzC'
            } else {
                if (PremiumNow > Premium) {
                    discordCode = file.get('discordCode')
                } else {
                    discordCode = 'discord.gg/kNUVpUJNzC'
                }
            }
            const ClientDisconnected = packet.message
            if (ClientDisconnected === 'disconnectionScreen.serverIdConflict') {
                const ClientData = {
                    Disconnection: `${this.Client.profile.name} (Bot) is already in the realm.`,
                    Clubpfp: ClubPfp
                }
                const Embed = new EmbedBuilder()
                    .setAuthor({ name: `Realm: ${realmname}`, iconURL: ClientData.Clubpfp })
                    .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Disconnection}\` 
${end} Realm: \`${realmname}\`

*Reconnecting in 5 Seconds!*
                `)
                    .setFooter({ text: `Requested By ${this.Interaction.user.tag}`, iconURL: this.Interaction.user.displayAvatarURL() })
                    .setTimestamp()
                this.Interaction.editReply({ embeds: [Embed], components: [] })
                setTimeout(() => {
                    if (rA < max) {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting | ${packet.message}`.cyan + ` (Attempt ${rA + 1}/${max})`.green);
                        this.Client.close()
                        new ClientStart(this.RealmId, this.GuildId, this.Interaction)
                        rA++;
                        return
                    } else {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting Limit Exceeded`.bold.red);
                        rA = 1
                        this.Client.close()
                        if (Disconnection) {
                            const embed = new EmbedBuilder()
                                .setColor(cred)
                                .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Disconnection}\` 
${end} Realm: \`${realmname}\`

*Stopped Auto Reconnecting!*
`)
                                .setTimestamp();
                            this.Interaction.editReply({ embeds: [embed], components: [] })
                            return
                        }
                    }
                }, 5000)
            } else if (ClientDisconnected === `Couldn't find any Realms for the authenticated account`) {
                const ClientData = {
                    Disconnection: `Realm is not on the ${this.Client.profile.name} (Bot)'s Realm list!`,
                    Clubpfp: ClubPfp
                }
                const Embed = new EmbedBuilder()
                    .setAuthor({ name: `Realm: ${realmname}`, iconURL: ClientData.Clubpfp })
                    .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Disconnection}\` 
${end} Realm: \`${realmname}\`

*Reconnecting in 5 Seconds!*
                `)
                    .setFooter({ text: `Requested By ${this.Interaction.user.tag}`, iconURL: this.Interaction.user.displayAvatarURL() })
                    .setTimestamp()
                this.Interaction.editReply({ embeds: [Embed], components: [] })
                setTimeout(() => {
                    if (rA < max) {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting | ${packet.message}`.cyan + ` (Attempt ${rA + 1}/${max})`.green);
                        this.Client.close()
                        new ClientStart(this.RealmId, this.GuildId, this.Interaction)
                        rA++;
                        return
                    } else {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting Limit Exceeded`.bold.red);
                        rA = 1
                        this.Client.close()
                        if (Disconnection) {
                            const embed = new EmbedBuilder()
                                .setColor(cred)
                                .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Disconnection}\` 
${end} Realm: \`${realmname}\`

*Stopped Auto Reconnecting!*
`)
                                .setTimestamp();
                            this.Interaction.editReply({ embeds: [embed], components: [] })
                            return
                        }
                    }
                }, 5000)
            } else if (ClientDisconnected === '%disconnect.kicked') {
                const ClientData = {
                    Disconnection: `${this.Client.profile.name} (Bot) has been kicked from the realm!`,
                    Clubpfp: ClubPfp
                }
                const Embed = new EmbedBuilder()
                    .setAuthor({ name: `Realm: ${realmname}`, iconURL: ClientData.Clubpfp })
                    .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Disconnection}\` 
${end} Realm: \`${realmname}\`

*Reconnecting in 5 Seconds!*
                `)
                    .setFooter({ text: `Requested By ${this.Interaction.user.tag}`, iconURL: this.Interaction.user.displayAvatarURL() })
                    .setTimestamp()
                this.Interaction.editReply({ embeds: [Embed], components: [] })
                setTimeout(() => {
                    if (rA < max) {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting | ${packet.message}`.cyan + ` (Attempt ${rA + 1}/${max})`.green);
                        this.Client.close()
                        new ClientStart(this.RealmId, this.GuildId, this.Interaction)
                        rA++;
                        return
                    } else {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting Limit Exceeded`.bold.red);
                        rA = 1
                        this.Client.close()
                        if (Disconnection) {
                            const embed = new EmbedBuilder()
                                .setColor(cred)
                                .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Disconnection}\` 
${end} Realm: \`${realmname}\`

*Stopped Auto Reconnecting!*
`)
                                .setTimestamp();
                            this.Interaction.editReply({ embeds: [embed], components: [] })
                            return
                        }
                    }
                }, 5000)
            } else {
                const ClientData = {
                    Disconnection: packet.message,
                    Clubpfp: ClubPfp
                }
                const Embed = new EmbedBuilder()
                    .setAuthor({ name: `Realm: ${realmname}`, iconURL: ClientData.Clubpfp })
                    .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Disconnection}\` 
${end} Realm: \`${realmname}\`

*Reconnecting in 5 Seconds!*
                `)
                    .setFooter({ text: `Requested By ${this.Interaction.user.tag}`, iconURL: this.Interaction.user.displayAvatarURL() })
                    .setTimestamp()
                this.Interaction.editReply({ embeds: [Embed], components: [] })
                setTimeout(() => {
                    if (rA < max) {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting | ${packet.message}`.cyan + ` (Attempt ${rA + 1}/${max})`.green);
                        this.Client.close()
                        new ClientStart(this.RealmId, this.GuildId, this.Interaction)
                        rA++;
                        return
                    } else {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting Limit Exceeded`.bold.red);
                        rA = 1
                        this.Client.close()
                        if (Disconnection) {
                            const embed = new EmbedBuilder()
                                .setColor(cred)
                                .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Disconnection}\` 
${end} Realm: \`${realmname}\`

*Stopped Auto Reconnecting!*
`)
                                .setTimestamp();
                            this.Interaction.editReply({ embeds: [embed], components: [] })
                            return
                        }
                    }
                }, 5000)
            }
        })

        this.Client.on('error', (packet) => {
            let file = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/config.json`);
            //Caches
            let players = editJsonFile(`./Database/PlayersDB/players.json`);
            let devicesDB = editJsonFile(`./Database/PlayersDB/DevicesDB.json`);
            let RecentsDB = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/recents.json`)
            let LastSeenDB = editJsonFile(`./Database/PlayersDB/Lastseen/lastseen.json`)

            //Configs
            let JoinLeaves = file.get('Join-Leave-Logs')
            let ConsoleChat = file.get(`ConsoleChannel`);
            let realmname = file.get(`RealmName`)
            let logs = file.get(`Join-Leave-Logs`);
            let discordCode = ''
            let automod = file.get(`Automod-Logs`)
            let format = file.get(`embedformat`);
            let antiinvis = file.get(`antiinvis`);
            let ClubPfp = file.get(`ClubPfp`)
            let ChatLogs = file.get(`Chat-Relay-Logs`);
            let ChatType = file.get(`chattype`);
            let DeathLogs = file.get(`Death-Logs`);
            const PremiumNow = Math.floor(Date.now() / 1000);
            const Premium = file.get("PremiumTime") ?? 0
            if (Premium === 0) {
                discordCode = 'discord.gg/kNUVpUJNzC'
            } else {
                if (PremiumNow > Premium) {
                    discordCode = file.get('discordCode')
                } else {
                    discordCode = 'discord.gg/kNUVpUJNzC'
                }
            }
            const ClientError = packet.message
            if (ClientError === '403 Forbidden {"errorCode":403, "errorMsg":"World is closed"}') {
                const ClientData = {
                    Error: `Realm is closed.`,
                    Clubpfp: ClubPfp
                }
                const Embed = new EmbedBuilder()
                    .setAuthor({ name: `Realm: ${realmname}`, iconURL: ClientData.Clubpfp })
                    .setDescription(`
${denied} **Connection Errored Out**
${reply} Error: \`${ClientData.Error}\` 
${end} Realm: \`${realmname}\`

*Reconnecting in 5 Seconds!*
                `)
                    .setFooter({ text: `Requested By ${this.Interaction.user.tag}`, iconURL: this.Interaction.user.displayAvatarURL() })
                    .setTimestamp()
                this.Interaction.editReply({ embeds: [Embed], components: [] })
                setTimeout(() => {
                    if (rA < max) {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting | ${packet.message}`.cyan + ` (Attempt ${rA + 1}/${max})`.green);
                        this.Client.close()
                        new ClientStart(this.RealmId, this.GuildId, this.Interaction)
                        rA++;
                        return
                    } else {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting Limit Exceeded`.bold.red);
                        rA = 1
                        this.Client.close()
                        if (Disconnection) {
                            const embed = new EmbedBuilder()
                                .setColor(cred)
                                .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Error}\` 
${end} Realm: \`${realmname}\`

*Stopped Auto Reconnecting!*
`)
                                .setTimestamp();
                            this.Interaction.editReply({ embeds: [embed], components: [] })
                            return
                        }
                    }
                }, 5000)
            } else if (ClientError === '403 Forbidden {"errorCode":403, "errorMsg":"No valid subscription"}') {
                const ClientData = {
                    Error: `Realm has expired.`,
                    Clubpfp: ClubPfp
                }
                const Embed = new EmbedBuilder()
                    .setAuthor({ name: `Realm: ${realmname}`, iconURL: ClientData.Clubpfp })
                    .setDescription(`
${denied} **Connection Errored Out**
${reply} Error: \`${ClientData.Error}\` 
${end} Realm: \`${realmname}\`

*Reconnecting in 5 Seconds!*
                `)
                    .setFooter({ text: `Requested By ${this.Interaction.user.tag}`, iconURL: this.Interaction.user.displayAvatarURL() })
                    .setTimestamp()
                this.Interaction.editReply({ embeds: [Embed], components: [] })
                setTimeout(() => {
                    if (rA < max) {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting | ${packet.message}`.cyan + ` (Attempt ${rA + 1}/${max})`.green);
                        this.Client.close()
                        new ClientStart(this.RealmId, this.GuildId, this.Interaction)
                        rA++;
                        return
                    } else {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting Limit Exceeded`.bold.red);
                        rA = 1
                        this.Client.close()
                        if (Disconnection) {
                            const embed = new EmbedBuilder()
                                .setColor(cred)
                                .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Error}\` 
${end} Realm: \`${realmname}\`

*Stopped Auto Reconnecting!*
`)
                                .setTimestamp();
                            this.Interaction.editReply({ embeds: [embed], components: [] })
                            return
                        }
                    }
                }, 5000)
            } else if (ClientError === '403 Forbidden {"errorCode":403, "errorMsg":"User banned"}') {
                const ClientData = {
                    Error: `${this.Client.profile.name} (Bot) has been banned!`,
                    Clubpfp: ClubPfp
                }
                const Embed = new EmbedBuilder()
                    .setAuthor({ name: `Realm: ${realmname}`, iconURL: ClientData.Clubpfp })
                    .setDescription(`
${denied} **Connection Errored Out**
${reply} Error: \`${ClientData.Error}\` 
${end} Realm: \`${realmname}\`

*Reconnecting in 5 Seconds!*
                `)
                    .setFooter({ text: `Requested By ${this.Interaction.user.tag}`, iconURL: this.Interaction.user.displayAvatarURL() })
                    .setTimestamp()
                this.Interaction.editReply({ embeds: [Embed], components: [] })
                setTimeout(() => {
                    if (rA < max) {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting | ${packet.message}`.cyan + ` (Attempt ${rA + 1}/${max})`.green);
                        this.Client.close()
                        new ClientStart(this.RealmId, this.GuildId, this.Interaction)
                        rA++;
                        return
                    } else {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting Limit Exceeded`.bold.red);
                        rA = 1
                        this.Client.close()
                        if (Disconnection) {
                            const embed = new EmbedBuilder()
                                .setColor(cred)
                                .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Error}\` 
${end} Realm: \`${realmname}\`

*Stopped Auto Reconnecting!*
`)
                                .setTimestamp();
                            this.Interaction.editReply({ embeds: [embed], components: [] })
                            return
                        }
                    }
                }, 5000)
            } else if (ClientError === '503 Service Unavailable Retry again later') {
                const ClientData = {
                    Error: `Realm asleep, please rerun this command again!`,
                    Clubpfp: ClubPfp
                }
                const Embed = new EmbedBuilder()
                    .setAuthor({ name: `Realm: ${realmname}`, iconURL: ClientData.Clubpfp })
                    .setDescription(`
${denied} **Connection Errored Out**
${reply} Error: \`${ClientData.Error}\` 
${end} Realm: \`${realmname}\`

*Reconnecting in 5 Seconds!*
                `)
                    .setFooter({ text: `Requested By ${this.Interaction.user.tag}`, iconURL: this.Interaction.user.displayAvatarURL() })
                    .setTimestamp()
                this.Interaction.editReply({ embeds: [Embed], components: [] })
                setTimeout(() => {
                    if (rA < max) {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting | ${packet.message}`.cyan + ` (Attempt ${rA + 1}/${max})`.green);
                        this.Client.close()
                        new ClientStart(this.RealmId, this.GuildId, this.Interaction)
                        rA++;
                        return
                    } else {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting Limit Exceeded`.bold.red);
                        rA = 1
                        this.Client.close()
                        if (Disconnection) {
                            const embed = new EmbedBuilder()
                                .setColor(cred)
                                .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Error}\` 
${end} Realm: \`${realmname}\`

*Stopped Auto Reconnecting!*
`)
                                .setTimestamp();
                            this.Interaction.editReply({ embeds: [embed], components: [] })
                            return
                        }
                    }
                }, 5000)
            } else {
                const ClientData = {
                    Error: packet.message,
                    Clubpfp: ClubPfp
                }
                const Embed = new EmbedBuilder()
                    .setAuthor({ name: `Realm: ${realmname}`, iconURL: ClientData.Clubpfp })
                    .setDescription(`
${denied} **Connection Errored Out**
${reply} Error: \`${ClientData.Error}\` 
${end} Realm: \`${realmname}\`

*Reconnecting in 5 Seconds!*
                `)
                    .setFooter({ text: `Requested By ${this.Interaction.user.tag}`, iconURL: this.Interaction.user.displayAvatarURL() })
                    .setTimestamp()
                this.Interaction.editReply({ embeds: [Embed], components: [] })
                setTimeout(() => {
                    if (rA < max) {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting | ${packet.message}`.cyan + ` (Attempt ${rA + 1}/${max})`.green);
                        this.Client.close()
                        new ClientStart(this.RealmId, this.GuildId, this.Interaction)
                        rA++;
                        return
                    } else {
                        console.log(`[${realmname}]`.yellow + ` Reconnecting Limit Exceeded`.bold.red);
                        rA = 1
                        this.Client.close()
                        if (Disconnection) {
                            const embed = new EmbedBuilder()
                                .setColor(cred)
                                .setDescription(`
${denied} **Connection Disconnected**
${reply} Error: \`${ClientData.Error}\` 
${end} Realm: \`${realmname}\`

*Stopped Auto Reconnecting!*
`)
                                .setTimestamp();
                            this.Interaction.editReply({ embeds: [embed], components: [] })
                            return
                        }
                    }
                }, 5000)
            }
        })

        this.Client.on('end', (packet) => {
            console.log("End Packet: ", packet)
        })

        this.Client.on('player_skin', (player) => {
            let file = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/config.json`);
            //Caches
            let players = editJsonFile(`./Database/PlayersDB/players.json`);
            let devicesDB = editJsonFile(`./Database/PlayersDB/DevicesDB.json`);
            let RecentsDB = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/recents.json`)
            let LastSeenDB = editJsonFile(`./Database/PlayersDB/Lastseen/lastseen.json`)

            //Configs
            let JoinLeaves = file.get('Join-Leave-Logs')
            let ConsoleChat = file.get(`ConsoleChannel`);
            let realmname = file.get(`RealmName`)
            let logs = file.get(`Join-Leave-Logs`);
            let discordCode = ''
            let automod = file.get(`Automod-Logs`)
            let format = file.get(`embedformat`);
            let antiinvis = file.get(`antiinvis`);
            let ClubPfp = file.get(`ClubPfp`)
            let ChatLogs = file.get(`Chat-Relay-Logs`);
            let ChatType = file.get(`chattype`);
            let DeathLogs = file.get(`Death-Logs`);
            const PremiumNow = Math.floor(Date.now() / 1000);
            const Premium = file.get("PremiumTime") ?? 0
            if (Premium === 0) {
                discordCode = 'discord.gg/kNUVpUJNzC'
            } else {
                if (PremiumNow > Premium) {
                    discordCode = file.get('discordCode')
                } else {
                    discordCode = 'discord.gg/kNUVpUJNzC'
                }
            }
            if (Premium === 0) {
            } else {
                if (now < Premium) {
                    if (antiinvis) {
                        if (players.get(player.uuid)) {
                            const startTime = performance.now();
                            const storedPlayer = players.get(player.uuid);
                            const storedName = storedPlayer.name
                            const storedPfp = storedPlayer.pfp;
                            const storedXuid = storedPlayer.xuid
                            if (player.skin?.skin_data?.width == 128 && player.skin?.skin_data?.height == 128) {
                                const skin_data = player.skin.skin_data.data;
                                const headTexture = skin_data.slice(0, 16384);
                                const canvas = Canvas.createCanvas(128, 128);
                                const ctx = canvas.getContext('2d');
                                const headImageData = ctx.createImageData(128, 128);

                                // Decode the skin data and draw it onto the canvas
                                for (let i = 0; i < 16384; i++) {
                                    headImageData.data[i * 4] = headTexture[i * 4];
                                    headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                    headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                    headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                }
                                ctx.putImageData(headImageData, 0, 0);

                                let invisiblePixelsCount = 0;
                                let totalAlphaValue = 0;
                                for (let i = 0; i < headImageData.data.length; i += 4) {
                                    if (headImageData.data[i + 3] === 0) {
                                        invisiblePixelsCount++;
                                    }
                                    totalAlphaValue += headImageData.data[i + 3];
                                }
                                if (totalAlphaValue < 10000) {
                                    console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmname} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                                    this.Client.write("command_request", {
                                        command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                                        version: 2,
                                        origin: {
                                            type: 0,
                                            uuid: "",
                                            request_id: "",
                                        },
                                    })
                                    this.Client.write("command_request", {
                                        command: `tellraw @a {"rawtext":[{"text":"§7[§9CosmosAC§7]\n=- §bUsername: ${storedName}\n§7=- §bReason: §3Using Unfair Skin"}]}`,
                                        version: 2,
                                        origin: {
                                            type: 0,
                                            uuid: "",
                                            request_id: "",
                                        },
                                    })
                                    this.IncreaseKicks()
                                    if (automod) {
                                        const AutomodEmbed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setThumbnail(storedPfp)
                                            .setDescription(`
${WARNING} __Kicked__ **${storedName}**
${end} **Reason:** \`Using Unfair Skin\`
`)
                                            .setFooter({ text: `Realm: ${realmname}` })
                                            .setTimestamp()
                                        this.SendEmbed(JoinLeaves, AutomodEmbed)
                                        const endTime = performance.now();
                                        const elapsedTime = endTime - startTime;
                                        console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                                    }
                                }
                            }
                            if (player.skin?.skin_data?.width == 64 && player.skin?.skin_data?.height == 64) {
                                const skin_data = player.skin.skin_data.data;
                                const headTexture = skin_data.slice(0, 4096);
                                const canvas = Canvas.createCanvas(64, 64);
                                const ctx = canvas.getContext('2d');
                                const headImageData = ctx.createImageData(64, 64);

                                // Decode the skin data and draw it onto the canvas
                                for (let i = 0; i < 4096; i++) {
                                    headImageData.data[i * 4] = headTexture[i * 4];
                                    headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                    headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                    headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                }
                                ctx.putImageData(headImageData, 0, 0);

                                let invisiblePixelsCount = 0;
                                let totalAlphaValue = 0;
                                for (let i = 0; i < headImageData.data.length; i += 4) {
                                    if (headImageData.data[i + 3] === 0) {
                                        invisiblePixelsCount++;
                                    }
                                    totalAlphaValue += headImageData.data[i + 3];
                                }
                                if (totalAlphaValue < 10000) {
                                    console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmname} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                                    this.Client.write("command_request", {
                                        command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                                        version: 2,
                                        origin: {
                                            type: 0,
                                            uuid: "",
                                            request_id: "",
                                        },
                                    })
                                    this.Client.write("command_request", {
                                        command: `tellraw @a {"rawtext":[{"text":"§7[§9CosmosAC§7]\n=- §bUsername: ${storedName}\n§7=- §bReason: §3Using Unfair Skin"}]}`,
                                        version: 2,
                                        origin: {
                                            type: 0,
                                            uuid: "",
                                            request_id: "",
                                        },
                                    })
                                    this.IncreaseKicks()
                                    if (automod) {
                                        const AutomodEmbed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setThumbnail(storedPfp)
                                            .setDescription(`
${WARNING} __Kicked__ **${storedName}**
${end} **Reason:** \`Using Unfair Skin\`
`)
                                            .setFooter({ text: `Realm: ${realmname}` })
                                            .setTimestamp()
                                        this.SendEmbed(JoinLeaves, AutomodEmbed)
                                        const endTime = performance.now();
                                        const elapsedTime = endTime - startTime;
                                        console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                                    }
                                }
                            }
                            if (player.skin?.skin_data?.width == 32 && player.skin?.skin_data?.height == 32) {
                                const skin_data = player.skin.skin_data.data;
                                const headTexture = skin_data.slice(0, 1024);
                                const canvas = Canvas.createCanvas(32, 32);
                                const ctx = canvas.getContext('2d');
                                const headImageData = ctx.createImageData(32, 32);

                                // Decode the skin data and draw it onto the canvas
                                for (let i = 0; i < 1024; i++) {
                                    headImageData.data[i * 4] = headTexture[i * 4];
                                    headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                    headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                    headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                }
                                ctx.putImageData(headImageData, 0, 0);


                                let invisiblePixelsCount = 0;
                                let totalAlphaValue = 0;
                                for (let i = 0; i < headImageData.data.length; i += 4) {
                                    if (headImageData.data[i + 3] === 0) {
                                        invisiblePixelsCount++;
                                    }
                                    totalAlphaValue += headImageData.data[i + 3];
                                }
                                if (totalAlphaValue < 10000) {
                                    console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmname} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                                    this.Client.write("command_request", {
                                        command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                                        version: 2,
                                        origin: {
                                            type: 0,
                                            uuid: "",
                                            request_id: "",
                                        },
                                    })
                                    this.Client.write("command_request", {
                                        command: `tellraw @a {"rawtext":[{"text":"§7[§9CosmosAC§7]\n=- §bUsername: ${storedName}\n§7=- §bReason: §3Using Unfair Skin"}]}`,
                                        version: 2,
                                        origin: {
                                            type: 0,
                                            uuid: "",
                                            request_id: "",
                                        },
                                    })
                                    this.IncreaseKicks()
                                    if (automod) {
                                        const AutomodEmbed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setThumbnail(storedPfp)
                                            .setDescription(`
${WARNING} __Kicked__ **${storedName}**
${end} **Reason:** \`Using Unfair Skin\`
`)
                                            .setFooter({ text: `Realm: ${realmname}` })
                                            .setTimestamp()
                                        this.SendEmbed(JoinLeaves, AutomodEmbed)
                                        const endTime = performance.now();
                                        const elapsedTime = endTime - startTime;
                                        console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                                    }
                                }
                            }
                            if (player.skin?.skin_data?.width == 16 && player.skin?.skin_data?.height == 16) {
                                const skin_data = player.skin.skin_data.data;
                                const headTexture = skin_data.slice(0, 64);
                                const canvas = Canvas.createCanvas(16, 16);
                                const ctx = canvas.getContext('2d');
                                const headImageData = ctx.createImageData(16, 16);

                                // Decode the skin data and draw it onto the canvas
                                for (let i = 0; i < 64; i++) {
                                    headImageData.data[i * 4] = headTexture[i * 4];
                                    headImageData.data[i * 4 + 1] = headTexture[i * 4 + 1];
                                    headImageData.data[i * 4 + 2] = headTexture[i * 4 + 2];
                                    headImageData.data[i * 4 + 3] = headTexture[i * 4 + 3];
                                }
                                ctx.putImageData(headImageData, 0, 0);


                                let invisiblePixelsCount = 0;
                                let totalAlphaValue = 0;
                                for (let i = 0; i < headImageData.data.length; i += 4) {
                                    if (headImageData.data[i + 3] === 0) {
                                        invisiblePixelsCount++;
                                    }
                                    totalAlphaValue += headImageData.data[i + 3];
                                }
                                if (totalAlphaValue < 10000) {
                                    console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmname} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                                    this.Client.write("command_request", {
                                        command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                                        version: 2,
                                        origin: {
                                            type: 0,
                                            uuid: "",
                                            request_id: "",
                                        },
                                    })
                                    this.Client.write("command_request", {
                                        command: `tellraw @a {"rawtext":[{"text":"§7[§9CosmosAC§7]\n=- §bUsername: ${storedName}\n§7=- §bReason: §3Using Unfair Skin"}]}`,
                                        version: 2,
                                        origin: {
                                            type: 0,
                                            uuid: "",
                                            request_id: "",
                                        },
                                    })
                                    this.IncreaseKicks()
                                    if (automod) {
                                        const AutomodEmbed = new EmbedBuilder()
                                            .setColor(corange)
                                            .setThumbnail(storedPfp)
                                            .setDescription(`
${WARNING} __Kicked__ **${storedName}**
${end} **Reason:** \`Using Unfair Skin\`
`)
                                            .setFooter({ text: `Realm: ${realmname}` })
                                            .setTimestamp()
                                        this.SendEmbed(JoinLeaves, AutomodEmbed)
                                        const endTime = performance.now();
                                        const elapsedTime = endTime - startTime;
                                        console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        try {
            let file = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/config.json`);
            //Caches
            let players = editJsonFile(`./Database/PlayersDB/players.json`);
            let devicesDB = editJsonFile(`./Database/PlayersDB/DevicesDB.json`);
            let RecentsDB = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/recents.json`)
            let LastSeenDB = editJsonFile(`./Database/PlayersDB/Lastseen/lastseen.json`)

            //Configs
            let JoinLeaves = file.get('Join-Leave-Logs')
            let ConsoleChat = file.get(`ConsoleChannel`);
            let realmname = file.get(`RealmName`)
            let logs = file.get(`Join-Leave-Logs`);
            let discordCode = ''
            let automod = file.get(`Automod-Logs`)
            let format = file.get(`embedformat`);
            let antiinvis = file.get(`antiinvis`);
            let ClubPfp = file.get(`ClubPfp`)
            let ChatLogs = file.get(`Chat-Relay-Logs`);
            let ChatType = file.get(`chattype`);
            let DeathLogs = file.get(`Death-Logs`);
            const PremiumNow = Math.floor(Date.now() / 1000);
            const Premium = file.get("PremiumTime") ?? 0
            if (Premium === 0) {
                discordCode = 'discord.gg/kNUVpUJNzC'
            } else {
                if (PremiumNow > Premium) {
                    discordCode = file.get('discordCode')
                } else {
                    discordCode = 'discord.gg/kNUVpUJNzC'
                }
            }
            if (Premium === 0) {
            } else {
                if (now < Premium) {
                    DiscordClient.on('messageCreate', (data) => {
                        if (data.channelId !== `${ChatLogs}` || data.author.bot) {

                        } else {
                            const member = data.guild.members.cache.get(data.author.id);
                            const roleName = member.roles.highest.name;
                            this.Client.queue("command_request", {
                                command: `tellraw @a {"rawtext":[{"text":"§r<§9Discord§r> §7(Role: ${roleName}) <§r${data.author.username}> ${data.content}"}]}`,
                                version: 2,
                                origin: {
                                    type: 0,
                                    uuid: "",
                                    request_id: "",
                                },
                            });
                        }
                        if (data.channelId !== `${ConsoleChat}` || data.author.bot || !data.content.startsWith(prefix)) {

                        } else {
                            const args = data.content.slice(prefix.length).trim().split(/ +/g);

                            const command = args.join(' ');

                            this.Client.write("command_request", {
                                command: `${command}`,
                                version: 2,
                                origin: {
                                    type: 0,
                                    uuid: "",
                                    request_id: "",
                                },
                            })
                            data.reply(`Sent Command Request!`)
                        }
                    })
                }
            }
        } catch (e) {

        }
        this.Client.on("text", (packet) => {
            let file = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/config.json`);
            //Caches
            let players = editJsonFile(`./Database/PlayersDB/players.json`);
            let devicesDB = editJsonFile(`./Database/PlayersDB/DevicesDB.json`);
            let RecentsDB = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/recents.json`)
            let LastSeenDB = editJsonFile(`./Database/PlayersDB/Lastseen/lastseen.json`)

            //Configs
            let JoinLeaves = file.get('Join-Leave-Logs')
            let ConsoleChat = file.get(`ConsoleChannel`);
            let realmname = file.get(`RealmName`)
            let logs = file.get(`Join-Leave-Logs`);
            let discordCode = ''
            let automod = file.get(`Automod-Logs`)
            let format = file.get(`embedformat`);
            let antiinvis = file.get(`antiinvis`);
            let ClubPfp = file.get(`ClubPfp`)
            let ChatLogs = file.get(`Chat-Relay-Logs`);
            let ChatType = file.get(`chattype`);
            let DeathLogs = file.get(`Death-Logs`);
            const PremiumNow = Math.floor(Date.now() / 1000);
            const Premium = file.get("PremiumTime") ?? 0
            if (packet.type === 'translation') {
                if (packet.message.startsWith('§e%multiplayer.player.joined.realms')) {
                } else if (packet.message.startsWith('§e%multiplayer.player.left.realms')) {
                } else if (packet.message === 'death.attack.player') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Was murdered by \`${packet.parameters[1]}\`!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.magic') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]} Was killed by ${packet.parameters[1]}\` using magic!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.onFire') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Has succumbed to the Eternal Flame!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.onFire.player') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Has succumbed to The Eternal Flame while fighting \`${packet.parameters[1]}\`!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.inFire') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Has succumbed to the Eternal Flame!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.inFire.player') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Has succumbed to the Eternal Flame while fighting \`${packet.parameters[1]}\`!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.lava') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Died while trying to swim in lava!
                  `)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.lava.player') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Died while trying to swim in lava to escape \`${packet.parameters[1]}\`!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.drown') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Drowned!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.explosion.player') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Was blown by a \`${packet.parameters[1]}\`!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.explosion') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Blew up!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.drown.player') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Was blown by \`${packet.parameters[1]}\`!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.inWall') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Suffocated in a wall! 
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.fall') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Hit the ground to hard!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.fell.accident.generic') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Fell from a high place!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.trident') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Was impaled by a trident!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.thrown') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Was pummeled by \`${packet.parameters[1]}\`!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.arrow') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Was shot by \`${packet.parameters[1]}\`!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.generic') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Died out of nowhere!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.lightningBolt') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Was struck by lightning!
`)
                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.mob.item') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Was slain by \`${packet.parameters[1]}\` using \`${packet.parameters[3]}\`!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.mob') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Was slain by \`${packet.parameters[1]}\`!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.outOfWorld') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Has Fallen into the Eternal Void!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.player.item') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Was killed by \`${packet.parameters[1]}\` using \`${packet.parameters[3]}\`!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.starve') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Starved to death!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.wither') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Withered away!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                } else if (packet.message === 'death.attack.freeze') {
                    if (DeathLogs) {
                        const DeathLogged = new EmbedBuilder()
                            .setColor(cred)
                            .setDescription(`
\`${packet.parameters[0]}\` Froze to death!
`)

                        this.SendEmbed(DeathLogs, DeathLogged)
                    }
                }
            }
            if (ChatType === "Normal") {
                if (packet.type !== "chat" || !packet.source_name) return
                if (ChatLogs) {
                    const ChatRelayed = new EmbedBuilder()
                        .setColor("DarkPurple")
                        .setAuthor({ name: `${realmname}`, iconURL: ClubPfp })
                        .setDescription(`
${end} **<${packet.source_name}>** \`${packet.message}\`
                                `)
                    this.SendEmbed(ChatLogs, ChatRelayed)
                }
            } else if (ChatType === 'Tellraw') {
                if (["whisper", "chat", "announcement", "translation"].includes(packet.type)) {

                } else {
                    try {
                        const obj = JSON.parse(packet.message.replace(/§./g, ""));
                        this.IncreaseTellraw()
                        if (ChatLogs) {
                            const GametestRelay = new EmbedBuilder()
                                .setColor("Purple")
                                .setAuthor({ name: `${realmname}`, iconURL: ClubPfp })
                                .setDescription(`
${end} ${obj.rawtext[0].text}
                        `)
                                .setFooter({ text: `Realm: ${realmname}` })
                            this.SendEmbed(ChatLogs, GametestRelay)
                        }
                    } catch (error) {
                        if (!fs.existsSync(`./Database/realm/${this.GuildId}/errors.txt`)) {
                            fs.writeFileSync(`./Database/realm/${this.GuildId}/errors.txt`, `Realm: ${realmname} | ${error}\n`)
                        } else {
                            fs.appendFileSync(`./Database/realm/${this.GuildId}/errors.txt`, `Realm: ${realmname} | ${error}\n`, err => {
                                if (err) {
                                    console.warn(err)
                                }
                            })
                        }
                    }
                }
            }
        })
    }


    async SendEmbed(channelId, Embed, skinAttachment) {
        let file = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/config.json`);
        //Caches
        let players = editJsonFile(`./Database/PlayersDB/players.json`);
        let devicesDB = editJsonFile(`./Database/PlayersDB/DevicesDB.json`);
        let RecentsDB = editJsonFile(`./Database/realm/${this.GuildId}/${this.RealmId}/recents.json`)
        let LastSeenDB = editJsonFile(`./Database/PlayersDB/Lastseen/lastseen.json`)

        //Configs
        let JoinLeaves = file.get('Join-Leave-Logs')
        let ConsoleChat = file.get(`ConsoleChannel`);
        let realmname = file.get(`RealmName`)
        let logs = file.get(`Join-Leave-Logs`);
        let discordCode = ''
        let automod = file.get(`Automod-Logs`)
        let format = file.get(`embedformat`);
        let antiinvis = file.get(`antiinvis`);
        let ClubPfp = file.get(`ClubPfp`)
        let ChatLogs = file.get(`Chat-Relay-Logs`);
        let ChatType = file.get(`chattype`);
        let DeathLogs = file.get(`Death-Logs`);
        const PremiumNow = Math.floor(Date.now() / 1000);
        const Premium = file.get("PremiumTime") ?? 0
        if (skinAttachment === undefined) {
            DiscordClient.channels
                .fetch(channelId)
                .then(async (channel) => await channel.send({ embeds: [Embed] }))
                .catch((error) => {
                    if (!fs.existsSync(`./Database/realm/${this.GuildId}/errors.txt`)) {
                        fs.writeFileSync(`./Database/realm/${this.GuildId}/errors.txt`, `Realm: ${realmname} | ${error}\n`)
                    } else {
                        fs.appendFileSync(`./Database/realm/${this.GuildId}/errors.txt`, `Realm: ${realmname} | ${error}\n`, err => {
                            if (err) {
                                console.warn(err)
                            }
                        })
                    }
                })
        } else {
            DiscordClient.channels
                .fetch(channelId)
                .then(async (channel) => await channel.send({ embeds: [Embed], files: [skinAttachment] }))
                .catch((error) => {
                    if (!fs.existsSync(`./Database/realm/${this.GuildId}/errors.txt`)) {
                        fs.writeFileSync(`./Database/realm/${this.GuildId}/errors.txt`, `Realm: ${realmname} | ${error}\n`)
                    } else {
                        fs.appendFileSync(`./Database/realm/${this.GuildId}/errors.txt`, `Realm: ${realmname} | ${error}\n`, err => {
                            if (err) {
                                console.warn(err)
                            }
                        })
                    }
                })
        }
    }

    async IncreaseKicks() {
        const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
        const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
        fs.writeFileSync(dbPath, JSON.stringify(KickSent));
    }

    async IncreaseJoins() {
        const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'joins.json');
        const Joined = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        Joined.Join = Joined.Join ? Joined.Join + 1 : 1;
        fs.writeFileSync(dbPath, JSON.stringify(Joined));
    }

    async IncreaseChats() {
        const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'chatRelayed.json');
        const ChatRelayed = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        ChatRelayed.Chat = ChatRelayed.Chat ? ChatRelayed.Chat + 1 : 1;
        fs.writeFileSync(dbPath, JSON.stringify(ChatRelayed));
    }

    async IncreaseTellraw() {
        const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'Gametest.json');
        const GametestRelayed = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        GametestRelayed.Gametest = GametestRelayed.Gametest ? GametestRelayed.Gametest + 1 : 1;
        fs.writeFileSync(dbPath, JSON.stringify(GametestRelayed));
    }

    async CosmosAutomod(playerName, xbox_user_id, pfp, device) {
        let DEVICE = ''
        if (device === 'Windows 10') {
            DEVICE = 'Minecraft for Windows'
        } else if (device === 'IOS') {
            DEVICE === 'Minecraft for iOS'
        } else if (device === 'Android') {
            DEVICE = 'Minecraft for Android'
        } else if (device === 'NintendoSwitch') {
            DEVICE = 'Minecraft for Nintendo Switch'
        } else if (device === 'Xbox') {
            DEVICE = 'Minecraft for Xbox'
        }
        let BedrockClient = this.Client
        let guildid = this.GuildId
        let FullDate = this.date
        const XboxAuth = JSON.parse(JSON.stringify({
            'x-xbl-contract-version': '2',
            'Authorization': `XBL3.0 x=${this.XboxProfile.userHash};${this.XboxProfile.XSTSToken}`,
            'Accept-Language': "en-US",
            maxRedirects: 1,
        }))
        let timeString = 0
        let discordCode = ''
        const startTime = performance.now();
        let file = editJsonFile(`./Database/realm/${guildid}/${this.RealmId}/config.json`);
        const now = Math.floor(Date.now() / 1000);
        const Premium = file.get("PremiumTime") ?? 0
        if (Premium === 0) {
            discordCode = 'discord.gg/kNUVpUJNzC'
        } else {
            if (now > Premium) {
                discordCode = file.get('discordCode')
            } else {
                discordCode = 'discord.gg/kNUVpUJNzC'
            }
        }
        let KicksDB = editJsonFile(`./Database/PlayersDB/KickDatabase.json`);
        let MinFollowers = file.get(`Followers`)
        let MinFriends = file.get(`Friends`)
        let MinGames = file.get(`Games`)
        let MinGamerscore = file.get(`Gamerscore`)
        let globalStatus = file.get(`globalStatus`)
        let realmname = file.get(`RealmName`)
        let automod = file.get(`Automod-Logs`)
        const filePath = `./Database/PlayersDB/KicksDB/${playerName}.json`;

        var whitelist = fs.readFileSync(
            `./Database/realm/${guildid}/${this.RealmId}/whitelist.json`
        );

        const bannedGamesJson = fs.readFileSync(`./Database/realm/${guildid}/${this.RealmId}/BannedDevices.json`);
        const ParsedBannedGames = JSON.parse(bannedGamesJson);
        const bannedGamesSet = new Set(ParsedBannedGames);

        var global = fs.readFileSync(
            `./Database/GlobalbanDB.json`
        );

        if (globalStatus) {
            if (global.includes(xbox_user_id)) {
                console.log(`[GLOBAL]`.bold.red + ` Global Banned ${playerName}`.green + ` Time: ${this.date}`.cyan)
                this.client.write("command_request", {
                    command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Global Banned`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                })
                BedrockClient.queue("command_request", {
                    command: `tellraw @a {"rawtext":[{"text":"§7[§9CosmosAC§7]\n=- §bUsername: ${playerName}\n§7=- §bReason: §3Global Banned"}]}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                IncreaseKicks()
                if (automod) {
                    const AutomodEmbed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(pfp)
                        .setDescription(`
${WARNING} __Kicked__ ${storedName}
${end} **Reason:** \`Global Banned\`
`)
                        .setFooter({ text: `Realm: ${realmname}` })
                        .setTimestamp()
                    this.SendEmbed(automod, AutomodEmbed)
                    return
                }
            }
        }


        const header = {
            'x-xbl-contract-version': 1,
            accept: 'application/json',
            Authorization: `XBL3.0 x=${this.XboxProfile.userHash};${this.XboxProfile.XSTSToken}`,
            'accept-language': 'en-US',
            Connection: 'Keep-Alive',
            'Accept-Encoding': 'gzip',
            'User-Agent': 'okhttp/4.9.1',
        }
        var GetGamerscoreAndPFP = {
            method: "get",
            url: `https://profile.xboxlive.com/users/xuid(${(xbox_user_id)})/profile/settings?settings=Gamerscore`,
            headers: XboxAuth,
        }
        var GetGames = {
            method: "get",
            url: `https://titlehub.xboxlive.com:443/users/xuid(${(xbox_user_id)})/titles/titlehistory/decoration/achievement,image,scid`,
            headers: header
        }
        var GetFollowers = {
            method: "get",
            url: `https://social.xboxlive.com:443/users/xuid(${(xbox_user_id)})/summary`,
            headers: header
        }
        var GetSocials = {
            method: "get",
            url: `https://peoplehub.xboxlive.com:443/users/xuid(${(xbox_user_id)})/people/social/decoration/multiplayersummary,preferredcolor`,
            headers: header
        }
        if (whitelist.includes(xbox_user_id)) {
            console.log(`[Automod]`.red + ` ${playerName} (${xbox_user_id}) Whitelisted`.green + ` [${this.date}]`.gray)
            return
        }
        if (this.XboxProfile.userXUID === xbox_user_id) {
            return
        }
        if (bannedGamesSet.has(DEVICE)) {
            console.log(`[Automod]`.red + ` Flagged ${playerName} (${xbox_user_id})`.green + ` Reason: Banned Device (${device})`.yellow + ` \nRealm: ${realmname} [${this.date}]`.gray)
            BedrockClient.write("command_request", {
                command: `kick ${playerName} \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Playing on a Banned Device\n§7=- §6Device: §e${device}\n§7=- §3Discord: ${discordCode}`,
                version: 2,
                origin: {
                    type: 0,
                    uuid: "",
                    request_id: "",
                },
            })
            BedrockClient.queue("command_request", {
                command: `tellraw @a {"rawtext":[{"text":"§7[§9CosmosAC§7]\n=- §bUsername: ${playerName}\n§7=- §bPlaying on a Banned Device\n§7=- §6Device: §e${device}"}]}`,
                version: 2,
                origin: {
                    type: 0,
                    uuid: "",
                    request_id: "",
                },
            });
            IncreaseKicks()
            if (automod) {
                const AutomodEmbed = new EmbedBuilder()
                    .setColor(corange)
                    .setThumbnail(pfp)
                    .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${reply} **Reason:** \`Playing on a Banned Device\`
${end} **Device:** \`${device}\`
`)
                    .setFooter({ text: `Realm: ${realmname}` })
                    .setTimestamp()
                this.SendEmbed(automod, AutomodEmbed)
            }
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
            const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
            const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
            kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
            fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))
            return
        }
        if (fs.existsSync(filePath)) {
            const dataJson = fs.readFileSync(filePath);
            const data = JSON.parse(dataJson);
            const Data = data.Data
            const Xuid = data.xuid
            const reason = data.reason
            const realm = data.realm
            const time = data.time ?? 'Unknown'
            IncreaseKicks()
            if (reason === 'Recently Played Banned Device' && realm === realmname) {
                console.log(`[Automod]`.red + ` Flagged ${playerName} (${Xuid})`.green + ` Reason: ${reason} (${time} on ${Data})`.yellow + ` \nRealm: ${realm} [${this.date}]`.gray)
                BedrockClient.write("command_request", {
                    command: `kick ${playerName} \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Recently Played Banned Device\n§7=- §6Device: §e${Data}\n§7=- §6Time Ago: ${time} Hour(s) Ago\n§7=- §3Discord: ${discordCode}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                })
                BedrockClient.queue("command_request", {
                    command: `tellraw @a {"rawtext":[{"text":"§7[§9CosmosAC§7]\n=- §bUsername: ${playerName}\n§7=- §bRecently Played Banned Device\n§7=- §6Device: §e${Data}\n§7=- §6Time Ago: ${time} Hour(s) Ago"}]}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                if (automod) {
                    const AutomodEmbed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(pfp)
                        .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${reply} **Reason:** \`Recently Played Banned Device\`
${reply} **Time Ago:** \`${time} Hour(s)\`
${end} **Device:** \`${Data}\`
`)
                        .setFooter({ text: `Realm: ${realmname}` })
                        .setTimestamp()
                    this.SendEmbed(automod, AutomodEmbed)
                }
                const endTime = performance.now();
                const elapsedTime = endTime - startTime;
                console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
                const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))
                return
            } else if (reason === 'Not Enough Gamerscore' && realm === realmname) {
                BedrockClient.write("command_request", {
                    command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Not Enough Gamerscore\n§7=- §6Current: §e${Data}/${MinGamerscore}\n§7=- §3Discord: ${discordCode}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                BedrockClient.queue("command_request", {
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC§7]\n =- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Gamerscore\n§7=- §6Current: §e${Data}/${MinGamerscore}"}]}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                console.log(`[Automod]`.red + ` Flagged ${playerName} (${xbox_user_id})`.green + ` Reason: Not Enough Gamerscore (${Data})`.yellow + ` \nRealm: ${realmname} [${this.date}]`.gray)
                if (automod) {
                    const AutomodEmbed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(pfp)
                        .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${reply} **Reason:** \`Not Enough Gamerscore\`
${end} **Gamerscore:** \`${Data}\`
`)
                        .setFooter({ text: `Realm: ${realmname}` })
                        .setTimestamp()
                    this.SendEmbed(automod, AutomodEmbed)
                }
                const endTime = performance.now();
                const elapsedTime = endTime - startTime;
                console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
                const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))
                return
            } else if (reason === 'Not Enough Followers' && realm === realmname) {
                BedrockClient.write("command_request", {
                    command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Not Enough Followers\n§7=- §6Current: §e${Data}/${MinFollowers}\n§7=- §3Discord: ${discordCode}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                BedrockClient.queue("command_request", {
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC§7]\n =- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Followers\n§7=- §6Current: §e${Data}/${MinFollowers}"}]}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                console.log(`[Automod]`.red + ` Flagged ${playerName} (${xbox_user_id})`.green + ` Reason: Not Enough Followers (${Data})`.yellow + ` \nRealm: ${realmname} [${this.date}]`.gray)
                if (automod) {
                    const AutomodEmbed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(pfp)
                        .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${reply} **Reason:** \`Not Enough Followers\`
${end} **Followers:** \`${Data}\`
`)
                        .setFooter({ text: `Realm: ${realmname}` })
                        .setTimestamp()
                    this.SendEmbed(automod, AutomodEmbed)
                }
                const endTime = performance.now();
                const elapsedTime = endTime - startTime;
                console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
                const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))
                return
            } else if (reason === 'Not Enough Friends' && realm === realmname) {
                BedrockClient.write("command_request", {
                    command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Not Enough Friends\n§7=- §6Current: §e${Data}/${MinFriends}\n§7=- §3Discord: ${discordCode}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                BedrockClient.queue("command_request", {
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC§7]\n =- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Friends\n§7=- §6Current: §e${Data}/${MinFriends}"}]}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                console.log(`[Automod]`.red + ` Flagged ${playerName} (${xbox_user_id})`.green + ` Reason: Not Enough Friends (${Data})`.yellow + ` \nRealm: ${realmname} [${this.date}]`.gray)
                if (automod) {
                    const AutomodEmbed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(pfp)
                        .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${reply} **Reason:** \`Not Enough Friends\`
${end} **Friends:** \`${Data}\`
`)
                        .setFooter({ text: `Realm: ${realmname}` })
                        .setTimestamp()
                    this.SendEmbed(automod, AutomodEmbed)
                }
                const endTime = performance.now();
                const elapsedTime = endTime - startTime;
                console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
                const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))
                return
            } else if (reason === 'Not Enough Games' && realm === realmname) {
                BedrockClient.write("command_request", {
                    command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Not Enough Games\n§7=- §6Current: §e${Data}/${MinGames}\n§7=- §3Discord: ${discordCode}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                BedrockClient.queue("command_request", {
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC§7]\n =- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Games\n§7=- §6Current: §e${Data}/${MinGames}"}]}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                console.log(`[Automod]`.red + ` Flagged ${playerName} (${xbox_user_id})`.green + ` Reason: Not Enough Games (${Data})`.yellow + ` \nRealm: ${realmname} [${this.date}]`.gray)
                if (automod) {
                    const AutomodEmbed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(pfp)
                        .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${reply} **Reason:** \`Not Enough Games\`
${end} **Games:** \`${Data}\`
`)
                        .setFooter({ text: `Realm: ${realmname}` })
                        .setTimestamp()
                    this.SendEmbed(automod, AutomodEmbed)
                }
                const endTime = performance.now();
                const elapsedTime = endTime - startTime;
                console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
                const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))
                return
            } else if (reason === 'Profile Private' && realm === realmname) {
                BedrockClient.write("command_request", {
                    command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Profile Is Private\n§7=- §3Discord: ${discordCode}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                BedrockClient.queue("command_request", {
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC§7]\n =- §bUsername: ${playerName}\n§7=- §bReason: §3Profile Is Private"}]}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                console.log(`[Automod]`.red + ` Flagged ${playerName} (${xbox_user_id})`.green + ` Reason: Profile Is Private`.yellow + ` \nRealm: ${realmname} [${this.date}]`.gray)
                if (automod) {
                    const AutomodEmbed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(pfp)
                        .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${end} **Reason:** \`Profile Is Private\`
`)
                        .setFooter({ text: `Realm: ${realmname}` })
                        .setTimestamp()
                    this.SendEmbed(automod, AutomodEmbed)
                }
                const endTime = performance.now();
                const elapsedTime = endTime - startTime;
                console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
                const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))
                return
            }
        }


        Promise.all([axios(GetGamerscoreAndPFP), axios(GetSocials), axios(GetFollowers), axios(GetGames)])
            .then(function (results) {
                const pfp = results[0].data?.profileUsers[0]?.settings[0]?.value;
                const gamerscore = results[0].data?.profileUsers[0]?.settings[1]?.value;
                const friendsAmount = results[1].data.people;
                const Friends = friendsAmount.length;
                const Followers = results[2].data.targetFollowerCount;
                const Games = results[3].data.titles;
                const GamesAmount = Games.length;
                const Gamelist = Games.slice(0, 5);

                if (MinGamerscore > gamerscore && device !== 'Playstation') {
                    BedrockClient.write("command_request", {
                        command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Not Enough Gamerscore\n§7=- §6Current: §e${gamerscore}/${MinGamerscore}\n§7=- §3Discord: ${discordCode}`,
                        version: 2,
                        origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                        },
                    });
                    BedrockClient.queue("command_request", {
                        command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC§7]\n=- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Gamerscore\n§7=- §6Current: §e${gamerscore}/${MinGamerscore}"}]}`,
                        version: 2,
                        origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                        },
                    });
                    IncreaseKicks()
                    console.log(`[Automod]`.red + ` Flagged ${playerName} (${xbox_user_id})`.green + ` Reason: Not Enough Gamerscore (${gamerscore})`.yellow + ` \nRealm: ${realmname} [${FullDate}]`.gray)
                    if (automod) {
                        const AutomodEmbed = new EmbedBuilder()
                            .setColor(corange)
                            .setThumbnail(pfp)
                            .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${reply} **Reason:** \`Not Enough Gamerscore\`
${end} **Gamerscore:** \`${gamerscore}\`
    `)
                            .setFooter({ text: `Realm: ${realmname}` })
                            .setTimestamp()
                        this.SendEmbed(automod, AutomodEmbed)
                    }
                    KicksDB.set(`${playerName}`, {
                        reason: "Not Enough Gamerscore",
                        Data: gamerscore,
                        xuid: xbox_user_id
                    });
                    KicksDB.save();
                    const endTime = performance.now();
                    const elapsedTime = endTime - startTime;
                    console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
                    const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                    const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                    kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                    fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))
                    const data = {
                        reason: "Not Enough Gamerscore",
                        Data: gamerscore,
                        xuid: xbox_user_id,
                        realm: realmname
                    };

                    fs.writeFileSync(`./Database/PlayersDB/KicksDB/${playerName}.json`, JSON.stringify(data, null, 2));
                    if (fs.existsSync(filePath)) {
                        setTimeout(() => {
                            try {
                                fs.unlinkSync(filePath);
                            } catch (e) {
                                console.log(e)
                            }
                        }, 6 * 60 * 60 * 1000);
                        return
                    }
                } else if (MinFollowers > Followers) {
                    BedrockClient.write("command_request", {
                        command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Not Enough Followers\n§7=- §6Current: §e${Followers}/${MinFollowers}\n§7=- §3Discord: ${discordCode}`,
                        version: 2,
                        origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                        },
                    });
                    BedrockClient.queue("command_request", {
                        command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosA§7]\n=- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Followers\n§7=- §6Current: §e${Followers}/${MinFollowers}"}]}`,
                        version: 2,
                        origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                        },
                    });
                    IncreaseKicks()
                    console.log(`[Automod]`.red + ` Flagged ${playerName} (${xbox_user_id})`.green + ` Reason: Not Enough Followers (${Followers})`.yellow + ` \nRealm: ${realmname} [${FullDate}]`.gray)
                    if (automod) {
                        const AutomodEmbed = new EmbedBuilder()
                            .setColor(corange)
                            .setThumbnail(pfp)
                            .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${reply} **Reason:** \`Not Enough Followers\`
${end} **Followers:** \`${Followers}\`
`)
                            .setFooter({ text: `Realm: ${realmname}` })
                            .setTimestamp()
                        this.SendEmbed(automod, AutomodEmbed)
                    }
                    KicksDB.set(`${playerName}`, {
                        reason: "Not Enough Followers",
                        Data: Followers,
                        xuid: xbox_user_id
                    });
                    KicksDB.save();
                    const endTime = performance.now();
                    const elapsedTime = endTime - startTime;
                    console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
                    const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                    const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                    kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                    fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))

                    const data = {
                        reason: "Not Enough Followers",
                        Data: Followers,
                        xuid: xbox_user_id,
                        realm: realmname
                    };

                    fs.writeFileSync(`./Database/PlayersDB/KicksDB/${playerName}.json`, JSON.stringify(data, null, 2));
                    if (fs.existsSync(filePath)) {
                        setTimeout(() => {
                            try {
                                fs.unlinkSync(filePath);
                            } catch (e) {
                                console.log(e)
                            }
                        }, 6 * 60 * 60 * 1000);
                    }
                    return
                } else if (MinFriends > Friends) {
                    BedrockClient.write("command_request", {
                        command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Not Enough Friends\n§7=- §6Current: §e${Friends}/${MinFriends}\n§7=- §3Discord: ${discordCode}`,
                        version: 2,
                        origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                        },
                    });
                    BedrockClient.queue("command_request", {
                        command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC§7]\n=- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Friends\n§7=- §6Current: §e${Friends}/${MinFriends}"}]}`,
                        version: 2,
                        origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                        },
                    });
                    IncreaseKicks()
                    console.log(`[Automod]`.red + ` Flagged ${playerName} (${xbox_user_id})`.green + ` Reason: Not Enough Friends (${Friends})`.yellow + ` \nRealm: ${realmname} [${FullDate}]`.gray)
                    if (automod) {
                        const AutomodEmbed = new EmbedBuilder()
                            .setColor(corange)
                            .setThumbnail(pfp)
                            .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${reply} **Reason:** \`Not Enough Friends\`
${end} **Friends:** \`${Friends}\`
`)
                            .setFooter({ text: `Realm: ${realmname}` })
                            .setTimestamp()
                        this.SendEmbed(automod, AutomodEmbed)
                    }
                    KicksDB.set(`${playerName}`, {
                        reason: "Not Enough Friends",
                        Data: Friends,
                        xuid: xbox_user_id
                    });
                    KicksDB.save();
                    const endTime = performance.now();
                    const elapsedTime = endTime - startTime;
                    console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
                    const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                    const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                    kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                    fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))

                    const data = {
                        reason: "Not Enough Friends",
                        Data: Friends,
                        xuid: xbox_user_id,
                        realm: realmname
                    };

                    fs.writeFileSync(`./Database/PlayersDB/KicksDB/${playerName}.json`, JSON.stringify(data, null, 2));
                    if (fs.existsSync(filePath)) {
                        setTimeout(() => {
                            try {
                                fs.unlinkSync(filePath);
                            } catch (e) {
                                console.log(e)
                            }
                        }, 6 * 60 * 60 * 1000);
                    }
                    return
                } else if (MinGames > GamesAmount) {
                    BedrockClient.write("command_request", {
                        command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Not Enough Games\n§7=- §6Current: §e${GamesAmount}/${MinGames}\n§7=- §3Discord: ${discordCode}`,
                        version: 2,
                        origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                        },
                    });
                    BedrockClient.queue("command_request", {
                        command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC§7]\n=- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Games\n§7=- §6Current: §e${GamesAmount}/${MinGames}"}]}`,
                        version: 2,
                        origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                        },
                    });
                    IncreaseKicks()
                    console.log(`[Automod]`.red + ` Flagged ${playerName} (${xbox_user_id})`.green + ` Reason: Not Enough Games (${GamesAmount})`.yellow + ` \nRealm: ${realmname} [${FullDate}]`.gray)
                    if (automod) {
                        const AutomodEmbed = new EmbedBuilder()
                            .setColor(corange)
                            .setThumbnail(pfp)
                            .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${reply} **Reason:** \`Not Enough Games\`
${end} **Games:** \`${GamesAmount}\`
    `)
                            .setFooter({ text: `Realm: ${realmname}` })
                            .setTimestamp()
                        this.SendEmbed(automod, AutomodEmbed)
                    }
                    KicksDB.set(`${playerName}`, {
                        reason: "Not Enough Games",
                        Data: GamesAmount,
                        xuid: xbox_user_id
                    });
                    KicksDB.save();
                    const endTime = performance.now();
                    const elapsedTime = endTime - startTime;
                    console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
                    const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                    const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                    kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                    fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))

                    const data = {
                        reason: "Not Enough Games",
                        Data: GamesAmount,
                        xuid: xbox_user_id,
                        realm: realmname
                    };

                    fs.writeFileSync(`./Database/PlayersDB/KicksDB/${playerName}.json`, JSON.stringify(data, null, 2));
                    if (fs.existsSync(filePath)) {
                        setTimeout(() => {
                            try {
                                fs.unlinkSync(filePath);
                            } catch (e) {
                                console.log(e)
                            }
                        }, 6 * 60 * 60 * 1000);
                    }
                    return
                }
                Gamelist.find((game) => {
                    if (bannedGamesSet.has(game.name)) {
                        try {
                            const lastTimePlayed = new Date(game.titleHistory.lastPlayed);
                            const now = new Date();
                            const diffTime = Math.abs(now - lastTimePlayed);
                            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                            const diffMinutes = Math.ceil(diffTime / (1000 * 60));
                            if (diffHours <= 24) {
                                IncreaseKicks()
                                console.log(`[API]`.bold.red + ` Flagged ${playerName} From ${realmname}`.green + ` Reason: Recently Played Banned Device | Device: ${game.name} | ${diffHours} Hours Ago`.yellow + ` Time: ${timeString}`.cyan)
                                BedrockClient.write("command_request", {
                                    command: `kick ${playerName} \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Recently Played Banned Device\n§7=- §6Device: §e${game.name}\n§7=- §6Time Ago: ${diffHours} Hour(s) Ago\n§7=- §3Discord: ${discordCode}`,
                                    version: 2,
                                    internal: true,
                                    origin: {
                                        type: 0,
                                        uuid: "",
                                        request_id: "",
                                    },
                                })
                                BedrockClient.queue("command_request", {
                                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC§7]\n=- §bUsername: ${playerName}\n§7=- §bReason: §3Recently Played Banned Device\n§7=- §6Device: §e${game.name}\n§7=- §6Time Ago: ${diffHours} Hour(s) Ago"}]}`,
                                    version: 2,
                                    origin: {
                                        type: 0,
                                        uuid: "",
                                        request_id: "",
                                    },
                                });
                                console.log(`[Automod]`.red + ` Flagged ${playerName} (${xbox_user_id})`.green + ` Reason: Recently Played Banned Device (${game.name}, ${diffHours};${diffMinutes})`.yellow + ` \nRealm: ${realmname} [${FullDate}]`.gray)
                                if (automod) {
                                    const AutomodEmbed = new EmbedBuilder()
                                        .setColor(corange)
                                        .setThumbnail(pfp)
                                        .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${reply} **Reason:** \`Recently Played Banned Device\`
${reply} **Time:** \`${diffHours}hrs, ${diffMinutes}mins\` Ago
${end} **Device:** \`${game.name}\`
`)
                                        .setFooter({ text: `Realm: ${realmname}` })
                                        .setTimestamp()
                                    this.SendEmbed(automod, AutomodEmbed)
                                }
                                KicksDB.set(`${playerName}`, {
                                    reason: "Recently Played Banned Device",
                                    Data: game.name,
                                    time: diffHours,
                                    xuid: xbox_user_id
                                });
                                KicksDB.save();
                                const endTime = performance.now();
                                const elapsedTime = endTime - startTime;
                                console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
                                const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                                const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                                kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                                fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))

                                const data = {
                                    reason: "Recently Played Banned Device",
                                    Data: game.name,
                                    time: diffHours,
                                    xuid: xbox_user_id,
                                    realm: realmname
                                };

                                fs.writeFileSync(`./Database/PlayersDB/KicksDB/${playerName}.json`, JSON.stringify(data, null, 2));
                                if (fs.existsSync(filePath)) {
                                    setTimeout(() => {
                                        try {
                                            fs.unlinkSync(filePath);
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }, 6 * 60 * 60 * 1000);
                                }
                                return true
                            }
                        } catch (e) {
                            console.log(e)
                        }
                    }
                })
            })
            .catch(function (error) {
                fs.appendFileSync(`Error.txt`, `Realm: ${realmname} | ${error}\n`, err => {
                    console.warn(err)
                })
                BedrockClient.write("command_request", {
                    command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: Profile Private\n§7=- §3Discord: ${discordCode}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                BedrockClient.queue("command_request", {
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC Kicked§7]\n=- §bUsername: ${playerName}\n§7=- §bReason: §3Profile Private\"}]}`,
                    version: 2,
                    origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                    },
                });
                IncreaseKicks()
                console.log(`[Automod]`.red + ` Flagged ${playerName} (${xbox_user_id})`.green + ` Reason: Profile Private`.yellow + ` \nRealm: ${realmname} [${FullDate}]`.gray)
                if (automod) {
                    const AutomodEmbed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(pfp)
                        .setDescription(`
${WARNING} __Kicked__ ${storedName}

**__ Automod Info __**
${end} **Reason:** \`Profile Private\`
`)
                        .setFooter({ text: `Realm: ${realmname}` })
                        .setTimestamp()
                    this.SendEmbed(automod, AutomodEmbed)
                }
                KicksDB.set(`${playerName}`, {
                    reason: "Profile Private",
                    Data: 0,
                    xuid: xbox_user_id
                });
                KicksDB.save();
                const endTime = performance.now();
                const elapsedTime = endTime - startTime;
                console.log(`[Automod]`.red + ` Kicked ${playerName} in ${elapsedTime}ms`.magenta);
                const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))

                const data = {
                    reason: "Profile Private",
                    Data: 0,
                    xuid: xbox_user_id,
                    realm: realmname
                };

                fs.writeFileSync(`./Database/PlayersDB/KicksDB/${playerName}.json`, JSON.stringify(data, null, 2));
                if (fs.existsSync(filePath)) {
                    setTimeout(() => {
                        try {
                            fs.unlinkSync(filePath);
                        } catch (e) {
                            console.log(e)
                        }
                    }, 6 * 60 * 60 * 1000);
                }
                return
            });


        function IncreaseKicks() {
            const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
            const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
            fs.writeFileSync(dbPath, JSON.stringify(KickSent));
        }
    }
}

module.exports = {
    ClientStart
};