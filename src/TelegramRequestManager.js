const request = require('request');
const constants = require('./constants');
const GoogleURL = require('google-url');
const BaseRequestManager = require('./BaseRequestManager');

module.exports = class TelegramRequestManager extends BaseRequestManager {
    constructor(settings) {
        super(settings);

        this.token = settings.token;
        this.disable_web_page_preview = 'false';
        this.host = 'https://api.telegram.org/bot' + this.token + '/';
        this.headers = {
            'User-Agent':
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30'
        };
        this.youtube_check_url = 'https://www.youtube.com/oembed';
        this.googleUrl = new GoogleURL({ key: settings.googleApiKey });
    }

    botReply(host, chat_id, message) {
        request.post(
            {
                url: host + 'sendMessage',
                form: {
                    chat_id,
                    text: message
                }
            },
            (err, response, body) => {
                console.log(err);
            }
        );
    }

    updateMessage(prop) {
        const url = that.host + 'editMessageText';

        request.post({ url, form: prop }, (err, response, body) => {
            if (err) {
                console.log('Error update buttons: ', err);
            }
        });
    }

    postData(channel_id, data, type) {
        let that = this;

        switch (type) {
            case constants.links: {
                const message = `${data.message} ${data.link}`;
                const url = `${this.host}sendMessage`;
                const propertiesObject = {
                    chat_id: channel_id,
                    text: message,
                    disable_web_page_preview: this.disable_web_page_preview,
                    disable_notification: `${this.isWeekend()}`
                };

                request.post(
                    {
                        url,
                        form: propertiesObject
                    },
                    (err, response, body) => {
                        console.log(`${response.statusCode} - ${data.link}`);

                        var body = JSON.parse(body);
                        if (!body || !body.result) {
                            return;
                        }
                        const shareLink = `https://t.me/${body.result.chat
                            .username}/${body.result.message_id}`;
                        const shareVkLink = `http://vk.com/share.php?url=${shareLink}&title=${data.message}`;
                        const shareFbLink = `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`;
                        const url = `${that.host}editMessageText`;

                        that.googleUrl.shorten(
                            shareVkLink,
                            (err1, shortUrlVk) => {
                                that.googleUrl.shorten(
                                    shareFbLink,
                                    (err2, shortUrlFb) => {
                                        const prop = {
                                            chat_id: `@${body.result.chat
                                                .username}`,
                                            message_id: body.result.message_id,
                                            text: message,
                                            disable_web_page_preview:
                                                that.disable_web_page_preview,
                                            disable_notification: `${that.isWeekend()}`,
                                            reply_markup: JSON.stringify({
                                                inline_keyboard: [
                                                    [
                                                        {
                                                            text: '👍',
                                                            callback_data: '+'
                                                        },
                                                        {
                                                            text: '😕',
                                                            callback_data: '-'
                                                        },
                                                        {
                                                            text: 'Share Vk',
                                                            url: shortUrlVk
                                                        },
                                                        {
                                                            text: 'Share Fb',
                                                            url: shortUrlFb
                                                        }
                                                    ]
                                                ]
                                            })
                                        };

                                        that.updateMessage(prop);
                                    }
                                );
                            }
                        );
                    }
                );

                break;
            }
        }
    }
};
