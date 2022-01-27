import { xf, equals, existance, isDataView, isArray, dataviewToArray, delay } from './functions.js';
import { SerialDriver, SerialPolyfillDriver } from './web-serial.js';
import { ids } from './constants.js';

function Driver(args = {}) {
    let _driver;

    function getOS() {
        if(!equals(navigator.appVersion.indexOf('Win'), -1)) return 'windows';
        if(!equals(navigator.appVersion.indexOf('Mac'), -1)) return 'macos';
        if(!equals(navigator.appVersion.indexOf('Android'), -1)) return 'android';
        if(!equals(navigator.appVersion.indexOf('Linux'), -1)) return 'linux';
        return 'unknown';
    }

    function init() {
        const os = getOS();
        console.log(os);

        if(equals(os, 'windows')) {
            // not supported
            _driver = SerialPolyfillDriver({onData: onRx});
        }
        if(equals(os, 'macos')) {
            _driver = SerialPolyfillDriver({onData: onRx});
        }
        if(equals(os, 'linux')) {
            _driver = SerialDriver({onData: onRx});
        }
        if(equals(os, 'android')) {
            _driver = SerialPolyfillDriver({onData: onRx});
        }

        start();
    }

    function start() {
        const self = this;
        xf.sub('ui:ant:driver:switch', onSwitch.bind(self));
        xf.sub('ant:driver:tx', onTx);
    }

    function stop() {
        xf.reg('ui:ant:driver:switch', async function() {
            if(_driver.isOpen()) {
                close();
            } else {
                open();
            }
        });
    }

    function onSwitch() {
        if(_driver.isOpen()) {
            close();
        } else {
            open();
        }
    }

    async function open() {
        xf.dispatch(`ant:driver:connecting`);
        await _driver.open(onOpen);
    }

    function close() {
        _driver.close();
        xf.dispatch('ant:driver:closed');
    }

    async function onOpen() {
        await delay(1000);
        xf.dispatch('ant:driver:ready');
        xf.dispatch(`ant:driver:connected`);
    }

    function onRx(data) {
        channelDispatch(getChannel(data), data);
    }
    function isGlobal(data) {
    }
    function getId(data) { return data[2]; }
    function getChannel(data) { return data[3]; }
    function channelDispatch(channel, data) {
        console.log(`ant: rx: ${data}`);
        if(equals(channel, 0)) {
            for(let channel=0; channel<8; channel++) {
                xf.dispatch(`ant:driver:${channel}:rx`,
                            new DataView(new Uint8Array(data).buffer));
            }
        } else {
            xf.dispatch(`ant:driver:${channel}:rx`,
                        new DataView(new Uint8Array(data).buffer));
        }
    }

    function onTx(dataview) {
        _driver.write(dataview);
    }

    return Object.freeze({
        init,
        open,
        close,
    });
}

const driver = Driver();

export { driver };

