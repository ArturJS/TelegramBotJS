const EventEmitter = require('events');

class Mediator extends EventEmitter {
    constructor() {
        super();
        console.log('Mediator initialized!');
    }

    on(eventName, callback) {
        console.log(`Added subscription on "${eventName}"`);
        super.on(eventName, callback);
    }

    off(eventName, callback) {
        console.log(`Removed subscription from "${eventName}"`);
        super.off(eventName, callback);
    }

    emit(eventName, data) {
        console.log(
            `Emit event "${eventName}" with data ${JSON.stringify(data)}`
        );
        super.emit(eventName, data);
    }
}

module.exports = new Mediator();
