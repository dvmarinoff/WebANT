import { xf } from '../functions.js';
import { driver } from '../driver.js';
import { Devices } from '../devices.js';
import './views.js';

const db = {
    power: 0,
    cacence: 0,
    speed: 0,
    heartRate: 0,
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

function start() {
    console.log('start app');

    driver.init();

    Devices();
}

start();

