const request = require('request');
const util = require('util');
const requestPromise = util.promisify(request);

module.exports = class BaseRequestManager {
    constructor(settings) {}

    async getNewContent(linksArray) {
        const promisesList = linksArray.map(link => {
            return requestPromise(link);
        });

        try {
            const dataList = await Promise.all(promisesList);
        } catch (err) {
            console.error(`Error in getNewContent: ${err}`);
            return [];
        }

        return dataList.map(response => response.body);
    }

    async getTitleLinks(requestParams) {
        if (!requestParams) throw new TypeError('Invalid requestParams');

        const { host } = requestParams;
        delete requestParams.host;

        try {
            const response = await requestPromise({
                url: host,
                qs: requestParams
            });
            return response.body;
        } catch (err) {
            console.error(`Error in getTitleLinks: ${err}`);
            return [];
        }
    }

    isWeekend() {
        const day = new Date().getDay();
        console.log(day);
        return day === 0 || day === 6;
    }
};
