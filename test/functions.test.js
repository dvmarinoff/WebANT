import { exists,
         empty,
         first,
         second,
         third,
         last,
         traverse,
         getIn,
         xf,
         toUint8Array,
         typeToAccessor} from '../src/functions.js';

describe('existance check', () => {
    describe('does not exist', () => {
        test('with Null', () => {
            expect(exists(null)).toBe(false);
        });
        test('with Undefined', () => {
            expect(exists(undefined)).toBe(false);
        });
    });

    describe('exists', () => {
        test('with Collection', () => {
            expect(exists({})).toBe(true);
            expect(exists([])).toBe(true);
            expect(exists("")).toBe(true);
            expect(exists(new Uint8Array([]))).toBe(true);
        });
        test('with Number', () => {
            expect(exists(0)).toBe(true);
        });
        test('with Boolean', () => {
            expect(exists(true)).toBe(true);
            expect(exists(false)).toBe(true);
        });
    });
});

describe('empty check', () => {
    describe('is empty', () => {
        test('with empty Array', () => {
            expect(empty([])).toBe(true);
        });
        test('with empty Object', () => {
            expect(empty({})).toBe(true);
        });
        test('with empty String', () => {
            expect(empty("")).toBe(true);
        });
        test('with undefined', () => {
            expect(empty(undefined)).toBe(true);
        });
    });

    describe('is not empty', () => {
        test('with Array', () => {
            expect(empty([0])).toBe(false);
        });
        test('with Object', () => {
            expect(empty({a: 0})).toBe(false);
        });
        test('with String', () => {
            expect(empty("zero")).toBe(false);
        });
    });

    describe('throws error', () => {
        test('with null', () => {
            expect(() => empty(null)).toThrow();
        });
        test('with number', () => {
            expect(() => empty(0)).toThrow();
        });
    });
});

describe('first element of collection', () => {
    describe('takes first element', () => {
        test('of Array', () => {
            expect(first([0])).toBe(0);
        });
        test('of String', () => {
            expect(first("zero")).toBe("z");
        });
    });

    describe('empty is undefined', () => {
        test('of Array', () => {
            expect(first([])).toBe(undefined);
        });
        test('of String', () => {
            expect(first("")).toBe(undefined);
        });
    });

    describe('first of undefined is undefined', () => {
        test('with undefined', () => {
            expect(first(undefined)).toBe(undefined);
        });
    });

    describe('throws error', () => {
        test('with number', () => {
            expect(() => first(0)).toThrow();
        });
        test('with null', () => {
            expect(() => first(null)).toThrow();
        });
    });
});

describe('second element of collection', () => {
    describe('takes second element', () => {
        test('of Array', () => {
            expect(second([0,1])).toBe(1);
        });
        test('of String', () => {
            expect(second("zero")).toBe("e");
        });
    });

    describe('index out of bound is undefined', () => {
        test('of Array', () => {
            expect(second([])).toBe(undefined);
        });
        test('of String', () => {
            expect(second("")).toBe(undefined);
        });
    });

    describe('empty is undefined', () => {
        test('of Array', () => {
            expect(second([])).toBe(undefined);
        });
        test('of String', () => {
            expect(second("")).toBe(undefined);
        });
    });

    describe('second of undefined is undefined', () => {
        test('with undefined', () => {
            expect(second(undefined)).toBe(undefined);
        });
    });

    describe('throws error', () => {
        test('with number', () => {
            expect(() => second(0)).toThrow();
        });
        test('with null', () => {
            expect(() => second(null)).toThrow();
        });
    });
});


describe('last element of Collection or String', () => {
    describe('works non-empty Collection or String', () => {
        test('with Array', () => {
            expect(last([0])).toBe(0);
            expect(last([0,2])).toBe(2);
            expect(last([0,1,4])).toBe(4);
        });
        test('with String', () => {
            expect(last('a')).toBe('a');
            expect(last('ab')).toBe('b');
            expect(last('abcd')).toBe('d');
            expect(last('1')).toBe('1');
        });
    });

    describe('empty Collection or String is undefined', () => {
        test('with Array', () => {
            expect(last([])).toBe(undefined);
        });
        test('with String', () => {
            expect(last('')).toBe(undefined);
        });
    });

    describe('last of undefined is undefined', () => {
        test('with undefined', () => {
            expect(second(undefined)).toBe(undefined);
        });
    });

    describe('throws error', () => {
        test('with number', () => {
            expect(() => last(0)).toThrow();
        });
        test('with null', () => {
            expect(() => last(null)).toThrow();
        });
    });
});

describe('traverse nested object', () => {

    function accumulate(acc, k, v, obj) {
        acc.push(v);
        return acc;
    }

    test('empty object', () => {
        expect(traverse({})).toEqual([]);
    });

    test('one entry object', () => {
        expect(traverse({crc: true}, accumulate, [])).toEqual([true]);
    });

    test('one level object', () => {
        expect(traverse({activity: true, session: true}, accumulate, [])).toEqual([true, true]);
    });

    test('many levels', () => {
        let obj = {data: {file_id: true,
                          event: {start: true,
                                  stop: false}},
                   crc: false};
        expect(traverse(obj, accumulate, [])).toEqual([true, true, false, false]);
    });
});

describe('XF', () => {

    describe('A counter', () => {
        // setup
        xf.create({count: 0});

        xf.reg('count-set', (value, db) => {
            db.count = value;
        });
        xf.reg('count-inc', (_, db) => {
            db.count += 1;
        });
        xf.reg('count-dec', (_, db) => {
            db.count -= 1;
        });

        // use
        let count = 0;

        function countSub(value) {
            count = value;
        }

        const subId = xf.sub('db:count', countSub);

        test('init value', () => {
            expect(count).toBe(0);
        });

        test('inc value', () => {
            xf.dispatch('count-inc');
            expect(count).toBe(1);
        });

        test('dec value', () => {
            xf.dispatch('count-dec');
            expect(count).toBe(0);
        });

        test('set value', () => {
            xf.dispatch('count-set', 4);
            expect(count).toBe(4);
        });

        test('unsub', () => {
            xf.unsub('db:count', subId);
            xf.dispatch('count-set', 3);
            expect(count).toBe(4);
        });
    });
});

// getIn
// toUint8Array

