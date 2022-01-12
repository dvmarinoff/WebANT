import { equals, dataviewToArray, nthBitToBool, xor } from '../src/functions.js';
import { ids, events, channelTypes, values, keys } from '../src/constants.js';
import { message, Message } from '../src/message.js';
import { DataPage } from '../src/common.js';
import { fec } from '../src/fec.js';

global.console = {
    log: jest.fn(),
    error: console.error,
    warn: console.warn,
};

describe('Message', () => {

    describe('fixed content length', () => {
        const msg = Message({
            contentLength: 3,
            id: 'assignChannel',
        });
        test('sync', () => {
            expect(msg.sync).toEqual(164);
        });

        test('id', () => {
            expect(msg.id).toEqual(66);
        });

        test('getLength()', () => {
            expect(msg.getLength()).toEqual(7);
        });

        test('calcLength()', () => {
            expect(msg.calcLength(3)).toEqual(7);
        });

        test('getContentLength()', () => {
            expect(msg.getContentLength()).toEqual(3);
        });
    });


    describe('variable content length', () => {
        const msg = Message({
            id: 'assignChannel',
        });

        function contentLength(isExtended) {
            if(isExtended) return 4;
            return 3;
        }

        test('setLengths()', () => {
            expect(msg.setLengths(contentLength(true))).toEqual({length: 8, contentLength: 4});
        });

        test('getContentLength()', () => {
            expect(msg.getContentLength()).toEqual(4);
        });

        test('getLength()', () => {
            expect(msg.getLength()).toEqual(8);
        });
    });
});

describe('Assaign Channel', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.assignChannel.encode();
            expect(dataviewToArray(msg)).toEqual([164, 3, 66, 0, 0, 0, 229]);
        });

        test('sets channel number', () => {
            let msg = message.assignChannel.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 3, 66, 1, 0, 0, 228]);
        });

        test('sets channel type', () => {
            let msg = message.assignChannel.encode({channelType: channelTypes.slave.receiveOnly});
            expect(dataviewToArray(msg)).toEqual([164, 3, 66, 0, 64, 0, 165]);
        });

        test('sets network number', () => {
            let msg = message.assignChannel.encode({networkNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 3, 66, 0, 0, 1, 228]);
        });

        test('extended assignment', () => {
            let msg = message.assignChannel.encode({extended: 0x10});
            expect(dataviewToArray(msg)).toEqual([164, 4, 66, 0, 0, 0, 16, 242]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.assignChannel.encode();
            const res  = message.assignChannel.decode(view);
            expect(res).toEqual({
                id: 66,
                channelNumber: 0,
                channeType: 0,
                networkNumber: 0,
                valid: true,
            });
        });

        test('extended', () => {
            const view = message.assignChannel.encode({extended: 0x10});
            const res  = message.assignChannel.decode(view);
            expect(res).toEqual({
                id: 66,
                channelNumber: 0,
                channeType: 0,
                networkNumber: 0,
                extended: 16,
                valid: true,
            });
        });
    });
});

describe('UnassaignChannel', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.unassignChannel.encode();
            expect(dataviewToArray(msg)).toEqual([164, 1, 65, 0, 228]);
        });

        test('sets channel number', () => {
            let msg = message.unassignChannel.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 1, 65, 1, 229]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.unassignChannel.encode();
            const res  = message.unassignChannel.decode(view);
            expect(res).toEqual({
                id: 65,
                channelNumber: 0,
                valid: true,
            });
        });

        test('channel 1', () => {
            const view = message.unassignChannel.encode({channelNumber: 1});
            const res  = message.unassignChannel.decode(view);
            expect(res).toEqual({
                id: 65,
                channelNumber: 1,
                valid: true,
            });
        });
    });
});

describe('SetChannelId', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.setChannelId.encode();
            expect(dataviewToArray(msg)).toEqual([164, 5, 81, 0, 0,0, 0, 0, 240]);
        });

        test('sets channel number', () => {
            let msg = message.setChannelId.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 5, 81, 1, 0,0, 0, 0, 241]);
        });

        test('sets device id', () => {
            let msg = message.setChannelId.encode({deviceNumber: 123});
            expect(dataviewToArray(msg)).toEqual([164, 5, 81, 0, 123,0, 0, 0, 139]);
        });

        test('sets device type', () => {
            let msg = message.setChannelId.encode({deviceType: 120});
            expect(dataviewToArray(msg)).toEqual([164, 5, 81, 0, 0,0, 120, 0, 136]);
        });

        test('sets transmission type', () => {
            let msg = message.setChannelId.encode({transmissionType: 0x10});
            expect(dataviewToArray(msg)).toEqual([164, 5, 81, 0, 0,0, 0, 16, 224]);
        });
    });

    describe('decode', () => {
        test('default message', () => {
            const view = message.setChannelId.encode();
            const res  = message.setChannelId.decode(view);
            expect(res).toEqual({
                id: 81,
                channelNumber: 0,
                deviceNumber: 0,
                deviceType: 0,
                transmissionType: 0,
                valid: true,
            });
        });

        test('set all params', () => {
            const view = message.setChannelId.encode({
                channelNumber: 1,
                deviceNumber: 123,
                deviceType: 120,
                transmissionType: 0x10,
            });
            const res = message.setChannelId.decode(view);
            expect(res).toEqual({
                id: 81,
                channelNumber: 1,
                deviceNumber: 123,
                deviceType: 120,
                transmissionType: 16,
                valid: true,
            });
        });
    });
});

describe('SetChannelPeriod', () => {

    describe('encode', () => {
        test('default', () => {
            let msg = message.setChannelPeriod.encode();
            expect(dataviewToArray(msg)).toEqual([164, 3, 67, 0, 0,32, 196]);
        });

        test('sets channel number', () => {
            let msg = message.setChannelPeriod.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 3, 67, 1, 0,32, 197]);
        });

        test('sets channel period', () => {
            let msg = message.setChannelPeriod.encode({channelPeriod: 16384});
            expect(dataviewToArray(msg)).toEqual([164, 3, 67, 0, 0,64, 164]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.setChannelPeriod.encode();
            const res  = message.setChannelPeriod.decode(view);
            expect(res).toEqual({
                id: 67,
                channelNumber: 0,
                channelPeriod: 8192,
                valid: true,
            });
        });
    });
});

describe('SetChannelFrequency', () => {

    describe('encode', () => {
        test('default', () => {
            let msg = message.setChannelFrequency.encode();
            expect(dataviewToArray(msg)).toEqual([164, 2, 69, 0, 66, 161]);
        });

        test('sets channel number', () => {
            let msg = message.setChannelFrequency.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 2, 69, 1, 66, 160]);
        });

        test('sets RF Frequency', () => {
            let msg = message.setChannelFrequency.encode({rfFrequency: 57});
            expect(dataviewToArray(msg)).toEqual([164, 2, 69, 0, 57, 218]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.setChannelFrequency.encode();
            const res  = message.setChannelFrequency.decode(view);
            expect(res).toEqual({
                id: 69,
                channelNumber: 0,
                rfFrequency: 66,
                valid: true,
            });
        });
    });
});

describe('SetNetworkKey', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.setNetworkKey.encode();
            expect(dataviewToArray(msg)).toEqual([164, 9, 70, 0,  232,228,33,59,85,122,103,193,  116]);
        });

        test('sets ant plus network key message', () => {
            let msg = message.setNetworkKey.encode({networkKey: keys.antPlus});
            expect(dataviewToArray(msg)).toEqual([164, 9, 70, 0,  185,165,33,251,189,114,195,69,  100]);
        });

        test('sets network number', () => {
            let msg = message.setNetworkKey.encode({networkNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 9, 70, 1,  232,228,33,59,85,122,103,193,  117]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.setNetworkKey.encode();
            const res  = message.setNetworkKey.decode(view);
            expect(res).toEqual({
                id: 70,
                networkNumber: 0,
                networkKey: keys.public,
                valid: true,
            });
        });
    });
});

describe('ResetSystem', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.resetSystem.encode();
            expect(dataviewToArray(msg)).toEqual([164, 1, 74, 0, 239]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.resetSystem.encode();
            const res  = message.resetSystem.decode(view);
            expect(res).toEqual({
                id: 74,
                valid: true,
            });
        });
    });
});

describe('OpenChannel', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.openChannel.encode();
            expect(dataviewToArray(msg)).toEqual([164, 1, 75, 0, 238]);
        });

        test('sets channel', () => {
            let msg = message.openChannel.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 1, 75, 1, 239]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.openChannel.encode();
            const res  = message.openChannel.decode(view);
            expect(res).toEqual({
                id: 75,
                channelNumber: 0,
                valid: true,
            });
        });
    });
});

describe('CloseChannel', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.closeChannel.encode();
            expect(dataviewToArray(msg)).toEqual([164, 1, 76, 0, 233]);
        });

        test('sets channel', () => {
            let msg = message.closeChannel.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 1, 76, 1, 232]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.closeChannel.encode();
            const res  = message.closeChannel.decode(view);
            expect(res).toEqual({
                id: 76,
                channelNumber: 0,
                valid: true,
            });
        });
    });
});

describe('RequestMessage', () => {
    // requestable are:
    // channelStatus, channelID, ANTversion, capabilities, eventBufferConfiguration,
    // advancedBurstCapabilities, advancedBurstConfiguration, eventFilter,
    // SDUMaskSetting, userNVM, encryptionModeParameters.

    describe('encode', () => {
        test('default message is requests channel status of channel 0', () => {
            let msg = message.requestMessage.encode();
            expect(dataviewToArray(msg)).toEqual([164, 2, 77, 0, 82, 185]);
        });

        test('sets channel number', () => {
            let msg = message.requestMessage.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 2, 77, 1, 82, 184]);
        });

        test('sets requested message id', () => {
            let msg = message.requestMessage.encode({requestedMessageId: ids.channelId});
            expect(dataviewToArray(msg)).toEqual([164, 2, 77, 0, 81, 186]);
        });

        // the sub message param in 9.5.4.4 is a mistery to me
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.requestMessage.encode();
            const res  = message.requestMessage.decode(view);
            expect(res).toEqual({
                id: 77,
                param: 0,
                requestedMessageId: 82,
                valid: true,
            });
        });
    });
});

describe('OpenRxScanMode', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.openRxScanMode.encode();
            expect(dataviewToArray(msg)).toEqual([164, 1, 91, 0, 254]);
        });

        test('sets sync packets to 1', () => {
            let msg = message.openRxScanMode.encode({syncPackets: 1});
            expect(dataviewToArray(msg)).toEqual([164, 2, 91, 0, 1, 252]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.openRxScanMode.encode();
            const res  = message.openRxScanMode.decode(view);
            expect(res).toEqual({
                id: 91,
                valid: true,
            });
        });

        test('syncPackets 0', () => {
            const view = message.openRxScanMode.encode({syncPackets: 0});
            const res  = message.openRxScanMode.decode(view);
            expect(res).toEqual({
                id: 91,
                syncPackets: 0,
                valid: true,
            });
        });

        test('syncPackets 1', () => {
            const view = message.openRxScanMode.encode({syncPackets: 1});
            const res  = message.openRxScanMode.decode(view);
            expect(res).toEqual({
                id: 91,
                syncPackets: 1,
                valid: true,
            });
        });
    });
});

describe('Sleep', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.sleep.encode();
            expect(dataviewToArray(msg)).toEqual([164, 1, 197, 0, 96]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.sleep.encode();
            const res  = message.sleep.decode(view);
            expect(res).toEqual({
                id: 197,
                valid: true,
            });
        });
    });
});

describe('SearchTimeout', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.searchTimeout.encode();
            expect(dataviewToArray(msg)).toEqual([164, 2, 68, 0, 10, 232]);
        });

        test('sets channel', () => {
            let msg = message.searchTimeout.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 2, 68, 1, 10, 233]);
        });

        test('sets search timeout', () => {
            let msg = message.searchTimeout.encode({searchTimeout: 12});
            expect(dataviewToArray(msg)).toEqual([164, 2, 68, 0, 12, 238]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.searchTimeout.encode();
            const res  = message.searchTimeout.decode(view);
            expect(res).toEqual({
                id: 68,
                channelNumber: 0,
                searchTimeout: 10,
                valid: true,
            });
        });

        test('channel 1, timeout 24 (60 seconds)', () => {
            const msg = message.searchTimeout.encode({
                channelNumber: 1,
                searchTimeout: 24
            });
            const res = message.searchTimeout.decode(msg);
            expect(res).toEqual({
                id: 68,
                channelNumber: 1,
                searchTimeout: 24,
                valid: true,
            });
        });
    });
});

describe('LowPrioritySearchTimeout', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.lowPrioritySearchTimeout.encode();
            expect(dataviewToArray(msg)).toEqual([164, 2, 99, 0, 2, 199]);
        });

        test('sets channel', () => {
            let msg = message.lowPrioritySearchTimeout.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 2, 99, 1, 2, 198]);
        });

        test('sets search timeout', () => {
            let msg = message.lowPrioritySearchTimeout.encode({searchTimeout: 12});
            expect(dataviewToArray(msg)).toEqual([164, 2, 99, 0, 12, 201]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = message.lowPrioritySearchTimeout.encode();
            const res  = message.lowPrioritySearchTimeout.decode(view);
            expect(res).toEqual({
                id: 99,
                channelNumber: 0,
                searchTimeout: 2,
                valid: true,
            });
        });

        test('channel 1, timeout 24 (60 seconds)', () => {
            const view = message.lowPrioritySearchTimeout.encode({
                channelNumber: 1,
                searchTimeout: 24
            });
            const res = message.lowPrioritySearchTimeout.decode(view);
            expect(res).toEqual({
                id: 99,
                channelNumber: 1,
                searchTimeout: 24,
                valid: true,
            });
        });
    });
});

describe('EnableExtendedRxMessages', () => {

    describe('encode', () => {
        test('default message (enable)', () => {
            let msg = message.enableExtRxMessages.encode();
            expect(dataviewToArray(msg)).toEqual([164, 2, 102, 0, 1, 193]);
        });

        test('sets disable', () => {
            let msg = message.enableExtRxMessages.encode({enable: 0});
            expect(dataviewToArray(msg)).toEqual([164, 2, 102, 0, 0, 192]);
        });
    });

    describe('decode', () => {
        test('default (enable)', () => {
            const view = message.enableExtRxMessages.encode();
            const res  = message.enableExtRxMessages.decode(view);
            expect(res).toEqual({
                id: 102,
                channelNumber: 0,
                enable: 1,
                valid: true,
            });
        });

        test('disable', () => {
            const view = message.enableExtRxMessages.encode({enable: 0});
            const res  = message.enableExtRxMessages.decode(view);
            expect(res).toEqual({
                id: 102,
                channelNumber: 0,
                enable: 0,
                valid: true,
            });
        });
    });
});

describe('LibConfig', () => {

    describe('encode', () => {
        test('default message (disable)', () => {
            let msg = message.libConfig.encode();
            expect(dataviewToArray(msg)).toEqual([164, 2, 110, 0, 0, 200]);
        });

        test('enable channel id', () => {
            let msg = message.libConfig.encode({config: values.libConfig.channelId});
            expect(dataviewToArray(msg)).toEqual([164, 2, 110, 0, 128, 72]);
        });

        test('enable rssi', () => {
            let msg = message.libConfig.encode({config: values.libConfig.rssi});
            expect(dataviewToArray(msg)).toEqual([164, 2, 110, 0, 64, 136]);
        });

        test('enable rx timestamps', () => {
            let msg = message.libConfig.encode({config: values.libConfig.rxTimestamps});
            expect(dataviewToArray(msg)).toEqual([164, 2, 110, 0, 32, 232]);
        });

        test('enable channel id, rssi, rx timestamps (all posible values)', () => {
            const enableAll = (values.libConfig.channelId + values.libConfig.rssi + values.libConfig.rxTimestamps);

            let msg = message.libConfig.encode({config: enableAll});

            expect(dataviewToArray(msg)).toEqual([164, 2, 110, 0, 224, 40]);
        });
    });

    describe('decode', () => {
        test('default (disabled)', () => {
            const view = message.libConfig.encode();
            const res  = message.libConfig.decode(view);
            expect(res).toEqual({
                id: 110,
                config: values.libConfig.disabled,
                valid: true,
            });
        });

        test('Enables Rx Timestamp Output', () => {
            const view = message.libConfig.encode({config: values.libConfig.rxTimestamps});
            const res  = message.libConfig.decode(view);
            expect(res).toEqual({
                id: 110,
                config: values.libConfig.rxTimestamps,
                valid: true,
            });
        });
    });
});

describe('AcknowledgedData', () => {

    // describe('Total Length', () => {
    //     let extendedInfo = new DataView(new Uint8Array([128, 139,182, 17, 16]).buffer);
    //     expect(message.acknowledgedData.TotalLength()).toBe(13);
    //     expect(message.acknowledgedData.TotalLength(undefined)).toBe(13);
    //     expect(message.acknowledgedData.TotalLength(null)).toBe(13);
    //     expect(message.acknowledgedData.TotalLength(extendedInfo)).toBe(18);
    // });

    describe('encode', () => {
        test('default message', () => {
            const view = message.acknowledgedData.encode();
            expect(dataviewToArray(view)).toEqual([164, 9, 79, 0,  0,0,0,0, 0,0,0,0,  226]);
        });

        test('sets channel', () => {
            const view = message.acknowledgedData.encode({channelNumber: 1});
            expect(dataviewToArray(view)).toEqual([164, 9, 79, 1,  0,0,0,0, 0,0,0,0,  227]);
        });

        test('sets payload', () => {
            const dataPage49 = new DataView(new Uint8Array([49, 255,255,255,255,255, 75,0]).buffer);

            let msg = message.acknowledgedData.encode({payload: dataPage49});
            expect(dataviewToArray(msg)).toEqual([164, 9, 79, 0,  49, 255,255,255,255,255, 75,0,  103]);
        });

        test('sets extended data (Channel Id)', () => {
            const dataPage16 = new DataView(new Uint8Array([16, 25, 4, 0,  0,0,  255, 0b00110100]).buffer);
            const extendedData = new DataView(new Uint8Array([128, 139,182, 17, 16]).buffer);

            let msg = message.acknowledgedData.encode({payload: dataPage16, extended: extendedData});
            expect(dataviewToArray(msg)).toEqual([164, 14, 79, 0,  16, 25, 4, 0, 0,0, 255, 52,  128, 139,182, 17, 16,  159]);
        });

        test('sets extended data (Channel Id + RSSI + Rx Timestamp)', () => {
            let dataPage16 = new DataView(new Uint8Array([16, 25, 4, 0,  0,0,  255, 0b00110100]).buffer);
            let extendedData = new DataView(new Uint8Array([224, 139,182, 17, 16,  32, 156,255, 128,  0, 128]).buffer);

            let msg = message.acknowledgedData.encode({payload: dataPage16, extended: extendedData});
            expect(dataviewToArray(msg)).toEqual([164, 20, 79, 0, 16, 25, 4, 0, 0,0, 255, 52,
                                                  224, 139,182, 17, 16,
                                                  32,  156,255, 128,
                                                  0, 128,
                                                  166]);
        });
    });

});

describe('ChannelEvent', () => {

    describe('encode', () => {
        test('on channel 1 response no error', () => {
            let msg = message.channelEvent.encode({channelNumber: 1, eventCode: 0});
            expect(dataviewToArray(msg)).toEqual([164, 3, 64, 1, 1, 0, 231]);
        });
    });

    describe('decode', () => {
        test('on channel 1 response no error', () => {
            const view = message.channelEvent.encode({
                channelNumber: 1,
                eventCode: 0
            });
            const res = message.channelEvent.decode(view);
            expect(res).toEqual({
                id: 64,
                channelNumber: 1,
                eventCode: 0,
                valid: true,
            });
        });

        test('on channel 1 event rx fail', () => {
            const view = message.channelEvent.encode({
                channelNumber: 1,
                eventCode: 2
            });
            const res = message.channelEvent.decode(view);
            expect(res).toEqual({
                id: 64,
                channelNumber: 1,
                eventCode: 2,
                valid: true,
            });
        });
    });
});

describe('Channel Response Message', () => {

    describe('encode', () => {
        test('on channel 1 for message id 82 response no error', () => {
            const msg = message.channelResponse.encode({
                channelNumber: 1,
                initMsgId: 82,
                responseCode: 0
            });
            expect(dataviewToArray(msg)).toEqual([164, 3, 64, 1, 82, 0, 180]);
        });
    });

    describe('decode', () => {
        test('on channel 1 for message id 82 response no error', () => {
            const view = message.channelResponse.encode({
                channelNumber: 1,
                initMsgId: 82,
                responseCode: 0
            });
            const res = message.channelResponse.decode(view);
            expect(res).toEqual({
                id: 64,
                channelNumber: 1,
                initMsgId: 82,
                responseCode: 0,
                valid: true,
            });
        });
    });
});

describe('Channel Status Message', () => {

    describe('encode', () => {
        test('default message (unassigned)', () => {
            let msg = message.channelStatus.encode();
            expect(dataviewToArray(msg)).toEqual([164, 2, 82, 0, 0, 244]);
        });

        test('sets channel number', () => {
            let msg = message.channelStatus.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 2, 82, 1, 0, 245]);
        });

        test('sets channel state (assigned)', () => {
            let msg = message.channelStatus.encode({channelState: 1});
            expect(dataviewToArray(msg)).toEqual([164, 2, 82, 0, 1, 245]);
        });

        test('sets channel state and network number', () => {
            let msg = message.channelStatus.encode({channelState: 2, networkNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 2, 82, 0, 6, 242]);
        });

        test('channel: assigned, number 1,', () => {
            let msg = message.channelStatus.encode({channelNumber: 1, channelState: 1});
            expect(dataviewToArray(msg)).toEqual([164, 2, 82, 1, 1, 244]);
        });

        test('channel: searching, number 0,', () => {
            let msg = message.channelStatus.encode({channelNumber: 0, channelState: 2});
            expect(dataviewToArray(msg)).toEqual([164, 2, 82, 0, 2, 246]);
        });

        test('channel: tracking, number 0,', () => {
            let msg = message.channelStatus.encode({channelNumber: 0, channelState: 3});
            expect(dataviewToArray(msg)).toEqual([164, 2, 82, 0, 3, 247]);
        });
    });

    describe('decode', () => {
        test('default - unassigned', () => {
            const view = message.channelStatus.encode();
            const res  = message.channelStatus.decode(view);
            expect(res).toEqual({
                id: 82,
                channelNumber: 0,
                status: 0,
                valid: true,
            });
        });
    });
});

describe('Capabilities', () => {

    describe('encode options', () => {
        test('encode standard options', () => {
            expect(message.capabilities.encodeStandardOptions({
                no_receive_channels:  false,
                no_transmit_channels: false,
                no_receive_messages:  false,
                no_transmit_messages: false,
                no_ackd_messages:     false,
                no_burst_messages:    true,
                // ...
            })).toBe(0b00100000);

            expect(message.capabilities.encodeStandardOptions({
                no_receive_channels:  false,
                no_transmit_channels: true,
                no_receive_messages:  false,
                no_transmit_messages: true,
                no_ackd_messages:     true,
                no_burst_messages:    true,
                // ...
            })).toBe(0b00111010);
        });
    });

    const capabilities = {
        // Standart Options
        no_receive_channels:  false,
        no_transmit_channels: false,
        no_receive_messages:  false,
        no_transmit_messages: false,
        no_ackd_messages:     false,
        no_burst_messages:    false,
        // Advanced Options
        network_enabled:              false,
        serial_number_enabled:        false,
        per_channel_tx_power_enabled: false,
        low_priority_search_enabled:  false,
        script_enabled:               false,
        search_list_enabled:          false,
        // Advanced Options 2
        led_enabled:         false,
        ext_message_enabled: false,
        scan_mode_enabled:   false,
        prox_search_enabled: false,
        ext_assign_enabled:  false,
        fs_antfs_enabled:    false,
        fit1_enabled:        false,
        // Advanced Options 3
        advanced_burst_enabled:         false,
        event_buffering_enabled:        false,
        event_filtering_enabled:        false,
        high_duty_search_enabled:       false,
        search_sharing_enabled:         false,
        selective_data_updates_enabled: false,
        encrypted_channel_enabled:      false,
        // Advanced Options 4
        capabilities_rfactive_notification_enabled: false,
    };

    describe('encode', () => {
        test('default message', () => {
            const msg = message.capabilities.encode(Object.assign(
                capabilities, {maxChannels: 8, maxNetworks: 1, maxSensRcore: 1}
            ));
            expect(dataviewToArray(msg)).toEqual([164, 8, 84,  8, 1, 0, 0, 0, 1, 0, 0, 240]);
        });
    });

    describe('decode', () => {
        test('default message', () => {
            const view = message.capabilities.encode(Object.assign(
                capabilities, {maxChannels: 8, maxNetworks: 1, maxSensRcore: 1}
            ));
            const res  = message.capabilities.decode(view);
            expect(res).toEqual(
                Object.assign(
                    capabilities, {id: 84, valid: true, maxChannels: 8, maxNetworks: 1, maxSensRcore: 1}
                )
            );
        });
    });

});

describe('SerialNumber', () => {

    const sn = 1251800828;

    describe('encode', () => {
        test('set sn', () => {
            const msg = message.serialNumber.encode({serialNumber: sn});
            expect(dataviewToArray(msg)).toEqual([164, 4, 97,  252,246,156,74, 29]);
        });
    });

    describe('decode', () => {
        test('read sn', () => {
            const view = message.serialNumber.encode({serialNumber: sn});
            const res  = message.serialNumber.decode(view);
            expect(res).toEqual({
                id: 97,
                serialNumber: sn,
                valid: true,
            });
        });
    });
});

describe('DataPage', () => {
    const definitions = {
        value1: {
            resolution: 1, offset: 0, unit: '', min: 0, max: 10, invalid: 255, default: 0
        },
        value2: {
            resolution: 0.1, offset: 0, unit: '', min: 0, max: 10, invalid: 255, default: 1
        },
        // input value is between 1 and 20
        // ouput value is between 100 and 200
        value3: {
            resolution: 0.1, offset: 10, unit: '', min: 0, max: 20, invalid: 255, default: 1
        },
    };

    const dataPage = DataPage({definitions});

    describe('length', () => {
        test('length', () => {
            expect(dataPage.length).toEqual(8);
        });
    });

    describe('applyResolution', () => {
        test('basic', () => {
            expect(dataPage.applyResolution('value1', 1)).toEqual(1);
        });

        test('with resolution', () => {
            expect(dataPage.applyResolution('value2', 1)).toEqual(10);
        });
    });

    describe('removeResolution', () => {
        test('basic', () => {
            expect(dataPage.removeResolution('value1', 1)).toEqual(1);
        });

        test('with resolution', () => {
            expect(dataPage.removeResolution('value2', 100)).toEqual(10);
        });
    });

    describe('applyOffset', () => {
        test('with offset', () => {
            expect(dataPage.applyOffset('value3', 1)).toEqual(110);
        });
    });

    describe('removeOffset', () => {
        test('with offset', () => {
            expect(dataPage.removeOffset('value3', 110)).toEqual(1);
        });
    });

    describe('encodeField', () => {
        test('basic', () => {
            expect(dataPage.encodeField('value1', 1)).toEqual(1);
        });

        test('input under min', () => {
            expect(dataPage.encodeField('value1', -1)).toEqual(0);
        });

        test('input over max', () => {
            expect(dataPage.encodeField('value1', 11)).toEqual(10);
        });

        test('with offset', () => {
            expect(dataPage.encodeField('value3', 1, dataPage.applyOffset)).toEqual(110);
        });
    });

    describe('decodeField', () => {
        test('basic', () => {
            expect(dataPage.decodeField('value1', 1)).toEqual(1);
        });

        test('with offset', () => {
            expect(dataPage.decodeField('value3', 110, dataPage.removeOffset)).toEqual(1);
        });
    });

});

describe('Data Page 48 - Basic Resistance', () => {

    describe('encode', () => {
        test('default', () => {
            const msg = fec.dataPage48.encode();
            expect(dataviewToArray(msg)).toEqual([48, 0,0,0,0,0,0, 0]);
        });

        test('in range', () => {
            const msg = fec.dataPage48.encode({resistance: 10});
            expect(dataviewToArray(msg)).toEqual([48, 0,0,0,0,0,0, 20]);
        });

        test('under min', () => {
            const msg = fec.dataPage48.encode({resistance: -10});
            expect(dataviewToArray(msg)).toEqual([48, 0,0,0,0,0,0, 0]);
        });

        test('over max', () => {
            const msg = fec.dataPage48.encode({resistance: 110});
            expect(dataviewToArray(msg)).toEqual([48, 0,0,0,0,0,0, 200]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage48.encode({resistance: 10});
            const res = fec.dataPage48.decode(view);
            expect(res).toEqual({resistance: 10});
        });
    });
});

describe('Data Page 49 - Target Power', () => {

    describe('encode', () => {
        test('default', () => {
            const msg = fec.dataPage49.encode();
            expect(dataviewToArray(msg)).toEqual([49, 0,0,0,0,0, 0,0]);
        });

        test('in range', () => {
            const msg = fec.dataPage49.encode({power: 200});
            expect(dataviewToArray(msg)).toEqual([49, 0,0,0,0,0, 32,3]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage49.encode({power: 200});
            const res = fec.dataPage49.decode(view);
            expect(res).toEqual({power: 200});
        });
    });
});

describe('Data Page 50 - Wind Resistance', () => {

    describe('encode', () => {
        test('invalid', () => {
            const msg = fec.dataPage50.encode({
                windResistance: fec.dataPage50.definitions.windResistance.invalid,
                windSpeed:      fec.dataPage50.definitions.windSpeed.invalid,
                draftingFactor: fec.dataPage50.definitions.draftingFactor.invalid
            });
            expect(dataviewToArray(msg)).toEqual([50, 0,0,0,0, 255, 255, 255]);
        });
        test('default', () => {
            const msg = fec.dataPage50.encode();
            expect(dataviewToArray(msg)).toEqual([50, 0,0,0,0, 51, 127, 100]);
        });

        test('windResistance', () => {
            const msg = fec.dataPage50.encode({windResistance: 0.48});
            expect(dataviewToArray(msg)).toEqual([50, 0,0,0,0, 48, 127, 100]);
        });

        test('crr', () => {
            const msg = fec.dataPage50.encode({windSpeed: 20});
            expect(dataviewToArray(msg)).toEqual([50, 0,0,0,0, 51, 147, 100]);
        });

        test('draftingFactor', () => {
            const msg = fec.dataPage50.encode({draftingFactor: 0.4});
            expect(dataviewToArray(msg)).toEqual([50, 0,0,0,0, 51, 127, 40]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage50.encode();
            const res = fec.dataPage50.decode(view);
            expect(res).toEqual({
                windResistance: 0.51,
                windSpeed: 0,
                draftingFactor: 1
            });
        });
    });
});

describe('Data Page 51 - Track Resistance', () => {

    describe('encode', () => {
        test('invalid', () => {
            const msg = fec.dataPage51.encode({
                grade: fec.dataPage51.definitions.grade.invalid,
                crr:   fec.dataPage51.definitions.crr.invalid,
            });
            expect(dataviewToArray(msg)).toEqual([51, 0,0,0,0, 255,255, 255]);
        });
        test('default', () => {
            const msg = fec.dataPage51.encode();
            expect(dataviewToArray(msg)).toEqual([51, 0,0,0,0, 32,78, 80]);
        });

        test('grade', () => {
            const msg = fec.dataPage51.encode({grade: 4.8});
            expect(dataviewToArray(msg)).toEqual([51, 0,0,0,0, 0,80, 80]);
        });

        test('crr', () => {
            const msg = fec.dataPage51.encode({crr: 0.00321});
            expect(dataviewToArray(msg)).toEqual([51, 0,0,0,0, 32,78, 64]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage51.encode();
            const res = fec.dataPage51.decode(view);
            expect(res).toEqual({
                grade: 0,
                crr: 0.004,
            });
        });
    });
});

describe('Data Page 55 - User Configuration', () => {

    describe('encode', () => {
        test('invalid', () => {
            const msg = fec.dataPage55.encode({
                userWeight:     fec.dataPage55.definitions.userWeight.invalid,
                diameterOffset: fec.dataPage55.definitions.diameterOffset.invalid,
                bikeWeight:     fec.dataPage55.definitions.bikeWeight.invalid,
                wheelDiameter:  fec.dataPage55.definitions.wheelDiameter.invalid,
                gearRatio:      fec.dataPage55.definitions.gearRatio.invalid,
            });
            expect(dataviewToArray(msg)).toEqual([55, 255,255, 0, 255,255, 255, 0]);
        });
        test('default', () => {
            const msg = fec.dataPage55.encode();
            expect(dataviewToArray(msg)).toEqual([55, 76,29, 0, 143,12, 70, 0]);
        });

        test('userWeight', () => {
            const msg = fec.dataPage55.encode({userWeight: 80});
            expect(dataviewToArray(msg)).toEqual([55, 64,31, 0, 143,12, 70, 0]);
        });

        test('bikeWeight', () => {
            const msg = fec.dataPage55.encode({bikeWeight: 7});
            expect(dataviewToArray(msg)).toEqual([55, 76,29, 0, 207,8, 70, 0]);
        });

        test('wheelDiameter', () => {
            const msg = fec.dataPage55.encode({wheelDiameter: 0.6});
            expect(dataviewToArray(msg)).toEqual([55, 76,29, 0, 143,12, 60, 0]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage55.encode();
            const res = fec.dataPage55.decode(view);
            expect(res).toEqual({
                userWeight: 75,
                diameterOffset: 15,
                bikeWeight: 10,
                wheelDiameter: 0.7,
                gearRatio: 0,
            });
        });
    });
});

describe('Data Page 16 - General FE Data', () => {

    describe('encode', () => {
        test('default', () => {
            const msg = fec.dataPage16.encode();
            expect(dataviewToArray(msg)).toEqual([16, 25, 0, 0, 0,0, 255, 32]);
        });

        test('invalid', () => {
            const msg = fec.dataPage16.encode();
            expect(dataviewToArray(msg)).toEqual([16, 25, 0, 0, 0,0, 255, 32]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage16.encode();
            const res = fec.dataPage16.decode(view);
            expect(res).toEqual({
                equipmentType: 'Trainer/Stationary Bike',
                elapsedTime: 0,
                speed: 0,
                heartRate: 255,
                capabilities: {
                    hrDataSource: 'Unknown',
                    distance: false,
                    virtualSpeed: false,
                },
                feState: {
                    feState: 'READY',
                    lapToggle: 0,
                },
            });
        });
    });
});

describe('Data Page 25 - Trainer Data', () => {

    describe('encode', () => {
        test('default', () => {
            const msg = fec.dataPage25.encode();
            expect(dataviewToArray(msg)).toEqual([25, 0, 0, 0,0, 0,0, 0]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage25.encode();
            const res  = fec.dataPage25.decode(view);
            expect(res).toEqual({
                eventCount: 0,
                cadence: 0,
                accumulatedPower: 0,
                power: 0,
                status: {
                    power: 0, resistance: 0, user: 0
                },
                flags: {
                    limits: 'ok',
                },
                feState: {
                    feState: 'READY',
                    lapToggle: 0,
                },
            });
        });

        test('default', () => {
            const config = {
                eventCount: 3,
                cadence: 80,
                accumulatedPower: 100*3,
                power: 100,
                status: {
                    power: 0, resistance: 0, user: 1
                },
                flags: { limits: 'high' },
                feState: {
                    feState: 'READY',
                    lapToggle: 0,
                },
            };

            const view = fec.dataPage25.encode(config);
            const res  = fec.dataPage25.decode(view);
            expect(res).toEqual(config);
        });
    });
});


// describe('', () => {

//     describe('encode', () => {
//         test('default message', () => {
//             let msg = message..encode();
//             expect(dataviewToArray(msg)).toEqual([164,]);
//         });
//     });

// });
