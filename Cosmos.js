const { Client, Events, GatewayIntentBits, Collection, EmbedBuilder, Partials } = require('discord.js');
const { token } = require('./config.json');
const fs = require('node:fs');
const { Authflow } = require("prismarine-auth");
const axios = require('axios');
const path = require('node:path');
const editJsonFile = require("edit-json-file");
require('colors')
//Colors
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


const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
	],
	partials: [
		Partials.Channel,
		Partials.Message
	]
});



client.setMaxListeners(20);
module.exports = client;

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, 'Commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'Events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


client.login(token);

let Unbanned = 0;

setInterval(() => {
	try {
		const RealmBanFilePath = './Database/RealmBans.json';
		const RealmBans = editJsonFile(RealmBanFilePath)
		const RealmBanJsonData = fs.readFileSync(RealmBanFilePath)
		const data = JSON.parse(RealmBanJsonData);
		const keys = Object.keys(data);

		for (let i = 0; i < keys.length; i++) {
			const BanData = data[keys[i]];

			const Xuid = BanData.Xuid
			const Gamertag = BanData.Gamertag
			const Reason = BanData.Reason
			const Timestamp = BanData.Length
			const RealmIDs = BanData.RealmID
			const GuildId = BanData.Guild
			const Pfp = BanData.pfp
			const GuildName = BanData.guildName
			const GuildPfp = BanData.guildPfp
			const BannedBy = BanData.bannedBy
			const BannedByPfp = BanData.bannedByPfp
			const RealmName = BanData.RealmNames

			let LengthString = '';
			if (Timestamp === 'Permanent') {
				LengthString = 'Permanent'
			} else {
				LengthString = `<t:${Timestamp}:f>`
			}

			const now = Math.floor(Date.now() / 1000)
			if (Timestamp <= now) {
				Unbanned++

				delete data[keys[i]];

				fs.writeFileSync(RealmBanFilePath, JSON.stringify(data, null, 2));
				if (Array.isArray(RealmIDs)) {
					RealmIDs.forEach(id => {
						if (fs.existsSync(`./Database/realm/${GuildId}/${id}/config.json`)) {
							const ConfigFile = editJsonFile(`./Database/realm/${GuildId}/${id}/config.json`)
							const BanLogs = ConfigFile.get("Ban-Logs") ?? 'Unknown'

							if (BanLogs === 'Unknown') {
								return
							}

							const banLogged = new EmbedBuilder()
								.setColor(cgreen)
								.setThumbnail(Pfp)
								.setAuthor({ name: `${GuildName}`, iconURL: GuildPfp })
								.setDescription(`
${success} **Realm Unbanned**
${end} **Gamertag:** \`${Gamertag}\`
		
**__ Unbanned Info __**
${reply} **Length:** ${LengthString}
${end} **Reason:** \`${Reason}\`

**__ Realms Unbanned From __**
		`)
								.setFooter({ text: `Executed By ${BannedBy}`, iconURL: BannedByPfp })
								.setTimestamp()
							RealmName.forEach((name, index) => {
								banLogged.addFields({
									name: `${success} **Realm:** \`${name}\``,
									value: `${end} Successfully Unbanned`
								})
								if (index === RealmIDs.length - 1) {
									client.channels
										.fetch(BanLogs)
										.then(async (channel) => await channel.send({ embeds: [banLogged] }))
										.catch((error) => {
											console.error(error);
										});
								}
							})
						}
					});
				} else {
					if (fs.existsSync(`./Database/realm/${GuildId}/${RealmIDs}/config.json`)) {
						const ConfigFile = editJsonFile(`./Database/realm/${GuildId}/${RealmIDs}/config.json`)
						const BanLogs = ConfigFile.get("Ban-Logs") ?? 'Unknown'

						if (BanLogs === 'Unknown') {
							return
						}
						new Authflow("", `./Database/Oauth/${GuildId}`, {
							flow: 'msal',
							relyingParty: "https://pocket.realms.minecraft.net/",
						})
							.getXboxToken()
							.then(async (PocketRealm) => {
								const PocketRealmAuth = JSON.parse(
									JSON.stringify({
										"x-xbl-contract-version": "2",
										Authorization: `XBL3.0 x=${PocketRealm.userHash};${PocketRealm.XSTSToken}`,
										"Accept-Language": "en-US",
										maxRedirects: 1,
									})
								)
								var BanRequest = {
									method: "delete",
									url: `https://pocket.realms.minecraft.net/worlds/${RealmIDs}/blocklist/${Xuid}`,
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
								axios(BanRequest)
									.then((res) => {

										const banLogged = new EmbedBuilder()
											.setColor(cgreen)
											.setThumbnail(Pfp)
											.setAuthor({ name: `${GuildName}`, iconURL: GuildPfp })
											.setDescription(`
${success} **Realm Unbanned**
${end} **Gamertag:** \`${Gamertag}\`

**__ Unbanned Info __**	
${reply} **Length:** ${LengthString}
${end} **Reason:** \`${Reason}\`

**__ Realm Info __**
${end} **Name:** \`${RealmName}\`
	`)
											.setFooter({ text: `Executed By ${BannedBy}`, iconURL: BannedByPfp })
											.setTimestamp()
										client.channels
											.fetch(BanLogs)
											.then(async (channel) => await channel.send({ embeds: [banLogged] }))
											.catch((error) => {
												console.error(error);
											});
									}).catch((error) => {
										console.log(error)
									})
							})
					}
				}

			}
		}
	} catch (e) {
		console.log(e)
	}
}, 240000)
const LiveEmbeds = editJsonFile(`./Database/LiveEmbeds.json`)


const { LivePlayerlist } = require('./PlayerlistEmbed.js')

for (const [guildId, realmId] of Object.entries(LiveEmbeds.data)) {
	for (const realmIdEntry of realmId) {
	}
}


process.on('unhandledRejection', (error) => {
	console.error('Unhandled promise rejection:', error);
});