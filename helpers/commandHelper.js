const slash = new Map();
const modals = new Map();  // Map to store modal handlers
const buttons = new Map();
const Fuse = require('fuse.js');

module.exports = {
    
    registerSlashCommand(command) {
        slash.set(command.data.name, command);
    },

    registerModalHandler(customId, handler) {
        modals.set(customId, handler);
    },

    registerButtonHandler(customId, handler) {
        buttons.set(customId, handler);
    },

    
    async handleInteraction(interaction) {
        if (interaction.isAutocomplete()) {
            const cmdName = interaction.commandName;
            const focused = interaction.options.getFocused(true);
        
            const isRelevantCommand =
                (cmdName === 'dono' && focused.name === 'itemname') ||
                (cmdName === 'raffle' && (focused.name === 'prize_item' || focused.name === 'item'));
        
            if (isRelevantCommand) {
                try {
                    const response = await fetch('https://api.gwapes.com/items');
                    const items1 = await response.json();
                    const items = items1.body;
        
                    const choices = items.map(item => ({
                        name: item.name,
                        value: item.name
                    }));
        
                    const fuseOptions = {
                        keys: ['name'],
                        threshold: 0.4,
                    };
        
                    const fuse = new Fuse(choices, fuseOptions);
        
                    const query = focused.value;
        
                    const filtered = fuse
                        .search(query)
                        .slice(0, 25)
                        .map(result => result.item);
        
        
                    await interaction.respond(filtered);
                } catch (error) {
                    console.error('Autocomplete Error:', error);
                    await interaction.respond([]);
                }
            }
        }

        else if (interaction.isCommand()) {
            // Handle slash commands
            const command = slash.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Error in this slash command.', ephemeral: true });
            }
        } else if (interaction.isModalSubmit()) {
            // Handle modal submissions
            const modalHandler = modals.get(interaction.customId.split('|')[0]);
            if (!modalHandler) return;
            try {
                await modalHandler(interaction);
            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: 'Error in this modal submission.', ephemeral: true });
            }
        } else if (interaction.isButton()) {
            const customId = interaction.customId.split('|')[0];
            const buttonHandler = buttons.get(customId);
            if(!buttonHandler) return;
            try {
                await buttonHandler.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Error in button interaction', ephemeral: true})
            }
        }
    },

};
