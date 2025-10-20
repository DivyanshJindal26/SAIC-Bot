// commandHandler.js
const messageCreateTriggers = new Map();
const messageUpdateTriggers = new Map();
const memJoinTriggers = new Map();

module.exports = {
    addMsgCreate(trigger) {
        messageCreateTriggers.set(trigger.name, trigger);
    },
    addMsgUpdate(trigger) {
        messageUpdateTriggers.set(trigger.name,trigger);
    },
    addMemJoin(trigger) {
        memJoinTriggers.set(trigger.name,trigger);
    },
    async handleCreate(msg, client) {
        for (const trigger of messageCreateTriggers.values()) {
            await trigger.execute(msg, client);
        }
    },
    async handleUpdate(oldMsg,newMsg) {
        for (const trigger of messageUpdateTriggers.values()) {
            await trigger.execute(oldMsg, newMsg);
        }
    },
    async handleJoin(user) {
        for (const trigger of memJoinTriggers.values()) {
            await trigger.execute(user);
        }
    }
};
