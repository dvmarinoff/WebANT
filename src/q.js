import { xf, equals, exists, existance, dataviewToArray } from './functions.js';
import { message } from './message.js';

//                             id  ch to  res
// channel response   [164, 3, 64, 0, 81, 0, 182]
//                             id  ch    res
// channel event      [164, 3, 64, 0, 1, 0, x]
//                             id  ch res
// requested response [164, 3, 82, 0, 2, 246]

// Case 1: write Config msg, and wait for channel response
//         send:     [164, 5, 81, 0, 0, 0, 0, 0, 240]
//         response: [164, 3, 64, 0, 81, 0, 182]
//
// Case 2: write Acknowledged Data with control data page, wait for channel event
//         TRANSFER_TX_COMPLETED, success
//         TX_TRANSFER_FAILED, fail and retry until success
//
//         send:       [164, 9, 79, 0,  49, 255,255,255,255,255, 75,0,  103]
//         response 1: [164, 3, 64, 0, 1, 5, x] 'event_transfer_tx_completed'
//         response 2: [164, 3, 64, 0, 1, 6, x] 'event_transfer_tx_failed'
//
// channel response decoded { id, channelNumber, initMsgId, responseCode, valid, }
// channel event decoded    { id, channelNumber, eventCode, valid, }

function Q(args = {}) {
    let _q = new Map();

    function start() {const self = this;}
    function stop() {const self = this;}

    function isResponse(dataview) {
        return message.channelResponse.isResponse(dataview);
    }

    function isEvent(dataview) {
        return message.channelEvent.isEvent(dataview);
    }

    function isEventSuccess(msg) {
        return [0, 5].contains(msg.eventCode);
    }

    function needsResponse(dataview) {}

    function needsEvent(dataview) {}

    function push(dataview) {
        // const promise = new Promise();
        // if(needsResponse(dataview)) {
        //     // add channel repsonse promise
        //     _q.set({});
        // }
        // if(needsEvent(dataview)) {
        //     // add acknowledged data promise
        // }
    }

    function pull(dataview) {
        // if(isResponse(dataview)) {
        //     // resolve channel repsonse promise
        //     const msg = message.channelResponse.decode(dataview);
        //     _q.get({initMsgId: msg.initMsgId});
        // }
        // if(isEvent(dataview)) {
        //     const msg = message.channelEvent.decode(dataview);
        //     if(isEventSuccess(msg)) {
        //         resolve acknowledged data promise
        //         _q.get({initMsgId: msg.initMsgId});
        //     }
        //     // reject acknowledged data promise, and retry
        // }
    }

    return Object.freeze({
        push,
        pull,
    });
}

export { Q };

