import { immerStore } from '../src';

it('primitive usage', () => {
    const count = immerStore(0);

    count.subscribe(value => {
        console.log(value);
    }); // logs '0'

    count.set(1); // logs '1'

    count.update(n => n + 1); // logs '2'
});

it('on-demand usage', () => {
    const count = immerStore(0, () => {
        console.log('got a subscriber');
        return () => console.log('no more subscribers');
    });

    count.set(1); // does nothing

    const unsubscribe = count.subscribe(value => {
        console.log(value);
    }); // logs 'got a subscriber', then '1'

    unsubscribe(); // logs 'no more subscribers'
});

it.only('immer showcase', () => {
    const root = immerStore({ count: 1, object: { value: 2 } });

    // Subscribe to any member of the object tree
    // Note that the type information is maintained
    root.select(root => root.object).subscribe(object => {
        console.log(object)
    }); // logs '{ value: 2 }'

    root.update(root => {
        root.count += 1;
        return root;
    }); // does not cause a change in object and thus does not trigger the above logging

    root.update(root => {
        root.object.value += 1;
        return root;
    }); // logs '{ value: 3 }'
});
