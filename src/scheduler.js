const schedule = require('node-schedule');
const TelegramRequstManager = require('./TelegramRequestManager');
const VkRequestManager = require('./VkRequestManager');
const fileManager = require('./fileManager');
const dataParser = require('./dataParser');

module.exports = class Scheduler {
    constructor(settings) {
        if (settings.vkSettings) {
            this.vkReuqestManager = new VkRequestManager(settings.vkSettings);
        }
        if (settings.telegramSettings) {
            this.telegramRequestManager = new TelegramRequstManager(
                settings.telegramSettings
            );
        }
        this.jobs = {};
    }

    parseTimeToCron(timeString, periodic) {
        const time = timeString.split(':');
        return `12 ${time[1]} ${time[0]} * * ${periodic}`;
    }

    setPublicsPostTimer(publicsSettings) {
        const that = this;
        for (let publicItem in publicsSettings) {
            const settings = publicsSettings[publicItem];
            this.jobs[settings.publicId] = {};
            console.log(settings.publicId);

            for (let i = 0; i < settings.times.length; i++) {
                const time = this.parseTimeToCron(settings.times[i], '0-6');
                console.log('---', settings.times[i]);
                const task = schedule.scheduleJob(time, () => {
                    const postData = fileManager.readStringFromFile(
                        settings.filePath
                    );

                    if (postData) {
                        const requestData = dataParser.parsePostString(
                            postData,
                            settings.type
                        );
                        if (requestData) {
                            that.vkReuqestManager.postData(
                                requestData,
                                settings.publicId
                            );
                        }
                    }
                });
                this.jobs[settings.publicId][settings.times[i]] = task;
            }
        }
    }

    setContentStealerTimer(settings) {
        const that = this;

        if (settings.times && settings.link) {
            const process = () => {
                const request = that.vkReuqestManager.getTitleLinks(
                    settings.link
                );

                request.then(
                    data => {
                        console.log('REQUEST');
                        const oldTitles = fileManager.getOldTitlesFromFile(
                            settings.resultFile
                        );
                        const newPosts = dataParser.parseTitles(
                            data,
                            oldTitles,
                            settings.link.q
                        );
                        fileManager.addNewArrayDataFile(
                            newPosts,
                            settings.resultFile
                        );

                        if (newPosts.length) {
                            const contetnRequest = that.vkReuqestManager.getNewContent(
                                newPosts
                            );
                            console.log(contetnRequest);
                            contetnRequest.then(
                                data => {
                                    let resultData = [];
                                    console.log('new Data');
                                    for (var i = 0; i < data.length; i++) {
                                        const result = dataParser.parseNewContent(
                                            data[i],
                                            settings.link.targetSelector,
                                            settings.link.lastElement,
                                            settings.link.saveLastPoint
                                        );
                                        resultData = resultData.concat(result);
                                    }
                                    if (!Array.isArray(settings.filePath)) {
                                        settings.filePath = [settings.filePath];
                                    }
                                    for (
                                        var i = 0;
                                        i < settings.filePath.length;
                                        i++
                                    ) {
                                        if (i > 0) {
                                            resultData = dataParser.shuffleArray(
                                                resultData
                                            );
                                        }
                                        fileManager.addNewArrayDataFile(
                                            resultData,
                                            settings.filePath[i]
                                        );
                                    }
                                },
                                error => {
                                    console.error(error);
                                }
                            );
                        }
                    },
                    error => {
                        console.error(error);
                    }
                );
            };
            const task = schedule.scheduleJob(settings.times, process);
            this.jobs.contentStealer = [task];
        }
    }

    getPostFunction(key, settings) {
        const that = this;
        return () => {
            const data = fileManager.readStringFromFile(settings.filePath);
            console.log(data);

            if (data) {
                const newData = dataParser.parsePostString(data, settings.type);
                const request = that.telegramRequestManager.postData(
                    key,
                    newData,
                    settings.type
                );
            }
        };
    }

    setTelegramPostTimer(channelsList) {
        for (let key in channelsList) {
            console.log(key);
            const settings = channelsList[key];
            const times = settings.times;
            this.jobs[key] = {};
            const post = this.getPostFunction(key, settings);
            for (let i = 0; i < times.length; i++) {
                const time = this.parseTimeToCron(settings.times[i], '0-6');
                console.log('---', settings.times[i]);
                const task = schedule.scheduleJob(time, post);
                this.jobs[key][settings.times[i]] = task;
            }
        }
    }

    removeLastPostTelegram(channelId, chat_id, host) {
        const tasks = this.jobs[channelId];
        const keys = Object.keys(tasks);
        const lastKey = keys[keys.length - 1];
        const task = keys[lastKey];
        let result = 'Не успешно';
        if (task && task.cancelNext) {
            task.cancelNext(true);
            result = 'Успешно';
        }
        this.telegramRequestManager.botReply(host, chat_id, result);
    }

    getChannelsTimes(channelId, chat_id, host) {
        const tasks = this.jobs[channelId];
        console.log(tasks);
        this.telegramRequestManager.botReply(
            host,
            chat_id,
            JSON.stringify(tasks)
        );
    }

    listJobsCount() {
        let count = 0;
        for (const key in this.jobs) {
            count += Object.keys(this.jobs[key]).length;
        }
        console.log('Tasks count: ', count);
    }

    cancelJobs() {
        if (this.jobs.length) {
            for (const key in this.jobs) {
                this.jobs[key].forEach(item => {
                    item.cancelJob();
                });
            }
        }
    }
};
