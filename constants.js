
const cred = `#800020`;
const cgreen = `#228B22`;
const corange = `#FF3131`;

const reply = `<:replycontinued:1119840768501227642>`;
const end = `<:reply:1119840769713381396>`;

const success = `<:5104yes:1082793438359072858>`;
const denied = `<:4330no:1082793436920422530>`;
const WARNING = `<:warning2:1071174519252856943>`;
const Manager = `<:staff:1074595818151096360>`
const Logging = `<:discordchannel:1071174144797966346>`
const Premium = `<:vipicon:1082785213685440593>`

const loading = `<a:Loading_Color:1070437345423265912>`;

const unload1 = `<:Unload1:1098991430543872010>`;
const unload2 = `<:Unload2:1098991415045931130>`;
const unload3 = `<:Unload3:1098991295126569041>`;

const load1 = `<:Load1:1098989932757929984>`;
const load2 = `<:Load2:1098989830559514735>`;
const load3 = `<:Load3:1098989816672165949>`;

const setup = `</setup:1100019296735870994>`;
const bsetup = `</bsetup:1100019296622628941>`;
const csetup = `</csetup:1094657613817446401>`;
const bperms = `</bperms:1100019296622628939>`

function createFirstEmbedLoad(guild, interactionUser) {
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${loading} **Verifying Account...**
${end} ${load1}${unload2}${unload3}
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date()
    };
}

function createSecondEmbedLoad(guild, interactionUser) {
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${loading} **Validating Settings...**
${end} ${load1}${load2}${unload3}
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date()
    };
}

function createThirdEmbedLoad(guild, interactionUser) {
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${loading} **Executing Operation...**
${end} ${load1}${load2}${load3}
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date()
    };
}

function createNotGuildOwnerEmbed(guild, interactionUser) {
    const OrangeColor = parseInt(corange.substring(1), 16)
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${WARNING} **Notice**
${reply} You don't have \`Administrator\` permission
${end} or you are not the guild owner to use this command!
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date(),
        color: OrangeColor
    };
}

function createNotInteractionCreator(guild, interactionUser) {
    const OrangeColor = parseInt(corange.substring(1), 16)
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${WARNING} **Notice**
${end} This is not your command!
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date(),
        color: OrangeColor
    };
}

function createNonBotAccountSetup(guild, interactionUser) {
    const OrangeColor = parseInt(corange.substring(1), 16)
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${WARNING} **Notice**
${reply} The Guild Owner / Administrator Hasn't Ran ${bsetup} Yet!
${end} Run ${bsetup} Then Retry This Command!
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date(),
        color: OrangeColor
    }
}

function createNonMainAccountSetup(guild, interactionUser) {
    const OrangeColor = parseInt(corange.substring(1), 16)
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${WARNING} **Notice**
${reply} The Guild Owner / Administrator Hasn't Ran ${setup} Yet!
${end} Run ${setup} Then Retry This Command!
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date(),
        color: OrangeColor
    }
}

function createMissingSlot(guild, interactionUser) {
    const OrangeColor = parseInt(corange.substring(1), 16)
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${WARNING} **Notice**
${reply} You Selected an **Empty Slot**!
${reply} Please Select a Slot That Has Your Realm.
${end} If You Don't See It, Please Run ${setup}
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date(),
        color: OrangeColor
    }
}

function createNoConfig(guild, interactionUser) {
    const OrangeColor = parseInt(corange.substring(1), 16)
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${WARNING} **Notice**
${reply} The Guild Owner / Administrator has not ran ${csetup}!
${end} If you don't see your realm(s), run ${setup}!
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date(),
        color: OrangeColor
    }
}

function creatNoPermRole(guild, interactionUser, permission) {
    const OrangeColor = parseInt(corange.substring(1), 16)
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${WARNING} **Notice**
${reply} This Guild Has No Roles In The \`${permission}\` Category!
${end} Run ${bperms} To Edit The Permissions.

*Usage: ${bperms} <role> <permission> (${permission})*
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date(),
        color: OrangeColor
    }
}

function createNoRolePermission(guild, interactionUser, roles, permission) {
    const OrangeColor = parseInt(corange.substring(1), 16)
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${WARNING} **Notice**
${reply} You Do Not Have Permission To Use This Command!
${reply} **Required Category:** \`${permission}\`
${end} **Required Role(s):** ${roles}

*Usage: ${bperms} <role> <permission> (${permission})*
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date(),
        color: OrangeColor
    }
}

function createSearchingUsername(guild, interactionUser) {
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${loading} **Searching Username**
${end} ${load1}${load2}${unload3}
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date()
    }
}

function createUserNotFound(guild, interactionUser) {
    const OrangeColor = parseInt(corange.substring(1), 16)
    return {
        author: { name: `${guild}`, iconURL: guild.iconURL() },
        description: `
${WARNING} **Notice**
${end} User not found!
`,
        footer: { text: `Requested By ${interactionUser.tag}`, iconURL: interactionUser.displayAvatarURL() },
        timestamp: new Date(),
        color: OrangeColor
    }
}



module.exports = {
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
    unload1,
    unload2,
    unload3,
    load1,
    load2,
    load3,
    createFirstEmbedLoad,
    createSecondEmbedLoad,
    createThirdEmbedLoad,
    createNotGuildOwnerEmbed,
    createNotInteractionCreator,
    createNonBotAccountSetup,
    createNonMainAccountSetup,
    createMissingSlot,
    createNoConfig,
    creatNoPermRole,
    createNoRolePermission,
    createSearchingUsername,
    createUserNotFound
};