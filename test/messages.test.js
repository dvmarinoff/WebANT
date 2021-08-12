import { equals, dataviewToArray, nthBitToBool, xor } from '../src/functions.js';
import { ids, events, channelTypes, values, keys } from '../src/constants.js';
import { message } from '../src/message.js';



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

describe('Unassaign Channel', () => {

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
});

describe('Set Channel Id', () => {

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
            let msg = message.setChannelId.encode({transType: 0x10});
            expect(dataviewToArray(msg)).toEqual([164, 5, 81, 0, 0,0, 0, 16, 224]);
        });
    });
});

describe('Set Channel Period', () => {

    describe('encode', () => {
        test('default message', () => {
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
});

describe('Set Channel Frequency', () => {

    describe('encode', () => {
        test('default message', () => {
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

});

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

describe('Reset System', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.resetSystem.encode();
            expect(dataviewToArray(msg)).toEqual([164, 1, 74, 0, 239]);
        });
    });

});

describe('Open Channel', () => {

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

});

describe('Close Channel', () => {

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

});

describe('Request Message', () => {
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

});

describe('Open Rx Scan Mode', () => {

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

});

describe('Sleep', () => {

    describe('encode', () => {
        test('default message', () => {
            let msg = message.sleep.encode();
            expect(dataviewToArray(msg)).toEqual([164, 1, 197, 0, 96]);
        });
    });

});

describe('Search Timeout', () => {

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

});

describe('Low Priority Search Timeout', () => {

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
});

describe('Enable Extended Rx Messages', () => {

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

});

describe('Lib Config', () => {

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
});

describe('Acknowledged Data Messsage', () => {

    describe('Total Length', () => {
        let extendedInfo = new DataView(new Uint8Array([128, 139,182, 17, 16]).buffer);

        expect(message.acknowledgedData.TotalLength()).toBe(13);
        expect(message.acknowledgedData.TotalLength(undefined)).toBe(13);
        expect(message.acknowledgedData.TotalLength(null)).toBe(13);

        expect(message.acknowledgedData.TotalLength(extendedInfo)).toBe(18);
    });

    describe('encode', () => {
        test('default message', () => {
            let msg = message.acknowledgedData.encode();
            expect(dataviewToArray(msg)).toEqual([164, 9, 79, 0,  0,0,0,0, 0,0,0,0,  226]);
        });

        test('sets channel', () => {
            let msg = message.acknowledgedData.encode({channelNumber: 1});
            expect(dataviewToArray(msg)).toEqual([164, 9, 79, 1,  0,0,0,0, 0,0,0,0,  227]);
        });

        test('sets payload', () => {
            let dataPage49 = new DataView(new Uint8Array([49, 255,255,255,255,255, 75,0]).buffer);

            let msg = message.acknowledgedData.encode({payload: dataPage49});
            expect(dataviewToArray(msg)).toEqual([164, 9, 79, 0,  49, 255,255,255,255,255, 75,0,  103]);
        });

        test('sets extended data (Channel Id)', () => {
            let dataPage16 = new DataView(new Uint8Array([16, 0b00011001, 4, 0,  0,0,  255, 0b00110100]).buffer);
            let extendedData = new DataView(new Uint8Array([128, 139,182, 17, 16]).buffer);

            let msg = message.acknowledgedData.encode({payload: dataPage16, extended: extendedData});
            expect(dataviewToArray(msg)).toEqual([164, 9, 79, 0,  16, 25, 4, 0, 0,0, 255, 52,  128, 139,182, 17, 16,  152]);
        });

        test('sets extended data (Channel Id + RSSI + Rx Timestamp)', () => {
            let dataPage16 = new DataView(new Uint8Array([16, 0b00011001, 4, 0,  0,0,  255, 0b00110100]).buffer);
            let extendedData = new DataView(new Uint8Array([224, 139,182, 17, 16,  32, 156,255, 128,  0, 128]).buffer);

            let msg = message.acknowledgedData.encode({payload: dataPage16, extended: extendedData});
            expect(dataviewToArray(msg)).toEqual([164, 9, 79, 0, 16, 25, 4, 0, 0,0, 255, 52,
                                                  224, 139,182, 17, 16,
                                                  32,  156,255, 128,
                                                  0, 128,
                                                  187]);
        });
    });

});

describe('Channel Event Message', () => {

    describe('encode', () => {
        test('on channel 1 response no error', () => {
            let msg = message.channelEvent.encode({channelNumber: 1, eventCode: 0});
            expect(dataviewToArray(msg)).toEqual([164, 3, 64, 1, 1, 0, 231]);
        });
    });
});

describe('Channel Response Message', () => {

    describe('encode', () => {
        test('on channel 1 for message id 82 response no error', () => {
            let msg = message.channelResponse.encode({channelNumber: 1, initMsgId: 82, responseCode: 0});
            expect(dataviewToArray(msg)).toEqual([164, 3, 64, 1, 82, 0, 180]);
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
    });
});

describe('Channel Status Messsage', () => {

    describe('default message', () => {
        let msg = message.channelStatus.encode();

        expect(dataviewToArray(msg)).toEqual([164, 2, 82, 0, 0, 244]);
    });

    describe('channel: assigned, number 1,', () => {
        let msg = message.channelStatus.encode({channelNumber: 1, channelState: 1});

        expect(dataviewToArray(msg)).toEqual([164, 2, 82, 1, 1, 244]);
    });

    describe('channel: searching, number 0,', () => {
        let msg = message.channelStatus.encode({channelNumber: 0, channelState: 2});

        expect(dataviewToArray(msg)).toEqual([164, 2, 82, 0, 2, 246]);
    });

    describe('channel: tracking, number 0,', () => {
        let msg = message.channelStatus.encode({channelNumber: 0, channelState: 3});

        expect(dataviewToArray(msg)).toEqual([164, 2, 82, 0, 3, 247]);
    });
});

describe('Capabilities Message', () => {

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

    describe('encode', () => {
        test('default message', () => {
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

            let msg = message.capabilities.encode(Object.assign(capabilities, {maxChannels: 8, maxNetworks: 1, maxSensRcore: 1}));

            expect(dataviewToArray(msg)).toEqual([164, 8, 84,  8, 1, 0, 0, 0, 1, 0, 0, 240]);
        });
    });

});

describe('Serial Number Message', () => {

    describe('encode', () => {
        test('default message', () => {
            const sn = 1251800828;

            let msg = message.serialNumber.encode({serialNumber: sn});
            expect(dataviewToArray(msg)).toEqual([164, 4, 97,  252,246,156,74, 29]);
        });
    });

});



describe('Data Page 16 (General FE Data)', () => {

    describe('encode', () => {
        test('default', () => {

            // let msg = fec.dataPage16.encode();
            // expect(dataviewToArray(msg)).toEqual([164,]);
        });
    });

    describe('decode', () => {
        test('default', () => {

            // fec.dataPage16.decode([]);
            // expect(dataviewToArray(msg)).toEqual([164,]);
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
