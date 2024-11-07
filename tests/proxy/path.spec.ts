import {createPathProxy, symPath} from "../../src/proxy/path";
import { expect, test } from 'vitest'

const root = {
    a: 1,
    b: {
        l: 2
    },
    d: <[number, { x: number }]>[
        3,
        {
            x: 4
        }
    ]
};

test('track path', () => {
    expect(createPathProxy()[symPath]).toEqual([]);
    expect(createPathProxy().a[symPath]).toEqual(['a']);
    expect(createPathProxy().b[symPath]).toEqual(['b']);
    expect(createPathProxy().b.l[symPath]).toEqual(['b', 'l']);
    expect(createPathProxy().d[symPath]).toEqual(['d']);
    expect(createPathProxy().d[0][symPath]).toEqual(['d', 0]);
    expect(createPathProxy().d[1][symPath]).toEqual(['d', 1]);
    expect(createPathProxy().d[1].x[symPath]).toEqual(['d', 1, 'x']);
});

