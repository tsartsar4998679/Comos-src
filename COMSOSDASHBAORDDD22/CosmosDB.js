const SoftUI = require("dbd-soft-ui");
const config = require('./config.js');
const editJsonFile = require("edit-json-file");
const fs = require('fs')
var session = require('express-session');
var FileStore = require('session-file-store')(session);
const path = require('node:path');
/* --- DISCORD.JS CLIENT --- */

const { Client, GatewayIntentBits, ChannelType, Embed, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ]
});
client.login(config.discord.bot_token);
module.exports = client

/* Events */

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

/* --- DASHBOARD --- */
(async () => {
    let DBD = require('discord-dashboard');
    await DBD.useLicense(config.dbd_license);
    DBD.Dashboard = DBD.UpdatedClass();

    const Dashboard = new DBD.Dashboard({
        sessionSaveSession: new FileStore(),
        client: {
            id: config.discord.client_id,
            secret: config.discord.client_secret
        },
        port: 80,
        redirectUri: 'https://dashboard.cosmosbot.dev/discord/callback',
        domain: 'https://dashboard.cosmosbot.dev',
        bot: client,
        useTheme404: true,
        ownerIDs: config.dbd.ownerIDs,
        theme: SoftUI({
            commands: [
                {
                    categoryId: "starting",
                    category: `Getting Started`,
                    subTitle: `Getting Started`,
                    /*
                                Use html to set an image using svg or an image. Use the class "invert-img" and "command-img" for e.g: `class="invert-img command-img"`.
                                Remove for no image.
                            */
                    hideSidebarItem: false,
                    hideDescription: false,
                    hideAlias: true,
                    list: [{
                        commandName: 'setup',
                        commandUsage: `/setup`,
                        commandDescription: 'Link your main account with Cosmos to get started',
                        commandAlias: 'No aliases'
                    },
                    {
                        commandName: 'bsetup',
                        commandUsage: `/bsetup`,
                        commandDescription: 'Link your alt/bot account with Cosmos for your realm(s)',
                        commandAlias: 'No aliases'
                    },
                    {
                        commandName: 'csetup',
                        commandUsage: `/csetup`,
                        commandDescription: 'Finalize your realm with Cosmos to edit its Config',
                        commandAlias: 'No aliases'
                    }
                    ],
                }
            ],
            customThemeOptions: {
                index: async ({ req, res, config }) => {
                    let username

                    if (req.session.user) {
                        username = req.session.user.username;
                        tag = req.session.user.tag;
                    } else {
                        username = "Logged out";
                        tag = "Logged out";
                    }

                    const totalMembers = client.guilds.cache.reduce((acc, guild) => {
                        return acc + guild.memberCount;
                    }, 0);
                    const cards = [{
                        title: "Current User",
                        icon: "single-02",
                        getValue: username,
                        progressBar: {
                            enabled: false,
                            getProgress: client.guilds.cache.size
                        }
                    },
                    {
                        title: "Servers In",
                        icon: "single-02",
                        getValue: `${client.guilds.cache.size} out of 500`,
                        progressBar: {
                            enabled: true,
                            getProgress: (client.guilds.cache.size / 500) * 100
                        }
                    },
                    {
                        title: "Watching Over",
                        icon: "single-02",
                        getValue: `${totalMembers}`,
                        progressBar: {
                            enabled: false,
                            getProgress: (totalMembers / 100000) * 100
                        }
                    }
                    ]
                    const realms = '../CosmosV2/Database/realm';
                    const itemsRealms = fs.readdirSync(realms);
                    const Realms = itemsRealms.filter(item => fs.statSync(`${realms}/${item}`).isDirectory());
                    const TotalRealms = Realms.length;

                    const graph = {
                        values: [TotalRealms, 0, 0, 0, 0, 0, 0, 0],
                        labels: ["Total Realms", "Coming Soon!", "Coming Soon!", "Coming Soon!", "Coming Soon!", "Coming Soon!", "Coming Soon!", "Coming Soon!"]
                    }

                    return {
                        graph,
                        cards,
                    }
                }
            },
            websiteName: "Cosmos",
            colorScheme: "pink",
            blacklisted: {
                title: "Blacklisted",
                subtitle: "Access denied",
                description: "Unfortunately it seems that you have been blacklisted from the dashboard.",
                button: {
                    enabled: false,
                    text: "Return",
                    link: "https://google.com"
                }
            },
            index: {
                card: {
                    category: "Soft UI",
                    title: "Assistants - The center of everything",
                    description: "Assistants Discord Bot management panel. Assistants Bot was created to give others the ability to do what they want. Just.<br>That's an example text.<br><br><b><i>Feel free to use HTML</i></b>",
                    image: "https://i.imgur.com/AasAZQ4.jpg",
                    link: {
                        enabled: false,

                        url: "https://google.com"
                    }
                },
                graph: {
                    enabled: true,
                    lineGraph: false,
                    title: 'Memory Usage',
                    tag: 'Cosmos Stats',
                    max: 5000,
                },
            },
            admin: {
                pterodactyl: {
                    enabled: false,
                    apiKey: "ptla_8AoiDbfARPShFIyzURF2nddGVJSTcnbXPWkXTNfikyJ",
                    panelLink: "216.128.176.101",
                    serverUUIDs: ['2a5cbb14-d058-4c3d-856b-8cfde6453022']
                }
            },
            icons: {
                favicon: 'https://images-ext-2.discordapp.net/external/DSJ6fuGDxeohYtvn5Y7BCJ9ZjLld17xgTiHi05aI82E/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1068479853218770945/a_50e5b525af85aaff2a55687bbc8a39eb.gif',
                noGuildIcon: "https://pnggrid.com/wp-content/uploads/2021/05/Discord-Logo-Circle-1024x1024.png",
                sidebar: {
                    darkUrl: 'https://images-ext-2.discordapp.net/external/DSJ6fuGDxeohYtvn5Y7BCJ9ZjLld17xgTiHi05aI82E/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1068479853218770945/a_50e5b525af85aaff2a55687bbc8a39eb.gif',
                    lightUrl: 'https://images-ext-2.discordapp.net/external/DSJ6fuGDxeohYtvn5Y7BCJ9ZjLld17xgTiHi05aI82E/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1068479853218770945/a_50e5b525af85aaff2a55687bbc8a39eb.gif',
                    hideName: false,
                    borderRadius: false,
                    alignCenter: true
                },
            },
            preloader: {
                image: "https://images-ext-2.discordapp.net/external/DSJ6fuGDxeohYtvn5Y7BCJ9ZjLld17xgTiHi05aI82E/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1068479853218770945/a_50e5b525af85aaff2a55687bbc8a39eb.gif",
                spinner: true,
                text: "Cosmos Loading",
            },
            supporteMail: "",
            locales: {
                enUS: {
                    name: 'English',
                    about: {
                        ab: "About Cosmos",
                        description: "What we are about",
                        subject: "",
                    },
                    index: {
                        feeds: ["", "Servers In", "Watching Over"],
                        card: {
                            category: "",
                            title: "Cosmos Change Logs",
                            description: `Resetted Skins Cache\nReseted Kicks Cache\nCouple Bug Fixes
                            `,
                            footer: "Login to access your Guilds"
                        },
                        feedsTitle: "Updates",
                        graphTitle: "Cosmos",
                    },
                    manage: {
                        settings: {
                            memberCount: "Members",
                            info: {
                                info: "Info",
                                server: "Server Information"
                            }
                        }
                    },
                    premium: {
                        enabled: false,
                        card: {
                            title: "Want more from Assistants?",
                            description: "Check out premium features below!",
                            bgImage: "https://assistantscenter.com/wp-content/uploads/2021/11/cropped-cropped-logov6.png",
                            button: {
                                text: "Become Premium",
                                url: "https://patreon.com/sharkybot"
                            }
                        }
                    },
                    partials: {
                        sidebar: {
                            dash: "Dashboard",
                            manage: "Manage Guilds/Configs",
                            commands: "Commands",
                            pp: "Privacy Policy",
                            plans: "Plans",
                            admin: "Admin",
                            account: "Account Pages",
                            login: "Sign In",
                            logout: "Sign Out",
                        },
                        navbar: {
                            home: "Home",
                            pages: {
                                manage: "Select Your Guild",
                                settings: "Manage Guilds",
                                commands: "Commands",
                                pp: "Privacy Policy",
                                plans: "Plans",
                                admin: "Admin Panel",
                                error: "Error",
                                credits: "Credits",
                                debug: "Debug",
                                leaderboard: "Leaderboard",
                                profile: "Profile",
                                maintenance: "Under Maintenance",
                            }
                        },
                        title: {
                            pages: {
                                manage: "Manage Guilds/Configs2",
                                settings: "Manage Config",
                                commands: "Commands",
                                pp: "Privacy Policy",
                                plans: "Plans",
                                admin: "Admin Panel",
                                error: "Error",
                                credits: "Credits",
                                debug: "Debug",
                                leaderboard: "Leaderboard",
                                profile: "Profile",
                                maintenance: "Under Maintenance",
                            }
                        },
                        preloader: {
                            text: "Loading Cosmos"
                        },
                        settings: {
                            title: "Site Configuration",
                            description: "Configurable Viewing Options",
                            theme: {
                                title: "Site Theme",
                                description: "Make the site more appealing for your eyes!",
                            },
                            language: {
                                title: "Site Language",
                                description: "Select your preffered language!",
                            }
                        },
                    }
                }
            }
        }),
        settings: [
            //realm 1
            {
                categoryId: 'realm1',
                categoryName: "Realm 1",
                categoryDescription: "Your Realm 1 Config Manager",
                categoryOptionsList: [
                    //Chat Relay
                    {
                        optionId: 'chatrelay',
                        optionName: "Chat-Relay Logs",
                        optionDescription: "Channel to set your chat relay to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const ChatRelay = ConfigEditor.get('Chat-Relay-Logs')
                            return ChatRelay
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('Chat-Relay-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Automod
                    {
                        optionId: 'automod',
                        optionName: "AutoMod Logs",
                        optionDescription: "Channel to set your automod to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const AutomodLogs = ConfigEditor.get('Automod-Logs')
                            return AutomodLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('Automod-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Join & Leaves
                    {
                        optionId: 'joinleaves',
                        optionName: "Join & Leave Logs",
                        optionDescription: "Channel to set your Join & Leave to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const JoinLeaveLogs = ConfigEditor.get('Join-Leave-Logs')
                            return JoinLeaveLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('Join-Leave-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Ban Logs
                    {
                        optionId: 'banlogs',
                        optionName: "Ban Logs",
                        optionDescription: "Channel to set your bans to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Ban-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('Ban-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Unban Logs
                    {
                        optionId: 'unbanlogs',
                        optionName: "Unban Logs",
                        optionDescription: "Channel to set your unbans to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Unban-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('Unban-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Kick Logs
                    {
                        optionId: 'kicklogs',
                        optionName: "Kick Logs",
                        optionDescription: "Channel to set your kick to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('KicksLogs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('KicksLogs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Invite Logs
                    {
                        optionId: 'invitelogs',
                        optionName: "Invite Logs",
                        optionDescription: "Channel to set your invites to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Cosmos-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('Cosmos-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Death Logs
                    {
                        optionId: 'deathlogs',
                        optionName: "Death Logs",
                        optionDescription: "Channel to set your death to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Death-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('Death-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Console Logs
                    {
                        optionId: 'consolelogs',
                        optionName: "Console Logs",
                        optionDescription: "Channel to set your console to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('ConsoleChannel')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('ConsoleChannel', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Chattype
                    {
                        optionId: 'chattype',
                        optionName: "Chat Types",
                        optionDescription: "Change your chat type",
                        optionType: DBD.formTypes.select({ "Normal": "Normal", "Tellraw": "Tellraw" }, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('chattype')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('chattype', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Embedformat
                    {
                        optionId: 'embedformat',
                        optionName: "Embed Format",
                        optionDescription: "Change your Join & Leave Thumbnails",
                        optionType: DBD.formTypes.select({ "Player's Skin Face": "SkinFace", "Player's Xbox Profile Picture": "Gamerpic" }, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('embedformat')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('embedformat', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Gamerscore
                    {
                        optionId: 'gamerscore',
                        optionName: "Gamerscore",
                        optionDescription: "Edit your realm's gamerscore config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Gamerscore')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('Gamerscore', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Followers
                    {
                        optionId: 'followers',
                        optionName: "Followers",
                        optionDescription: "Edit your realm's followers config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Followers')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('Followers', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Friends
                    {
                        optionId: 'friends',
                        optionName: "Friends",
                        optionDescription: "Edit your realm's friends config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Friends')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('Friends', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Games
                    {
                        optionId: 'games',
                        optionName: "Games",
                        optionDescription: "Edit your realm's games config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Games')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('Games', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Invis
                    {
                        optionId: 'antiinvis',
                        optionName: "Anti-Invis",
                        optionDescription: "Edit your realm's anti-invis config",
                        optionType: DBD.formTypes.switch(false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('antiinvis')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('antiinvis', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            const now = Math.floor(Date.now() / 1000);
                            const Premium = ConfigEditor.get("PremiumTime") ?? 0
                            if (Premium === 0) {
                                return {
                                    allowed: false,
                                    errorMessage: 'This realm has no premium!'
                                }
                            } else {
                                if (now < Premium) {
                                    return {
                                        allowed: true,
                                        errorMessage: null
                                    };
                                } else {
                                    return {
                                        allowed: false,
                                        errorMessage: 'This realm has no premium!'
                                    }
                                }
                            }
                        }
                    },
                    //Global Bans
                    {
                        optionId: 'globalban',
                        optionName: "Global Ban",
                        optionDescription: "Edit your realm's global ban config",
                        optionType: DBD.formTypes.switch(false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('globalStatus')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('globalStatus', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    },
                    //Ban Message
                    {
                        optionId: 'banmessage',
                        optionName: "Ban Message",
                        optionDescription: "Edit your realm's ban message config",
                        optionType: DBD.formTypes.textarea("You have been banned from {realmname} for reason: {reason}", 1, undefined, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('banMessage')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)
                            ConfigEditor.set('banMessage', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    },
                    //Devices
                    {
                        optionId: 'bandevices',
                        optionName: "Banned Devices",
                        optionDescription: "Edit your realm's banned devices config",
                        optionType: DBD.formTypes.multiSelect(
                            {
                                "Minecraft for Windows": "Minecraft for Windows", 
                                "Minecraft Launcher": "Minecraft Launcher", 
                                "Minecraft for iOS": "Minecraft for iOS",
                                "Minecraft for Android": "Minecraft for Android",
                                "Minecraft for Nintendo Switch": "Minecraft for Nintendo Switch",
                                "Disable Ban Devices": "Disabled"
                            }),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id !== 'Empty') {
                                const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                                if (fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/BannedDevices.json`)) {
                                    let rawData = fs.readFileSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/BannedDevices.json`);
                                    const bd = JSON.parse(rawData);
                                    return bd
                                } else return []
                            } else {
                                return []
                            }
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const filePath = `../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/BannedDevices.json`
                            const JsonData = newData === 'Disabled' ? [] : newData;
                            fs.writeFile(filePath, JSON.stringify(JsonData), err => {
                                if (err) {
                                    console.log(err)
                                }
                            })
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[0]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    }
                ]
            },
            //Realm 2
            {
                categoryId: 'realm2',
                categoryName: "Realm 2",
                categoryDescription: "Your Realm 2 Config Manager",
                categoryOptionsList: [
                    //Chat Relay
                    {
                        optionId: 'chatrelay',
                        optionName: "Chat-Relay Logs",
                        optionDescription: "Channel to set your chat relay to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const ChatRelay = ConfigEditor.get('Chat-Relay-Logs')
                            return ChatRelay
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('Chat-Relay-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Automod
                    {
                        optionId: 'automod',
                        optionName: "AutoMod Logs",
                        optionDescription: "Channel to set your automod to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const AutomodLogs = ConfigEditor.get('Automod-Logs')
                            return AutomodLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('Automod-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Join & Leaves
                    {
                        optionId: 'joinleaves',
                        optionName: "Join & Leave Logs",
                        optionDescription: "Channel to set your Join & Leave to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const JoinLeaveLogs = ConfigEditor.get('Join-Leave-Logs')
                            return JoinLeaveLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('Join-Leave-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Ban Logs
                    {
                        optionId: 'banlogs',
                        optionName: "Ban Logs",
                        optionDescription: "Channel to set your bans to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Ban-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('Ban-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            } 
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Unban Logs
                    {
                        optionId: 'unbanlogs',
                        optionName: "Unban Logs",
                        optionDescription: "Channel to set your unbans to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Unban-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('Unban-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Kick Logs
                    {
                        optionId: 'kicklogs',
                        optionName: "Kick Logs",
                        optionDescription: "Channel to set your kick to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('KicksLogs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('KicksLogs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Invite Logs
                    {
                        optionId: 'invitelogs',
                        optionName: "Invite Logs",
                        optionDescription: "Channel to set your invites to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Cosmos-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('Cosmos-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Death Logs
                    {
                        optionId: 'deathlogs',
                        optionName: "Death Logs",
                        optionDescription: "Channel to set your death to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Death-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('Death-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Console Logs
                    {
                        optionId: 'consolelogs',
                        optionName: "Console Logs",
                        optionDescription: "Channel to set your console to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('ConsoleChannel')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('ConsoleChannel', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Chattype
                    {
                        optionId: 'chattype',
                        optionName: "Chat Types",
                        optionDescription: "Change your chat type",
                        optionType: DBD.formTypes.select({ "Normal": "Normal", "Tellraw": "Tellraw" }, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('chattype')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('chattype', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Embedformat
                    {
                        optionId: 'embedformat',
                        optionName: "Embed Format",
                        optionDescription: "Change your Join & Leave Thumbnails",
                        optionType: DBD.formTypes.select({ "Player's Skin Face": "SkinFace", "Player's Xbox Profile Picture": "Gamerpic" }, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('embedformat')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('embedformat', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Gamerscore
                    {
                        optionId: 'gamerscore',
                        optionName: "Gamerscore",
                        optionDescription: "Edit your realm's gamerscore config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Gamerscore')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('Gamerscore', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Followers
                    {
                        optionId: 'followers',
                        optionName: "Followers",
                        optionDescription: "Edit your realm's followers config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Followers')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('Followers', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Friends
                    {
                        optionId: 'friends',
                        optionName: "Friends",
                        optionDescription: "Edit your realm's friends config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Friends')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('Friends', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Games
                    {
                        optionId: 'games',
                        optionName: "Games",
                        optionDescription: "Edit your realm's games config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Games')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('Games', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Invis
                    {
                        optionId: 'antiinvis',
                        optionName: "Anti-Invis",
                        optionDescription: "Edit your realm's anti-invis config",
                        optionType: DBD.formTypes.switch(false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('antiinvis')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('antiinvis', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            const now = Math.floor(Date.now() / 1000);
                            const Premium = ConfigEditor.get("PremiumTime") ?? 0
                            if (Premium === 0) {
                                return {
                                    allowed: false,
                                    errorMessage: 'This realm has no premium!'
                                }
                            } else {
                                if (now < Premium) {
                                    return {
                                        allowed: true,
                                        errorMessage: null
                                    };
                                } else {
                                    return {
                                        allowed: false,
                                        errorMessage: 'This realm has no premium!'
                                    }
                                }
                            }
                        }
                    },
                    //Global Bans
                    {
                        optionId: 'globalban',
                        optionName: "Global Ban",
                        optionDescription: "Edit your realm's global ban config",
                        optionType: DBD.formTypes.switch(false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('globalStatus')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('globalStatus', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    },
                    //Ban Message
                    {
                        optionId: 'banmessage',
                        optionName: "Ban Message",
                        optionDescription: "Edit your realm's ban message config",
                        optionType: DBD.formTypes.textarea("You have been banned from {realmname} for reason: {reason}", 1, undefined, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('banMessage')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)
                            ConfigEditor.set('banMessage', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    },
                    //Devices
                    {
                        optionId: 'bandevices',
                        optionName: "Banned Devices",
                        optionDescription: "Edit your realm's banned devices config",
                        optionType: DBD.formTypes.multiSelect(
                            {
                                "Minecraft for Windows": "Minecraft for Windows", 
                                "Minecraft Launcher": "Minecraft Launcher", 
                                "Minecraft for iOS": "Minecraft for iOS",
                                "Minecraft for Android": "Minecraft for Android",
                                "Minecraft for Nintendo Switch": "Minecraft for Nintendo Switch",
                                "Disable Ban Devices": "Disabled"
                            }),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id !== 'Empty') {
                                const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                                if (fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/BannedDevices.json`)) {
                                    let rawData = fs.readFileSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/BannedDevices.json`);
                                    const bd = JSON.parse(rawData);
                                    return bd
                                } else return []
                            } else {
                                return []
                            }
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const filePath = `../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/BannedDevices.json`
                            const JsonData = newData === 'Disabled' ? [] : newData;
                            fs.writeFile(filePath, JSON.stringify(JsonData), err => {
                                if (err) {
                                    console.log(err)
                                }
                            })
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[1]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    }
                ]
            },
            //Realm 3
            {
                categoryId: 'realm3',
                categoryName: "Realm 3",
                categoryDescription: "Your Realm 3 Config Manager",
                categoryOptionsList: [
                    //Chat Relay
                    {
                        optionId: 'chatrelay',
                        optionName: "Chat-Relay Logs",
                        optionDescription: "Channel to set your chat relay to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const ChatRelay = ConfigEditor.get('Chat-Relay-Logs')
                            return ChatRelay
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('Chat-Relay-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Automod
                    {
                        optionId: 'automod',
                        optionName: "AutoMod Logs",
                        optionDescription: "Channel to set your automod to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const AutomodLogs = ConfigEditor.get('Automod-Logs')
                            return AutomodLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('Automod-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Join & Leaves
                    {
                        optionId: 'joinleaves',
                        optionName: "Join & Leave Logs",
                        optionDescription: "Channel to set your Join & Leave to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const JoinLeaveLogs = ConfigEditor.get('Join-Leave-Logs')
                            return JoinLeaveLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('Join-Leave-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Ban Logs
                    {
                        optionId: 'banlogs',
                        optionName: "Ban Logs",
                        optionDescription: "Channel to set your bans to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Ban-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('Ban-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Unban Logs
                    {
                        optionId: 'unbanlogs',
                        optionName: "Unban Logs",
                        optionDescription: "Channel to set your unbans to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Unban-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('Unban-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Kick Logs
                    {
                        optionId: 'kicklogs',
                        optionName: "Kick Logs",
                        optionDescription: "Channel to set your kick to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('KicksLogs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('KicksLogs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Invite Logs
                    {
                        optionId: 'invitelogs',
                        optionName: "Invite Logs",
                        optionDescription: "Channel to set your invites to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Cosmos-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('Cosmos-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Death Logs
                    {
                        optionId: 'deathlogs',
                        optionName: "Death Logs",
                        optionDescription: "Channel to set your death to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Death-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('Death-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Console Logs
                    {
                        optionId: 'consolelogs',
                        optionName: "Console Logs",
                        optionDescription: "Channel to set your console to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('ConsoleChannel')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('ConsoleChannel', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Chattype
                    {
                        optionId: 'chattype',
                        optionName: "Chat Types",
                        optionDescription: "Change your chat type",
                        optionType: DBD.formTypes.select({ "Normal": "Normal", "Tellraw": "Tellraw" }, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('chattype')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('chattype', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Embedformat
                    {
                        optionId: 'embedformat',
                        optionName: "Embed Format",
                        optionDescription: "Change your Join & Leave Thumbnails",
                        optionType: DBD.formTypes.select({ "Player's Skin Face": "SkinFace", "Player's Xbox Profile Picture": "Gamerpic" }, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('embedformat')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('embedformat', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Gamerscore
                    {
                        optionId: 'gamerscore',
                        optionName: "Gamerscore",
                        optionDescription: "Edit your realm's gamerscore config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Gamerscore')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('Gamerscore', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Followers
                    {
                        optionId: 'followers',
                        optionName: "Followers",
                        optionDescription: "Edit your realm's followers config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Followers')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('Followers', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Friends
                    {
                        optionId: 'friends',
                        optionName: "Friends",
                        optionDescription: "Edit your realm's friends config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Friends')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('Friends', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Games
                    {
                        optionId: 'games',
                        optionName: "Games",
                        optionDescription: "Edit your realm's games config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Games')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('Games', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Invis
                    {
                        optionId: 'antiinvis',
                        optionName: "Anti-Invis",
                        optionDescription: "Edit your realm's anti-invis config",
                        optionType: DBD.formTypes.switch(false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('antiinvis')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('antiinvis', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            const now = Math.floor(Date.now() / 1000);
                            const Premium = ConfigEditor.get("PremiumTime") ?? 0
                            if (Premium === 0) {
                                return {
                                    allowed: false,
                                    errorMessage: 'This realm has no premium!'
                                }
                            } else {
                                if (now < Premium) {
                                    return {
                                        allowed: true,
                                        errorMessage: null
                                    };
                                } else {
                                    return {
                                        allowed: false,
                                        errorMessage: 'This realm has no premium!'
                                    }
                                }
                            }
                        }
                    },
                    //Global Bans
                    {
                        optionId: 'globalban',
                        optionName: "Global Ban",
                        optionDescription: "Edit your realm's global ban config",
                        optionType: DBD.formTypes.switch(false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('globalStatus')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('globalStatus', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    },
                    //Ban Message
                    {
                        optionId: 'banmessage',
                        optionName: "Ban Message",
                        optionDescription: "Edit your realm's ban message config",
                        optionType: DBD.formTypes.textarea("You have been banned from {realmname} for reason: {reason}", 1, undefined, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('banMessage')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)
                            ConfigEditor.set('banMessage', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    },
                    //Devices
                    {
                        optionId: 'bandevices',
                        optionName: "Banned Devices",
                        optionDescription: "Edit your realm's banned devices config",
                        optionType: DBD.formTypes.multiSelect(
                            {
                                "Minecraft for Windows": "Minecraft for Windows", 
                                "Minecraft Launcher": "Minecraft Launcher", 
                                "Minecraft for iOS": "Minecraft for iOS",
                                "Minecraft for Android": "Minecraft for Android",
                                "Minecraft for Nintendo Switch": "Minecraft for Nintendo Switch",
                                "Disable Ban Devices": "Disabled"
                            }),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id !== 'Empty') {
                                const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                                if (fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/BannedDevices.json`)) {
                                    let rawData = fs.readFileSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/BannedDevices.json`);
                                    const bd = JSON.parse(rawData);
                                    return bd
                                } else return []
                            } else {
                                return []
                            }
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const filePath = `../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/BannedDevices.json`
                            const JsonData = newData === 'Disabled' ? [] : newData;
                            fs.writeFile(filePath, JSON.stringify(JsonData), err => {
                                if (err) {
                                    console.log(err)
                                }
                            })
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[2]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[2]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    }
                ]
            },
            //Realm 4
            {
                categoryId: 'realm4',
                categoryName: "Realm 4",
                categoryDescription: "Your Realm 4 Config Manager",
                categoryOptionsList: [
                    //Chat Relay
                    {
                        optionId: 'chatrelay',
                        optionName: "Chat-Relay Logs",
                        optionDescription: "Channel to set your chat relay to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const ChatRelay = ConfigEditor.get('Chat-Relay-Logs')
                            return ChatRelay
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('Chat-Relay-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Automod
                    {
                        optionId: 'automod',
                        optionName: "AutoMod Logs",
                        optionDescription: "Channel to set your automod to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const AutomodLogs = ConfigEditor.get('Automod-Logs')
                            return AutomodLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('Automod-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Join & Leaves
                    {
                        optionId: 'joinleaves',
                        optionName: "Join & Leave Logs",
                        optionDescription: "Channel to set your Join & Leave to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const JoinLeaveLogs = ConfigEditor.get('Join-Leave-Logs')
                            return JoinLeaveLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('Join-Leave-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Ban Logs
                    {
                        optionId: 'banlogs',
                        optionName: "Ban Logs",
                        optionDescription: "Channel to set your bans to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Ban-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('Ban-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Unban Logs
                    {
                        optionId: 'unbanlogs',
                        optionName: "Unban Logs",
                        optionDescription: "Channel to set your unbans to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Unban-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('Unban-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Kick Logs
                    {
                        optionId: 'kicklogs',
                        optionName: "Kick Logs",
                        optionDescription: "Channel to set your kick to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('KicksLogs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('KicksLogs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Invite Logs
                    {
                        optionId: 'invitelogs',
                        optionName: "Invite Logs",
                        optionDescription: "Channel to set your invites to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Cosmos-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('Cosmos-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Death Logs
                    {
                        optionId: 'deathlogs',
                        optionName: "Death Logs",
                        optionDescription: "Channel to set your death to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Death-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('Death-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Console Logs
                    {
                        optionId: 'consolelogs',
                        optionName: "Console Logs",
                        optionDescription: "Channel to set your console to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('ConsoleChannel')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('ConsoleChannel', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Chattype
                    {
                        optionId: 'chattype',
                        optionName: "Chat Types",
                        optionDescription: "Change your chat type",
                        optionType: DBD.formTypes.select({ "Normal": "Normal", "Tellraw": "Tellraw" }, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('chattype')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('chattype', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Embedformat
                    {
                        optionId: 'embedformat',
                        optionName: "Embed Format",
                        optionDescription: "Change your Join & Leave Thumbnails",
                        optionType: DBD.formTypes.select({ "Player's Skin Face": "SkinFace", "Player's Xbox Profile Picture": "Gamerpic" }, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('embedformat')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('embedformat', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Gamerscore
                    {
                        optionId: 'gamerscore',
                        optionName: "Gamerscore",
                        optionDescription: "Edit your realm's gamerscore config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Gamerscore')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('Gamerscore', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Followers
                    {
                        optionId: 'followers',
                        optionName: "Followers",
                        optionDescription: "Edit your realm's followers config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Followers')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('Followers', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Friends
                    {
                        optionId: 'friends',
                        optionName: "Friends",
                        optionDescription: "Edit your realm's friends config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Friends')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('Friends', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Games
                    {
                        optionId: 'games',
                        optionName: "Games",
                        optionDescription: "Edit your realm's games config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Games')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('Games', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Invis
                    {
                        optionId: 'antiinvis',
                        optionName: "Anti-Invis",
                        optionDescription: "Edit your realm's anti-invis config",
                        optionType: DBD.formTypes.switch(false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('antiinvis')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('antiinvis', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            const now = Math.floor(Date.now() / 1000);
                            const Premium = ConfigEditor.get("PremiumTime") ?? 0
                            if (Premium === 0) {
                                return {
                                    allowed: false,
                                    errorMessage: 'This realm has no premium!'
                                }
                            } else {
                                if (now < Premium) {
                                    return {
                                        allowed: true,
                                        errorMessage: null
                                    };
                                } else {
                                    return {
                                        allowed: false,
                                        errorMessage: 'This realm has no premium!'
                                    }
                                }
                            }
                        }
                    },
                    //Global Bans
                    {
                        optionId: 'globalban',
                        optionName: "Global Ban",
                        optionDescription: "Edit your realm's global ban config",
                        optionType: DBD.formTypes.switch(false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('globalStatus')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('globalStatus', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    },
                    //Ban Message
                    {
                        optionId: 'banmessage',
                        optionName: "Ban Message",
                        optionDescription: "Edit your realm's ban message config",
                        optionType: DBD.formTypes.textarea("You have been banned from {realmname} for reason: {reason}", 1, undefined, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('banMessage')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)
                            ConfigEditor.set('banMessage', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    },
                    //Devices
                    {
                        optionId: 'bandevices',
                        optionName: "Banned Devices",
                        optionDescription: "Edit your realm's banned devices config",
                        optionType: DBD.formTypes.multiSelect(
                            {
                                "Minecraft for Windows": "Minecraft for Windows", 
                                "Minecraft Launcher": "Minecraft Launcher", 
                                "Minecraft for iOS": "Minecraft for iOS",
                                "Minecraft for Android": "Minecraft for Android",
                                "Minecraft for Nintendo Switch": "Minecraft for Nintendo Switch",
                                "Disable Ban Devices": "Disabled"
                            }),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id !== 'Empty') {
                                const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                                if (fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/BannedDevices.json`)) {
                                    let rawData = fs.readFileSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/BannedDevices.json`);
                                    const bd = JSON.parse(rawData);
                                    return bd
                                } else return []
                            } else {
                                return []
                            }
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const filePath = `../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/BannedDevices.json`
                            const JsonData = newData === 'Disabled' ? [] : newData;
                            fs.writeFile(filePath, JSON.stringify(JsonData), err => {
                                if (err) {
                                    console.log(err)
                                }
                            })
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[3]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    }
                ]
            },
            //Realm 5
            {
                categoryId: 'realm5',
                categoryName: "Realm 5",
                categoryDescription: "Your Realm 5 Config Manager",
                categoryOptionsList: [
                    //Chat Relay
                    {
                        optionId: 'chatrelay',
                        optionName: "Chat-Relay Logs",
                        optionDescription: "Channel to set your chat relay to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const ChatRelay = ConfigEditor.get('Chat-Relay-Logs')
                            return ChatRelay
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('Chat-Relay-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Automod
                    {
                        optionId: 'automod',
                        optionName: "AutoMod Logs",
                        optionDescription: "Channel to set your automod to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const AutomodLogs = ConfigEditor.get('Automod-Logs')
                            return AutomodLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('Automod-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Join & Leaves
                    {
                        optionId: 'joinleaves',
                        optionName: "Join & Leave Logs",
                        optionDescription: "Channel to set your Join & Leave to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const JoinLeaveLogs = ConfigEditor.get('Join-Leave-Logs')
                            return JoinLeaveLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('Join-Leave-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Ban Logs
                    {
                        optionId: 'banlogs',
                        optionName: "Ban Logs",
                        optionDescription: "Channel to set your bans to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Ban-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('Ban-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Unban Logs
                    {
                        optionId: 'unbanlogs',
                        optionName: "Unban Logs",
                        optionDescription: "Channel to set your unbans to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Unban-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('Unban-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Kick Logs
                    {
                        optionId: 'kicklogs',
                        optionName: "Kick Logs",
                        optionDescription: "Channel to set your kick to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('KicksLogs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('KicksLogs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Invite Logs
                    {
                        optionId: 'invitelogs',
                        optionName: "Invite Logs",
                        optionDescription: "Channel to set your invites to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Cosmos-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('Cosmos-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Death Logs
                    {
                        optionId: 'deathlogs',
                        optionName: "Death Logs",
                        optionDescription: "Channel to set your death to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Death-Logs')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('Death-Logs', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Console Logs
                    {
                        optionId: 'consolelogs',
                        optionName: "Console Logs",
                        optionDescription: "Channel to set your console to send to!",
                        optionType: DBD.formTypes.channelsSelect(false, [ChannelType.GuildText], true, false, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('ConsoleChannel')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('ConsoleChannel', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Chattype
                    {
                        optionId: 'chattype',
                        optionName: "Chat Types",
                        optionDescription: "Change your chat type",
                        optionType: DBD.formTypes.select({ "Normal": "Normal", "Tellraw": "Tellraw" }, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('chattype')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('chattype', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Embedformat
                    {
                        optionId: 'embedformat',
                        optionName: "Embed Format",
                        optionDescription: "Change your Join & Leave Thumbnails",
                        optionType: DBD.formTypes.select({ "Player's Skin Face": "SkinFace", "Player's Xbox Profile Picture": "Gamerpic" }, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('embedformat')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('embedformat', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Gamerscore
                    {
                        optionId: 'gamerscore',
                        optionName: "Gamerscore",
                        optionDescription: "Edit your realm's gamerscore config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Gamerscore')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('Gamerscore', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Followers
                    {
                        optionId: 'followers',
                        optionName: "Followers",
                        optionDescription: "Edit your realm's followers config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Followers')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('Followers', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Friends
                    {
                        optionId: 'friends',
                        optionName: "Friends",
                        optionDescription: "Edit your realm's friends config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Friends')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('Friends', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Games
                    {
                        optionId: 'games',
                        optionName: "Games",
                        optionDescription: "Edit your realm's games config",
                        optionType: DBD.formTypes.input("Value here", 0, 5000, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('Games')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('Games', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    //Invis
                    {
                        optionId: 'antiinvis',
                        optionName: "Anti-Invis",
                        optionDescription: "Edit your realm's anti-invis config",
                        optionType: DBD.formTypes.switch(false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('antiinvis')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('antiinvis', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            const now = Math.floor(Date.now() / 1000);
                            const Premium = ConfigEditor.get("PremiumTime") ?? 0
                            if (Premium === 0) {
                                return {
                                    allowed: false,
                                    errorMessage: 'This realm has no premium!'
                                }
                            } else {
                                if (now < Premium) {
                                    return {
                                        allowed: true,
                                        errorMessage: null
                                    };
                                } else {
                                    return {
                                        allowed: false,
                                        errorMessage: 'This realm has no premium!'
                                    }
                                }
                            }
                        }
                    },
                    //Global Bans
                    {
                        optionId: 'globalban',
                        optionName: "Global Ban",
                        optionDescription: "Edit your realm's global ban config",
                        optionType: DBD.formTypes.switch(false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('globalStatus')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('globalStatus', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    },
                    //Ban Message
                    {
                        optionId: 'banmessage',
                        optionName: "Ban Message",
                        optionDescription: "Edit your realm's ban message config",
                        optionType: DBD.formTypes.textarea("You have been banned from {realmname} for reason: {reason}", 1, undefined, false),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            const BLogs = ConfigEditor.get('banMessage')
                            return BLogs
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const ConfigEditor = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)
                            ConfigEditor.set('banMessage', newData)
                            ConfigEditor.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[3]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    },
                    //Devices
                    {
                        optionId: 'bandevices',
                        optionName: "Banned Devices",
                        optionDescription: "Edit your realm's banned devices config",
                        optionType: DBD.formTypes.multiSelect(
                            {
                                "Minecraft for Windows": "Minecraft for Windows", 
                                "Minecraft Launcher": "Minecraft Launcher", 
                                "Minecraft for iOS": "Minecraft for iOS",
                                "Minecraft for Android": "Minecraft for Android",
                                "Minecraft for Nintendo Switch": "Minecraft for Nintendo Switch",
                                "Disable Ban Devices": "Disabled"
                            }),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id !== 'Empty') {
                                const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                                if (fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/BannedDevices.json`)) {
                                    let rawData = fs.readFileSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[1]?.[0]}/BannedDevices.json`);
                                    const bd = JSON.parse(rawData);
                                    return bd
                                } else return []
                            } else {
                                return []
                            }
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const filePath = `../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/BannedDevices.json`
                            const JsonData = newData === 'Disabled' ? [] : newData;
                            fs.writeFile(filePath, JSON.stringify(JsonData), err => {
                                if (err) {
                                    console.log(err)
                                }
                            })
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[4]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            const Realm2Id = File.data[guild.id]?.[4]?.[0] ?? 'Empty';
                            if (Realm2Id === 'Empty') return {
                                allowed: false,
                                errorMessage: 'Empty Slot!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };

                        }
                    }
                ]
            },
            //Permissions
            {
                categoryId: 'permissions',
                categoryName: "Edit Permissions",
                categoryDescription: "Edit your guild's permissions",
                categoryOptionsList: [
                    {
                        optionId: 'reconnect',
                        optionName: "Reconnect",
                        optionDescription: "Edit your guild permission for Reconnect",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('Reconnect')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('Reconnect', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'configmanager',
                        optionName: "Config Manager",
                        optionDescription: "Edit your guild permission for Config Manager",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('ConfigManager')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('ConfigManager', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realmunban',
                        optionName: "Realm Unban",
                        optionDescription: "Edit your guild permission for Realm Unbans",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmUnban')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmUnban', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realmbans',
                        optionName: "Realm Bans",
                        optionDescription: "Edit your guild permission for Realm Bans",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmBan')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmBan', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realminvite',
                        optionName: "Realm Invite",
                        optionDescription: "Edit your guild permission for Realm Invite",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmInvite')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmInvite', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realmopen',
                        optionName: "Realm Open",
                        optionDescription: "Edit your guild permission for Realm Open",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmOpen')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmOpen', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realmclose',
                        optionName: "Realm Close",
                        optionDescription: "Edit your guild permission for Realm Close",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmClose')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmClose', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realmrestore',
                        optionName: "Realm Restore",
                        optionDescription: "Edit your guild permission for Realm Restore",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmBackup')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmBackup', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realmcode',
                        optionName: "Realm Code",
                        optionDescription: "Edit your guild permission for Realm Code",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmCode')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmCode', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realmpermissions',
                        optionName: "Realm Permissions",
                        optionDescription: "Edit your guild permission for Realm Permissions",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmPermissions')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmPermissions', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realmplayers',
                        optionName: "Realm Players",
                        optionDescription: "Edit your guild permission for Realm Players",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmPlayers')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmPlayers', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realmrecents',
                        optionName: "Realm Recents",
                        optionDescription: "Edit your guild permission for Realm Recents",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmRecents')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmRecents', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realmrename',
                        optionName: "Realm Rename",
                        optionDescription: "Edit your guild permission for Realm Rename",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmRename')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmRename', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realmslots',
                        optionName: "Realm Slots",
                        optionDescription: "Edit your guild permission for Realm Slots",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmSlots')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmSlots', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                    {
                        optionId: 'realmchangecode',
                        optionName: "Realm Change Code",
                        optionDescription: "Edit your guild permission for Realm Change Code",
                        optionType: DBD.formTypes.rolesMultiSelect(false, false, true),
                        getActualSet: async ({ guild }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            const Reconnects = PermUpdate.get('RealmChangeCode')
                            return Reconnects
                        },
                        setNew: async ({ guild, newData }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            const PermUpdate = editJsonFile(`../CosmosV2/Database/realm/${guild.id}/perms.json`);
                            PermUpdate.append('RealmChangeCode', `${newData}`)
                            PermUpdate.save()
                        },
                        allowedCheck: async ({ guild, user }) => {
                            const File = editJsonFile(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`);
                            if (!fs.existsSync(`../CosmosV2/Database/Oauth/${guild.id}/realms.json`)) return {
                                allowed: false,
                                errorMessage: 'You have not setup with Cosmos yet!'
                            }
                            if (!fs.existsSync(`../CosmosV2/Database/realm/${guild.id}/${File.data[guild.id]?.[0]?.[0]}/config.json`)) return {
                                allowed: false,
                                errorMessage: 'This realm has not yet setup with Cosmos yet!'
                            }
                            return {
                                allowed: true,
                                errorMessage: null
                            };
                        }
                    },
                ]
            }

        ]
    });
    Dashboard.init();
    Dashboard.DBDEvents.on('guildSettingsUpdated', (data) => {
        const Embed = new EmbedBuilder()
            .setThumbnail(data.user.avatarURL)
            .setDescription(`
**__ Cosmos Dashboard __**
> Settings Updated!

**__ User Info __**
> Name: ${data.user.global_name}
> Id: ${data.user.id}

**__ Settings Updated __**

__ Success __
> ${data.changes.successes}

__ Errors __
> ${data.changes.errors}

        `)
        client.channels
            .fetch("1123854126468579348")
            .then(async (channel) => await channel.send({ embeds: [Embed] }))
            .catch((error) => {
                console.error(error);
            });
    });
})();