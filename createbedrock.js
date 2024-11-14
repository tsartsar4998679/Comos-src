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

const cred = `#800020`;
const cgreen = `#228B22`;
const corange = `#FF3131`;
const cpurple = `#800080`;

let reply = `<:reply:1068634523522306068>`;
let end = `<:replay_end:1068634568502026391>`;
let success = `<:5104yes:1082793438359072858>`;
let denied = `<:4330no:1082793436920422530>`;
let warning = `<:warning1:1082789666568294500> `

let removed = `<:4805_red_minus:1082798537877770370>`;
let add = `<:8090_green_plus:1082798539379331102>`;

const editJsonFile = require("edit-json-file");
const axios = require("axios");
const bedrock = require("bedrock-protocol");
const { Authflow } = require("prismarine-auth");
const fs = require("fs");
const path = require('path');
const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const { performance } = require('perf_hooks');
const prefix = '!'
const discordClient = require('./Cosmos.js')

var LOGS = `1088270010176249876`

//Time
//Anti-Spam
let rA = 0;

const max = 3;

const {
  EmbedBuilder
} = require("discord.js");
require('colors');

class RealmStart {
  constructor(realmidss, guild) {
    this.realmidsss = realmidss;
    this.guild = guild
    this.connectionReady = false
    this.client = null;
    this.date = new Date();
    if (!this.client) {
      try {
        this.getRealmClient().then((client) => {
          this.client = client;
          let file = editJsonFile(`./Database/realm/${this.guild}/${this.realmidsss}/config.json`);
          let realmName = file.get(`RealmName`)
          const now = new Date();
          const hours = now.getHours();
          const minutes = now.getMinutes();
          const seconds = now.getSeconds();
          const amOrPm = hours >= 12 ? 'PM' : 'AM';
          const formattedHours = hours % 12 || 12;
          const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
          const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
          const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}${amOrPm}`;
          const moment = require('moment-timezone');
          const EST = 'America/New_York';
          moment.tz.setDefault(EST);

          console.log(`[+]`.bold.green + ` Client Created `.bold.red + ` | Realm ID: ${this.realmidsss}`.yellow + ` | Realm Name: ${realmName}`.green + ` Time: ${timeString}`.cyan)
          this.onStartup();
        });
      } catch (e) {
        console.log(e)
      }
    }
  }
  onStartup() {
    try {
      let file = editJsonFile(`./Database/realm/${this.guild}/${this.realmidsss}/config.json`);
      let realmName = file.get(`RealmName`)
      //Play Status
      this.client.on('play_status', (status) => {
        console.log(status.status)
        try {
          if (status.status === 'player_spawn') {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const amOrPm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
            const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}${amOrPm}`;
            const moment = require('moment-timezone');
            const EST = 'America/New_York';
            moment.tz.setDefault(EST);
            console.log(`[+]`.bold.green + ` Client Connected `.bold.red + ` | Realm ID: ${this.realmidsss}`.yellow + ` | Realm Name: ${realmName}`.green + ` Time: ${timeString}`.cyan)
            const embed = new EmbedBuilder()
              .setColor(cgreen)
              .setDescription(`
${success} **New Connection**

**__ Realm Info __**
${reply} **Name:** ${realmName}
${reply} **ID:** ${this.realmidsss}
${end} Successfully Connected
              `)
              .setTimestamp();
            discordClient.channels
              .fetch(LOGS)
              .then(async (channel) => await channel.send({ embeds: [embed] }))
              .catch((error) => {
                console.error(error);
              });

            const loginSuccessData = JSON.parse(fs.readFileSync('Database/Graphs/graphDataLogins.json'));
            const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
            loginSuccessData[isoDate] = (loginSuccessData[isoDate] || 0) + 1
            fs.writeFileSync('Database/Graphs/graphDataLogins.json', JSON.stringify(loginSuccessData, null, 2))
          }
        } catch (error) {
          console.error(error);
        }
      });
      //Gametest Relay
      try {
        this.client.on("text", (packet) => {
          if (["whisper", "chat", "announcement", "translation"].includes(packet.type)) {
            return;
          }
          const message = JSON.parse(packet.message);
          try {
            if (message && message.rawtext && message.rawtext.find(text => text.translate)) {
              return
            }
          } catch (e) {
            console.log(e)
          }
          let file = editJsonFile(`./Database/realm/${this.guild}/${this.realmidsss}/config.json`);
          let chat = file.get(`Chat-Relay-Logs`);
          let chatrank = file.get(`chattype`);
          let realmname = file.get('RealmName')

          if (chatrank === 'Gametest') {
            if (chat) {
              try {
                const obj = JSON.parse(packet.message.replace(/§./g, ""));
                IncreaseGametest()
                const autoMod = new EmbedBuilder()
                  .setColor(cpurple)
                  .setDescription(`
  ${obj.rawtext[0].text}
                    `)
                  .setFooter({ text: `Realm: ${realmname}` })
                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => await channel.send({ embeds: [autoMod] }))
                  .catch((error) => {
                    console.error(error);
                  });
              } catch (e) {
                console.log(e)
              }
            } else {
              console.log(`${realmName} Has Not Set Channel Logs For Chat-Relay Logs!`.red);
            }
          }
          function IncreaseGametest() {
            const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'Gametest.json');
            const GametestRelayed = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            GametestRelayed.Gametest = GametestRelayed.Gametest ? GametestRelayed.Gametest + 1 : 1;
            fs.writeFileSync(dbPath, JSON.stringify(GametestRelayed));
          }
        });
      } catch (e) {
        console.log(e);
      }
      //Discord Relay
      try {
        let file = editJsonFile(`./Database/realm/${this.guild}/${this.realmidsss}/config.json`);
        let chat = file.get(`Chat-Relay-Logs`);
        const now = Math.floor(Date.now() / 1000);
        const Premium = file.get("PremiumTime") ?? 0
        if (Premium === 0) {
        } else {
          if (now < Premium) {
            discordClient.on('messageCreate', (data) => {
              console.log(data)
              try {
                if (data.channelId !== `${chat}` || data.author.bot) return
                const member = data.guild.members.cache.get(data.author.id);
                const roleName = member.roles.highest.name;
                this.client.queue("command_request", {
                  command: `tellraw @a {"rawtext":[{"text":"§5[DISCORD] §9<§b[${roleName}] §9${data.author.tag}> §f${data.content}§r"}]}`,
                  version: 2,
                  origin: {
                    type: 0,
                    uuid: "",
                    request_id: "",
                  },
                });
              } catch (e) {
                console.log(e)
              }
            })
          }
        }
      } catch (e) {
      }
      //Death Relay
      try {
        this.client.on("text", (packet) => {
          let file = editJsonFile(`./Database/realm/${this.guild}/${this.realmidsss}/config.json`);
          let chat = file.get(`Death-Logs`);
          if (packet.type === 'translation') {
            if (packet.message === `§e%multiplayer.player.joined.realms`) {

            } else if (packet.message === `§e%multiplayer.player.left.realms`) {

            } else if (packet.message === 'death.attack.player') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Was murdered by \`${packet.parameters[1]}\`!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.magic') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]} Was killed by ${packet.parameters[1]}\` using magic!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.onFire') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Has succumbed to the Eternal Flame!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.onFire.player') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Has succumbed to The Eternal Flame while fighting \`${packet.parameters[1]}\`!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.inFire') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Has succumbed to the Eternal Flame!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.inFire.player') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Has succumbed to the Eternal Flame while fighting \`${packet.parameters[1]}\`!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.lava') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Died while trying to swim in lava!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.lava.player') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Died while trying to swim in lava to escape \`${packet.parameters[1]}\`!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.drown') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Drowned!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.explosion.player') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Was blown by a \`${packet.parameters[1]}\`!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.explosion') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Blew up!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.drown.player') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Was blown by \`${packet.parameters[1]}\`!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.inWall') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Suffocated in a wall! 
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.fall') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Hit the ground to hard!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.fell.accident.generic') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Fell from a high place!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.trident') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Was impaled by a trident!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.thrown') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Was pummeled by \`${packet.parameters[1]}\`!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }

            } else if (packet.message === 'death.attack.arrow') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Was shot by \`${packet.parameters[1]}\`!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }
            } else if (packet.message === 'death.attack.generic') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Got Thanos snapped!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }
            } else if (packet.message === 'death.attack.lightningBolt') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Was struck by lightning!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }
            } else if (packet.message === 'death.attack.mob.item') {
              if (chat) {
                console.log(`[Death-Logs]`.bold.green + ` ${packet.parameters} `.bold.red + ` | Realm Name: ${realmName}`.green)
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Was slain by \`${packet.parameters[1]}\` using \`${packet.parameters[3]}\`!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }
            } else if (packet.message === 'death.attack.mob') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Was slain by \`${packet.parameters[1]}\`!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }
            } else if (packet.message === 'death.attack.outOfWorld') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Has Fallen into the Eternal Void!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }
            } else if (packet.message === 'death.attack.player.item') {
              if (chat) {
                try {
                if (packet.parameters[2].includes('§')) {
                  try {
                    const obj = JSON.parse(packet.parameters[2].replace(/§./g, ""));
                    const embed = new EmbedBuilder()
                      .setColor(cred)
                      .setDescription(`
\`${packet.parameters[0]}\` Was murdered by \`${packet.parameters[1]}\` using \`${obj}\`!
                  `)

                    discordClient.channels
                      .fetch(chat)
                      .then(async (channel) => {
                        await channel.send({ embeds: [embed] });
                      })
                      .catch((error) => {
                        console.error(error);
                      });
                  } catch (e) {
                    console.log(e)
                  }
                }
              } catch (e) {
                console.log(e)
              }
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }
            } else if (packet.message === 'death.attack.starve') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Starved to death!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }
            } else if (packet.message === 'death.attack.wither') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Withered away!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }
            } else if (packet.message === 'death.attack.freeze') {
              if (chat) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
\`${packet.parameters[0]}\` Froze to death!
                  `)

                discordClient.channels
                  .fetch(chat)
                  .then(async (channel) => {
                    await channel.send({ embeds: [embed] });
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Death Logs!`)
              }
            }
          }
        })
      } catch (e) {
        console.log(e)
      }
      //Execute Commands
      try {
        let file = editJsonFile(`./Database/realm/${this.guild}/${this.realmidsss}/config.json`);
        let ConsoleChat = file.get(`ConsoleChannel`);
        const now = Math.floor(Date.now() / 1000);
        const Premium = file.get("PremiumTime") ?? 0

        if (Premium === 0) {
        } else {
          if (now < Premium) {
            discordClient.on('messageCreate', (data) => {
              try {
                if (data.channelId !== `${ConsoleChat}` || data.author.bot || !data.content.startsWith(prefix)) return

                const args = data.content.slice(prefix.length).trim().split(/ +/g);

                const command = args.join(' ');

                this.client.queue("command_request", {
                  command: `${command}`,
                  version: 2,
                  origin: {
                    type: 0,
                    uuid: "",
                    request_id: "",
                  },
                })
              } catch (e) {
                console.log(e)
              }
            })
          }
        }
      } catch (e) {
        console.log(e)
      }
      //Chat Relay
      try {
        this.client.on("text", (packet) => {
          let file = editJsonFile(`./Database/realm/${this.guild}/${this.realmidsss}/config.json`);
          let chat = file.get(`Chat-Relay-Logs`);
          let chatrank = file.get(`chattype`);
          let realmname = file.get('RealmName')
          if (chatrank === "Normal") {
            if (packet.type !== "chat" || !packet.source_name) return
            if (chat) {
              const embed = new EmbedBuilder()
                .setColor("Purple")
                .setDescription(`
**<${packet.source_name}>** ${packet.message}
                            `)
                .setFooter({ text: `Realm: ${realmname}` })
              discordClient.channels
                .fetch(chat)
                .then(async (channel) => {
                  IncreaseChatRelayed();
                  await channel.send({ embeds: [embed] });
                })
                .catch((error) => {
                  console.error(error);
                });
            } else {
              console.log(`${realmName} Has Not Set Channel Logs For Chat-Relay Logs!`)
            }
          }
          function IncreaseChatRelayed() {
            const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'chatRelayed.json');
            const ChatRelayed = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            ChatRelayed.Chat = ChatRelayed.Chat ? ChatRelayed.Chat + 1 : 1;
            fs.writeFileSync(dbPath, JSON.stringify(ChatRelayed));
          }
        })
      } catch (e) {
        console.log(e)
      }
      //Playerlist
      try {
        this.client.on("player_list", (packet) => {
          const realmid = this.realmidsss
          const startTime = performance.now();
          let file = editJsonFile(`./Database/realm/${this.guild}/${realmid}/config.json`);
          let players = editJsonFile(`./Database/PlayersDB/players.json`);
          let devicesDB = editJsonFile(`./Database/PlayersDB/DevicesDB.json`);
          let RecentsDB = editJsonFile(`./Database/realm/${this.guild}/${this.realmidsss}/recents.json`)
          let LastSeenDB = editJsonFile(`./Database/PlayersDB/Lastseen/lastseen.json`)
          let logs = file.get(`Join-Leave-Logs`);
          let discordCode = file.get('discordCode') ?? 'discord.gg/cosmosbot'
          let automod = file.get(`Automod-Logs`)
          let realmname = file.get('RealmName')
          let format = file.get(`embedformat`);
          let antiinvis = file.get(`antiinvis`);
          const now2 = new Date();
          const hours = now2.getHours();
          const minutes = now2.getMinutes();
          const seconds = now2.getSeconds();
          const amOrPm = hours >= 12 ? 'PM' : 'AM';
          const formattedHours = hours % 12 || 12;
          const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
          const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
          const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}${amOrPm}`;
          const moment = require('moment-timezone');
          const EST = 'America/New_York';
          moment.tz.setDefault(EST);
          const now = moment();
          const unixTimestamp = now.unix();
          new Authflow('', `./Database/BotAccounts/${this.guild}`, { relyingParty: 'http://xboxlive.com', flow: 'msal' }).getXboxToken().then(async (Xbox) => {
            if (packet.records.type === "add") {
              packet.records.records.forEach((player) => {
                IncreaseJoins()
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

                if (format === "gamerpic") {
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

                    console.log(`[+]`.bold.green + ` Username: ${player.username} - ${player.xbox_user_id} | ${realmname} `.yellow + ` Time: ${timeString}`.cyan)
                    if (logs) {
                      const embed = new EmbedBuilder()
                        .setColor(cgreen)
                        .setThumbnail(storedPfp)
                        .setDescription(`
  ${add} Realm __Connection__
  
  **__ Player Info __**
  ${reply} **Username:** ${player.username}
  ${reply} **Xuid:** ${storedXuid}
  ${end} **Device:** ${devices[player.build_platform]}
  `)
                        .setFooter({ text: `Realm: ${realmname}` })
                        .setTimestamp();
                      discordClient.channels
                        .fetch(logs)
                        .then(async (channel) => await channel.send({ embeds: [embed] }))
                        .catch((error) => {
                          console.error(error);
                        });
                    } else {
                      console.log(`${realmName} Has Not Set Channel Logs For Join/Leave Logs!`)
                    }
                  } else {

                    console.log(`[+]`.bold.green + ` Username: ${player.username} - ${player.xbox_user_id} | ${realmname} `.yellow + ` Time: ${timeString}`.cyan)
                    new Authflow('', `./Database/BotAccounts/${this.guild}`, { relyingParty: 'http://xboxlive.com', flow: 'msal' }).getXboxToken().then(async (t) => {
                      const auth = JSON.parse(JSON.stringify({
                        'x-xbl-contract-version': '2',
                        'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
                        'Accept-Language': "en-US",
                        maxRedirects: 1,
                      }))
                      axios
                        .get(`https://profile.xboxlive.com/users/gt(${(player.username)})/profile/settings?settings=GameDisplayPicRaw`, {
                          headers: auth,
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
                            const embed = new EmbedBuilder()
                              .setColor(cgreen)
                              .setThumbnail(pfp)

                              .setDescription(`
    ${add} Realm __Connection__
    
    **__ Player Info __**
    ${reply} **Username:** ${player.username}
    ${reply} **Xuid:** ${player.xbox_user_id}
    ${end} **Device:** ${devices[player.build_platform]}
    `)
                              .setFooter({ text: `Realm: ${realmname}` })
                              .setTimestamp();
                            discordClient.channels
                              .fetch(logs)
                              .then(async (channel) => await channel.send({ embeds: [embed] }))
                              .catch((error) => {
                                console.error(error);
                              });
                          } else {
                            console.log(`${realmName} Has Not Set Channel Logs For Join/Leave Logs!`)
                          }
                        })
                        .catch((error) => {
                          console.log(`[XBOX API]`.bold.red + ` - RealmJoins -`.red + ` Gamertag Error`.green + ` Error From ${player.username} | Error Code: ${error.response.status} | Error Text: ${error.response.statusText}`.yellow)
                        });
                    })
                      .catch((error) => {
                        console.log(error)
                      });
                  }
                }
                if (format === "face") {
                  if (players.get(player.uuid)) {

                    console.log(`[+]`.bold.green + ` Username: ${player.username} - ${player.xbox_user_id} | ${realmname} `.yellow + ` Time: ${timeString}`.cyan)
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
                        console.log(player.username, "256x256")
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
                                return;
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

                          const embed = new EmbedBuilder()
                            .setColor(cgreen)
                            .setThumbnail(thumbnailUrl)
                            .setDescription(`
  ${add} Realm __Connection__
  
  **__ Player Info __**
  ${reply} **Username:** ${player.username}
  ${reply} **Xuid:** ${player.xbox_user_id}
  ${end} **Device:** ${devices[player.build_platform]}
                              `)
                            .setFooter({ text: `Realm: ${realmname}` })
                            .setTimestamp();

                          discordClient.channels
                            .fetch(logs)
                            .then(async (channel) => await channel.send({ embeds: [embed], files: [skinAttachment] }))
                            .catch((error) => {
                              console.error(error);
                            });
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
                                return;
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

                          const embed = new EmbedBuilder()
                            .setColor(cgreen)
                            .setThumbnail(thumbnailUrl)
                            .setDescription(`
  ${add} Realm __Connection__
  
  **__ Player Info __**
  ${reply} **Username:** ${player.username}
  ${reply} **Xuid:** ${player.xbox_user_id}
  ${end} **Device:** ${devices[player.build_platform]}
                              `)
                            .setFooter({ text: `Realm: ${realmname}` })
                            .setTimestamp();

                          discordClient.channels
                            .fetch(logs)
                            .then(async (channel) => await channel.send({ embeds: [embed], files: [skinAttachment] }))
                            .catch((error) => {
                              console.error(error);
                            });
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
                                return;
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

                          const embed = new EmbedBuilder()
                            .setColor(cgreen)
                            .setThumbnail(thumbnailUrl)
                            .setDescription(`
  ${add} Realm __Connection__
  
  **__ Player Info __**
  ${reply} **Username:** ${player.username}
  ${reply} **Xuid:** ${player.xbox_user_id}
  ${end} **Device:** ${devices[player.build_platform]}
                              `)
                            .setFooter({ text: `Realm: ${realmname}` })
                            .setTimestamp();

                          discordClient.channels
                            .fetch(logs)
                            .then(async (channel) => await channel.send({ embeds: [embed], files: [skinAttachment] }))
                            .catch((error) => {
                              console.error(error);
                            });

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
                                return;
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

                          const embed = new EmbedBuilder()
                            .setColor(cgreen)
                            .setThumbnail(thumbnailUrl)
                            .setDescription(`
  ${add} Realm __Connection__
  
  **__ Player Info __**
  ${reply} **Username:** ${player.username}
  ${reply} **Xuid:** ${player.xbox_user_id}
  ${end} **Device:** ${devices[player.build_platform]}
                              `)
                            .setFooter({ text: `Realm: ${realmname}` })
                            .setTimestamp();

                          discordClient.channels
                            .fetch(logs)
                            .then(async (channel) => await channel.send({ embeds: [embed], files: [skinAttachment] }))
                            .catch((error) => {
                              console.error(error);
                            });
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
                                return;
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

                          const embed = new EmbedBuilder()
                            .setColor(cgreen)
                            .setThumbnail(thumbnailUrl)
                            .setDescription(`
  ${add} Realm __Connection__
  
  **__ Player Info __**
  ${reply} **Username:** ${player.username}
  ${reply} **Xuid:** ${player.xbox_user_id}
  ${end} **Device:** ${devices[player.build_platform]}
                              `)
                            .setFooter({ text: `Realm: ${realmname}` })
                            .setTimestamp();

                          discordClient.channels
                            .fetch(logs)
                            .then(async (channel) => await channel.send({ embeds: [embed], files: [skinAttachment] }))
                            .catch((error) => {
                              console.error(error);
                            });
                        })
                      }
                      //Raw Save
                      if (player.skin_data?.skin_data?.width == 256 && player.skin_data?.skin_data?.height == 256) {
                        const skin_data = player.skin_data.skin_data.data;
                        const canvas = Canvas.createCanvas(256, 256);
                        const ctx = canvas.getContext('2d');
                        const skinImageData = ctx.createImageData(256, 256);
                        // Decode the skin data and draw it onto the canvas
                        for (let i = 0; i < 16384; i++) {
                          skinImageData.data[i * 4] = skin_data[i * 4];
                          skinImageData.data[i * 4 + 1] = skin_data[i * 4 + 1];
                          skinImageData.data[i * 4 + 2] = skin_data[i * 4 + 2];
                          skinImageData.data[i * 4 + 3] = skin_data[i * 4 + 3];
                        }
                        ctx.putImageData(skinImageData, 0, 0);

                        const pngStream = canvas.createPNGStream();
                        const chunks = [];
                        pngStream.on('data', (chunk) => chunks.push(chunk));
                        pngStream.on('end', () => {
                          const buffer = Buffer.concat(chunks);
                          const skinDirectory = path.join(__dirname, 'Database/PlayersDB/SkinsRaw', player.username);

                          if (!fs.existsSync(skinDirectory)) {
                            fs.mkdirSync(skinDirectory, { recursive: true });
                          }

                          // Check if the skin already exists
                          let skinExists = false;
                          let skinPath, skinFilename, skinAttachment;

                          fs.readdirSync(skinDirectory).forEach((filename) => {
                            const filePath = path.join(skinDirectory, filename);
                            if (fs.lstatSync(filePath).isFile()) {
                              const fileData = fs.readFileSync(filePath);
                              if (buffer.equals(fileData)) {
                                skinExists = true;
                                skinPath = filePath;
                                skinFilename = filename;
                                skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                return;
                              }
                            }
                          });

                          if (!skinExists) {
                            skinFilename = `${player.xbox_user_id}.png`;
                            skinPath = path.join(skinDirectory, skinFilename);

                            fs.writeFile(skinPath, buffer, (err) => {
                              if (err) throw err;

                            });

                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                          } else {
                            // Update the file name and path of the new skin file
                            skinFilename = `${player.xbox_user_id}.png`;
                            skinPath = path.join(skinDirectory, skinFilename);

                            fs.writeFile(skinPath, buffer, (err) => {
                              if (err) throw err;

                            });

                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                            // Delete the old skin file
                            fs.unlinkSync(skinPath);
                          }
                        });
                      }
                      if (player.skin_data?.skin_data?.width == 128 && player.skin_data?.skin_data?.height == 128) {
                        const skin_data = player.skin_data.skin_data.data;
                        const canvas = Canvas.createCanvas(128, 128);
                        const ctx = canvas.getContext('2d');
                        const skinImageData = ctx.createImageData(128, 128);

                        // Decode the skin data and draw it onto the canvas
                        for (let i = 0; i < 8192; i++) {
                          skinImageData.data[i * 4] = skin_data[i * 4];
                          skinImageData.data[i * 4 + 1] = skin_data[i * 4 + 1];
                          skinImageData.data[i * 4 + 2] = skin_data[i * 4 + 2];
                          skinImageData.data[i * 4 + 3] = skin_data[i * 4 + 3];
                        }
                        ctx.putImageData(skinImageData, 0, 0);

                        const pngStream = canvas.createPNGStream();
                        const chunks = [];
                        pngStream.on('data', (chunk) => chunks.push(chunk));
                        pngStream.on('end', () => {
                          const buffer = Buffer.concat(chunks);
                          const skinDirectory = path.join(__dirname, 'Database/PlayersDB/SkinsRaw', player.username);

                          if (!fs.existsSync(skinDirectory)) {
                            fs.mkdirSync(skinDirectory, { recursive: true });
                          }

                          // Check if the skin already exists
                          let skinExists = false;
                          let skinPath, skinFilename, skinAttachment;

                          fs.readdirSync(skinDirectory).forEach((filename) => {
                            const filePath = path.join(skinDirectory, filename);
                            if (fs.lstatSync(filePath).isFile()) {
                              const fileData = fs.readFileSync(filePath);
                              if (buffer.equals(fileData)) {
                                skinExists = true;
                                skinPath = filePath;
                                skinFilename = filename;
                                skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                return;
                              }
                            }
                          });

                          if (!skinExists) {
                            skinFilename = `${player.xbox_user_id}.png`;
                            skinPath = path.join(skinDirectory, skinFilename);

                            fs.writeFile(skinPath, buffer, (err) => {
                              if (err) throw err;

                            });

                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                          } else {
                            // Update the file name and path of the new skin file
                            skinFilename = `${player.xbox_user_id}.png`;
                            skinPath = path.join(skinDirectory, skinFilename);

                            fs.writeFile(skinPath, buffer, (err) => {
                              if (err) throw err;

                            });

                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                            // Delete the old skin file
                            fs.unlinkSync(skinPath);
                          }
                        });
                      }
                      if (player.skin_data?.skin_data?.width == 64 && player.skin_data?.skin_data?.height == 64) {
                        const skin_data = player.skin_data.skin_data.data;
                        const canvas = Canvas.createCanvas(64, 64);
                        const ctx = canvas.getContext('2d');
                        const skinImageData = ctx.createImageData(64, 64);

                        // Decode the skin data and draw it onto the canvas
                        for (let i = 0; i < 4096; i++) {
                          skinImageData.data[i * 4] = skin_data[i * 4];
                          skinImageData.data[i * 4 + 1] = skin_data[i * 4 + 1];
                          skinImageData.data[i * 4 + 2] = skin_data[i * 4 + 2];
                          skinImageData.data[i * 4 + 3] = skin_data[i * 4 + 3];
                        }
                        ctx.putImageData(skinImageData, 0, 0);

                        const pngStream = canvas.createPNGStream();
                        const chunks = [];
                        pngStream.on('data', (chunk) => chunks.push(chunk));
                        pngStream.on('end', () => {
                          const buffer = Buffer.concat(chunks);
                          const skinDirectory = path.join(__dirname, 'Database/PlayersDB/SkinsRaw', player.username);

                          if (!fs.existsSync(skinDirectory)) {
                            fs.mkdirSync(skinDirectory, { recursive: true });
                          }

                          // Check if the skin already exists
                          let skinExists = false;
                          let skinPath, skinFilename, skinAttachment;

                          fs.readdirSync(skinDirectory).forEach((filename) => {
                            const filePath = path.join(skinDirectory, filename);
                            if (fs.lstatSync(filePath).isFile()) {
                              const fileData = fs.readFileSync(filePath);
                              if (buffer.equals(fileData)) {
                                skinExists = true;
                                skinPath = filePath;
                                skinFilename = filename;
                                skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                return;
                              }
                            }
                          });

                          if (!skinExists) {
                            skinFilename = `${player.xbox_user_id}.png`;
                            skinPath = path.join(skinDirectory, skinFilename);

                            fs.writeFile(skinPath, buffer, (err) => {
                              if (err) throw err;

                            });

                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                          } else {
                            // Update the file name and path of the new skin file
                            skinFilename = `${player.xbox_user_id}.png`;
                            skinPath = path.join(skinDirectory, skinFilename);

                            fs.writeFile(skinPath, buffer, (err) => {
                              if (err) throw err;

                            });

                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                            // Delete the old skin file
                            fs.unlinkSync(skinPath);
                          }
                        });
                      }
                      if (player.skin_data?.skin_data?.width == 32 && player.skin_data?.skin_data?.height == 32) {
                        const skin_data = player.skin_data.skin_data.data;
                        const canvas = Canvas.createCanvas(32, 32);
                        const ctx = canvas.getContext('2d');
                        const skinImageData = ctx.createImageData(32, 32);

                        // Decode the skin data and draw it onto the canvas
                        for (let i = 0; i < 1024; i++) {
                          skinImageData.data[i * 4] = skin_data[i * 4];
                          skinImageData.data[i * 4 + 1] = skin_data[i * 4 + 1];
                          skinImageData.data[i * 4 + 2] = skin_data[i * 4 + 2];
                          skinImageData.data[i * 4 + 3] = skin_data[i * 4 + 3];
                        }
                        ctx.putImageData(skinImageData, 0, 0);

                        const pngStream = canvas.createPNGStream();
                        const chunks = [];
                        pngStream.on('data', (chunk) => chunks.push(chunk));
                        pngStream.on('end', () => {
                          const buffer = Buffer.concat(chunks);
                          const skinDirectory = path.join(__dirname, 'Database/PlayersDB/SkinsRaw', player.username);

                          if (!fs.existsSync(skinDirectory)) {
                            fs.mkdirSync(skinDirectory, { recursive: true });
                          }

                          // Check if the skin already exists
                          let skinExists = false;
                          let skinPath, skinFilename, skinAttachment;

                          fs.readdirSync(skinDirectory).forEach((filename) => {
                            const filePath = path.join(skinDirectory, filename);
                            if (fs.lstatSync(filePath).isFile()) {
                              const fileData = fs.readFileSync(filePath);
                              if (buffer.equals(fileData)) {
                                skinExists = true;
                                skinPath = filePath;
                                skinFilename = filename;
                                skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                return;
                              }
                            }
                          });

                          if (!skinExists) {
                            skinFilename = `${player.xbox_user_id}.png`;
                            skinPath = path.join(skinDirectory, skinFilename);

                            fs.writeFile(skinPath, buffer, (err) => {
                              if (err) throw err;

                            });

                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                          } else {
                            // Update the file name and path of the new skin file
                            skinFilename = `${player.xbox_user_id}.png`;
                            skinPath = path.join(skinDirectory, skinFilename);

                            fs.writeFile(skinPath, buffer, (err) => {
                              if (err) throw err;

                            });

                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                            // Delete the old skin file
                            fs.unlinkSync(skinPath);
                          }
                        });
                      }
                      if (player.skin_data?.skin_data?.width == 16 && player.skin_data?.skin_data?.height == 16) {
                        const skin_data = player.skin_data.skin_data.data;
                        const canvas = Canvas.createCanvas(16, 16);
                        const ctx = canvas.getContext('2d');
                        const skinImageData = ctx.createImageData(16, 16);

                        // Decode the skin data and draw it onto the canvas
                        for (let i = 0; i < 64; i++) {
                          skinImageData.data[i * 4] = skin_data[i * 4];
                          skinImageData.data[i * 4 + 1] = skin_data[i * 4 + 1];
                          skinImageData.data[i * 4 + 2] = skin_data[i * 4 + 2];
                          skinImageData.data[i * 4 + 3] = skin_data[i * 4 + 3];
                        }
                        ctx.putImageData(skinImageData, 0, 0);

                        const pngStream = canvas.createPNGStream();
                        const chunks = [];
                        pngStream.on('data', (chunk) => chunks.push(chunk));
                        pngStream.on('end', () => {
                          const buffer = Buffer.concat(chunks);
                          const skinDirectory = path.join(__dirname, 'Database/PlayersDB/SkinsRaw', player.username);

                          if (!fs.existsSync(skinDirectory)) {
                            fs.mkdirSync(skinDirectory, { recursive: true });
                          }

                          // Check if the skin already exists
                          let skinExists = false;
                          let skinPath, skinFilename, skinAttachment;

                          fs.readdirSync(skinDirectory).forEach((filename) => {
                            const filePath = path.join(skinDirectory, filename);
                            if (fs.lstatSync(filePath).isFile()) {
                              const fileData = fs.readFileSync(filePath);
                              if (buffer.equals(fileData)) {
                                skinExists = true;
                                skinPath = filePath;
                                skinFilename = filename;
                                skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                return;
                              }
                            }
                          });

                          if (!skinExists) {
                            skinFilename = `${player.xbox_user_id}.png`;
                            skinPath = path.join(skinDirectory, skinFilename);

                            fs.writeFile(skinPath, buffer, (err) => {
                              if (err) throw err;

                            });

                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                          } else {
                            // Update the file name and path of the new skin file
                            skinFilename = `${player.xbox_user_id}.png`;
                            skinPath = path.join(skinDirectory, skinFilename);

                            fs.writeFile(skinPath, buffer, (err) => {
                              if (err) throw err;

                            });

                            skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                            // Delete the old skin file
                            fs.unlinkSync(skinPath);
                          }
                        });
                      }
                    } else {
                      console.log(`${realmName} Has Not Set Channel Logs For Join/Leave Logs!`)
                    }
                  } else {

                    console.log(`[+]`.bold.green + ` Username: ${player.username} - ${player.xbox_user_id} | ${realmname} `.yellow + ` Time: ${timeString}`.cyan)
                    new Authflow('', `./Database/BotAccounts/${this.guild}`, { relyingParty: 'http://xboxlive.com', flow: 'msal' }).getXboxToken().then(async (t) => {
                      const auth = JSON.parse(JSON.stringify({
                        'x-xbl-contract-version': '2',
                        'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
                        'Accept-Language': "en-US",
                        maxRedirects: 1,
                      }))
                      axios
                        .get(`https://profile.xboxlive.com/users/gt(${(player.username)})/profile/settings?settings=GameDisplayPicRaw`, {
                          headers: auth,
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
                                      return;
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

                                const embed = new EmbedBuilder()
                                  .setColor(cgreen)
                                  .setThumbnail(thumbnailUrl)
                                  .setDescription(`
  ${add} Realm __Connection__
        
  **__ Player Info __**
  ${reply} **Username:** ${player.username}
  ${reply} **Xuid:** ${player.xbox_user_id}
  ${end} **Device:** ${devices[player.build_platform]}
                                    `)
                                  .setFooter({ text: `Realm: ${realmname}` })
                                  .setTimestamp();

                                discordClient.channels
                                  .fetch(logs)
                                  .then(async (channel) => await channel.send({ embeds: [embed], files: [skinAttachment] }))
                                  .catch((error) => {
                                    console.error(error);
                                  });
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

                              let invisiblePixelsCount = 0;
                              let totalAlphaValue = 0;
                              for (let i = 0; i < headImageData.data.length; i += 4) {
                                if (headImageData.data[i + 3] === 0) {
                                  invisiblePixelsCount++;
                                }
                                totalAlphaValue += headImageData.data[i + 3];
                              }
                              if (antiinvis === "true") {
                                if (totalAlphaValue === 0) {
                                  console.log(`[SKINS]`.bold.red + ` Flagged ${player.username} | Invis Skins | AlphaValue: ${totalAlphaValue}`.green)
                                  this.client.queue("command_request", {
                                    command: `kick "${player.username}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Invis Skin\n§7=- §3Discord: ${discordCode}`,
                                    version: 2,
                                    origin: {
                                      type: 0,
                                      uuid: "",
                                      request_id: "",
                                    },
                                  });
                                  IncreaseKicks()
                                  function IncreaseKicks() {
                                    const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
                                    const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                                    KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
                                    fs.writeFileSync(dbPath, JSON.stringify(KickSent));
                                  }
                                  if (automod) {
                                    const embed = new EmbedBuilder()
                                      .setColor(corange)
                                      .setThumbnail(pfp)
                                      .setDescription(`
  ${success} Automod __Kicked__
                    
  **__ Player Info __**
  ${reply} **Username:** \`${player.username}\`
  ${end} **Xuid:** \`${player.xbox_user_id}\`
                    
  **__ Kicked Info __**
  ${end} **Reason:** \`Using Invis Skin\`
                    `)
                                      .setFooter({ text: `Realm: ${realmname}` })
                                      .setTimestamp()
                                    discordClient.channels
                                      .fetch(automod)
                                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                                      .catch((error) => {
                                        console.error(error);
                                      });
                                    const endTime = performance.now();
                                    const elapsedTime = endTime - startTime;
                                    console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                                  } else {
                                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                                  }
                                }
                              }

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
                                      return;
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

                                const embed = new EmbedBuilder()
                                  .setColor(cgreen)
                                  .setThumbnail(thumbnailUrl)
                                  .setDescription(`
  ${add} Realm __Connection__
  
  **__ Player Info __**
  ${reply} **Username:** ${player.username}
  ${reply} **Xuid:** ${player.xbox_user_id}
  ${end} **Device:** ${devices[player.build_platform]}
                                    `)
                                  .setFooter({ text: `Realm: ${realmname}` })
                                  .setTimestamp();

                                discordClient.channels
                                  .fetch(logs)
                                  .then(async (channel) => await channel.send({ embeds: [embed], files: [skinAttachment] }))
                                  .catch((error) => {
                                    console.error(error);
                                  });
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

                              let invisiblePixelsCount = 0;
                              let totalAlphaValue = 0;
                              for (let i = 0; i < headImageData.data.length; i += 4) {
                                if (headImageData.data[i + 3] === 0) {
                                  invisiblePixelsCount++;
                                }
                                totalAlphaValue += headImageData.data[i + 3];
                              }
                              if (antiinvis === "true") {
                                if (totalAlphaValue === 0) {
                                  console.log(`[SKINS]`.bold.red + ` Flagged ${player.username} | Invis Skins | AlphaValue: ${totalAlphaValue}`.green)
                                  this.client.queue("command_request", {
                                    command: `kick "${player.username}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Invis Skin\n§7=- §3Discord: ${discordCode}`,
                                    version: 2,
                                    origin: {
                                      type: 0,
                                      uuid: "",
                                      request_id: "",
                                    },
                                  });
                                  IncreaseKicks()
                                  function IncreaseKicks() {
                                    const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
                                    const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                                    KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
                                    fs.writeFileSync(dbPath, JSON.stringify(KickSent));
                                  }
                                  if (automod) {
                                    const embed = new EmbedBuilder()
                                      .setColor(corange)
                                      .setThumbnail(pfp)
                                      .setDescription(`
  ${success} Automod __Kicked__
                    
  **__ Player Info __**
  ${reply} **Username:** \`${player.username}\`
  ${end} **Xuid:** \`${player.xbox_user_id}\`
                    
  **__ Kicked Info __**
  ${end} **Reason:** \`Using Invis Skin\`
                    `)
                                      .setFooter({ text: `Realm: ${realmname}` })
                                      .setTimestamp()
                                    discordClient.channels
                                      .fetch(automod)
                                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                                      .catch((error) => {
                                        console.error(error);
                                      });
                                    const endTime = performance.now();
                                    const elapsedTime = endTime - startTime;
                                    console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                                  } else {
                                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                                  }
                                }
                              }

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
                                      return;
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

                                const embed = new EmbedBuilder()
                                  .setColor(cgreen)
                                  .setThumbnail(thumbnailUrl)
                                  .setDescription(`
  ${add} Realm __Connection__
  
  **__ Player Info __**
  ${reply} **Username:** ${player.username}
  ${reply} **Xuid:** ${player.xbox_user_id}
  ${end} **Device:** ${devices[player.build_platform]}
                                    `)
                                  .setFooter({ text: `Realm: ${realmname}` })
                                  .setTimestamp();

                                discordClient.channels
                                  .fetch(logs)
                                  .then(async (channel) => await channel.send({ embeds: [embed], files: [skinAttachment] }))
                                  .catch((error) => {
                                    console.error(error);
                                  });
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

                              let invisiblePixelsCount = 0;
                              let totalAlphaValue = 0;
                              for (let i = 0; i < headImageData.data.length; i += 4) {
                                if (headImageData.data[i + 3] === 0) {
                                  invisiblePixelsCount++;
                                }
                                totalAlphaValue += headImageData.data[i + 3];
                              }
                              if (antiinvis === "true") {
                                if (totalAlphaValue === 0) {
                                  console.log(`[SKINS]`.bold.red + ` Flagged ${player.username} | Invis Skins | AlphaValue: ${totalAlphaValue}`.green)
                                  this.client.queue("command_request", {
                                    command: `kick "${player.username}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Invis Skin\n§7=- §3Discord: ${discordCode}`,
                                    version: 2,
                                    origin: {
                                      type: 0,
                                      uuid: "",
                                      request_id: "",
                                    },
                                  });
                                  IncreaseKicks()
                                  function IncreaseKicks() {
                                    const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
                                    const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                                    KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
                                    fs.writeFileSync(dbPath, JSON.stringify(KickSent));
                                  }
                                  if (automod) {
                                    const embed = new EmbedBuilder()
                                      .setColor(corange)
                                      .setThumbnail(pfp)
                                      .setDescription(`
  ${success} Automod __Kicked__
                          
  **__ Player Info __**
  ${reply} **Username:** \`${player.username}\`
  ${end} **Xuid:** \`${player.xbox_user_id}\`
                          
  **__ Kicked Info __**
  ${end} **Reason:** \`Using Invis Skin\`
                          `)
                                      .setFooter({ text: `Realm: ${realmname}` })
                                      .setTimestamp()
                                    discordClient.channels
                                      .fetch(automod)
                                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                                      .catch((error) => {
                                        console.error(error);
                                      });
                                    const endTime = performance.now();
                                    const elapsedTime = endTime - startTime;
                                    console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                                  } else {
                                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                                  }
                                }
                              }

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
                                      return;
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

                                const embed = new EmbedBuilder()
                                  .setColor(cgreen)
                                  .setThumbnail(thumbnailUrl)
                                  .setDescription(`
  ${add} Realm __Connection__
  
  **__ Player Info __**
  ${reply} **Username:** ${player.username}
  ${reply} **Xuid:** ${player.xbox_user_id}
  ${end} **Device:** ${devices[player.build_platform]}
                                    `)
                                  .setFooter({ text: `Realm: ${realmname}` })
                                  .setTimestamp();

                                discordClient.channels
                                  .fetch(logs)
                                  .then(async (channel) => await channel.send({ embeds: [embed], files: [skinAttachment] }))
                                  .catch((error) => {
                                    console.error(error);
                                  });
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

                              let invisiblePixelsCount = 0;
                              let totalAlphaValue = 0;
                              for (let i = 0; i < headImageData.data.length; i += 4) {
                                if (headImageData.data[i + 3] === 0) {
                                  invisiblePixelsCount++;
                                }
                                totalAlphaValue += headImageData.data[i + 3];
                              }
                              if (antiinvis === "true") {
                                if (totalAlphaValue === 0) {
                                  console.log(`[SKINS]`.bold.red + ` Flagged ${player.username} | Invis Skins | AlphaValue: ${totalAlphaValue}`.green)
                                  this.client.queue("command_request", {
                                    command: `kick "${player.username}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Invis Skin\n§7=- §3Discord: ${discordCode}`,
                                    version: 2,
                                    origin: {
                                      type: 0,
                                      uuid: "",
                                      request_id: "",
                                    },
                                  });
                                  IncreaseKicks()
                                  function IncreaseKicks() {
                                    const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
                                    const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                                    KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
                                    fs.writeFileSync(dbPath, JSON.stringify(KickSent));
                                  }
                                  if (automod) {
                                    const embed = new EmbedBuilder()
                                      .setColor(corange)
                                      .setThumbnail(pfp)
                                      .setDescription(`
  ${success} Automod __Kicked__
                    
  **__ Player Info __**
  ${reply} **Username:** \`${player.username}\`
  ${end} **Xuid:** \`${player.xbox_user_id}\`
                    
  **__ Kicked Info __**
  ${end} **Reason:** \`Using Invis Skin\`
                    `)
                                      .setFooter({ text: `Realm: ${realmname}` })
                                      .setTimestamp()
                                    discordClient.channels
                                      .fetch(automod)
                                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                                      .catch((error) => {
                                        console.error(error);
                                      });
                                    const endTime = performance.now();
                                    const elapsedTime = endTime - startTime;
                                    console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                                  } else {
                                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                                  }
                                }
                              }

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
                                      return;
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

                                const embed = new EmbedBuilder()
                                  .setColor(cgreen)
                                  .setThumbnail(thumbnailUrl)
                                  .setDescription(`
  ${add} Realm __Connection__
  
  **__ Player Info __**
  ${reply} **Username:** ${player.username}
  ${reply} **Xuid:** ${player.xbox_user_id}
  ${end} **Device:** ${devices[player.build_platform]}
                                    `)
                                  .setFooter({ text: `Realm: ${realmname}` })
                                  .setTimestamp();

                                discordClient.channels
                                  .fetch(logs)
                                  .then(async (channel) => await channel.send({ embeds: [embed], files: [skinAttachment] }))
                                  .catch((error) => {
                                    console.error(error);
                                  });
                              })
                            }
                            //Raw Save
                            if (player.skin_data?.skin_data?.width == 256 && player.skin_data?.skin_data?.height == 256) {
                              const skin_data = player.skin_data.skin_data.data;
                              const canvas = Canvas.createCanvas(256, 256);
                              const ctx = canvas.getContext('2d');
                              const skinImageData = ctx.createImageData(256, 256);
                              // Decode the skin data and draw it onto the canvas
                              for (let i = 0; i < 16384; i++) {
                                skinImageData.data[i * 4] = skin_data[i * 4];
                                skinImageData.data[i * 4 + 1] = skin_data[i * 4 + 1];
                                skinImageData.data[i * 4 + 2] = skin_data[i * 4 + 2];
                                skinImageData.data[i * 4 + 3] = skin_data[i * 4 + 3];
                              }
                              ctx.putImageData(skinImageData, 0, 0);

                              const pngStream = canvas.createPNGStream();
                              const chunks = [];
                              pngStream.on('data', (chunk) => chunks.push(chunk));
                              pngStream.on('end', () => {
                                const buffer = Buffer.concat(chunks);
                                const skinDirectory = path.join(__dirname, 'Database/PlayersDB/SkinsRaw', player.username);

                                if (!fs.existsSync(skinDirectory)) {
                                  fs.mkdirSync(skinDirectory, { recursive: true });
                                }

                                // Check if the skin already exists
                                let skinExists = false;
                                let skinPath, skinFilename, skinAttachment;

                                fs.readdirSync(skinDirectory).forEach((filename) => {
                                  const filePath = path.join(skinDirectory, filename);
                                  if (fs.lstatSync(filePath).isFile()) {
                                    const fileData = fs.readFileSync(filePath);
                                    if (buffer.equals(fileData)) {
                                      skinExists = true;
                                      skinPath = filePath;
                                      skinFilename = filename;
                                      skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                      return;
                                    }
                                  }
                                });

                                if (!skinExists) {
                                  skinFilename = `${player.xbox_user_id}.png`;
                                  skinPath = path.join(skinDirectory, skinFilename);

                                  fs.writeFile(skinPath, buffer, (err) => {
                                    if (err) throw err;

                                  });

                                  skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                } else {
                                  // Update the file name and path of the new skin file
                                  skinFilename = `${player.xbox_user_id}.png`;
                                  skinPath = path.join(skinDirectory, skinFilename);

                                  fs.writeFile(skinPath, buffer, (err) => {
                                    if (err) throw err;

                                  });

                                  skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                  // Delete the old skin file
                                  fs.unlinkSync(skinPath);
                                }
                              });
                            }
                            if (player.skin_data?.skin_data?.width == 128 && player.skin_data?.skin_data?.height == 128) {
                              const skin_data = player.skin_data.skin_data.data;
                              const canvas = Canvas.createCanvas(128, 128);
                              const ctx = canvas.getContext('2d');
                              const skinImageData = ctx.createImageData(128, 128);

                              // Decode the skin data and draw it onto the canvas
                              for (let i = 0; i < 8192; i++) {
                                skinImageData.data[i * 4] = skin_data[i * 4];
                                skinImageData.data[i * 4 + 1] = skin_data[i * 4 + 1];
                                skinImageData.data[i * 4 + 2] = skin_data[i * 4 + 2];
                                skinImageData.data[i * 4 + 3] = skin_data[i * 4 + 3];
                              }
                              ctx.putImageData(skinImageData, 0, 0);

                              const pngStream = canvas.createPNGStream();
                              const chunks = [];
                              pngStream.on('data', (chunk) => chunks.push(chunk));
                              pngStream.on('end', () => {
                                const buffer = Buffer.concat(chunks);
                                const skinDirectory = path.join(__dirname, 'Database/PlayersDB/SkinsRaw', player.username);

                                if (!fs.existsSync(skinDirectory)) {
                                  fs.mkdirSync(skinDirectory, { recursive: true });
                                }

                                // Check if the skin already exists
                                let skinExists = false;
                                let skinPath, skinFilename, skinAttachment;

                                fs.readdirSync(skinDirectory).forEach((filename) => {
                                  const filePath = path.join(skinDirectory, filename);
                                  if (fs.lstatSync(filePath).isFile()) {
                                    const fileData = fs.readFileSync(filePath);
                                    if (buffer.equals(fileData)) {
                                      skinExists = true;
                                      skinPath = filePath;
                                      skinFilename = filename;
                                      skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                      return;
                                    }
                                  }
                                });

                                if (!skinExists) {
                                  skinFilename = `${player.xbox_user_id}.png`;
                                  skinPath = path.join(skinDirectory, skinFilename);

                                  fs.writeFile(skinPath, buffer, (err) => {
                                    if (err) throw err;

                                  });

                                  skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                } else {
                                  // Update the file name and path of the new skin file
                                  skinFilename = `${player.xbox_user_id}.png`;
                                  skinPath = path.join(skinDirectory, skinFilename);

                                  fs.writeFile(skinPath, buffer, (err) => {
                                    if (err) throw err;

                                  });

                                  skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                  // Delete the old skin file
                                  fs.unlinkSync(skinPath);
                                }
                              });
                            }
                            if (player.skin_data?.skin_data?.width == 64 && player.skin_data?.skin_data?.height == 64) {
                              const skin_data = player.skin_data.skin_data.data;
                              const canvas = Canvas.createCanvas(64, 64);
                              const ctx = canvas.getContext('2d');
                              const skinImageData = ctx.createImageData(64, 64);

                              // Decode the skin data and draw it onto the canvas
                              for (let i = 0; i < 4096; i++) {
                                skinImageData.data[i * 4] = skin_data[i * 4];
                                skinImageData.data[i * 4 + 1] = skin_data[i * 4 + 1];
                                skinImageData.data[i * 4 + 2] = skin_data[i * 4 + 2];
                                skinImageData.data[i * 4 + 3] = skin_data[i * 4 + 3];
                              }
                              ctx.putImageData(skinImageData, 0, 0);

                              const pngStream = canvas.createPNGStream();
                              const chunks = [];
                              pngStream.on('data', (chunk) => chunks.push(chunk));
                              pngStream.on('end', () => {
                                const buffer = Buffer.concat(chunks);
                                const skinDirectory = path.join(__dirname, 'Database/PlayersDB/SkinsRaw', player.username);

                                if (!fs.existsSync(skinDirectory)) {
                                  fs.mkdirSync(skinDirectory, { recursive: true });
                                }

                                // Check if the skin already exists
                                let skinExists = false;
                                let skinPath, skinFilename, skinAttachment;

                                fs.readdirSync(skinDirectory).forEach((filename) => {
                                  const filePath = path.join(skinDirectory, filename);
                                  if (fs.lstatSync(filePath).isFile()) {
                                    const fileData = fs.readFileSync(filePath);
                                    if (buffer.equals(fileData)) {
                                      skinExists = true;
                                      skinPath = filePath;
                                      skinFilename = filename;
                                      skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                      return;
                                    }
                                  }
                                });

                                if (!skinExists) {
                                  skinFilename = `${player.xbox_user_id}.png`;
                                  skinPath = path.join(skinDirectory, skinFilename);

                                  fs.writeFile(skinPath, buffer, (err) => {
                                    if (err) throw err;

                                  });

                                  skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                } else {
                                  // Update the file name and path of the new skin file
                                  skinFilename = `${player.xbox_user_id}.png`;
                                  skinPath = path.join(skinDirectory, skinFilename);

                                  fs.writeFile(skinPath, buffer, (err) => {
                                    if (err) throw err;

                                  });

                                  skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                  // Delete the old skin file
                                  fs.unlinkSync(skinPath);
                                }
                              });
                            }
                            if (player.skin_data?.skin_data?.width == 32 && player.skin_data?.skin_data?.height == 32) {
                              const skin_data = player.skin_data.skin_data.data;
                              const canvas = Canvas.createCanvas(32, 32);
                              const ctx = canvas.getContext('2d');
                              const skinImageData = ctx.createImageData(32, 32);

                              // Decode the skin data and draw it onto the canvas
                              for (let i = 0; i < 1024; i++) {
                                skinImageData.data[i * 4] = skin_data[i * 4];
                                skinImageData.data[i * 4 + 1] = skin_data[i * 4 + 1];
                                skinImageData.data[i * 4 + 2] = skin_data[i * 4 + 2];
                                skinImageData.data[i * 4 + 3] = skin_data[i * 4 + 3];
                              }
                              ctx.putImageData(skinImageData, 0, 0);

                              const pngStream = canvas.createPNGStream();
                              const chunks = [];
                              pngStream.on('data', (chunk) => chunks.push(chunk));
                              pngStream.on('end', () => {
                                const buffer = Buffer.concat(chunks);
                                const skinDirectory = path.join(__dirname, 'Database/PlayersDB/SkinsRaw', player.username);

                                if (!fs.existsSync(skinDirectory)) {
                                  fs.mkdirSync(skinDirectory, { recursive: true });
                                }

                                // Check if the skin already exists
                                let skinExists = false;
                                let skinPath, skinFilename, skinAttachment;

                                fs.readdirSync(skinDirectory).forEach((filename) => {
                                  const filePath = path.join(skinDirectory, filename);
                                  if (fs.lstatSync(filePath).isFile()) {
                                    const fileData = fs.readFileSync(filePath);
                                    if (buffer.equals(fileData)) {
                                      skinExists = true;
                                      skinPath = filePath;
                                      skinFilename = filename;
                                      skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                      return;
                                    }
                                  }
                                });

                                if (!skinExists) {
                                  skinFilename = `${player.xbox_user_id}.png`;
                                  skinPath = path.join(skinDirectory, skinFilename);

                                  fs.writeFile(skinPath, buffer, (err) => {
                                    if (err) throw err;

                                  });

                                  skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                } else {
                                  // Update the file name and path of the new skin file
                                  skinFilename = `${player.xbox_user_id}.png`;
                                  skinPath = path.join(skinDirectory, skinFilename);

                                  fs.writeFile(skinPath, buffer, (err) => {
                                    if (err) throw err;

                                  });

                                  skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                  // Delete the old skin file
                                  fs.unlinkSync(skinPath);
                                }
                              });
                            }
                            if (player.skin_data?.skin_data?.width == 16 && player.skin_data?.skin_data?.height == 16) {
                              const skin_data = player.skin_data.skin_data.data;
                              const canvas = Canvas.createCanvas(16, 16);
                              const ctx = canvas.getContext('2d');
                              const skinImageData = ctx.createImageData(16, 16);

                              // Decode the skin data and draw it onto the canvas
                              for (let i = 0; i < 64; i++) {
                                skinImageData.data[i * 4] = skin_data[i * 4];
                                skinImageData.data[i * 4 + 1] = skin_data[i * 4 + 1];
                                skinImageData.data[i * 4 + 2] = skin_data[i * 4 + 2];
                                skinImageData.data[i * 4 + 3] = skin_data[i * 4 + 3];
                              }
                              ctx.putImageData(skinImageData, 0, 0);

                              const pngStream = canvas.createPNGStream();
                              const chunks = [];
                              pngStream.on('data', (chunk) => chunks.push(chunk));
                              pngStream.on('end', () => {
                                const buffer = Buffer.concat(chunks);
                                const skinDirectory = path.join(__dirname, 'Database/PlayersDB/SkinsRaw', player.username);

                                if (!fs.existsSync(skinDirectory)) {
                                  fs.mkdirSync(skinDirectory, { recursive: true });
                                }

                                // Check if the skin already exists
                                let skinExists = false;
                                let skinPath, skinFilename, skinAttachment;

                                fs.readdirSync(skinDirectory).forEach((filename) => {
                                  const filePath = path.join(skinDirectory, filename);
                                  if (fs.lstatSync(filePath).isFile()) {
                                    const fileData = fs.readFileSync(filePath);
                                    if (buffer.equals(fileData)) {
                                      skinExists = true;
                                      skinPath = filePath;
                                      skinFilename = filename;
                                      skinAttachment = new AttachmentBuilder(fileData, { name: filename });
                                      return;
                                    }
                                  }
                                });

                                if (!skinExists) {
                                  skinFilename = `${player.xbox_user_id}.png`;
                                  skinPath = path.join(skinDirectory, skinFilename);

                                  fs.writeFile(skinPath, buffer, (err) => {
                                    if (err) throw err;

                                  });

                                  skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });
                                } else {
                                  // Update the file name and path of the new skin file
                                  skinFilename = `${player.xbox_user_id}.png`;
                                  skinPath = path.join(skinDirectory, skinFilename);

                                  fs.writeFile(skinPath, buffer, (err) => {
                                    if (err) throw err;

                                  });

                                  skinAttachment = new AttachmentBuilder(buffer, { name: skinFilename });

                                  // Delete the old skin file
                                  fs.unlinkSync(skinPath);
                                }
                              });
                            }
                          } else {
                            console.log(`${realmName} Has Not Set Channel Logs For Join/Leave Logs!`)
                          }
                        })
                        .catch((error) => {
                          console.log(error)
                        });
                    })
                      .catch((error) => {
                        console.log(error)
                      });
                  }
                }
                if (antiinvis === true) {
                  if (players.get(player.uuid)) {
                    const storedPlayer = players.get(player.uuid);
                    const storedName = storedPlayer.name
                    const storedPfp = storedPlayer.pfp;
                    const storedXuid = storedPlayer.xuid
                    if (player.skin_data?.skin_data?.width == 256 && player.skin_data?.skin_data?.height == 256) {
                      console.log('Its a 256x256 skin!')
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

                      let invisiblePixelsCount = 0;
                      let totalAlphaValue = 0;
                      for (let i = 0; i < headImageData.data.length; i += 4) {
                        if (headImageData.data[i + 3] === 0) {
                          invisiblePixelsCount++;
                        }
                        totalAlphaValue += headImageData.data[i + 3];
                      }
                      if (totalAlphaValue < 10000) {
                        console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmName} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                        this.client.write("command_request", {
                          command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                          version: 2,
                          origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                          },
                        });
                        IncreaseKicks()
                        function IncreaseKicks() {
                          const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
                          const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                          KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
                          fs.writeFileSync(dbPath, JSON.stringify(KickSent));
                        }
                        if (automod) {
                          const embed = new EmbedBuilder()
                            .setColor(corange)
                            .setThumbnail(storedPfp)
                            .setDescription(`
${success} Automod __Kicked__
      
**__ Player Info __**
${reply} **Username:** \`${storedName}\`
${end} **Xuid:** \`${storedXuid}\`
      
**__ Kicked Info __**
${end} **Reason:** \`Using Unfair Skin\`
      `)
                            .setFooter({ text: `Realm: ${realmName}` })
                            .setTimestamp()
                          discordClient.channels
                            .fetch(automod)
                            .then(async (channel) => await channel.send({ embeds: [embed] }))
                            .catch((error) => {
                              console.error(error);
                            });
                          const endTime = performance.now();
                          const elapsedTime = endTime - startTime;
                          console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                        } else {
                          console.log(`${realmName} Has Not Set Channel Logs For Automod Logs!`)
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
                        console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmName} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                        this.client.write("command_request", {
                          command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                          version: 2,
                          origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                          },
                        });
                        IncreaseKicks()
                        function IncreaseKicks() {
                          const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
                          const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                          KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
                          fs.writeFileSync(dbPath, JSON.stringify(KickSent));
                        }
                        if (automod) {
                          const embed = new EmbedBuilder()
                            .setColor(corange)
                            .setThumbnail(storedPfp)
                            .setDescription(`
${success} Automod __Kicked__
      
**__ Player Info __**
${reply} **Username:** \`${storedName}\`
${end} **Xuid:** \`${storedXuid}\`

**__ Kicked Info __**
${end} **Reason:** \`Using Unfair Skin\`
      `)
                            .setFooter({ text: `Realm: ${realmName}` })
                            .setTimestamp()
                          discordClient.channels
                            .fetch(automod)
                            .then(async (channel) => await channel.send({ embeds: [embed] }))
                            .catch((error) => {
                              console.error(error);
                            });
                          const endTime = performance.now();
                          const elapsedTime = endTime - startTime;
                          console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                        } else {
                          console.log(`${realmName} Has Not Set Channel Logs For Automod Logs!`)
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
                        console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmName} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                        this.client.write("command_request", {
                          command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                          version: 2,
                          origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                          },
                        });
                        IncreaseKicks()
                        function IncreaseKicks() {
                          const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
                          const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                          KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
                          fs.writeFileSync(dbPath, JSON.stringify(KickSent));
                        }
                        if (automod) {
                          const embed = new EmbedBuilder()
                            .setColor(corange)
                            .setThumbnail(storedPfp)
                            .setDescription(`
${success} Automod __Kicked__
      
**__ Player Info __**
${reply} **Username:** \`${storedName}\`
${end} **Xuid:** \`${storedXuid}\`
      
**__ Kicked Info __**
${end} **Reason:** \`Using Unfair Skin\`
      `)
                            .setFooter({ text: `Realm: ${realmName}` })
                            .setTimestamp()
                          discordClient.channels
                            .fetch(automod)
                            .then(async (channel) => await channel.send({ embeds: [embed] }))
                            .catch((error) => {
                              console.error(error);
                            });
                          const endTime = performance.now();
                          const elapsedTime = endTime - startTime;
                          console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                        } else {
                          console.log(`${realmName} Has Not Set Channel Logs For Automod Logs!`)
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
                        console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmName} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                        this.client.write("command_request", {
                          command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                          version: 2,
                          origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                          },
                        });
                        IncreaseKicks()
                        function IncreaseKicks() {
                          const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
                          const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                          KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
                          fs.writeFileSync(dbPath, JSON.stringify(KickSent));
                        }
                        if (automod) {
                          const embed = new EmbedBuilder()
                            .setColor(corange)
                            .setThumbnail(pfp)
                            .setDescription(`
${success} Automod __Kicked__
      
**__ Player Info __**
${reply} **Username:** \`${storedName}\`
${end} **Xuid:** \`${storedXuid}\`
      
**__ Kicked Info __**
${end} **Reason:** \`Using Unfair Skin\`
`)
                            .setFooter({ text: `Realm: ${realmName}` })
                            .setTimestamp()
                          discordClient.channels
                            .fetch(automod)
                            .then(async (channel) => await channel.send({ embeds: [embed] }))
                            .catch((error) => {
                              console.error(error);
                            });
                          const endTime = performance.now();
                          const elapsedTime = endTime - startTime;
                          console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                        } else {
                          console.log(`${realmName} Has Not Set Channel Logs For Automod Logs!`)
                        }
                      }
                    }
                  }
                }
                function IncreaseJoins() {
                  const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'joins.json');
                  const Joined = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                  Joined.Join = Joined.Join ? Joined.Join + 1 : 1;
                  fs.writeFileSync(dbPath, JSON.stringify(Joined));
                }

              })
            }
            if (packet.records.type === "remove") {
              packet.records.records.forEach((player) => {
                try {
                  const storedPlayer = players.get(player.uuid);
                  const storedName = storedPlayer.name
                  const storedXuid = storedPlayer.xuid
                  const now = new Date();
                  const hours = now.getHours();
                  const minutes = now.getMinutes();
                  const seconds = now.getSeconds();
                  const amOrPm = hours >= 12 ? 'PM' : 'AM';
                  const formattedHours = hours % 12 || 12;
                  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
                  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
                  const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}${amOrPm}`;
                  const moment = require('moment-timezone');
                  const EST = 'America/New_York';
                  moment.tz.setDefault(EST);

                  console.log(`[-]`.bold.red + ` Username: ${storedName} - ${storedXuid} | ${realmname} `.yellow + ` Time: ${timeString}`.cyan)
                  if (logs) {
                    const embed = new EmbedBuilder()
                      .setColor(cred)

                      .setDescription(`
${removed} Realm __Disconnection__
  
**__ Player Info __**
${reply} **Username:** ${storedName}
${end} **Xuid:** ${storedXuid}
  `)
                      .setFooter({ text: `Realm: ${realmname}` })
                      .setTimestamp()
                    discordClient.channels
                      .fetch(logs)
                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                      .catch((error) => {
                        console.error(error);
                      });
                  } else {
                    console.log(`${realmName} Has Not Set Channel Logs For Join/Leave Logs!`)
                  }
                } catch (error) {
                  console.log(`Data Not Found | ${error}`)
                }
              });
            }
          })
        })
      } catch (e) {
        console.log(e)
      }
      //Anti-Unfair Skin
      this.client.on('player_skin', (player) => {
        let file = editJsonFile(`./Database/realm/${this.guild}/${this.realmidsss}/config.json`);
        let players = editJsonFile(`./Database/PlayersDB/players.json`);
        let discordCode = file.get('discordCode') ?? 'discord.gg/cosmosbot'
        let automod = file.get(`Automod-Logs`)
        let antiinvis = file.get(`antiinvis`);
        const now = Math.floor(Date.now() / 1000);
        const Premium = file.get("PremiumTime") ?? 0

        if (Premium === 0) {
        } else {
          if (now < Premium) {
            if (antiinvis === true) {
              if (players.get(player.uuid)) {
                const startTime = performance.now();
                const storedPlayer = players.get(player.uuid);
                const storedName = storedPlayer.name
                const storedPfp = storedPlayer.pfp;
                const storedXuid = storedPlayer.xuid
                if (player.skin?.skin_data?.width == 256 && player.skin?.skin_data?.height == 256) {
                  console.log('Its a 256x256 skin!')
                }
                if (player.skin?.skin_data?.width == 128 && player.skin?.skin_data?.height == 128) {
                  console.log(`[SKINS]`.bold.red + ` Scanning Player: ${storedName} | 128x128`.green)
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
                  console.log(`[SKINS]`.bold.red + ` Scanned Player: ${storedName} | AlphaValue: ${totalAlphaValue} | 128x128`.green)
                  if (totalAlphaValue < 10000) {
                    console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmName} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                    this.client.write("command_request", {
                      command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                      version: 2,
                      origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                      },
                    });
                    IncreaseKicks()
                    function IncreaseKicks() {
                      const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
                      const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                      KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
                      fs.writeFileSync(dbPath, JSON.stringify(KickSent));
                    }
                    if (automod) {
                      const embed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(storedPfp)
                        .setDescription(`
${success} Automod __Kicked__

**__ Player Info __**
${reply} **Username:** \`${storedName}\`
${end} **Xuid:** \`${storedXuid}\`

**__ Kicked Info __**
${end} **Reason:** \`Using Unfair Skin\`
`)
                        .setFooter({ text: `Realm: ${realmName}` })
                        .setTimestamp()
                      discordClient.channels
                        .fetch(automod)
                        .then(async (channel) => await channel.send({ embeds: [embed] }))
                        .catch((error) => {
                          console.error(error);
                        });
                      const endTime = performance.now();
                      const elapsedTime = endTime - startTime;
                      console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                    } else {
                      console.log(`${realmName} Has Not Set Channel Logs For Automod Logs!`)
                    }
                  }
                }
                if (player.skin?.skin_data?.width == 64 && player.skin?.skin_data?.height == 64) {
                  console.log(`[SKINS]`.bold.red + ` Scanning Player: ${storedName} | 64x64`.green)
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
                  console.log(`[SKINS]`.bold.red + ` Scanned Player: ${storedName} | AlphaValue: ${totalAlphaValue} | 64x64`.green)
                  if (totalAlphaValue < 10000) {
                    console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmName} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                    this.client.write("command_request", {
                      command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                      version: 2,
                      origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                      },
                    });
                    IncreaseKicks()
                    function IncreaseKicks() {
                      const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
                      const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                      KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
                      fs.writeFileSync(dbPath, JSON.stringify(KickSent));
                    }
                    if (automod) {
                      const embed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(storedPfp)
                        .setDescription(`
${success} Automod __Kicked__

**__ Player Info __**
${reply} **Username:** \`${storedName}\`
${end} **Xuid:** \`${storedXuid}\`

**__ Kicked Info __**
${end} **Reason:** \`Using Unfair Skin\`
`)
                        .setFooter({ text: `Realm: ${realmName}` })
                        .setTimestamp()
                      discordClient.channels
                        .fetch(automod)
                        .then(async (channel) => await channel.send({ embeds: [embed] }))
                        .catch((error) => {
                          console.error(error);
                        });
                      const endTime = performance.now();
                      const elapsedTime = endTime - startTime;
                      console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                    } else {
                      console.log(`${realmName} Has Not Set Channel Logs For Automod Logs!`)
                    }
                  }
                }
                if (player.skin?.skin_data?.width == 32 && player.skin?.skin_data?.height == 32) {
                  console.log(`[SKINS]`.bold.red + ` Scanning Player: ${storedName} | 32x32`.green)
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
                  console.log(`[SKINS]`.bold.red + ` Scanned Player: ${storedName} | AlphaValue: ${totalAlphaValue} | 32x32`.green)
                  if (totalAlphaValue < 10000) {
                    console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmName} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                    this.client.write("command_request", {
                      command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                      version: 2,
                      origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                      },
                    });
                    IncreaseKicks()
                    function IncreaseKicks() {
                      const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
                      const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                      KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
                      fs.writeFileSync(dbPath, JSON.stringify(KickSent));
                    }
                    if (automod) {
                      const embed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(storedPfp)
                        .setDescription(`
${success} Automod __Kicked__

**__ Player Info __**
${reply} **Username:** \`${storedName}\`
${end} **Xuid:** \`${storedXuid}\`

**__ Kicked Info __**
${end} **Reason:** \`Using Unfair Skin\`
`)
                        .setFooter({ text: `Realm: ${realmName}` })
                        .setTimestamp()
                      discordClient.channels
                        .fetch(automod)
                        .then(async (channel) => await channel.send({ embeds: [embed] }))
                        .catch((error) => {
                          console.error(error);
                        });
                      const endTime = performance.now();
                      const elapsedTime = endTime - startTime;
                      console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                    } else {
                      console.log(`${realmName} Has Not Set Channel Logs For Automod Logs!`)
                    }
                  }
                }
                if (player.skin?.skin_data?.width == 16 && player.skin?.skin_data?.height == 16) {
                  console.log(`[SKINS]`.bold.red + ` Scanning Player: ${storedName} | 16x16`.green)
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
                  console.log(`[SKINS]`.bold.red + ` Scanned Player: ${storedName} | AlphaValue: ${totalAlphaValue} | 16x16`.green)
                  if (totalAlphaValue < 10000) {
                    console.log(`[SKINS]`.bold.red + ` Flagged ${storedName} From ${realmName} | Unfair Skins | AlphaValue: ${totalAlphaValue}`.green)
                    this.client.write("command_request", {
                      command: `kick "${storedName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Using Unfair Skin\n§7=- §3Discord: ${discordCode}`,
                      version: 2,
                      origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                      },
                    });
                    IncreaseKicks()
                    function IncreaseKicks() {
                      const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
                      const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                      KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
                      fs.writeFileSync(dbPath, JSON.stringify(KickSent));
                    }
                    if (automod) {
                      const embed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(storedPfp)
                        .setDescription(`
${success} Automod __Kicked__

**__ Player Info __**
${reply} **Username:** \`${storedName}\`
${end} **Xuid:** \`${storedXuid}\`

**__ Kicked Info __**
${end} **Reason:** \`Using Unfair Skin\`
`)
                        .setFooter({ text: `Realm: ${realmName}` })
                        .setTimestamp()
                      discordClient.channels
                        .fetch(automod)
                        .then(async (channel) => await channel.send({ embeds: [embed] }))
                        .catch((error) => {
                          console.error(error);
                        });
                      const endTime = performance.now();
                      const elapsedTime = endTime - startTime;
                      console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                    } else {
                      console.log(`${realmName} Has Not Set Channel Logs For Automod Logs!`)
                    }
                  }
                }
              } else {
                console.log(`${realmName} Has Not Found Any Data For Player | Skipping Skin Check!`)
              }
            }
          }
        }
      })
      //Disconnection
      try {
        this.client.on('disconnect', (packet) => {
          console.log("Disconnection Packet: ", packet)
          let file = editJsonFile(`./Database/realm/${this.guild}/${this.realmidsss}/config.json`);
          let Disconnection = file.get('Disconnection-Logs')
          if (Disconnection) {
            const embed = new EmbedBuilder()
              .setColor(cred)
              .setDescription(`
${denied} **Disconnected**

**__ Disconnection Info __**
${reply} **Name:** ${realmName}
${end} ${packet.message}
          `)
              .setTimestamp();
            discordClient.channels
              .fetch(Disconnection)
              .then(async (channel) => await channel.send({ embeds: [embed] }))
              .catch((error) => {
                console.error(error);
              });
          } else {
            console.log(`${realmName} Has Not Set Channel Logs For Disconnection Logs!`)
          }
          setTimeout(() => {
            if (rA < max) {
              console.log(`[${realmName}]`.bold.yellow + ` Realm: ${realmName} Reconnecting: Disconnection | ${packet.message}`.cyan + ` (Attempt ${rA + 1}/${max})`.green);
              new RealmStart(this.realmidsss, this.guild);
              rA++;
              return
            } else {
              console.log(`[${realmName}]`.bold.yellow + ` Realm: ${realmName} Reconnecting Limit Exceeded`.red);
              rA = 0
              if (Disconnection) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
    ${denied} **Disconnected**
    
    **__ Disconnection Info __**
    ${reply} **Name:** ${realmName}
    ${end} ${packet.message}
  
    Stopped Auto Reconnecting as it has exceeded the limit!
              `)
                  .setTimestamp();
                discordClient.channels
                  .fetch(Disconnection)
                  .then(async (channel) => await channel.send({ embeds: [embed] }))
                  .catch((error) => {
                    console.error(error);
                  });
                return
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Disconnection Logs!`)
              }
            }
          }, 1500)
        })
      } catch (error) {
        console.log(error)
      }
      //Error
      try {
        this.client.on('error', (packet) => {
          console.log("Error Packet: ", packet)
          let file = editJsonFile(`./Database/realm/${this.guild}/${this.realmidsss}/config.json`);
          let Disconnection = file.get('Disconnection-Logs')
          if (Disconnection) {
            const embed = new EmbedBuilder()
              .setColor(cred)
              .setDescription(`
${denied} **Client Error**

**__ Error Info __**
${reply} **Name:** ${realmName}
${end} ${packet.message}
          `)
              .setTimestamp();
            discordClient.channels
              .fetch(Disconnection)
              .then(async (channel) => await channel.send({ embeds: [embed] }))
              .catch((error) => {
                console.error(error);
              });
          } else {
            console.log(`${realmName} Has Not Set Channel Logs For Disconnection Logs!`)
          }
          setTimeout(() => {
            if (rA < max) {
              console.log(`[${realmName}]`.bold.yellow + ` Realm: ${realmName} Reconnecting: Disconnection | ${packet.message}`.cyan + ` (Attempt ${rA + 1}/${max})`.green);
              new RealmStart(this.realmidsss, this.guild);
              rA++;
              return
            } else {
              console.log(`[${realmName}]`.bold.yellow + ` Realm: ${realmName} Reconnecting Limit Exceeded`.red);
              rA = 0
              if (Disconnection) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
    ${denied} **Disconnected**
    
    **__ Disconnection Info __**
    ${reply} **Name:** ${realmName}
    ${end} ${packet.message}
  
    Stopped Auto Reconnecting as it has exceeded the limit!
              `)
                  .setTimestamp();
                discordClient.channels
                  .fetch(Disconnection)
                  .then(async (channel) => await channel.send({ embeds: [embed] }))
                  .catch((error) => {
                    console.error(error);
                  });
                return
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Disconnection Logs!`)
              }
            }
          }, 1500)
        })
      } catch (error) {
        console.log(error)
      }
      //Ended
      try {
        this.client.on('end', (packet) => {
          console.log("End Packet: ", packet)
          let file = editJsonFile(`./Database/realm/${this.guild}/${this.realmidsss}/config.json`);
          let Disconnection = file.get('Disconnection-Logs')
          if (Disconnection) {
            const embed = new EmbedBuilder()
              .setColor(cred)
              .setDescription(`
${denied} **Client Ended**

**__ End Info __**
${reply} **Name:** ${realmName}
${reply} **ID:** ${this.realmidsss}
${end} ${packet.message}
          `)
              .setTimestamp();
            discordClient.channels
              .fetch(Disconnection)
              .then(async (channel) => await channel.send({ embeds: [embed] }))
              .catch((error) => {
                console.error(error);
              });
          } else {
            console.log(`${realmName} Has Not Set Channel Logs For Disconnection Logs!`)
          }
          setTimeout(() => {
            if (rA < max) {
              console.log(`[${realmName}]`.bold.yellow + ` Realm: ${realmName} Reconnecting: Disconnection | ${packet.message}`.cyan + ` (Attempt ${rA + 1}/${max})`.green);
              new RealmStart(this.realmidsss, this.guild);
              rA++;
              return
            } else {
              console.log(`[${realmName}]`.bold.yellow + ` Realm: ${realmName} Reconnecting Limit Exceeded`.red);
              rA = 0
              if (Disconnection) {
                const embed = new EmbedBuilder()
                  .setColor(cred)
                  .setDescription(`
    ${denied} **Disconnected**
    
    **__ Disconnection Info __**
    ${reply} **Name:** ${realmName}
    ${end} ${packet.message}
  
    Stopped Auto Reconnecting as it has exceeded the limit!
              `)
                  .setTimestamp();
                discordClient.channels
                  .fetch(Disconnection)
                  .then(async (channel) => await channel.send({ embeds: [embed] }))
                  .catch((error) => {
                    console.error(error);
                  });
                return
              } else {
                console.log(`${realmName} Has Not Set Channel Logs For Disconnection Logs!`)
              }
            }
          }, 1500)
        })
      } catch (error) {
        console.log(error)
      }
    } catch (error) {
      console.log(error)
    }
  }
  async getRealmClient() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const CLIENT = bedrock.createClient({
            profilesFolder: `./Database/BotAccounts/${this.guild}`,
            realms: {
              realmId: this.realmidsss,
            },
            connectTimeout: 10000,
            autoInitPlayer: true,
            skipPing: true
          });
          resolve(CLIENT)
        } catch (e) {
          console.log(`${e.message}`.bold.red);
          reject(e.message);
        }
      }, 1500);
    });
  }
  async CosmosAutomod(playerName, xbox_user_id, pfp, device) {
    let timeString = 0
    const startTime = performance.now();
    let BedrockClient = this.client
    let guildid = this.guild
    let file = editJsonFile(`./Database/realm/${guildid}/${this.realmidsss}/config.json`);
    let KicksDB = editJsonFile(`./Database/PlayersDB/KickDatabase.json`);
    let MinFollowers = file.get(`Followers`)
    let MinFriends = file.get(`Friends`)
    let MinGames = file.get(`Games`)
    let MinGamerscore = file.get(`Gamerscore`)
    let globalStatus = file.get(`globalStatus`)
    let realmname = file.get(`RealmName`)
    let discordCode = file.get('discordCode') ?? 'discord.gg/cosmosbot'
    let automod = file.get(`Automod-Logs`)
    const filePath = `./Database/PlayersDB/KicksDB/${playerName}.json`;

    var whitelist = fs.readFileSync(
      `./Database/realm/${guildid}/${this.realmidsss}/whitelist.json`
    );

    const bannedGamesJson = fs.readFileSync(`./Database/realm/${guildid}/${this.realmidsss}/BannedDevices.json`);
    const ParsedBannedGames = JSON.parse(bannedGamesJson);
    const bannedGamesSet = new Set(ParsedBannedGames);

    var global = fs.readFileSync(
      `./Database/GlobalbanDB.json`
    );

    if (globalStatus === 'activate') {
      if (global.includes(xbox_user_id)) {
        console.log(`[GLOBAL]`.bold.red + ` Global Banned ${playerName}`.green + ` Time: ${timeString}`.cyan)
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
          command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC§7]\n=- §bUsername: ${playerName}\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Global Banned\n§7=- §3Discord: ${discordCode}"}]}`,
          version: 2,
          origin: {
            type: 0,
            uuid: "",
            request_id: "",
          },
        });
        IncreaseKicks()
        if (automod) {
          const embed = new EmbedBuilder()
            .setColor(corange)
            .setThumbnail(pfp)
            .setDescription(`
  ${success} Automod __Kicked__
  
  **__ Player Info __**
  ${reply} **Username:** \`${playerName}\`
  ${end} **Xuid:** \`${xbox_user_id}\`
  
  **__ Kicked Info __**
  ${end} **Reason:** \`Global Banned\`
  `)
            .setFooter({ text: `Realm: ${realmname}` })
            .setTimestamp()
          discordClient.channels
            .fetch(automod)
            .then(async (channel) => await channel.send({ embeds: [embed] }))
            .catch((error) => {
              console.error(error);
            });
          return
        } else {
          console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
        }
      }
    }

    new Authflow("", `./Database/Oauth/${guildid}`, {
      flow: 'msal',
      relyingParty: "http://xboxlive.com",
    })
      .getXboxToken()
      .then(async (MainXbox) => {
        new Authflow("", `./Database/BotAccounts/${guildid}`, {
          flow: 'msal',
          relyingParty: "http://xboxlive.com",
        })
          .getXboxToken()
          .then(async (Xbox) => {
            const XboxAuth = JSON.parse(JSON.stringify({
              'x-xbl-contract-version': '2',
              'Authorization': `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
              'Accept-Language': "en-US",
              maxRedirects: 1,
            }))


            const header = {
              'x-xbl-contract-version': 1,
              accept: 'application/json',
              Authorization: `XBL3.0 x=${Xbox.userHash};${Xbox.XSTSToken}`,
              'accept-language': 'en-US',
              Connection: 'Keep-Alive',
              'Accept-Encoding': 'gzip',
              'User-Agent': 'okhttp/4.9.1',
            }
            var GetGamerscoreAndPFP = {
              method: "get",
              url: `https://profile.xboxlive.com/users/xuid(${(xbox_user_id)})/profile/settings?settings=GameDisplayPicRaw,Gamerscore`,
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
              console.log(`[WHITELIST]`.bold.green + ` Username: ${playerName} | Xuid: ${xbox_user_id}`.yellow + ` Time: ${timeString}`.cyan)
              return
            }
            if (Xbox.userXUID === xbox_user_id) {
              console.log(`[IGNORE]`.bold.red + ` Skipped ${playerName} From ${realmname}`.green + ` Reason: Server's Realm Bot`.yellow + ` Time: ${timeString}`.cyan)
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
              if (reason === 'Recently Played Banned Device') {
                if (realm !== realmname) {
                  console.log(`[CACHE]`.bold.red + ` Skipped ${playerName} From ${realmname}`.green + ` Reason: Not The Cached Realm It Was Last Kicked`.yellow + ` Time: ${timeString}`.cyan)
                } else {
                  console.log(`[CACHE]`.bold.red + ` Flagged ${playerName} From ${realmname}`.green + ` Reason: ${reason} | Device: ${Data} | Time Ago: ${time}`.yellow + ` Time: ${timeString}`.cyan)
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
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC Kicked§7] =- §bUsername: ${playerName}\n§7=- §bReason: §3Recently Played Banned Device\n§7=- §6Device: §e${Data}\n§7=- §6Time Ago: ${time} Hour(s) Ago\"}]}`,
                    version: 2,
                    origin: {
                      type: 0,
                      uuid: "",
                      request_id: "",
                    },
                  });
                  if (automod) {
                    const embed = new EmbedBuilder()
                      .setColor(corange)
                      .setThumbnail(pfp)
                      .setDescription(`
${success} Automod __Kicked__
${reply} **Username:** \`${playerName}\`
${end} **Xuid:** \`${xbox_user_id}\`
                    
**__ Kicked Info __**
${reply} **Reason:** \`Recently Played Banned Device\`
${reply} **Time Ago:** \`${time} Hour(s) Ago\`
${end} **Device:** \`${Data}\`
          `)
                      .setFooter({ text: `Realm: ${realmname}` })
                      .setTimestamp()
                    discordClient.channels
                      .fetch(automod)
                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                      .catch((error) => {
                        console.error(error);
                      });
                  } else {
                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                  }
                }
              } else if (reason === 'Not Enough Gamerscore') {
                if (realm !== realmname) {
                  console.log(`[CACHE]`.bold.red + ` Skipped ${playerName} From ${realmname}`.green + ` Reason: Not The Cached Realm It Was Last Kicked`.yellow + ` Time: ${timeString}`.cyan)
                } else {
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
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC Kicked§7] =- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Gamerscore\n§7=- §6Current: §e${gs}/${MinGamerscore}"}]}`,
                    version: 2,
                    origin: {
                      type: 0,
                      uuid: "",
                      request_id: "",
                    },
                  });
                  IncreaseKicks()
                  console.log(`[CACHE]`.bold.red + ` Flagged ${playerName} From ${realmname}`.green + ` Reason: Not Enough Gamerscore | Gamerscore: ${Data}/${MinGamerscore}`.yellow + ` Time: ${timeString}`.cyan)
                  if (automod) {
                    const embed = new EmbedBuilder()
                      .setColor(corange)
                      .setThumbnail(pfp)
                      .setDescription(`
  ${success} Automod __Kicked__
  ${reply} **Username:** \`${playerName}\`
  ${end} **Xuid:** \`${xbox_user_id}\`
            
  **__ Kicked Info __**
  ${reply} **Reason:** \`Not Enough Gamerscore\`
  ${end} **Gamerscore:** \`${Data}\`
            `)
                      .setFooter({ text: `Realm: ${realmname}` })
                      .setTimestamp()
                    discordClient.channels
                      .fetch(automod)
                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                      .catch((error) => {
                        console.error(error);
                      });
                  } else {
                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                  }
                }
              } else if (reason === 'Not Enough Followers') {
                if (realm !== realmname) {
                  console.log(`[CACHE]`.bold.red + ` Skipped ${playerName} From ${realmname}`.green + ` Reason: Not The Cached Realm It Was Last Kicked`.yellow + ` Time: ${timeString}`.cyan)
                } else {
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
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC Kicked§7] =- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Followers\n§7=- §6Current: §e${fl}/${MinFollowers}"}]}`,
                    version: 2,
                    origin: {
                      type: 0,
                      uuid: "",
                      request_id: "",
                    },
                  });
                  IncreaseKicks()
                  console.log(`[CACHE]`.bold.red + ` Flagged ${playerName} From ${realmname}`.green + ` Reason: Not Enough Followers | Followers: ${Data}/${MinFollowers}`.yellow + ` Time: ${timeString}`.cyan)
                  if (automod) {
                    const embed = new EmbedBuilder()
                      .setColor(corange)
                      .setThumbnail(pfp)
                      .setDescription(`
${success} Automod __Kicked__
${reply} **Username:** \`${playerName}\`
${end} **Xuid:** \`${xbox_user_id}\`
          
**__ Kicked Info __**
${reply} **Reason:** \`Not Enough Followers\`
${end} **Gamerscore:** \`${Data}\`
          `)
                      .setFooter({ text: `Realm: ${realmname}` })
                      .setTimestamp()
                    discordClient.channels
                      .fetch(automod)
                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                      .catch((error) => {
                        console.error(error);
                      });
                  } else {
                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                  }
                }
              } else if (reason === 'Not Enough Friends') {
                if (realm !== realmname) {
                  console.log(`[CACHE]`.bold.red + ` Skipped ${playerName} From ${realmname}`.green + ` Reason: Not The Cached Realm It Was Last Kicked`.yellow + ` Time: ${timeString}`.cyan)
                } else {
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
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC Kicked§7]\n=- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Friends\n§7=- §6Current: §e${Data}/${MinFriends}"}]}`,
                    version: 2,
                    origin: {
                      type: 0,
                      uuid: "",
                      request_id: "",
                    },
                  });
                  IncreaseKicks()
                  console.log(`[CACHE]`.bold.red + ` Flagged ${playerName} From ${realmname}`.green + ` Reason: Not Enough Friends | Friends: ${Data}/${MinFriends}`.yellow + ` Time: ${timeString}`.cyan)
                  if (automod) {
                    const embed = new EmbedBuilder()
                      .setColor(corange)
                      .setThumbnail(pfp)
                      .setDescription(`
${success} Automod __Kicked__
${reply} **Username:** \`${playerName}\`
${end} **Xuid:** \`${xbox_user_id}\`
          
**__ Kicked Info __**
${reply} **Reason:** \`Not Enough Friends\`
${end} **Gamerscore:** \`${Data}\`
          `)
                      .setFooter({ text: `Realm: ${realmname}` })
                      .setTimestamp()
                    discordClient.channels
                      .fetch(automod)
                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                      .catch((error) => {
                        console.error(error);
                      });
                  } else {
                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                  }
                }
              } else if (reason === 'Not Enough Games') {
                if (realm !== realmname) {
                  console.log(`[CACHE]`.bold.red + ` Skipped ${playerName} From ${realmname}`.green + ` Reason: Not The Cached Realm It Was Last Kicked`.yellow + ` Time: ${timeString}`.cyan)
                } else {
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
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC Kicked§7]\n=- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Games\n§7=- §6Current: §e${Data}/${MinGames}"}]}`,
                    version: 2,
                    origin: {
                      type: 0,
                      uuid: "",
                      request_id: "",
                    },
                  });
                  IncreaseKicks()
                  console.log(`[CACHE]`.bold.red + ` Flagged ${playerName} From ${realmname}`.green + ` Reason: Not Enough Games | Games: ${Data}/${MinGames}`.yellow + ` Time: ${timeString}`.cyan)
                  if (automod) {
                    const embed = new EmbedBuilder()
                      .setColor(corange)
                      .setThumbnail(pfp)
                      .setDescription(`
${success} Automod __Kicked__
${reply} **Username:** \`${playerName}\`
${end} **Xuid:** \`${xbox_user_id}\`
          
**__ Kicked Info __**
${reply} **Reason:** \`Not Enough Games\`
${end} **Gamerscore:** \`${Data}\`
          `)
                      .setFooter({ text: `Realm: ${realmname}` })
                      .setTimestamp()
                    discordClient.channels
                      .fetch(automod)
                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                      .catch((error) => {
                        console.error(error);
                      });
                  } else {
                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                  }
                }
              } else if (reason === 'Profile Is Private') {
                if (realm !== realmname) {
                  console.log(`[CACHE]`.bold.red + ` Skipped ${playerName} From ${realmname}`.green + ` Reason: Not The Cached Realm It Was Last Kicked`.yellow + ` Time: ${timeString}`.cyan)
                } else {
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
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC Kicked§7]\n=- §bUsername: ${playerName}\n§7=- §bReason: §3Profile Is Private\n§7=- §3Discord: ${discordCode}"}]}`,
                    version: 2,
                    origin: {
                      type: 0,
                      uuid: "",
                      request_id: "",
                    },
                  });
                  IncreaseKicks()
                  console.log(`[CACHE]`.bold.red + ` Flagged ${playerName} From ${realmname}`.green + ` Reason: Profile Is Private`.yellow + ` Time: ${timeString}`.cyan)
                  if (automod) {
                    const embed = new EmbedBuilder()
                      .setColor(corange)
                      .setThumbnail(pfp)
                      .setDescription(`
${success} Automod __Kicked__
${reply} **Username:** \`${playerName}\`
${end} **Xuid:** \`${xbox_user_id}\`

**__ Kicked Info __**
${end} **Reason:** \`Profile Is Private\`
          `)
                      .setFooter({ text: `Realm: ${realmname}` })
                      .setTimestamp()
                    discordClient.channels
                      .fetch(automod)
                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                      .catch((error) => {
                        console.error(error);
                      });
                  } else {
                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                  }
                }
              }
              const endTime = performance.now();
              const elapsedTime = endTime - startTime;
              console.log(`Elapsed time: ${elapsedTime} milliseconds`);
              const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
              const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
              kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
              fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))
              return
            }


            Promise.all([axios(GetGamerscoreAndPFP), axios(GetSocials), axios(GetFollowers), axios(GetGames)])
              .then(function (results) {
                const pfp = results[0].data?.profileUsers[0]?.settings[0]?.value;
                const gs = results[0].data?.profileUsers[0]?.settings[1]?.value;
                const fra = results[1].data.people;
                const fr = fra.length;
                const fl = results[2].data.targetFollowerCount;
                const g = results[3].data.titles;
                const ga = g.length;
                const gl = g.slice(0, 5);

                if (MinGamerscore > gs) {
                  if (device === 'Playstation') {
                    console.log(`[IGNORE]`.bold.red + ` Skipped ${playerName} From ${realmname}`.green + ` Reason: On Playstation For Low Gamerscore`.yellow + ` Time: ${timeString}`.cyan)
                  } else {
                    BedrockClient.write("command_request", {
                      command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Not Enough Gamerscore\n§7=- §6Current: §e${gs}/${MinGamerscore}\n§7=- §3Discord: ${discordCode}`,
                      version: 2,
                      origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                      },
                    });
                    BedrockClient.queue("command_request", {
                      command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC Kicked§7] =- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Gamerscore\n§7=- §6Current: §e${gs}/${MinGamerscore}"}]}`,
                      version: 2,
                      origin: {
                        type: 0,
                        uuid: "",
                        request_id: "",
                      },
                    });
                    IncreaseKicks()
                    console.log(`[API]`.bold.red + ` Flagged ${playerName} From ${realmname}`.green + ` Reason: Not Enough Gamerscore | Gamerscore: ${gs}/${MinGamerscore}`.yellow)
                    if (automod) {
                      const embed = new EmbedBuilder()
                        .setColor(corange)
                        .setThumbnail(pfp)
                        .setDescription(`
  ${success} Automod __Kicked__
  ${reply} **Username:** \`${playerName}\`
  ${end} **Xuid:** \`${xbox_user_id}\`
              
  **__ Kicked Info __**
  ${reply} **Reason:** \`Not Enough Gamerscore\`
  ${end} **Gamerscore:** \`${gs}\`
              `)
                        .setFooter({ text: `Realm: ${realmname}` })
                        .setTimestamp()
                      discordClient.channels
                        .fetch(automod)
                        .then(async (channel) => await channel.send({ embeds: [embed] }))
                        .catch((error) => {
                          console.error(error);
                        });
                    } else {
                      console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                    }
                    KicksDB.set(`${playerName}`, {
                      reason: "Not Enough Gamerscore",
                      Data: gs,
                      xuid: xbox_user_id
                    });
                    KicksDB.save();
                    const endTime = performance.now();
                    const elapsedTime = endTime - startTime;
                    console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                    const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                    const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                    kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                    fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))
                    const data = {
                      reason: "Not Enough Gamerscore",
                      Data: gs,
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
                } else if (MinFollowers > fl) {
                  BedrockClient.write("command_request", {
                    command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Not Enough Followers\n§7=- §6Current: §e${fl}/${MinFollowers}\n§7=- §3Discord: ${discordCode}`,
                    version: 2,
                    origin: {
                      type: 0,
                      uuid: "",
                      request_id: "",
                    },
                  });
                  BedrockClient.queue("command_request", {
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC Kicked§7] =- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Followers\n§7=- §6Current: §e${fl}/${MinFollowers}"}]}`,
                    version: 2,
                    origin: {
                      type: 0,
                      uuid: "",
                      request_id: "",
                    },
                  });
                  IncreaseKicks()
                  console.log(`[API]`.bold.red + ` Flagged ${playerName} From ${realmname}`.green + ` Reason: Not Enough Followers | Followers: ${fl}/${MinFollowers}`.yellow + ` Time: ${timeString}`.cyan)
                  if (automod) {
                    const embed = new EmbedBuilder()
                      .setColor(corange)
                      .setThumbnail(pfp)
                      .setDescription(`
${success} Automod __Kicked__
${reply} **Username:** \`${playerName}\`
${end} **Xuid:** \`${xbox_user_id}\`
          
**__ Kicked Info __**
${reply} **Reason:** \`Not Enough Followers\`
${end} **Followers:** \`${fl}\`
          `)
                      .setFooter({ text: `Realm: ${realmname}` })
                      .setTimestamp()
                    discordClient.channels
                      .fetch(automod)
                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                      .catch((error) => {
                        console.error(error);
                      });
                  } else {
                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                  }
                  KicksDB.set(`${playerName}`, {
                    reason: "Not Enough Followers",
                    Data: fl,
                    xuid: xbox_user_id
                  });
                  KicksDB.save();
                  const endTime = performance.now();
                  const elapsedTime = endTime - startTime;
                  console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                  const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                  const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                  kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                  fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))

                  const data = {
                    reason: "Not Enough Followers",
                    Data: fl,
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
                } else if (MinFriends > fr) {
                  BedrockClient.write("command_request", {
                    command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Not Enough Friends\n§7=- §6Current: §e${fr}/${MinFriends}\n§7=- §3Discord: ${discordCode}`,
                    version: 2,
                    origin: {
                      type: 0,
                      uuid: "",
                      request_id: "",
                    },
                  });
                  BedrockClient.queue("command_request", {
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC§7] =- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Friends\n§7=- §6Current: §e${fr}/${MinFriends}"}]}`,
                    version: 2,
                    origin: {
                      type: 0,
                      uuid: "",
                      request_id: "",
                    },
                  });
                  IncreaseKicks()
                  console.log(`[API]`.bold.red + ` Flagged ${playerName} From ${realmname}`.green + ` Reason: Not Enough Friends | Friends: ${fr}/${MinFriends}`.yellow + ` Time: ${timeString}`.cyan)
                  if (automod) {
                    const embed = new EmbedBuilder()
                      .setColor(corange)
                      .setThumbnail(pfp)
                      .setDescription(`
${success} Automod __Kicked__
${reply} **Username:** \`${playerName}\`
${end} **Xuid:** \`${xbox_user_id}\`
      
**__ Kicked Info __**
${reply} **Reason:** \`Not Enough Friends\`
${end} **Friends:** \`${fr}\`
      `)
                      .setFooter({ text: `Realm: ${realmname}` })
                      .setTimestamp()
                    discordClient.channels
                      .fetch(automod)
                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                      .catch((error) => {
                        console.error(error);
                      });
                  } else {
                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                  }
                  KicksDB.set(`${playerName}`, {
                    reason: "Not Enough Friends",
                    Data: fr,
                    xuid: xbox_user_id
                  });
                  KicksDB.save();
                  const endTime = performance.now();
                  const elapsedTime = endTime - startTime;
                  console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                  const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                  const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                  kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                  fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))

                  const data = {
                    reason: "Not Enough Friends",
                    Data: fr,
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
                } else if (MinGames > ga) {
                  BedrockClient.write("command_request", {
                    command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: §3Not Enough Games\n§7=- §6Current: §e${ga}/${MinGames}\n§7=- §3Discord: ${discordCode}`,
                    version: 2,
                    origin: {
                      type: 0,
                      uuid: "",
                      request_id: "",
                    },
                  });
                  BedrockClient.queue("command_request", {
                    command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC Kicked§7] =- §bUsername: ${playerName}\n§7=- §bReason: §3Not Enough Games\n§7=- §6Current: §e${ga}/${MinGames}"}]}`,
                    version: 2,
                    origin: {
                      type: 0,
                      uuid: "",
                      request_id: "",
                    },
                  });
                  IncreaseKicks()
                  console.log(`[API]`.bold.red + ` Flagged ${playerName} From ${realmname}`.green + ` Reason: Not Enough Games | Games: ${ga}/${MinGames}`.yellow + ` Time: ${timeString}`.cyan)
                  if (automod) {
                    const embed = new EmbedBuilder()
                      .setColor(corange)
                      .setThumbnail(pfp)
                      .setDescription(`
${success} Automod __Kicked__
${reply} **Username:** \`${playerName}\`
${end} **Xuid:** \`${xbox_user_id}\`
  
**__ Kicked Info __**
${reply} **Reason:** \`Not Enough Games\`
${end} **Games:** \`${ga}\`
  `)
                      .setFooter({ text: `Realm: ${realmname}` })
                      .setTimestamp()
                    discordClient.channels
                      .fetch(automod)
                      .then(async (channel) => await channel.send({ embeds: [embed] }))
                      .catch((error) => {
                        console.error(error);
                      });
                  } else {
                    console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                  }
                  KicksDB.set(`${playerName}`, {
                    reason: "Not Enough Games",
                    Data: ga,
                    xuid: xbox_user_id
                  });
                  KicksDB.save();
                  const endTime = performance.now();
                  const elapsedTime = endTime - startTime;
                  console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                  const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                  const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                  kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                  fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))

                  const data = {
                    reason: "Not Enough Games",
                    Data: ga,
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
                gl.find((game) => {
                  if (bannedGamesSet.has(game.name)) {
                    try {
                      const lastTimePlayed = new Date(game.titleHistory.lastPlayed);
                      const now = new Date();
                      const diffTime = Math.abs(now - lastTimePlayed);
                      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
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
                          command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC Kicked§7] =- §bUsername: ${playerName}\n§7=- §bReason: §3Recently Played Banned Device\n§7=- §6Device: §e${game.name}\n§7=- §6Time Ago: ${diffHours} Hour(s) Ago"}]}`,
                          version: 2,
                          origin: {
                            type: 0,
                            uuid: "",
                            request_id: "",
                          },
                        });
                        if (automod) {
                          const embed = new EmbedBuilder()
                            .setColor(corange)
                            .setThumbnail(pfp)
                            .setDescription(`
${success} Automod __Kicked__
${reply} **Username:** \`${playerName}\`
${end} **Xuid:** \`${xbox_user_id}\`

**__ Kicked Info __**
${reply} **Reason:** \`Recently Played Banned Device\`
${reply} **Time Ago:** \`${diffHours} Hour(s) Ago\`
${end} **Device:** \`${game.name}\`
      `)
                            .setFooter({ text: `Realm: ${realmname}` })
                            .setTimestamp()
                          discordClient.channels
                            .fetch(automod)
                            .then(async (channel) => await channel.send({ embeds: [embed] }))
                            .catch((error) => {
                              console.error(error);
                            });
                        } else {
                          console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
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
                        console.log(`Elapsed time: ${elapsedTime} milliseconds`);
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
                console.log(`[API]`.bold.red + ` Automod Promise Error`.green + ` Error From ${playerName} | Error Code: ${error.response.status} | Error Text: ${error.response.statusText} | Error Data: ${error.response.data}`.yellow + ` Time: ${timeString}`.cyan)
                BedrockClient.write("command_request", {
                  command: `kick "${playerName}" \n\n§7[§9CosmosAC§7]\n=- §cKicked By Cosmos Anticheat\n§7=- §bReason: Profile Is Private\n§7=- §3Discord: ${discordCode}`,
                  version: 2,
                  origin: {
                    type: 0,
                    uuid: "",
                    request_id: "",
                  },
                });
                BedrockClient.queue("command_request", {
                  command: `tellraw @a {"rawtext":[{"text":"\n\n§7[§9CosmosAC Kicked§7] =- §bUsername: ${playerName}n§7=- §bReason: §3Profile Is Private\"}]}`,
                  version: 2,
                  origin: {
                    type: 0,
                    uuid: "",
                    request_id: "",
                  },
                });
                IncreaseKicks()
                console.log(`[API]`.bold.red + ` Flagged ${playerName} From ${realmname}`.green + ` Reason: Profile Is Private`.yellow + ` Time: ${timeString}`.cyan)
                if (automod) {
                  const embed = new EmbedBuilder()
                    .setColor(corange)
                    .setThumbnail(pfp)
                    .setDescription(`
${success} Automod __Kicked__
${reply} **Username:** \`${playerName}\`
${end} **Xuid:** \`${xbox_user_id}\`

**__ Kicked Info __**
${end} **Reason:** \`Profile Is Private\`
`)
                    .setFooter({ text: `Realm: ${realmname}` })
                    .setTimestamp()
                  discordClient.channels
                    .fetch(automod)
                    .then(async (channel) => await channel.send({ embeds: [embed] }))
                    .catch((error) => {
                      console.error(error);
                    });
                } else {
                  console.log(`${realmname} Has Not Set Channel Logs For Automod Logs!`)
                }
                KicksDB.set(`${playerName}`, {
                  reason: "Profile Is Private",
                  Data: 0,
                  xuid: xbox_user_id
                });
                KicksDB.save();
                const endTime = performance.now();
                const elapsedTime = endTime - startTime;
                console.log(`Elapsed time: ${elapsedTime} milliseconds`);
                const kickSuccessCount = JSON.parse(fs.readFileSync('Database/Graphs/graphDataKicks.json'));
                const isoDate = new Date().toISOString().slice(0, 13) + ":00:00Z"
                kickSuccessCount[isoDate] = (kickSuccessCount[isoDate] || 0) + 1
                fs.writeFileSync('Database/Graphs/graphDataKicks.json', JSON.stringify(kickSuccessCount, null, 2))

                const data = {
                  reason: "Profile Is Private",
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
          })
      })

    function IncreaseKicks() {
      const dbPath = path.join(process.cwd(), 'Database', 'Stats', 'kickCounts.json');
      const KickSent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      KickSent.kickCount = KickSent.kickCount ? KickSent.kickCount + 1 : 1;
      fs.writeFileSync(dbPath, JSON.stringify(KickSent));
    }
  }
}

module.exports = RealmStart;
