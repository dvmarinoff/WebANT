//
// Web Serial
//
import { equals, exists, existance, empty, last, delay } from './functions.js';
import { serialPolyfill, SerialPort } from './web-serial-polyfill.js';

const values = {
    dynastreamId:       4047, // 0x0FCF
    ANT_USB_2_Stick_Id: 1008,
    ANT_USB_m_Stick_Id: 1009,
    baudRate:           115200,
};

function USBDriver() {
    throw new Error('not implemented!');
}

function SerialDriver() {
    throw new Error('not implemented!');
}

function SerialPolyfillDriver(args = {}) {
    const defaults = {
        filter:   [{ usbVendorId: values.dynastreamId }],
        baudRate: 115200,
        onData:  defaultOnData,
    };

    const onData = existance(args.onData, defaults.onData);

    let device;
    let port;
    let reader;
    let writer;
    let _reading = false;
    let _isOpen  = false;

    function isOpen() { return _isOpen; }
    function setIsOpen(value) { _isOpen = value; return _isOpen; }

    function isReading() { return _reading; }
    function setReading(value) { _reading = value; return _reading; }

    async function request() {
        // get known device or request a new one
        const device = await navigator.usb.requestDevice({filters: defaults.filter});
        const port = new SerialPort(device);
        return port;
    }

    async function open(cb) {
        console.log('open');
        port = await request();

        await port.open({baudRate: defaults.baudRate});

        setIsOpen(true);
        setReading(true);

        reader = port.readable.pipeThrough(
            new TransformStream(new MessageTransformer())
        ).getReader();

        writer = port.writable.getWriter();

        cb();
        read();
    }

    async function close() {
        setIsOpen(false);
        setReading(false);
        await reader.cancel();
        console.log(`ant driver closed`);
    }

    async function read() {
        console.log('read');
        while (port.readable && isReading()) {
            console.log('while');
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) { break; }
                    console.log('while while');
                    onData(value);
                }
                console.log('not while while');
            } catch (error) {
                console.error(`:serial :reader-error`, error);
            } finally {
                reader.releaseLock();
                console.log('finally');
            }
        }
        writer.releaseLock();
        await port.close();
        console.log('close');
    }

    function defaultOnData(data) {
        console.log(data);
    }

    async function write(dataview) {
        return await writer.write(dataview.buffer);
    }

    return Object.freeze({
        isOpen,
        isReading,
        request,
        open,
        close,
        read,
        write,
    });
}





// refactor
class MessageTransformer {
    constructor() {
        this.leftover = [];
        this.sync = 164;
    }
    transform(chunk, controller) {
        const self = this;
        let msgs = [];
        let achunk = Array.from(chunk);
        if(empty(this.leftover)) {
            msgs = self.toANTMsg(achunk, [], 0);
        } else {
            msgs = self.toANTMsg(achunk, this.leftover, 0, true);
        }

        let lastMsg = last(msgs);

        if(exists(lastMsg)) {
            if(self.isFullMsg(lastMsg)) {
                this.leftover = [];
            } else {
                this.leftover = [lastMsg];
                msgs.pop();
            }

            msgs.forEach(msg => controller.enqueue(msg));
        }
    }
    flush(controller) {
        const self = this;
        controller.enqueue(self.container);
    }
    readLength(msg) {
        const self = this;
        return msg[1];
    }
    isFullMsg(msg) {
        const self = this;
        if(msg === undefined) return false;
        if(msg.length > 1) {
            return msg.length === (self.readLength(msg) + 4);
        }
        return false;
    }
    toANTMsg(chunk, msgs = [], i = 0, leftover = false) {
        const self = this;
        if(i >= chunk.length) return msgs;
        if(chunk[i] === self.sync) {
            if(chunk[i+1] === undefined) {
                msgs.push([chunk[i]]);
                return self.toANTMsg(chunk, msgs, i+1);
            } else {
                let len = chunk[i+1] + 4;
                msgs.push(chunk.slice(i, i+len));
                i += len;
                return self.toANTMsg(chunk, msgs, i);
            }
        }
        if(leftover) {
            let nextSync = chunk.indexOf(self.sync);
            let len = nextSync > -1 ? nextSync : chunk.length;
            msgs[i] = msgs[i].concat(chunk.slice(i, len));
            return self.toANTMsg(chunk, msgs, i+len);
        }
        return self.toANTMsg(chunk, msgs, i+1);
    }
}
// end refactor

export { SerialDriver, SerialPolyfillDriver };

