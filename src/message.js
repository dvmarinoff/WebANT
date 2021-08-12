import { equals, exists, existance, isUndefined,
         dataviewToArray, nthBitToBool, xor } from './functions.js';
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
    const fixedLength   = 4;
    const contentLength = 1;
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
        view.setUint8( 1, contentLength, true);
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
        view.setUint8( 1, contentLength,   true);
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
        view.setUint8( 1, contentLength, true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, channelNumber, true);
        view.setUint16(4, channelPeriod, true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function SetChannelFrequency() {
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
        view.setUint8( 1, contentLength, true);
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
    const fixedLength   = 4;
    const contentLength = 1;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.resetSystem; // 74, 0x4A

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, contentLength, true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, 0,             true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function OpenChannel() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 1;
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
        view.setUint8( 1, contentLength, true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, channelNumber, true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function CloseChannel() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 1;
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
        view.setUint8( 1, contentLength, true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, channelNumber, true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function RequestMessage() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 2;
    const id            = ids.requestMessage; // 77, 0x4D

    const defaults = {
        channelNumber:      0,
        subMessageId:       false,
        requestedMessageId: 82, // channel status message id
    };

    function totalLength() {
        return fixedLength + contentLength;
    }

    function encode(args = {subMessageId: false}) {
        let buffer   = new ArrayBuffer(totalLength());
        let view     = new DataView(buffer);

        const channelNumber      = args.channelNumber      || defaults.channelNumber;
        const subMessageId       = args.subMessageId       || defaults.subMessageId;
        const requestedMessageId = args.requestedMessageId || defaults.requestedMessageId;

        const param = channelNumber;
        if(subMessageId) param = subMessageId;

        view.setUint8( 0, sync,               true);
        view.setUint8( 1, contentLength,      true);
        view.setUint8( 2, id,                 true);
        view.setUint8( 3, param,              true);
        view.setUint8( 4, requestedMessageId, true);

        view.setUint8(totalLength() - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function OpenRxScanMode() {
    const sync          = values.sync;
    const fixedLength   = 4;
    let contentLength   = 1;
    let totalLength     = fixedLength + contentLength;
    const id            = ids.openRxScanMode; // 91, 0x5B

    function ContentLength(syncPackets) {
        if(syncPackets) return  2;
        return 1;
    }
    function TotalLength(contentLength) {
        return fixedLength + contentLength;
    }
    function XorIndex() {
        return totalLength - 1;
    }

    function encode(args = {syncPackets: false}) {
        const syncPackets = args.syncPackets;
        contentLength  = ContentLength(syncPackets);
        totalLength    = TotalLength(contentLength);
        const xorIndex = XorIndex();

        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, contentLength, true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, 0,             true);

        if(syncPackets) {
            view.setUint8(4, syncPackets,   true);
        }

        view.setUint8(xorIndex, xor(view), true);

        return view;
    }
    return Object.freeze({ encode });
}

function Sleep() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 1;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.sleepMessage; // 197, 0xC5

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, contentLength, true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, 0,             true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function SearchTimeout() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 2;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.searchTimeout; // 68, 0x44

    const defaults = {
        channelNumber: 0,
        searchTimeout: 10, // 10 * 2.5 seconds = 25 seconds
    };

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const channelNumber = existance(args.channelNumber, defaults.channelNumber);
        const searchTimeout = existance(args.searchTimeout, defaults.searchTimeout);

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, contentLength, true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, channelNumber, true);
        view.setUint8( 4, searchTimeout, true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function LowPrioritySearchTimeout() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 2;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.searchLowTimeout; // 99, 0x63

    const defaults = {
        channelNumber: 0,
        searchTimeout: 2, // 2 * 2.5 seconds = 5 seconds, 255 is infinite
    };

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const channelNumber = existance(args.channelNumber, defaults.channelNumber);
        const searchTimeout = existance(args.searchTimeout, defaults.searchTimeout);

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, contentLength, true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, channelNumber, true);
        view.setUint8( 4, searchTimeout, true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function EnableExtRxMessages() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 2;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.enableExtRx; // 102, 0x66

    const defaults = {
        enable: 1, // 0 disable, 1 enable
    };

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const enable = existance(args.enable, defaults.enable);

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, contentLength, true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, 0,             true);
        view.setUint8( 4, enable,        true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function LibConfig() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 2;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.libConfig; // 110, 0x6E

    const defaults = {
        config: values.libConfig.disabled
    };

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const config = existance(args.config, defaults.config);

        view.setUint8(0, sync,          true);
        view.setUint8(1, contentLength, true);
        view.setUint8(2, id,            true);
        view.setUint8(3, 0,             true);
        view.setUint8(4, config,        true);

        view.setUint8(totalLength - 1, xor(view), true);

        return view;
    }

    return Object.freeze({ encode, values });
}

function Data(args) {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 9;
    const payloadLength = contentLength - 1;
    const id            = args.typeId;

    const payloadIndex      = 4;
    const extendedDataIndex = payloadIndex + (contentLength - 1);

    function TotalLength(extended) {
        let extendedDataLength = 0;
        if(exists(extended)) extendedDataLength = extended.byteLength;
        return fixedLength + contentLength + extendedDataLength;
    }

    function XorIndex(totalLength) {
        return totalLength - 1;
    }

    const defaults = {
        channelNumber: 0,
        payload:       new Uint8Array(new ArrayBuffer(payloadLength)),
    };

    function encode(args = {}) {
        const totalLength = TotalLength(args.extended);
        const xorIndex    = XorIndex(totalLength);

        const channelNumber = existance(args.channelNumber, defaults.channelNumber);
        const payload       = existance(args.payload,       defaults.payload);

        let buffer = new ArrayBuffer(totalLength);
        let view   = new DataView(buffer);
        let uint8  = new Uint8Array(buffer);

        view.setUint8(0, sync,          true);
        view.setUint8(1, contentLength, true);
        view.setUint8(2, id,            true);
        view.setUint8(3, channelNumber, true);

        uint8.set(new Uint8Array(payload.buffer), payloadIndex);

        if(exists(args.extended)) {
            uint8.set(new Uint8Array((args.extended).buffer), extendedDataIndex);
        }

        view.setUint8(xorIndex, xor(view), true);

        return view;
    }

    return Object.freeze({ encode, TotalLength });
}

function BroadcastData() {
    const id = ids.broadcastData; // 78, 0x4E
    return Data({typeId: id});
}

function AcknowledgedData() {
    const id = ids.acknowledgedData; // 79, 0x4F
    return Data({typeId: id});
}

function BurstTransferData() {

    function encode() {
        throw new Error('not implemented');
    }

    return Object.freeze({ encode });
}

function AdvancedBurstData() {

    function encode() {
        throw new Error('not implemented');
    }

    return Object.freeze({ encode });
}

function ChannelEvent() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 3;
    const id            = ids.channelEvent;

    const defaults = {
        channelNumber: 0,
    };

    function totalLength(args) {
        let length = fixedLength + contentLength;

        if(exists(args.encryptionId)) {
            length += 4;
        }
        if(exists(args.userInfoString)) {
            length += 19;
        }

        return length;
    }

    function encode(args) {
        let buffer     = new ArrayBuffer(totalLength(args));
        let view       = new DataView(buffer);
        let uint8      = new Uint8Array(buffer);
        const xorIndex = totalLength(args) - 1;

        const channelNumber = args.channelNumber || defaults.channelNumber;
        const eventCode     = args.eventCode;

        view.setUint8(0, sync,          true);
        view.setUint8(1, contentLength, true);
        view.setUint8(2, id,            true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, 1,             true);
        view.setUint8(5, eventCode,     true);

        if(exists(args.encryptionId)) {
            view.setUint32(6, args.encryptionId, true);
        }
        if(exists(args.userInfoString)) {
            uint8.set(args.userInfoString, 10);
        }

        view.setUint8(xorIndex, xor(view), true);

        return view;
    }

    return Object.freeze({ encode });
}

function ChannelResponse() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 3;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.channelResponse;

    const defaults = {
        channelNumber: 0,
    };

    function encode(args) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const channelNumber = args.channelNumber || defaults.channelNumber;
        const initMsgId     = existance(args.initMsgId);
        const responseCode  = existance(args.responseCode);

        view.setUint8(0, sync,          true);
        view.setUint8(1, contentLength, true);
        view.setUint8(2, id,            true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, initMsgId,     true);
        view.setUint8(5, responseCode,  true);
        view.setUint8(6, xor(view),     true);

        return view;
    }

    return Object.freeze({ encode });
}

function ChannelStatus() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 2;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.channelStatus;

    const defaults = {
        channelNumber: 0,
        channelState:  0,
        networkNumber: 0,
        channelType:   0,
    };

    const channelStates = {
        unassigned: 0,
        assigned:   1,
        searching:  2,
        tracking:   3,
    };

    function encodeChannelStatus(args) {
        let status = 0b00000000;

        status |= existance(args.channelState, defaults.channelState);
        status |= existance(args.networkNumber, defaults.networkNumber) << 2;
        status |= existance(args.channelType, defaults.channelType) << 4;

        return status;
    }

    function encode(args = {}) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const channelNumber = args.channelNumber || defaults.channelNumber;
        const status        = encodeChannelStatus(args);

        view.setUint8(0, sync,          true);
        view.setUint8(1, contentLength, true);
        view.setUint8(2, id,            true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, status,        true);
        view.setUint8(5, xor(view),     true);

        return view;
    }

    return Object.freeze({ encode });
}

function ChannelId() {
    return SetChannelId();
}

function Capabilities() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 8;
    const id            = ids.capabilities;

    function totalLength(args) {
        return fixedLength + contentLength;
    }

    const defaults = {
        maxChannels:  0,
        maxNetworks:  0,
        maxSensRcore: 0,
    };

    function encodeStandardOptions(args) {
        let options = 0b00000000;

        if(args.no_receive_channels)  options |= 0b00000001;
        if(args.no_transmit_channels) options |= 0b00000010;
        if(args.no_receive_messages)  options |= 0b00000100;
        if(args.no_transmit_messages) options |= 0b00001000;
        if(args.no_ackd_messages)     options |= 0b00010000;
        if(args.no_burst_messages)    options |= 0b00100000;

        return options;
    }

    function encodeAdvancedOptions(args) {
        let options = 0b00000000;

        if(args.network_enabled)              options |= 0b00000010;
        if(args.serial_number_enabled)        options |= 0b00001000;
        if(args.per_channel_tx_power_enabled) options |= 0b00010000;
        if(args.low_priority_search_enabled)  options |= 0b00100000;
        if(args.script_enabled)               options |= 0b01000000;
        if(args.search_list_enabled)          options |= 0b10000000;

        return options;
    }

    function encodeAdvancedOptions2(args) {
        let options = 0b00000000;

        if(args.led_enabled)         options |= 0b00000001;
        if(args.ext_message_enabled) options |= 0b00000010;
        if(args.scan_mode_enabled)   options |= 0b00000100;
        if(args.prox_search_enabled) options |= 0b00010000;
        if(args.ext_assign_enabled)  options |= 0b00100000;
        if(args.fs_antfs_enabled)    options |= 0b01000000;
        if(args.fit1_enabled)        options |= 0b10000000;

        return options;
    }

    function encodeAdvancedOptions3(args) {
        let options = 0b00000000;

        if(args.advanced_burst_enabled)         options |= 0b00000001;
        if(args.event_buffering_enabled)        options |= 0b00000010;
        if(args.event_filtering_enabled)        options |= 0b00000100;
        if(args.high_duty_search_enabled)       options |= 0b00001000;
        if(args.search_sharing_enabled)         options |= 0b00010000;
        if(args.selective_data_updates_enabled) options |= 0b01000000;
        if(args.encrypted_channel_enabled)      options |= 0b10000000;

        return options;
    }

    function encodeAdvancedOptions4(args) {
        let options = 0b00000000;

        if(args.capabilities_rfactive_notification_enabled) options |= 0b00000001;

        return options;
    }

    function encode(args = {}) {
        let buffer = new ArrayBuffer(totalLength(args));
        let view   = new DataView(buffer);

        const maxChannels  = existance(args.maxChannels, defaults.maxChannels);
        const maxNetworks  = existance(args.maxNetworks, defaults.maxNetworks);
        const standard     = encodeStandardOptions(args);
        const advanced     = encodeAdvancedOptions(args);
        const advanced2    = encodeAdvancedOptions2(args);
        const maxSensRcore = existance(args.maxSensRcore, defaults.maxSensRcore);
        const advanced3    = encodeAdvancedOptions3(args);
        const advanced4    = encodeAdvancedOptions4(args);

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, contentLength, true);
        view.setUint8( 2, id,            true);
        view.setUint8( 3, maxChannels,   true);
        view.setUint8( 4, maxNetworks,   true);
        view.setUint8( 5, standard,      true);
        view.setUint8( 6, advanced,      true);
        view.setUint8( 7, advanced2,     true);
        view.setUint8( 8, maxSensRcore,  true);
        view.setUint8( 9, advanced3,     true);
        view.setUint8(10, advanced4,     true);

        view.setUint8(11, xor(view),     true);

        return view;
    }
    return Object.freeze({
        encode,
        encodeStandardOptions,
        encodeAdvancedOptions,
        encodeAdvancedOptions2,
        encodeAdvancedOptions3,
        encodeAdvancedOptions4
    });
}

function SerialNumber() {
    const sync          = values.sync;
    const fixedLength   = 4;
    const contentLength = 4;
    const totalLength   = fixedLength + contentLength;
    const id            = ids.serialNumber;

    const defaults = {
        serialNumber: 0,
    };

    function encode(args) {
        let buffer   = new ArrayBuffer(totalLength);
        let view     = new DataView(buffer);

        const serialNumber = existance(args.serialNumber, defaults.serialNumber);

        view.setUint8( 0, sync,          true);
        view.setUint8( 1, contentLength, true);
        view.setUint8( 2, id,            true);
        view.setUint32(3, serialNumber,  true);
        view.setUint8( 7, xor(view),     true);

        return view;
    }

    return Object.freeze({ encode });
}

function deviceTypeToString(deviceType) {
    if(equals(deviceType, 120)) return 'Heart Rate';
    if(equals(deviceType, 17))  return 'Trainer';
    if(equals(deviceType, 11))  return 'Power Meter';
    if(equals(deviceType, 121)) return 'Speed and Cadence';
    return 'unsupported';
}


const message = {
    // config
    assignChannel:            AssignChannel(),
    unassignChannel:          UnassignChannel(),
    setChannelId:             SetChannelId(),
    setChannelPeriod:         SetChannelPeriod(),
    setChannelFrequency:      SetChannelFrequency(),
    setNetworkKey:            SetNetworkKey(),
    searchTimeout:            SearchTimeout(),
    enableExtRxMessages:      EnableExtRxMessages(),
    libConfig:                LibConfig(),
    lowPrioritySearchTimeout: LowPrioritySearchTimeout(),

    // control
    resetSystem:         ResetSystem(),
    openChannel:         OpenChannel(),
    closeChannel:        CloseChannel(),
    requestMessage:      RequestMessage(),
    openRxScanMode:      OpenRxScanMode(),
    sleep:               Sleep(),

    // data
    broadcastData:       BroadcastData(),
    acknowledgedData:    AcknowledgedData(),
    burstTransferData:   BurstTransferData(),
    advancedBurstData:   AdvancedBurstData(),

    // channel messages
    channelEvent:    ChannelEvent(),
    channelResponse: ChannelResponse(),

    // requested response messages
    channelStatus: ChannelStatus(),
    channelId:     ChannelId(),
    capabilities:  Capabilities(),
    serialNumber:  SerialNumber(),
};

const utils = {
    deviceTypeToString,
};

export { message, utils };
