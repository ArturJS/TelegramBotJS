const fs = require('fs');
const _ = require('lodash');

class FileManager {
    constructor() {
        console.log('FileManager created');
    }

    readDataFromFile(path) {
        let content = null;

        try {
            content = fs.readFileSync(path, 'utf8');
        } catch (error) {
            console.error(error);
        }
        return content;
    }

    readDataFromJson(path) {
        let content = this.readDataFromFile(path);

        try {
            content = JSON.parse(content);
        } catch (error) {
            console.error(error);
        }
        return content;
    }

    readStringFromFile(filePath) {
        let result = this.readDataFromFile(filePath);

        if (result) {
            const lines = result.split('\r\n');
            result = lines.splice(0, 1)[0];
            fs.writeFileSync(filePath, lines.join('\r\n'));
        }

        return result;
    }

    getOldTitlesFromFile(filePath) {
        const result = this.readDataFromFile(filePath);
        let lines = [];

        if (result) {
            lines = result.split('\r\n');
        }
        return lines;
    }

    addNewArrayDataFile(newData, filePath) {
        const result = this.readDataFromFile(filePath);
        if (result) {
            let lines = result.split('\r\n');
            lines = newData.concat(lines);
            fs.writeFileSync(filePath, lines.join('\r\n'));
        }
    }
}

module.exports = new FileManager();
