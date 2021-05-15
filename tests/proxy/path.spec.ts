import {createPathProxy, symPath} from "../../src/proxy/path";

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

it('track path', () => {
    expect(createPathProxy(root)[symPath]).toEqual([]);
    expect(createPathProxy(root).a[symPath]).toEqual(['a']);
    expect(createPathProxy(root).b[symPath]).toEqual(['b']);
    expect(createPathProxy(root).b.l[symPath]).toEqual(['b', 'l']);
    expect(createPathProxy(root).d[symPath]).toEqual(['d']);
    expect(createPathProxy(root).d[0][symPath]).toEqual(['d', 0]);
    expect(createPathProxy(root).d[1][symPath]).toEqual(['d', 1]);
    expect(createPathProxy(root).d[1].x[symPath]).toEqual(['d', 1, 'x']);
});

