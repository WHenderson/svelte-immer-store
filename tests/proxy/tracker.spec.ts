import {createTrackerProxy, symTrackerDetails} from "../../src/proxy/tracker";
import { expect, test } from 'vitest'

const root = {
    a: 1,
    b: 'two',
    c: {
        l: 3,
        m: 'four'
    },
    d: <[number, string, { x: number, y: string }]>[
        5,
        'six',
        {
            x: 7,
            y: 'eight'
        }
    ]
};

test('track values', () => {
    expect(createTrackerProxy(root)[symTrackerDetails].value).toEqual(root);
    expect(createTrackerProxy(root).a[symTrackerDetails].value).toEqual(root.a);
    expect(createTrackerProxy(root).b[symTrackerDetails].value).toEqual(root.b);
    expect(createTrackerProxy(root).c[symTrackerDetails].value).toEqual(root.c);
    expect(createTrackerProxy(root).c.l[symTrackerDetails].value).toEqual(root.c.l);
    expect(createTrackerProxy(root).c.m[symTrackerDetails].value).toEqual(root.c.m);
    expect(createTrackerProxy(root).d[symTrackerDetails].value).toEqual(root.d);
    expect(createTrackerProxy(root).d[0][symTrackerDetails].value).toEqual(root.d[0]);
    expect(createTrackerProxy(root).d[1][symTrackerDetails].value).toEqual(root.d[1]);
    expect(createTrackerProxy(root).d[2][symTrackerDetails].value).toEqual(root.d[2]);
    expect(createTrackerProxy(root).d[2].x[symTrackerDetails].value).toEqual(root.d[2].x);
    expect(createTrackerProxy(root).d[2].y[symTrackerDetails].value).toEqual(root.d[2].y);
    expect(createTrackerProxy(<any>root).e[symTrackerDetails].value).toBeUndefined();
});

test('track parent', () => {
    expect(createTrackerProxy(root)[symTrackerDetails].parent).toBeUndefined();
    expect(createTrackerProxy(root).a[symTrackerDetails].parent).toEqual(root);
    expect(createTrackerProxy(root).b[symTrackerDetails].parent).toEqual(root);
    expect(createTrackerProxy(root).c[symTrackerDetails].parent).toEqual(root);
    expect(createTrackerProxy(root).c.l[symTrackerDetails].parent).toEqual(root.c);
    expect(createTrackerProxy(root).c.m[symTrackerDetails].parent).toEqual(root.c);
    expect(createTrackerProxy(root).d[symTrackerDetails].parent).toEqual(root);
    expect(createTrackerProxy(root).d[0][symTrackerDetails].parent).toEqual(root.d);
    expect(createTrackerProxy(root).d[1][symTrackerDetails].parent).toEqual(root.d);
    expect(createTrackerProxy(root).d[2][symTrackerDetails].parent).toEqual(root.d);
    expect(createTrackerProxy(root).d[2].x[symTrackerDetails].parent).toEqual(root.d[2]);
    expect(createTrackerProxy(root).d[2].y[symTrackerDetails].parent).toEqual(root.d[2]);
    expect(createTrackerProxy(<any>root).e[symTrackerDetails].parent).toEqual(root);
});

test('track property', () => {
    expect(createTrackerProxy(root)[symTrackerDetails].property).toEqual(undefined);
    expect(createTrackerProxy(root).a[symTrackerDetails].property).toEqual('a');
    expect(createTrackerProxy(root).b[symTrackerDetails].property).toEqual('b');
    expect(createTrackerProxy(root).c[symTrackerDetails].property).toEqual('c');
    expect(createTrackerProxy(root).c.l[symTrackerDetails].property).toEqual('l');
    expect(createTrackerProxy(root).c.m[symTrackerDetails].property).toEqual('m');
    expect(createTrackerProxy(root).d[symTrackerDetails].property).toEqual('d');
    expect(createTrackerProxy(root).d[0][symTrackerDetails].property).toEqual(0);
    expect(createTrackerProxy(root).d[1][symTrackerDetails].property).toEqual(1);
    expect(createTrackerProxy(root).d[2][symTrackerDetails].property).toEqual(2);
    expect(createTrackerProxy(root).d[2].x[symTrackerDetails].property).toEqual('x');
    expect(createTrackerProxy(root).d[2].y[symTrackerDetails].property).toEqual('y');
    expect(createTrackerProxy(<any>root).e[symTrackerDetails].property).toEqual('e');
});
