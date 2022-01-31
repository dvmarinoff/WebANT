import { xf, equals } from '../functions.js';
import { driver } from '../driver.js';
import { Devices } from '../devices.js';
import './views.js';

const db = {
    power: 0,
    cacence: 0,
    speed: 0,
    heartRate: 0,
    powerTarget: 140,
    slopeTarget: 0,
    mode: 'erg',
};

xf.create(db);

xf.reg('power', (power, db) => {
    db.power = power;
});

xf.reg('cadence', (cadence, db) => {
    db.cadence = cadence;
});

xf.reg('speed', (speed, db) => {
    db.speed = speed;
});

xf.reg('heartRate', (heartRate, db) => {
    db.heartRate = heartRate;
});

xf.reg('ui:mode-set', (mode, db) => {
    db.mode = mode;

    if(equals(mode, 'erg')) {
        xf.dispatch(`ui:power-target-set`, db.powerTarget);
    }
    if(equals(mode, 'slope')) {
        xf.dispatch(`ui:slope-target-set`, db.slopeTarget);
    }
});

xf.reg('ui:power-target-set', (powerTarget, db) => {
    db.powerTarget = powerTarget;
});
xf.reg('ui:power-target-inc', (_, db) => {
    db.powerTarget = db.powerTarget + 10;
});
xf.reg(`ui:power-target-dec`, (_, db) => {
    db.powerTarget = db.powerTarget - 10;
});

xf.reg('ui:slope-target-set', (slopeTarget, db) => {
    db.slopeTarget = slopeTarget;
});
xf.reg('ui:slope-target-inc', (_, db) => {
    db.slopeTarget = db.slopeTarget + 0.5;
});
xf.reg(`ui:slope-target-dec`, (_, db) => {
    db.slopeTarget = db.slopeTarget - 0.5;
});


function start() {
    console.log('start app');

    driver.init();

    Devices();
}

start();

