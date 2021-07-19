import { equals, dataviewToArray, nthBitToBool, xor } from './functions.js';
import { ids, events, channelTypes, values, keys } from './constants.js';



// Config messages
function AssignChannel() {
    const sync             = values.sync;
    const fixedLength      = 4;
    const contentLength    = 3;
    const contentExtLength = 4;
    const id               = ids.assignChannel; // 66, 0x42

    const extendedAssignment = {
        backgroundScanningEnable:       0x01,
        frequencyAgilityEnable:         0x04,
        fastChannelInitiationEnable:    0x10,
        asynchronousTransmissionEnable: 0x20
    };

    const defaults = {
        channelNumber: 0,
        channelType:   channelTypes.slave.bidirectional,
        netNumber:     0,
        extended:      extendedAssignment.backgroundScanningEnable
    };

    function totalLength(isExtended) {
        let length = contentLength;
        if(isExtended) length = contentExtLength;
        return fixedLength + length;
    }

    function encode(args = {extended: false}) {
        let buffer   = new ArrayBuffer(totalLength(args.extended));
        let view     = new DataView(buffer);

        const channelNumber = args.channelNumber || defaults.channelNumber;
        const channelType   = args.channelType   || defaults.channelType;
        const netNumber     = args.netNumber     || defaults.netNumber;

        view.setUint8(0, sync,          true);
        view.setUint8(1, contentLength, true);
        view.setUint8(2, id,            true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, channelType,   true);
        view.setUint8(5, netNumber,     true);
        if(args.extended) {
            view.setUint8(6, args.extended, true);
        }

        view.setUint8(totalLength(args.extended) - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode, extendedAssignment });
}

function UnassignChannel() {
    const sync          = values.sync;
    const fixedLength   = 1;
    const contentLength = 3;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.unassignChannel; // 65, 0x41

    const defaults = {
        channelNumber: 0,
    };

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const channelNumber = args.channelNumber || defaults.channelNumber;

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, totalLength,   true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, channelNumber, true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function SetChannelId() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 5;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.setChannelId; // 81, 0x51

    const defaults = {
        channelNumber:   0,
        deviceNumber:    0,
        deviceType:      0,
        transmitionType: 0
    };

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const channelNumber   = args.channelNumber || defaults.channelNumber;
        const deviceNumber    = args.deviceNumber  || defaults.deviceNumber;
        const deviceType      = args.deviceType    || defaults.deviceType;
        const transmitionType = args.transType     || defaults.transType;
        view.setUint8( 0, sync,            true);
        view.setUint8( 1, totalLength,     true);
        view.setUint8( 2, id,              true);
        view.setUint8( 3, channelNumber,   true);
        view.setUint16(4, deviceNumber,    true);
        view.setUint8( 6, deviceType,      true);
        view.setUint8( 7, transmitionType, true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function SetChannelPeriod() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 3;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.channelPeriod; // 67, 0x43

    const defaults = {
        channelNumber: 0,
        channelPeriod: 8192, // (4Hz)
    };

    // The channel messaging period in seconds * 32768.
    // Maximum messaging period is ~2 seconds.

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const channelNumber = args.channelNumber || defaults.channelNumber;
        const channelPeriod = args.channelPeriod || defaults.channelPeriod;

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, totalLength,   true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, channelNumber, true);
        view.setUint16(4, channelPeriod, true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function ChannelFrequency() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 2;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.channelFrequency; // 69, 0x45

    const defaults = {
        channelNumber: 0,
        rfFrequency:   66,
    };

    // ChannelFrequency = 2400 MHz + ChannelRFFrequencyNumber * 1.0 MHz
    // most ANT devices ara between 2450 MHz and 2457 MHz

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const channelNumber = args.channelNumber || defaults.channelNumber;
        const rfFrequency   = args.rfFrequency   || defaults.rfFrequency;

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, totalLength,   true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, channelNumber, true);
        view.setUint8( 4, rfFrequency,   true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function SetNetworkKey() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 9;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.setNetworkKey; // 70, 0x46

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);
        let uint8    = new Uint8Array(buffer);

        const netKey    = args.netKey    || keys.public;
        const netNumber = args.netNumber || 0;

        view.setUint8(0, sync,          true);
        view.setUint8(1, contentLength, true);
        view.setUint8(2, id,            true);
        view.setUint8(3, netNumber,     true);

        uint8.set(new Uint8Array(netKey), 4);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    function decode(dataview) {
        const message   = 'SetNetworkKey';
        const netNumber = dataview.getUint8(3);
        const array     = dataviewToArray(dataview);
        const netKey    = array.slice(4, 8);

        return { message, netNumber, netKey };
    }

    return Object.freeze({ encode, decode });
}

// Control Messages
function ResetSystem() {
    const sync          = values.sync;
    const fixedLength   = 1;
    const contentLength = 3;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.resetSystem; // 74, 0x4A

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, totalLength,   true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, 0,             true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function OpenChannel() {
    const sync          = values.sync;
    const fixedLength   = 1;
    const contentLength = 3;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.openChannel; // 75, 0x4B

    const defaults = {
        channelNumber: 0,
    };

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const channelNumber = args.channelNumber || defaults.channelNumber;

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, totalLength,   true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, channelNumber, true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function CloseChannel() {
    const sync          = values.sync;
    const fixedLength   = 1;
    const contentLength = 3;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.closeChannel; // 76, 0x4C

    const defaults = {
        channelNumber: 0,
    };

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const channelNumber = args.channelNumber || defaults.channelNumber;

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, totalLength,   true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, channelNumber, true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function RequestMessage() {
    const sync          = values.sync;
    const fixedLength   = 1;
    const contentLength = 3;
    const id            = ids.requestMessage; // 77, 0x4D

    const defaults = {
        channelNumber:      0,
        subMessageId:       false,
        requestedMessageId: 0,
    };

    function totalLength() {
        return fixedLength + contentLength;
    }

    function encode(args = {subMessageId: false}) {
        let buffer   = new ArrayBuffer(totalLength());
        let view     = new DataView(buffer);

        const channelNumber      = args.channelNumber || defaults.channelNumber;
        const subMessageId       = args.channelNumber || defaults.channelNumber;
        const requestedMessageId = args.channelNumber || defaults.channelNumber;

        const param = channelNumber;
        if(subMessageId) param = subMessageId;

        view.setUint8( 0, sync,               true);
        view.setUint8( 1, totalLength,        true);
        view.setUint8( 2, id,                 true);
        view.setUint8( 3, param,              true);
        view.setUint8( 3, requestedMessageId, true);

        view.setUint8(totalLength() - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function OpenRxScanMode() {
    const sync          = values.sync;
    const fixedLength   = 1;
    const id            = ids.sleepMessage; // 197, 0xC5

    function totalLength(syncOnly) {
        let contentLength = 1;
        if(syncOnly) contentLength = 2;
        return fixedLength + contentLength;
    }

    function encode(args = {syncOnly: false}) {
        let buffer   = new ArrayBuffer(totalLength(args.syncOnly));
        let view     = new DataView(buffer);

        const syncOnly = args.syncOnly;

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, totalLength,   true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, 0,             true);

        if(args.syncOnly) {
            view.setUint8(4, syncOnly,   true);
        }

        view.setUint8(totalLength() - 1, xor(view), true);

        return view;
    }
    return Object.freeze({ encode });
}

function Sleep() {
    const sync          = values.sync;
    const fixedLength   = 1;
    const contentLength = 3;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.sleepMessage; // 197, 0xC5

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, totalLength,   true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, 0,             true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}





function SearchTimeout(args) {
    let buffer   = new ArrayBuffer(6);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 2;
    const id     = 68;  // 0x44
    const channelNumber = args.channelNumber || 0;
    const timeout       = args.timeout; // 12 * 2.5 = 30s, 255 is infinite

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, timeout,       true);
    view.setUint8(5, xor(view),     true);

    return view;
}

function LowPrioritySearchTimeout(args) {
    let buffer   = new ArrayBuffer(6);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 2;
    const id     = 99;  // 0x63
    const channelNumber = args.channelNumber || 0;
    const timeout       = args.timeoutLow    || 2; // 2 * 2.5 = 5s, 255 is infinite

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, timeout,       true);
    view.setUint8(5, xor(view),     true);

    return view;
}

function EnableExtRxMessages(args) {
    let buffer   = new ArrayBuffer(6);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 2;
    const id     = 102; // 0x66

    view.setUint8(0, sync,        true);
    view.setUint8(1, length,      true);
    view.setUint8(2, id,          true);
    view.setUint8(3, 0,           true);
    view.setUint8(4, args.enable, true);
    view.setUint8(5, xor(view),   true);

    return view;
}

function CommonPage70(pageNumber) {
    let buffer          = new ArrayBuffer(8);
    let view            = new DataView(buffer);
    const commandId     = 70; // 0x46, Data Page Request
    const transResponse = 2;  // 0b00000010
    const commandType   = 1;

    view.setUint8(0, commandId,     true);
    view.setUint8(1, 255,           true);
    view.setUint8(2, 255,           true);
    view.setUint8(3, 255,           true);
    view.setUint8(4, 255,           true);
    view.setUint8(5, transResponse, true);
    view.setUint8(6, pageNumber,    true);
    view.setUint8(7, commandType,   true);

    return view;
}

function RequestDataPage(pageNumber, channel) {
    return Control(CommonPage70(pageNumber), channel);
}
function targetPower(power, channel = 5) {
    return Control(page.dataPage49(power), channel);
}
function targetResistance(level, channel = 5) {
    return Control(page.dataPage48(level), channel);
}
function targetSlope(slope, channel = 5) {
    return Control(page.dataPage51(slope), channel);
}

function Control(content, channel = 5) {
    const sync   = 164;
    const length = 9;
    const type   = 79; // Acknowledged 0x4F
    let buffer   = new ArrayBuffer(13);
    let view     = new DataView(buffer);
    view.setUint8(0, sync,    true);
    view.setUint8(1, length,  true);
    view.setUint8(2, type,    true);
    view.setUint8(3, channel, true);

    let j = 4;
    for(let i = 0; i < 8; i++) {
        view.setUint8(j, content.getUint8(i), true);
        j++;
    }

    const crc = xor(view);
    view.setUint8(12, crc, true);

    return view;
}
function Data(dataview) {
    const sync     = dataview.getUint8(0);
    const length   = dataview.getUint8(1);
    const type     = dataview.getUint8(2);
    const channel  = dataview.getUint8(3);
    const dataPage = dataview.getUint8(4);

    if(dataPage === 25) {
        return page.dataPage25(dataview);
    }
    if(dataPage === 16) {
        return page.dataPage16(dataview);
    }
    return { page: 0 };
}

// Decode
function readExtendedData(data) {
    const length        = data[1];
    const id            = data[2];
    const channelNumber = data[3];
    const flag          = data[12];
    const deviceNumber  = (data[14] << 8) + (data[13]);
    const deviceType    = data[15];
    const transType     = data[16];
    return { deviceNumber, deviceType, transType };
}

function readChannelStatus(data) {
    const id             = 82; // 0x52
    const channelNumber  = data[3];
    const status         = data[4] & 0b00000011; // just bits 0 and 1
    let res              = 'unknown';
    if(status === 0) res = 'unassigned';
    if(status === 1) res = 'assigned';
    if(status === 2) res = 'searching';
    if(status === 3) res = 'tracking';
    return res;
}

function readChannelId(data) {
    const id            = 81; // 0x51
    const channelNumber = data[3];
    const deviceNumber  = (data[5] << 8) + data[4];
    const deviceType    = data[6];
    const transType     = data[7];
    return { channelNumber, deviceNumber, deviceType, transType };
}

function readANTVersion(data) {
    const id      = 62; // 0x3E
    const version = arrayToString(data.slice(3));
    return { version };
}

function readSerialNumber(data) {
    const id = 97; // 0x61
    const sn = data.slice(3);
    return { sn };
}

function readCapabilities(data) {
    const id               = 84; // 0x54
    const maxAntChannels   = data[3];
    const maxNetworks      = data[4];
    const standardOptions  = data[5];
    const advancedOptions  = data[6];
    const advancedOptions2 = data[7];
    const maxSensRcore     = data[8];
    const advancedOptions3 = data[9];
    const advancedOptions4 = data[10];
    return { maxAntChannels,
             maxNetworks,
             standardOptions,
             advancedOptions,
             advancedOptions2,
             maxSensRcore,
             advancedOptions3,
             advancedOptions4};
}

function readSync(msg) {
    return msg[0];
}
function readLength(msg) {
    return msg[1];
}
function readId(msg) {
    return msg[2];
}
function readChannel(msg) {
    return msg[3];
}

function isValidEventCode(code) {
    return Object.values(events).includes(code);
}
function eventCodeToString(code) {
    if(!isValidEventCode(code)) {
        return `invalid event code`;
    }
    const prop = Object.entries(events)
          .filter(e => e[1] === code)[0][0];
    const str  = prop.split('_').join(' ');
    return `${str}`;
}

function isValidId(id) {
    return Object.values(ids).includes(id);
}
function idToString(id) {
    if(!isValidId(id)) {
        return `invalid message id`;
    }
    const prop = Object.entries(ids).filter(e => e[1] === id)[0][0];
    const str  = prop.split('_').join(' ');
    return `${str}`;
}

function readResponse(msg) {
    // response to write
    const channel = readChannel(msg);
    const id      = readId(msg);
    const toId    = msg[4];
    const code    = msg[5];
    return { channel, id, toId, code };
}
function readEvent(msg) {
    const channel = readChannel(msg);
    const code    = msg[5];
    return { channel, code };
}


function isResponse(msg) {
    return readId(msg) === ids.channelResponse;
}
function isRequestedResponse(msg) {
    return [ids.channelId,
            ids.channelStatus,
            ids.ANTVersion,
            ids.capabilities,
            ids.serialNumber
           ].includes(readId(msg));
}
function isBroadcast(msg) {
    return readId(msg) === ids.broascastData;
}
function isBroadcastExt(msg) {
    return readId(msg) === ids.broascastExtData;
}
function isAcknowledged(msg) {
    return readId(msg) === ids.acknowledgedData;
}
function isBurst(msg) {
    return readId(msg) === ids.burstData;
}
function isBurstAdv(msg) {
    return readId(msg) === ids.burstAdvData;
}
function isEvent(msg) {
    return readId(msg) === ids.channelEvent;
}
function isSerialError(msg) {
    return readId(msg) === ids.serialError;
}
function isChannelId(msg) {
    return ids.channelId === readId(msg);
}
function isChannelStatus(msg) {
    return ids.channelStatus === readId(msg);
}
function isANTVersion(msg) {
    return ids.ANTVersion === readId(msg);
}
function isCapabilities(msg) {
    return ids.capabilities === readId(msg);
}
function isSerialNumber(msg) {
    return ids.serialNumber === readId(msg);
}

function startsWithSync(msg) {
    return readSync(msg) === 0xA4;
}
function isFullMsg(msg) {
    if(msg === undefined) return false;
    if(msg.length > 1) {
        return msg.length === (readLength(msg) + 4);
    }
    return false;
}

function isValid(data) {
    if(!startsWithSync(data)) return false;
    if(!isFullMsg(data))      return false;
    return true;
}

function deviceTypeToString(deviceType) {
    if(equals(deviceType, 120)) return 'Heart Rate';
    if(equals(deviceType, 17))  return 'Trainer';
    if(equals(deviceType, 11))  return 'Power Meter';
    if(equals(deviceType, 121)) return 'Speed and Cadence';
    return 'unsupported';
}


const message = {
    setNetworkKey:    SetNetworkKey(),
    assignChannel:    AssignChannel(),
    setChannelId:     SetChannelId(),
    channelFrequency: ChannelFrequency(),
};

const utils = {
    deviceTypeToString,
};

export { message, utils };
