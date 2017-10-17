const Scheduler = require('./scheduler');
const events = require('./events');

module.exports = class PosterBot {
    constructor(commonSettings) {
        if (commonSettings.settings) {
            this.scheduler = new Scheduler(commonSettings.settings);
        }
        if (commonSettings.publicsList) {
            this.publicsList = commonSettings.publicsList;
            console.log(this.publicsList);
        }
        if (commonSettings.channelsList) {
            this.channelsList = commonSettings.channelsList;
            console.log(this.channelsList);
        }
        if (commonSettings.stealerSettings) {
            this.stealerSettings = commonSettings.stealerSettings;
        }
        this.scheduler.listJobsCount();
    }

    attachEvents() {
        const that = this;

        events.on('removeLast', params => {
            console.log('REMOOOVE');
            that.scheduler.removeLastPostTelegram(
                params.channelId,
                params.chat_id,
                params.host
            );
        });

        events.on('getChannelsTimes', params => {
            console.log('getChannelsTimes');
            that.scheduler.getChannelsTimes(
                '@testChannelJem',
                params.chat_id,
                params.host
            );
        });
    }

    startBot() {
        if (this.publicsList) {
            console.log('START BOT');
            console.log(this.publicsList);
            this.scheduler.setPublicsPostTimer(this.publicsList);
        }
        if (this.channelsList) {
            this.scheduler.setTelegramPostTimer(this.channelsList);
        }
        if (this.stealerSettings) {
            for (let prop in this.stealerSettings) {
                this.scheduler.setContentStealerTimer(
                    this.stealerSettings[prop]
                );
            }
        }
        this.scheduler.listJobsCount();
        this.attachEvents();
    }

    stopBot() {
        this.scheduler.cancelJobs();
    }
};
