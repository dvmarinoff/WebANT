import { xf, equals, exists, existance, empty, first, last, delay } from './functions.js';
import { keys, ids } from './constants.js';
import { message } from './message.js';

function Channel(args = {}) {
    const number  = existance(args.channelNumber);
    const profile = existance(args.profile);
    const onData  = existance(args.onData);

    let deviceId = 0;
    let status   = 'searching';
    let config   = configure({profile, number, deviceId, status});

    function start() {
        const self = this;
        // xf.sub('ant:q:pull', onPull.bind(self));
    }

    function stop() {
        const self = this;
        // xf.unsub('ant:q:pull', onPull.bind(self));
    }

    function configure(args) {
        return channelConfig.get(args);
    }

    let q = existance(args.q, {});

    function search() {
        config = configure({profile, number, deviceId, status: 'searching'});
        console.log(`Channel: .search `, config);

        requestStatus();
        // push(message.unassignChannel.encode(config)); // maybe ??
        push(message.setNetworkKey.encode(config));
        push(message.assignChannel.encode(config));

        push(message.setChannelId.encode(config));
        push(message.enableExtRxMessages.encode(config));
        push(message.lowPrioritySearchTimeout.encode(config));
        push(message.searchTimeout.encode(config));

        push(message.setChannelFrequency.encode(config));
        push(message.setChannelPeriod.encode(config));
        push(message.openChannel.encode(config));
    }

    function track() {
        config = configure({profile, number, deviceId, status: 'tracking',});
        console.log(config);

        push(message.enableExtRxMessages(config));
        push(message.setChannelId.encode(config));
        push(message.lowPrioritySearchTimeout.encode(config));
        push(message.searchTimeout.encode(config));
    }

    function requestStatus() {
        const msg = message.requestMessage.encode({
            channelNumber:      config.channelNumber,
            requestedMessageId: ids.channelStatus,
        });
        push(msg);
    }

    function open() {
    }

    function close() {
        push(message.closeChannel.encode(config));
    }

    function push(data) {
        xf.dispatch('ant:q:push', data);
    }

    function defaultsOnData(data) {
        return data;
    }

    return Object.freeze({
        search,
        track,
        requestStatus,
        open,
        close,

        onData,
        push,
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
        console.log(`:Channels .init`);
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
        console.log(`:Channels .create`);
        const number = findAvailable(1);
        args.channelNumber = number;
        const channel = Channel(args);
        _channels[number] = channel;
        return channel;
    }

    function get(number) {
        console.log(`:Channels .get`);
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

