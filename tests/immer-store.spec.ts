import {get} from "svelte/store";
import * as util from "util";
import {noop} from "svelte/internal";
import {History, immerStore} from "../src";

it('primitive types', () => {
    const store = immerStore(1);

    expect(get(store)).toEqual(1);

    store.set(2);

    expect(get(store)).toEqual(2);

    store.update(x => x + 3);

    expect(get(store)).toEqual(2 + 3);

    expect(store.path).toEqual([]);

    const subStore = store.select(x => (<any>x).y);

    expect(get(subStore)).toBeUndefined();
    expect(subStore.path).toEqual(['y']);

    expect(() => subStore.set(5)).toThrow('cannot set value, invalid path');
    expect(() => subStore.update(x => x + 7)).toThrow('cannot update value, invalid path');
    expect(() => subStore.delete()).toThrow('cannot delete value, invalid path');
});

it('complex types', () => {
    const original = {
        a: 1,
        b: 2,
        c: {
            x: 3
        },
        d: <[number, { y: number }]>[
            5,
            {
                y: 7
            }
        ]
    };

    const history = new History();

    const store = immerStore(original, noop, history.enqueue);

    expect(get(store)).toEqual(original);
    expect(get(store.select(root => root.a))).toEqual(original.a);
    expect(get(store.select(root => root.b))).toEqual(original.b);
    expect(get(store.select(root => root.c))).toEqual(original.c);
    expect(get(store.select(root => root.c.x))).toEqual(original.c.x);
    expect(get(store.select(root => root.d))).toEqual(original.d);
    expect(get(store.select(root => root.d[0]))).toEqual(original.d[0]);
    expect(get(store.select(root => root.d[1]))).toEqual(original.d[1]);
    expect(get(store.select(root => root.d[1].y))).toEqual(original.d[1].y);
    expect(get(store.select(root => root.d).select(d => d[1].y))).toEqual(original.d[1].y);
    expect(get(store.select(root => root.d[1]).select('y'))).toEqual(original.d[1].y);
    expect(get(store.select(root => root.d[1]).select([0], 1))).toEqual(original.d[0]);

    expect(store.select(root => root.d[1].y).path).toEqual(['d',1,'y']);
    expect(store.select(root => root.d).select(d => d[1].y).path).toEqual(['d',1,'y']);
    expect(store.select(root => root.d[1]).select('y').path).toEqual(['d',1,'y']);
    expect(store.select(root => root.d[1]).select([0], 1).path).toEqual(['d',0]);

    const mockR = jest.fn();
    const mockA = jest.fn();
    const mockC = jest.fn();
    const mockY = jest.fn();

    const storeA = store.select(r => r.a);
    const storeC = store.select(r => r.c);
    const storeY = store.select(r => r.d[1].y);

    store.subscribe(mockR);
    storeA.subscribe(mockA);
    storeC.subscribe(mockC);
    storeY.subscribe(mockY);

    storeY.set(11);

    expect(mockR.mock.calls[1][0]).not.toStrictEqual(original);
    expect(mockR.mock.calls[1][0].d[1].y).toEqual(11);
    expect(mockY.mock.calls[1][0]).toEqual(11);

    storeC.update(c => { c.x = 13; return c } );

    expect(mockR.mock.calls[2][0].c.x).toEqual(13);
    expect(mockR.mock.calls.length).toEqual(3);

    storeA.update(a => a + 17);

    expect(mockR.mock.calls[3][0].a).toEqual(original.a + 17);
    expect(mockR.mock.calls.length).toEqual(4);

    store.set({
        a: 19,
        b: 19,
        c: {
            x: 19
        },
        d: [
            19,
            {
                y: 19
            }
        ]
    });

    expect(mockR.mock.calls[4][0].a).toEqual(19);
    expect(mockR.mock.calls.length).toEqual(5);

    expect(history.count).toEqual(4);

    history.undo();

    expect(mockR.mock.calls[5][0].a).toEqual(18);

    history.undo();

    expect(mockR.mock.calls[6][0].c.x).toEqual(13);

    history.undo();

    expect(mockR.mock.calls[7][0].d[1].y).toEqual(11);

    history.undo();

    expect(history.canUndo).toBeFalsy();

    expect(mockR.mock.calls[8][0]).toStrictEqual(original);
});
