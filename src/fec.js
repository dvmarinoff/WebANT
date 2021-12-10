import { equals, exists, existance, isUndefined, curry2, xor } from './functions.js';
import { fixInRange } from './utils.js';

function DataPage(args = {}) {
    const defaults = {
        length: 8,
    };

    const length      = existance(args.length, defaults.length);
    const definitions = existance(args.definitions);

    const applyResolution = curry2((prop, value) => {
        return value / definitions[prop].resolution;
    });

    const applyOffset = curry2((prop, value) => {
        return (applyResolution(prop, definitions[prop].offset)) +
               (applyResolution(prop, value));
    });

    function encodeField(prop, input, transform = applyResolution(prop)) {
        const invalid = definitions[prop].invalid;
        const min     = applyResolution(definitions[prop].min);
        const max     = applyResolution(prop, definitions[prop].max);
        const value   = existance(input, invalid);

        if(equals(value, invalid)) {
            return value;
        } else {
            return Math.floor(fixInRange(min, max)(transform(value)));
        }
    }

    return {
        length,
        applyResolution,
        applyOffset,
        encodeField,
    };
}

function DataPage48() {
    // Data Page 48 (0x30) – Basic Resistance
    const number = 48;

    const definitions = {
        resistance: {
            resolution: 0.5, unit: '', min: 0, max: 100, invalid: 0, default: 0
        },
    };

    const data   = DataPage({definitions});
    const length = data.length;

    function encode(args = {}) {
        const resistance = data.encodeField('resistance', args.resistance);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8(0, number,     true);
        view.setUint8(6, resistance, true);

        return view;
    }

    function decode(args = {}) {}

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode,
    });
}

function DataPage49() {
    // Data Page 49 (0x31) – Target power
    const number = 49;

    const definitions = {
        power: {
            resolution: 0.25, unit: 'W', min: 0, max: 4000, invalid: 0, default: 0
        },
    };

    const data   = DataPage({definitions});
    const length = data.length;

    function encode(args = {}) {
        const power = data.encodeField('power', args.power);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8(0, number, true);
        view.setUint8(6, power,  true);

        return view;
    }

    function decode(args = {}) {}

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode,
    });
}

function DataPage50() {
    // Data Page 50 (0x32) – Wind Resistance
    const number = 50;

    let values = {
        frontalArea: {
            mtb: 0.57, commuter: 0.55, roadTouring: 0.40, roadRacing: 0.36,
        },
        drag: {
            mtb: 1.20, commuter: 1.15, roadTouring: 1.0, roadRacing: 0.88,
        },
        airDensity: {
            sea15deg: 1.275,
        },
    };

    const definitions = {
        windResistance: {
            resolution: 0.01, unit: 'kg/m', min: 0, max: 1.86, invalid: 0xFF, default: 0.51
        },
        windSpeed: {
            resolution: 1, unit: 'km/h', min: -127, max: 127, invalid: 0xFF, default: 0.40, offset: 127
        },
        draftingFactor: {
            resolution: 0.01, unit: '', min: 0, max: 1, invalid: 0xFF, default: 1.0
        },
    };

    const data   = DataPage({definitions});
    const length = data.length;

    function calcWindRasistance(args = {}) {
        // WindResistanceCoefficient = FrontalSurfaceArea * DragCoefficient * AirDensity
        const frontalArea = existance(args.frontalArea, values.frontalArea.roadTouring);
        const drag        = existance(args.drag, values.drag.roadTouring);
        const airDensity  = existance(args.airDensity, values.airDensity.roadTouring);
        return frontalArea * drag * airDensity;
    }

    // 0x0000 -127 | 0x7F (127) 0 | 0xFE (254) 127
    // applyOffset('WindSpeed', 0)  -> 127
    // applyOffset('WindSpeed', 13) -> 140
    // applyOffset('WindSpeed', 20) -> 147

    function encode(args = {}) {
        const windResistance = data.encodeField('windResistance', args.windResistance);
        const windSpeed      = data.encodeField('windSpeed', args.windSpeed, data.applyOffset('windSpeed'));
        const draftingFactor = data.encodeField('draftingFactor', args.draftingFactor);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8(0, number,         true);
        view.setUint8(5, windResistance, true);
        view.setUint8(6, windSpeed,      true);
        view.setUint8(7, draftingFactor, true);

        return view;
    }

    function decode(args = {}) {}

    return Object.freeze({
        number,
        length,
        definitions,
        values,
        calcWindRasistance,
        encode,
        decode,
    });
}

function DataPage51(args = {}) {
    // Data Page 51 (0x33) – Track Resistance
    const number = 51;

    const definitions = {
        grade: {
            resolution: 0.01, unit: '%', min: 0, max: 400, invalid: 0xFFFF, default: 0, offset: 200
        },
        crr: {
            resolution: 0.00005, unit: '', min: 0, max: 0.0127, invalid: 0xFF, default: 0.004
        },
    };

    // Simulated Grade (%) = (Raw Grade Value x 0.01%) – 200.00%
    // 0x0000 -200.00% | 0x4E20 (20000) 0.00% | 0x9C40 (40000) +200.00%
    //
    // applyOffset('grade', 0)   -> 20000
    // applyOffset('grade', 1)   -> 20100
    // applyOffset('grade', 4.5) -> 20450

    const data   = DataPage({definitions});
    const length = data.length;

    function encode(args = {}) {
        const grade = data.encodeField('grade', args.grade, data.applyOffset('grade'));
        const crr   = data.encodeField('crr', args.crr);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, number, true);
        view.setUint16(5, grade,  true);
        view.setUint8( 7, crr,    true);

        return view;
    }

    function decode(args = {}) {}

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode,
    });
}

function DataPage55(args = {}) {
    // Data Page 55 (0x37) – User Configuration
    const number = 55;

    const definitions = {
        userWeight:     {resolution: 0.01, unit: 'kg', min: 0, max: 655.34, invalid: 0xFFFF, default: 75},
        diameterOffset: {resolution: 1,    unit: 'mm', min: 1, max: 10,     invalid: 0xF,    default: 0xF},
        bikeWeight:     {resolution: 0.05, unit: 'kg', min: 0, max: 50,     invalid: 0xFFF,  default: 10},
        wheelDiameter:  {resolution: 0.01, unit: 'm',  min: 0, max: 2.54,   invalid: 0xFF,   default: 0.7},
        gearRatio:      {resolution: 0.03, unit: '',   min: 3, max: 7.65,   invalid: 0x00,   default: 0x00},
    };

    const data   = DataPage({definitions});
    const length = data.length;

    function encode(args = {}) {
        const userWeight     = data.encodeField('userWeight', args.userWeight);
        const diameterOffset = data.encodeField('diameterOffset', args.diameterOffset);
        const bikeWeight     = data.encodeField('bikeWeight', args.bikeWeight);
        const wheelDiameter  = data.encodeField('wheelDiameter', args.wheelDiameter);
        const gearRatio      = data.encodeField('gearRatio', args.gearRatio);

        const bikeWeightMSN = bikeWeight & 0b111111110000;
        const bikeWeightLSN = bikeWeight & 0b000000001111;
        const combined      = (bikeWeightLSN << 4) + diameterOffset; // 0-3 diameter offset, 4-7 bike weight LSN

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, number,        true);
        view.setUint16(1, userWeight,    true);
        view.setUint8( 4, combined,      true);
        view.setUint8( 5, bikeWeightMSN, true);
        view.setUint8( 6, wheelDiameter, true);
        view.setUint8( 7, gearRatio,     true);

        return view;
    }

    function decode(args = {}) {}

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode,
    });
}

function DataPage16() {
    // Data Page 16 (0x10) – General FE Data
    const number = 16;

    const definitions = {
        elapsedTime: {
            resolution: 0.25, unit: 's', min: 0, max: 64, invalid: 0, default: 0
        },
        distance: {
            resolution: 1, unit: 'm', min: 0, max: 256, invalid: 0, default: 0
        },
        speed: {
            resolution: 0.001, unit: 'm/s', min: 0, max: 65.534, invalid: 0xFFFF, default: 0
        },
        heartRate: {
            resolution: 1, unit: 'bpm', min: 0, max: 254, invalid: 0xFF, default: 0
        },
    };

    const data   = DataPage({definitions});
    const length = data.length;

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

    function encodeEquipmentType(args = {}) {
        return equipmentTypesToNumber(args.equipmentType);
    }

    function encodeCapabilities(args = {}) {
        return 0b0000;
    }

    function encodeFEState(args = {}) {
        return 0b0000;
    }

    function encode(args = {}) {
        const equipmentType = encodeEquipmentType(args.equipmentType);
        const elapsedTime   = data.encodeField('elapsedTime', args.elapsedTime);
        const distance      = data.encodeField('distance', args.distance);
        const speed         = data.encodeField('speed', args.speed);
        const heartRate     = data.encodeField('heartRate', args.heartRate);
        const capabilities  = encodeCapabilities(args.capabilities);
        const FEState       = encodeFEState(args.feState);

        const combined = (FEState << 4) + capabilities;

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, number,        true);
        view.setUint8( 1, equipmentType, true);
        view.setUint8( 2, elapsedTime,   true);
        view.setUint16(3, speed,         true);
        view.setUint8( 5, heartRate,     true);
        view.setUint8( 6, combined,      true);
        view.setUint8( 7, xor(view),     true);

        return view;
    }

    function decodeEquipmentType(value) {
        return numberToEquipmentType(value & 0b00011111);
    }

    function decode(view) {
        const number        = view.getUint8( 0, true);
        const equipmentType = view.getUint8( 1, true);
        const elapsedTime   = view.getUint8( 2, true);
        const speed         = view.getUint16(3, true);
        const heartRate     = view.getUint8( 5, true);
        const xor           = view.getUint8( 7, true);

        const combined      = view.getUint8( 6, true);
        const capabilities  = 0;
        const FEState       = 0;

        // return {
        //     equipmentType: decodeField('equipmentType', equipmentType),
        //     speed:         decodeField('speed', speed),
        // };

        // elapsedTime   = elapsedTime * elapsedTimeUnit;
        // speed         = speed * speedUnit * 3.6;
        return {
            number,
            equipmentType,
            elapsedTime,
            speed,
            heartRate,
            capabilities,
            FEState
        };
    }

    return Object.freeze({
        number,
        length,
        definitions,
        encodeEquipmentType,
        encodeCapabilities,
        encodeFEState,
        encode,
        decode

    });
}

const fec = {
    dataPage48: DataPage48(),
    dataPage49: DataPage49(),
    dataPage50: DataPage50(),
    dataPage51: DataPage51(),
    dataPage55: DataPage55(),
};

export { fec };
