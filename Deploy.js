const { REST, Routes } = require('discord.js');
const { clientid, token } = require('./config.json');
const fs = require('node:fs');
require('colors');
const path = require('node:path');

const commands = [];

const foldersPath = path.join(__dirname, 'Commands');

function readCommands(folderPath) {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            readCommands(filePath); // Recursively read subfolders
        } else if (file.endsWith('.js')) {
            const command = require(filePath);
            commands.push(command.data.toJSON());
        }
    }
}

readCommands(foldersPath);

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
    try {
        console.log(`[DEPLOY]`.bold.green + ` Started refreshing:`.yellow + ` ${commands.length} `.red + `application (/) commands.`.yellow);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(clientid),
            { body: commands },
        );
        console.log(`[DEPLOY]`.bold.green + ` Successfully reloaded`.yellow + ` ${data.length} `.red + `application (/) commands.`.yellow);
        readCommands(foldersPath); // Call the function again to get the list of loaded command files
        commands.forEach(command => {
            console.log(`[DEPLOY]`.bold.green + ` Successfully Loaded:`.yellow + ` ${command.name}`.red);
        });
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
