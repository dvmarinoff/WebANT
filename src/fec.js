import { equals, exists, existance, isUndefined, xor } from './functions.js';



function numberToEquipmentType(number) {
    if(equals(number, 19)) return 'Treadmill';
    if(equals(number, 20)) return 'Elliptical';
    if(equals(number, 22)) return 'Rower';
    if(equals(number, 23)) return 'Climber';
    if(equals(number, 24)) return 'Nordic Skier';
    if(equals(number, 25)) return 'Trainer/Stationary Bike';
    throw new Error('Unknown equipment type number');
};

function equipmentTypesToNumber(str) {
    if(equals(str, 'Treadmill'))               return 19;
    if(equals(str, 'Elliptical'))              return 20;
    if(equals(str, 'Rower'))                   return 22;
    if(equals(str, 'Climber'))                 return 23;
    if(equals(str, 'Nordic Skier'))            return 24;
    if(equals(str, 'Trainer/Stationary Bike')) return 25;
    throw new Error('Unknown equipment type name');
};

function DataPage16() {
    // General FE Data
    const pageNumber = 16;
    const length     = 8;

    const elapsedTimeUnit          = 0.25; // 0.25s
    const elapsedTimeRollOver      = 64;   // 64s
    const distanceTraveledRollOver = 256; // 256 meters
    const speedUnit                = 0.001;  // 0.001 m/s
    const speedRollOver            = 65.534; // 65.534 m/s
    const speedInvalid             = 65535;  // 0xFFFF
    const heartRateRollOver        = 254; // 254 bpm
    const heartRateInvalid         = 255; // 0xFF

    const defaults = {
        equipmentType: 0b00000000,
        elapsedTime: 0,
        distanceTraveled: 0,
        speed: 0,
        heartRate: 0,
        capabilitiesAndFEState: 0b00000000,
    };

    function encode(args) {
        let buffer = new ArrayBuffer(length);
        let view   = new DataView(buffer);

        const equipmentType          = existance(args.equipmentType, defaults.equipmentType);
        const elapsedTime            = existance(args.elapsedTime, defaults.elapsedTime);
        const distanceTraveled       = existance(args.distanceTraveled, defaults.distanceTraveled);
        const speed                  = existance(args.speed, defaults.speed);
        const heartRate              = existance(args.heartRate, defaults.heartRate);
        const capabilitiesAndFEState = existance(args.capabilitiesAndFEState, defaults.capabilitiesAndFEState);

        view.setUint8( 0, pageNumber,             true);
        view.setUint8( 1, equipmentType,          true);
        view.setUint8( 2, elapsedTime,            true);
        view.setUint16(3, speed,                  true);
        view.setUint8( 5, heartRate,              true);
        view.setUint8( 6, capabilitiesAndFEState, true);
        view.setUint8( 7, xor(view),              true);

        return view;
    }

    function decode(view) {

        let pageNumber             = view.getUint8( 0, true);
        let equipmentType          = view.getUint8( 1, true);
        let elapsedTime            = view.getUint8( 2, true);
        let speed                  = view.getUint16(3, true);
        let heartRate              = view.getUint8( 5, true);
        let capabilitiesAndFEState = view.getUint8( 6, true);
        let xor                    = view.getUint8( 7, true);

        equipmentType = numberToEquipmentType(equipmentType & 0b00011111);
        elapsedTime   = elapsedTime * elapsedTimeUnit;
        speed         = speed * speedUnit * 3.6;

        return { pageNumber, equipmentType, elapsedTime, speed, heartRate, capabilitiesAndFEState };
    }

    return Object.freeze({ encode, decode });
}

function ControlPage48() {
    // Basic resistance
}

function ControlPage49() {
    // Target power
}

function ControlPage50() {
    // Simulation
}

function ControlPage51() {
    // Simulation
}
