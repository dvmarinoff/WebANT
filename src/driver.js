import { xf, equals, existance, delay } from './functions.js';
import { SerialDriver, SerialPolyfillDriver } from './web-serial.js';

function Driver(args = {}) {
    let _driver;

    function getOS() {
        if(!equals(navigator.appVersion.indexOf('Win'), -1)) return 'windows';
        if(!equals(navigator.appVersion.indexOf('Mac'), -1)) return 'macos';
        if(!equals(navigator.appVersion.indexOf('Linux'), -1)) return 'linux';
        if(!equals(navigator.appVersion.indexOf('Android'), -1)) return 'android';
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
        await _driver.open(onOpen);
    }

    function close() {
        _driver.close();
        xf.dispatch('ant:driver:closed');
    }

    async function onOpen() {
        await delay(1000);
        xf.dispatch('ant:driver:opened');
    }

    function onRx(data) {
        xf.dispatch('ant:driver:rx', data);
    }

    function onTx(data) {
        _driver.write(data);
    }

    return Object.freeze({
        init,
        open,
        close,
    });
}

const driver = Driver();

export { driver };

