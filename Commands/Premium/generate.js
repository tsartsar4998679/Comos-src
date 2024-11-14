const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');
const editJsonFile = require("edit-json-file");
const crypto = require('crypto');

const cred = `#800020`;
const cgreen = `#228B22`;
const corange = `#FF3131`;

let reply = `<:reply:1068634523522306068>`;
let end = `<:replay_end:1068634568502026391>`;

let success = `<:5104yes:1082793438359072858>`;
let denied = `<:4330no:1082793436920422530>`;
let WARNING = `<:warning2:1071174519252856943> `

let loading = `<a:Loading_Color:1070437345423265912>`;

let unload1 = `<:Unload1:1098991430543872010>`
let unload2 = `<:Unload2:1098991415045931130>`
let unload3 = `<:Unload3:1098991295126569041>`

let load1 = `<:Load1:1098989932757929984>`
let load2 = `<:Load2:1098989830559514735>`
let load3 = `<:Load3:1098989816672165949>`

let configperms = `</configperms:1082887632712908941>`

const codes = [];
const serials = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Generate Premium Codes')
        .addStringOption(option =>
            option.setName('amount')
                .setDescription('Amount of Codes To Generate')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type Of Premium')
                .setRequired(true)
                .addChoices(
                    { name: 'Monthly', value: 'monthly' },
                    { name: '3 Monthly', value: '3monthly' },
                    { name: '6 Monthly', value: '6monthly' },
                    { name: 'Yearly', value: 'yearly' }
                )),

    async execute(interaction) {
        if (interaction.user.id !== '667844353003356199') {
            console.log(`[GENERATE]`.bold.red + ` ${interaction.user.tag} Has Attempted To Use /generate Command In ${interaction.guild}`.bold.yellow + ` (ID: ${interaction.guild.id})!`.cyan)
            const Embed = new EmbedBuilder()
                .setColor(corange)
                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                .setDescription(`
${WARNING} **Notice**
${end} This is a Dev Command!
`)
                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
            interaction.reply({ embeds: [Embed], ephemeral: true })
            return
        }
        const amount = interaction.options.getString('amount')
        const type = interaction.options.getString('type')
        if (type === "monthly") {
            const Embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                .setDescription(`
${loading} **Restocking Sellix**
${reply} **Generating:** \`${amount}\` Codes
${end} **Type:** \`${type}\`
`)
                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
            interaction.reply({ embeds: [Embed] })
            for (let i = 0; i < amount; i++) {
                const code = crypto.randomBytes(20).toString('hex');
                serials.push(code);
                codes.push(code);
                setTimeout(() => {
                    if (i === amount - 1) {
                        const Embed = new EmbedBuilder()
                            .setColor(cgreen)
                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                            .setDescription(`
${success} **Restocked Sellix**
${reply} **Generated:** \`${amount}\` Codes
${end} **Type:** \`${type}\`
                        `)
                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                            .setTimestamp();
                        interaction.editReply({ embeds: [Embed] });
                        const sellix = require("@sellix/node-sdk")("w6RxxlasFk1rrluut7Nmnwga0NExcxrig5BjPLgOTedkk1lnYLmb3mvPjVW01qsK", "cosmospremium");
                        const productId = "64703be67cdf5";
                        const productPayload = {
                            title: "Monthly Premium",
                            price: 3.00,
                            description: "Get Cosmos Premium on a monthly basic to use it's features!",
                            currency: "USD",
                            gateways: ["PAYPAL"],
                            type: "SUBSCRIPTION",
                            serials: serials
                        };
                        void (async () => {
                            try {
                                await sellix.products.update(productId, productPayload);
                            } catch (e) {
                                console.log(e);
                            }
                        })();
                    }
                }, 1500)
            }
            fs.writeFile(`./Database/MonthlyCodes.json`, JSON.stringify(codes, null, 2), (err) => {
                if (err) {
                    console.error(err);
                }
            })
        }
        if (type === "3monthly") {
            const Embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                .setDescription(`
${loading} **Generating Codes**
${reply} **Generating:** \`${amount}\` Codes
${end} **Type:** \`${type}\`
`)
                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
            interaction.reply({ embeds: [Embed] })
            for (let i = 0; i < amount; i++) {
                const code = crypto.randomBytes(20).toString('hex');
                codes.push(code);
                serials.push(code);
                setTimeout(() => {
                    if (i === amount - 1) {
                        const Embed = new EmbedBuilder()
                            .setColor(cgreen)
                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                            .setDescription(`
${success} **Generated Codes For Sellix**
${reply} **Generated:** \`${amount}\` Codes
${end} **Type:** \`${type}\`
                        `)
                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                            .setTimestamp();
                        interaction.editReply({ embeds: [Embed] });
                        const sellix = require("@sellix/node-sdk")("w6RxxlasFk1rrluut7Nmnwga0NExcxrig5BjPLgOTedkk1lnYLmb3mvPjVW01qsK", "cosmospremium");
                        const productId = "64703c9c54b92";
                        const productPayload = {
                            title: "3 Month Premium",
                            price: 9.00,
                            description: "Get Cosmos Premium on a monthly basic to use it's features!",
                            currency: "USD",
                            gateways: ["PAYPAL"],
                            type: "SUBSCRIPTION",
                            serials: serials
                        };
                        void (async () => {
                            try {
                                await sellix.products.update(productId, productPayload);
                            } catch (e) {
                                console.log(e);
                            }
                        })();
                    }
                }, 1500)
            }
            fs.writeFile(`./Database/3MonthlyCodes.json`, JSON.stringify(codes, null, 2), (err) => {
                if (err) {
                    console.error(err);
                }
            })
        }
        if (type === "6monthly") {
            const Embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                .setDescription(`
${loading} **Generating Codes**
${reply} **Generating:** \`${amount}\` Codes
${end} **Type:** \`${type}\`
`)
                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
            interaction.reply({ embeds: [Embed] })
            for (let i = 0; i < amount; i++) {
                const code = crypto.randomBytes(20).toString('hex');
                codes.push(code);
                setTimeout(() => {
                    if (i === amount - 1) {
                        const Embed = new EmbedBuilder()
                            .setColor(cgreen)
                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                            .setDescription(`
${success} **Generated Codes**
${reply} **Generated:** \`${amount}\` Codes
${end} **Type:** \`${type}\`
                        `)
                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                            .setTimestamp();
                        interaction.editReply({ embeds: [Embed] });
                    }
                }, 1500)
            }
            fs.writeFile(`./Database/6MonthlyCodes.json`, JSON.stringify(codes, null, 2), (err) => {
                if (err) {
                    console.error(err);
                }
            })
        }
        if (type === "yearly") {
            const Embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                .setDescription(`
${loading} **Generating Codes**

**__ Code Info __**
${reply} **Generating:** \`${amount}\` Codes
${end} **Type:** \`${type}\`
`)
                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
            interaction.reply({ embeds: [Embed] })
            for (let i = 0; i < amount; i++) {
                const code = crypto.randomBytes(20).toString('hex');
                codes.push(code);
                setTimeout(() => {
                    if (i === amount - 1) {
                        const Embed = new EmbedBuilder()
                            .setColor(cgreen)
                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                            .setDescription(`
${success} **Generated Codes**

**__ Code Info __**
${reply} **Generated:** \`${amount}\` Codes
${end} **Type:** \`${type}\`
                        `)
                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                            .setTimestamp();
                        interaction.editReply({ embeds: [Embed] });
                    }
                }, 1500)
            }
            fs.writeFile(`./Database/YearlyCodeBase.json`, JSON.stringify(codes, null, 2), (err) => {
                if (err) {
                    console.error(err);
                }
            })
        }
        if (type === "2years") {
            const Embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                .setDescription(`
${loading} **Generating Codes**

**__ Code Info __**
${reply} **Generating:** \`${amount}\` Codes
${end} **Type:** \`${type}\`
`)
                .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
            interaction.reply({ embeds: [Embed] })
            for (let i = 0; i < amount; i++) {
                const code = crypto.randomBytes(20).toString('hex');
                codes.push(code);
                setTimeout(() => {
                    if (i === amount - 1) {
                        const Embed = new EmbedBuilder()
                            .setColor(cgreen)
                            .setAuthor({ name: `${interaction.guild}`, iconURL: interaction.guild.iconURL() })
                            .setDescription(`
${success} **Generated Codes**

**__ Code Info __**
${reply} **Generated:** \`${amount}\` Codes
${end} **Type:** \`${type}\`
                        `)
                            .setFooter({ text: `Requested By ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                            .setTimestamp();
                        interaction.editReply({ embeds: [Embed] });
                    }
                }, 1500)
            }
            fs.writeFile(`./Database/2YearCodes.json`, JSON.stringify(codes, null, 2), (err) => {
                if (err) {
                    console.error(err);
                }
            })
        }
    }
}