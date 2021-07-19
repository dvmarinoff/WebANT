import { equals, dataviewToArray, nthBitToBool, xor } from '../src/functions.js';
import { ids, events, channelTypes, values, keys } from '../src/constants.js';
import { message } from '../src/message.js';



describe('Set Network Key', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.setNetworkKey.encode();
            expect(dataviewToArray(msg)).toEqual([164, 9, 70, 0,  232,228,33,59,85,122,103,193,  116]);
        });

        test('sets ant plus network key message', () => {
            let msg = message.setNetworkKey.encode({netKey: keys.antPlus});
            expect(dataviewToArray(msg)).toEqual([164, 9, 70, 0,  185,165,33,251,189,114,195,69,  100]);
        });

        test('sets network number', () => {
            let msg = message.setNetworkKey.encode({netNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 9, 70, 1,  232,228,33,59,85,122,103,193,  117]);
        });
    });
});

describe('Assaign Channel', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.assignChannel.encode();
            expect(dataviewToArray(msg)).toEqual([164, 3, 66, 0,  0, 0,  229]);
        });

        test('sets channel number', () => {
            let msg = message.assignChannel.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 3, 66, 1,  0, 0,  228]);
        });

        test('sets channel type', () => {
            let msg = message.assignChannel.encode({channelType: channelTypes.slave.receiveOnly});
            expect(dataviewToArray(msg)).toEqual([164, 3, 66, 0,  64, 0,  165]);
        });

        test('sets network number', () => {
            let msg = message.assignChannel.encode({netNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 3, 66, 0,  0, 1,  228]);
        });

        test('extended assignment', () => {
            let msg = message.assignChannel.encode({extended: 0x10});
            expect(dataviewToArray(msg)).toEqual([164, 3, 66, 0,  0, 0, 16,  245]);
        });
    });
});

describe('Unssaign Channel', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.unassignChannel.encode();
            expect(dataviewToArray(msg)).toEqual([164, 3, 65, 0, 230]);
        });

        // test('sets channel number', () => {
        //     let msg = message.assignChannel.encode({channelNumber: 1});
        //     expect(dataviewToArray(msg)).toEqual([164, 3, 66, 1,  0, 0,  228]);
        // });

        // test('sets channel type', () => {
        //     let msg = message.assignChannel.encode({channelType: channelTypes.slave.receiveOnly});
        //     expect(dataviewToArray(msg)).toEqual([164, 3, 66, 0,  64, 0,  165]);
        // });

        // test('sets network number', () => {
        //     let msg = message.assignChannel.encode({netNumber: 1});
        //     expect(dataviewToArray(msg)).toEqual([164, 3, 66, 0,  0, 1,  228]);
        // });
    });
});
