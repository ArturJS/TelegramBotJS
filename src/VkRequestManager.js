const request = require('request');
const BaseRequestManager = require('./BaseRequestManager');

module.exports = class VkRequestManager extends BaseRequestManager {
    constructor(settings) {
        super(settings);
        this.token = settings.token;
        this.host = 'https://api.vk.com/method/wall.post';
        this.postFromGroup = 1;
    }

    postData(post, publicId) {
        const propertiesObject = {
            owner_id: `-${publicId}`,
            access_token: this.token,
            from_group: this.postFromGroup,
            message: post.message,
            attachment: post.link
        };

        request(
            { url: this.host, qs: propertiesObject },
            (err, response, body) => {
                console.log(`${response.statusCode} - ${post.link}`);
            }
        );
    }
};
