const request = require('request');
const events = require('./events');

const adminId = 'name';
let updateId = 0;
const handlers = {
    echo(host, chat_id, text = 'hello') {
        console.log('HEREEEE1');
        request.post(
            {
                url: `${host}sendMessage`,
                form: { chat_id, text }
            },
            (err, response, body) => {
                console.log(err);
            }
        );
    },
    hello(host, chat_id, text) {
        events.raise('hello', { chat_id, host, text });
        const keyboard = {
            keyboard: [[{ text: '123' }, { text: '456' }]],
            one_time_keyboard: true
        };
        request.post(
            {
                url: `${host}sendMessage`,
                form: {
                    chat_id,
                    text: '123',
                    reply_markup: JSON.stringify(keyboard)
                }
            },
            (err, response, body) => {
                console.log(err);
            }
        );
    },
    line(host, chat_id, text) {
        events.raise('hello', { chat_id, host, text });
        const keyboard = {
            inline_keyboard: [
                [
                    { text: '👍', callback_data: '+' },
                    { text: '😕', callback_data: '-' }
                ]
            ],
            one_time_keyboard: true
        };
        request.post(
            {
                url: `${host}sendMessage`,
                form: {
                    chat_id,
                    text: '123',
                    reply_markup: JSON.stringify(keyboard)
                }
            },
            (err, response, body) => {
                console.log(err);
            }
        );
    },
    removeLast(host, chat_id, channelId) {
        events.raise('removeLast', {
            channelId,
            chat_id,
            host
        });
    },
    getchannelstimes(host, chat_id, channelId) {
        events.raise('getChannelsTimes', {
            channelId,
            chat_id,
            host
        });
    }
};

function processResponse(data, host) {
    if (!data) {
        return;
    }
    try {
        data = JSON.parse(data);
    } catch (error) {
        console.log(error);
        return;
    }
    console.log(data);
    data = data.result;
    if (!data) {
        return;
    }
    const lastCommand = data[data.length - 1];
    if (lastCommand && lastCommand.update_id) {
        updateId = lastCommand.update_id + 1;
    }
    if (
        lastCommand &&
        lastCommand.message &&
        lastCommand.message.from &&
        lastCommand.message.from.username === adminId
    ) {
        console.log(lastCommand.message);
        const text = lastCommand.message.text.trim();
        const chat_id = lastCommand.message.chat.id;
        if (text.charAt(0) === '/') {
            const commandParams = getCommandParams(text);
            const handler = getHandlerByCommand(commandParams.command);
            handler(host, chat_id, commandParams.text);
        }
    }
}

function getCommandParams(text) {
    const commandEnd = text.indexOf(' ');
    let command;
    const text;
    if (commandEnd < 0) {
        command = text.substr(1);
        text = '';
    } else {
        command = text.substr(1, commandEnd - 1);
        text = text.substr(commandEnd);
    }
    return {
        command,
        text
    };
}

function getHandlerByCommand(command) {
    const handler = handlers[command];
    return handler || (() => {});
}

function getMessageChecker(host) {
    const url = `${host}getUpdates`;
    return () => {
        console.log(`${url}?offset=${updateId}`);
        request
            .get(`${url}?offset=${updateId}`)
            .on('response', (response, data) => {
                response.on('data', data => {
                    processResponse(data, host);
                });
            });
    };
}

class UserBot {
    constructor(settings) {
        if (settings && settings.token) {
            this.token = settings.token;
            this.time = 1500;
            this.host = 'https://api.telegram.org/bot' + this.token + '/';
            this._timer = 0;
        }
    }

    startBot() {
        const checkFunc = getMessageChecker(this.host);
        this._timer = setInterval(checkFunc, this.time);
    }

    stopBot() {
        if (this._timer) {
            clearInterval(this._timer);
        }
    }
}

module.exports = UserBot;
