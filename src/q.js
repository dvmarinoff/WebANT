import { xf, equals, exists, existance, dataviewToArray } from './functions.js';
import { channels } from './channels.js';

function Q(args = {}) {
    let _q        = new Map();
    let channels = existance(args.channels);

    function start() {
        const self = this;
        xf.sub('ant:driver:ready', onReady.bind(self));
        xf.sub('ant:driver:rx', onData.bind(self));
    }

    function stop() {
        const self = this;
        xf.unsub('ant:driver:ready', onReady.bind(self));
        xf.unsub('ant:driver:rx', onData.bind(self));
    }

    function onReady() {
        channels.init();
    }

    function onData(data) {
        console.log(`ant: rx: ${data}`);
        const channelNumber = channels.getNumber(data);
        channels.get(channelNumber).onData(data);
    }

    function write(dataview) {
        xf.dispatch('ant:driver:tx', dataview);
        console.log(`ant: tx: ${dataviewToArray(dataview)}`);
    }

    function push(args = {}) {
        write(args.msg);
    }

    return Object.freeze({
        onData,
        push,
    });
}

const q = Q();
q.start();

export { q };

