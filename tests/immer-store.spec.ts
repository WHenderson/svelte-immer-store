import {immerStore} from "../src/immer-store";
import {get} from "svelte/store";

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

    const store = immerStore(original);

    expect(get(store)).toEqual(original);
    expect(get(store.select(root => root.a))).toEqual(original.a);
    expect(get(store.select(root => root.b))).toEqual(original.b);
    expect(get(store.select(root => root.c))).toEqual(original.c);
    expect(get(store.select(root => root.c.x))).toEqual(original.c.x);
    expect(get(store.select(root => root.d))).toEqual(original.d);
    expect(get(store.select(root => root.d[0]))).toEqual(original.d[0]);
    expect(get(store.select(root => root.d[1]))).toEqual(original.d[1]);
    expect(get(store.select(root => root.d[1].y))).toEqual(original.d[1].y);
});
