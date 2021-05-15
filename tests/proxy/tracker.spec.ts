import {createTrackerProxy, symDetails} from "../../src/proxy/tracker";

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


it('track values', () => {
    expect(createTrackerProxy(root)[symDetails].value).toEqual(root);
    expect(createTrackerProxy(root).a[symDetails].value).toEqual(root.a);
    expect(createTrackerProxy(root).b[symDetails].value).toEqual(root.b);
    expect(createTrackerProxy(root).c[symDetails].value).toEqual(root.c);
    expect(createTrackerProxy(root).c.l[symDetails].value).toEqual(root.c.l);
    expect(createTrackerProxy(root).c.m[symDetails].value).toEqual(root.c.m);
    expect(createTrackerProxy(root).d[symDetails].value).toEqual(root.d);
    expect(createTrackerProxy(root).d[0][symDetails].value).toEqual(root.d[0]);
    expect(createTrackerProxy(root).d[1][symDetails].value).toEqual(root.d[1]);
    expect(createTrackerProxy(root).d[2][symDetails].value).toEqual(root.d[2]);
    expect(createTrackerProxy(root).d[2].x[symDetails].value).toEqual(root.d[2].x);
    expect(createTrackerProxy(root).d[2].y[symDetails].value).toEqual(root.d[2].y);
    expect(createTrackerProxy(<any>root).e[symDetails].value).toBeUndefined();
});

it('track parent', () => {
    expect(createTrackerProxy(root)[symDetails].parent).toBeUndefined();
    expect(createTrackerProxy(root).a[symDetails].parent).toEqual(root);
    expect(createTrackerProxy(root).b[symDetails].parent).toEqual(root);
    expect(createTrackerProxy(root).c[symDetails].parent).toEqual(root);
    expect(createTrackerProxy(root).c.l[symDetails].parent).toEqual(root.c);
    expect(createTrackerProxy(root).c.m[symDetails].parent).toEqual(root.c);
    expect(createTrackerProxy(root).d[symDetails].parent).toEqual(root);
    expect(createTrackerProxy(root).d[0][symDetails].parent).toEqual(root.d);
    expect(createTrackerProxy(root).d[1][symDetails].parent).toEqual(root.d);
    expect(createTrackerProxy(root).d[2][symDetails].parent).toEqual(root.d);
    expect(createTrackerProxy(root).d[2].x[symDetails].parent).toEqual(root.d[2]);
    expect(createTrackerProxy(root).d[2].y[symDetails].parent).toEqual(root.d[2]);
    expect(createTrackerProxy(<any>root).e[symDetails].parent).toEqual(root);
});

it('track property', () => {
    expect(createTrackerProxy(root)[symDetails].property).toEqual(undefined);
    expect(createTrackerProxy(root).a[symDetails].property).toEqual('a');
    expect(createTrackerProxy(root).b[symDetails].property).toEqual('b');
    expect(createTrackerProxy(root).c[symDetails].property).toEqual('c');
    expect(createTrackerProxy(root).c.l[symDetails].property).toEqual('l');
    expect(createTrackerProxy(root).c.m[symDetails].property).toEqual('m');
    expect(createTrackerProxy(root).d[symDetails].property).toEqual('d');
    expect(createTrackerProxy(root).d[0][symDetails].property).toEqual(0);
    expect(createTrackerProxy(root).d[1][symDetails].property).toEqual(1);
    expect(createTrackerProxy(root).d[2][symDetails].property).toEqual(2);
    expect(createTrackerProxy(root).d[2].x[symDetails].property).toEqual('x');
    expect(createTrackerProxy(root).d[2].y[symDetails].property).toEqual('y');
    expect(createTrackerProxy(<any>root).e[symDetails].property).toEqual('e');
});
