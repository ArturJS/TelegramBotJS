const constants = require('./constants');
const _ = require('lodash');
const jsdom = require('jsdom').jsdom;
const myWindow = jsdom().defaultView;
const $ = require('jquery')(myWindow);

module.exports = {
    parsePostString(postData, postType) {
        let dataList;
        let result;

        switch (postType) {
            case constants.links:
                dataList = postData.split(' ');
                result = {
                    link: dataList.splice(0, 1)[0],
                    message: dataList.join(' ')
                };
                break;
            default:
                result = {
                    message: postData
                };
        }
        return result;
    },

    parseTitles(body, titles, q) {
        let items = $(body).find('.post__title_link');

        items = _.map(items, function(el) {
            el = $(el);
            if (el.text().indexOf(q) > -1) {
                return $(el).attr('href');
            } else {
                return null;
            }
        });
        items = _.filter(items, function(el) {
            return el !== null;
        });

        let newPosts = _.difference(items, titles);
        return newPosts;
    },

    parseNewContent(body, targetSelector, lastElement, saveLastPointText) {
        const $body = $(body);
        const $a = $body.find('a');
        const arr = [];
        let resultArr;
        let lastEl = $body.find(lastElement);

        if (!lastEl.length) {
            const links = $body.find('.content a');
            for (let i = 0; i < links.length; i++) {
                if (
                    $(links[i])
                        .text()
                        .indexOf(saveLastPointText) > -1
                ) {
                    lastEl = $(links[i]);
                    break;
                }
            }
        }

        const lastIndex = $a.index(lastEl);

        $body.find(targetSelector).each(function() {
            const $element = $(this);
            if ($a.index($element) < lastIndex) {
                arr.push({
                    link: $element.attr('href'),
                    text: $element.text()
                });
            }
        });

        resultArr = arr.map(({ link, text }) => `${link} ${text}`);
        resultArr = this.shuffleArray(resultArr);
        console.log('Get New Content --- ', resultArr.length);

        return resultArr;
    },

    shuffleArray(data) {
        return _.shuffle(data);
    }
};
