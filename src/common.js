import { equals, existance, curry2 } from './functions.js';
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

    const removeResolution = curry2((prop, value) => {
        return value * definitions[prop].resolution;
    });

    const applyOffset = curry2((prop, value) => {
        return (applyResolution(prop, definitions[prop].offset)) +
               (applyResolution(prop, value));
    });

    const removeOffset = curry2((prop, value) => {
        return (removeResolution(prop, value)) - (definitions[prop].offset);
    });

    function encodeField(prop, input, transform = applyResolution) {
        const invalid = definitions[prop].invalid;
        const min     = transform(prop, definitions[prop].min);
        const max     = transform(prop, definitions[prop].max);
        const value   = existance(input, definitions[prop].default);

        if(equals(value, invalid)) {
            return value;
        } else {
            return Math.floor(fixInRange(min, max, transform(prop, value)));
        }
    }

    function decodeField(prop, input, transform = removeResolution) {
        return transform(prop, input);
    }

    return {
        length,
        applyResolution,
        removeResolution,
        applyOffset,
        removeOffset,
        encodeField,
        decodeField,
    };
}

export { DataPage };

