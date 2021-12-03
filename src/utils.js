//
// Util functions specific to the project that can't find a place
// in the more general function.js
//

function fixInRange(min, max, value) {
    if(value >= max) {
        return max;
    } else if(value < min) {
        return min;
    } else {
        return value;
    }
}

//
// ANT+ and .FIT
//
const garmin_epoch = Date.parse('31 Dec 1989 00:00:00 GMT');

function toFitTimestamp(timestamp) {
    return Math.round((timestamp - garmin_epoch) / 1000);
}

function toJsTimestamp(fitTimestamp) {
    return (fitTimestamp * 1000) + garmin_epoch;
}

function now() {
    return toFitTimestamp(Date.now());
}

function timeDiff(timestamp1, timestamp2) {
    let difference = (timestamp1 / 1000) - (timestamp2 / 1000);
    return Math.round(Math.abs(difference));
};

export {
    // Other
    fixInRange,

    // ANT+ and .FIT
    toFitTimestamp,
    toJsTimestamp,
    now,
    timeDiff,
};
