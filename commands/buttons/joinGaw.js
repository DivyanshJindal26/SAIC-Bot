const { giveawayJoin } = require('../../helpers/giveaway')

module.exports = {
    name: 'giveawayJoin',
    async execute(interaction) {
        await giveawayJoin(interaction);
    },
};
