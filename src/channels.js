import { xf, equals, exists, existance, empty, first, last, delay } from './functions.js';
import { keys, ids } from './constants.js';
import { message } from './message.js';

// const config = {
//     channel: {
//         channelNumber: 2,
//     },
//     deviceId: {
//         deviceNumber: 0,
//         deviceType: 17,
//         transmissionType: 0,
//     },
//     filters: {
//         deviceType: 17,
//         period: (32768 / 4),
//         frequency: 57,
//         key: keys.antPlus,
//     },
//     onData: onData,
// };

// config: {
//     channel: {
//         channelNumber: 1,
//     },
//     deviceId: {
//         deviceNumber: 0,
//         deviceType: 0,
//         transmissionType: 0,
//     },
//     filters: {
//         deviceType: 0,
//         period: (32280 / 4),
//         frequency: 57,
//         key: keys.antPlus,
//     }
// }

function Channel(args = {}) {
    const defaults = {
        config: {
            channelNumber:    0,
            channelType:      0,
            deviceType:       0,
            enable:           1,
            extended:         0x01,
            searchTimeout:    0,
            lowSearchTimeout: 255,
            deviceNumber:     0,
            transmissionType: 0,
            channelPeriod:    8192,
            rfFrequency:      66,
            key:              keys.public,
        }
    };

    const config = configure(args);

    function configure(args) {
    }

    let q = existance(args.q, {});
    function setQ(value) { q = value; return q; }

    function open() {
    }

    function search() {
        // write(message.unassignChannel.encode(config)); // maybe ??
        write(message.setNetworkKey.encode(config));
        write(message.assignChannel.encode(config));
        write(message.setChannelId.encode(config));
        write(message.enableExtRxMessages(config));
        write(message.lowPrioritySearchTimeout.encode(config));
        write(message.searchTimeout.encode(config));
        write(message.setChannelFrequency.encode(config));
        write(message.setChannelPeriod.encode(config));
        write(message.openChannel.encode(config));
    }

    function connect() {
        write(message.enableExtRxMessages(config));
    }

    function close() {
        write(message.closeChannel.encode(config));
    }

    function status() {
        const msg = message.requestMessage.encode({
            channelNumber:      config.channelNumber,
            requestedMessageId: ids.channelStatus,
        });
        write(msg);
        // write({channel: config.channelNumber, msg: msg});
    }

    function onData() {
    }

    function write(msg) {
        q.push(msg);
    }

    return Object.freeze({
        setQ,
        open,
        close,
        status,
    });
}

function Channels() {
    const _channels = {
        0: undefined, // background channel
        1: undefined,
        2: undefined,
        3: undefined,
        4: undefined,
        5: undefined,
        6: undefined,
        7: undefined,
    };

    function init() {
        // determine the status of each channel
    }

    function isAvailable(key) {
        if(!equals(key, 0) && !exists(_channels[key])) return true;
        return false;
    }

    function findAvailable(number) {
        if(isAvailable(number)) return number;
        return first(Object.keys(_channels).filter(isAvailable));
    }

    function create(args = {}) {
        const number = findAvailable(1);
        args.channelNumber = number;
        const channel = Channel(args);
        _channels[number] = channel;
        return channel;
    }

    function get(number) {
        return _channels[number];
    }

    return Object.freeze({
        init,
        isAvailable,
        findAvailable,
        create,
        get,
    });
}

const channels = Channels();

export { channels };

