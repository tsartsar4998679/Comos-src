const { Events, ActivityType, Embed, EmbedBuilder } = require('discord.js');
require('colors');
const fs = require('node:fs');
const editJsonFile = require("edit-json-file");
const path = require('path');

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
	name: Events.ClientReady,
	once: true,
	execute(client) {

		const totalMembers = client.guilds.cache.reduce((acc, guild) => {
			return acc + guild.memberCount;
		}, 0);
		let kicks = editJsonFile(`./Database/Stats/kickCounts.json`);
		const kickCount = kicks.get(`kickCount`);

		let joins = editJsonFile(`./Database/Stats/joins.json`);
		const joinCount = joins.get(`Join`);

		let Gametest = editJsonFile(`./Database/Stats/Gametest.json`);
		const GametestCount = Gametest.get(`Gametest`);

		let Chats = editJsonFile(`./Database/Stats/chatRelayed.json`);
		const ChatRelayed = Chats.get(`Chat`);

		const global = fs.readFileSync('./Database/GlobalbanDB.json');
		const parsedGlobal = JSON.parse(global);
		const totalban = parsedGlobal.length

		const mainACC = './Database/Oauth';
		const itemsMAIN = fs.readdirSync(mainACC);
		const MainAccFolder = itemsMAIN.filter(item => fs.statSync(`${mainACC}/${item}`).isDirectory());
		const TotalMainAccounts = MainAccFolder.length;

		const botACC = './Database/BotAccounts';
		const itemsBOT = fs.readdirSync(botACC);
		const BotAccFolder = itemsBOT.filter(item => fs.statSync(`${botACC}/${item}`).isDirectory());
		const TotalBotAccounts = BotAccFolder.length;

		const realms = './Database/realm';
		const itemsRealms = fs.readdirSync(realms);
		const Realms = itemsRealms.filter(item => fs.statSync(`${realms}/${item}`).isDirectory());
		const TotalRealms = Realms.length;


		const activities = [
			`${totalMembers} Users`,
			`${client.guilds.cache.size} Servers`,
			`${totalban} Global Bans`,
			`${TotalMainAccounts} Main Accounts`,
			`${TotalBotAccounts} Bot Accounts`,
			`${TotalRealms} Total Realms`,
			`${ChatRelayed} Chats Relayed`,
			`${GametestCount} Gametest Relayed`,
			`${joinCount} Joins`,
			`${kickCount} Kicks Sent`
		];
		console.log(`[READY] `.bold.green + `${client.user.tag}`.red + ` is online!`.yellow)
		console.log(`[READY] `.bold.green + `Serving`.yellow + ` ${client.guilds.cache.size}`.red + ` Servers`.yellow)

		let activityIndex = 0;

		client.user.setPresence({
			activities: [{ name: activities[activityIndex], type: ActivityType.Watching }],
			status: 'idle',
		});

		setInterval(() => {
			activityIndex = (activityIndex + 1) % activities.length;
			client.user.setPresence({
				activities: [{ name: activities[activityIndex], type: ActivityType.Watching }],
				status: 'idle',
			});
		}, 10000);
	},
}; 