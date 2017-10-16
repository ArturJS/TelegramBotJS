const fileManager = require('./fileManager');
const PosterBot = require('./PosterBot');
const UserBot = require('./UserBot');

const settings = fileManager.readDataFromJson('./settings/settings.json');
const publicsList = fileManager.readDataFromJson('./settings/vkpublic.json');
const stealerSettings = fileManager.readDataFromJson(
    './settings/contentStealer.json'
);
const channelsList = fileManager.readDataFromJson(
    './settings/telegramchannel.json'
);

if (settings) {
    const commonSettings = {
        settings,
        publicsList,
        stealerSettings,
        channelsList
    };

    const posterBot = new PosterBot(commonSettings);
    posterBot.startBot();

    if (settings.telegramSettings) {
        const userBot = new UserBot(settings.telegramSettings);
        userBot.startBot();
    }
}
