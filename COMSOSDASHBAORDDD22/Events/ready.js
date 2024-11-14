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

		client.user.setPresence({
			activities: [{ name: 'Main Bot Down', type: ActivityType.Watching }],
			status: 'dnd',
		});
	},
}; 