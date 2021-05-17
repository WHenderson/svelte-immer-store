import {History, immerStore} from '../src';
import {noop} from "svelte/internal";

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

it('object', () => {
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

it('store history', () => {
    const history = new History();
    const count = immerStore(0, noop, history.enqueue);

    count.subscribe(value => {
        console.log(value);
    }); // logs '0'

    count.set(1); // logs '1'

    count.update(n => n + 1); // logs '2'

    history.undo(); // logs '1'

    history.undo(); // logs '0'

    history.redo(); // logs '1'
});


it.only('select', () => {
    const root = immerStore({count: 1, object: {value: 2}});

    const count = root.select(root => root.count);
    const object = root.select(root => root.object);

    // each of these is equivalent
    //const value = object.select(['value'], 0); // relative path
    //const value = object.select(['object', 'value']); // absolute path
    //const value = object.select('value'); // property
    const value = object.select(object => object.value); // selector
    //const value = root.select(root => root.object.value); // selector

    object.subscribe(object => {
        console.log(object);
    }); // logs '{ value: 2 }'

    count.set(2); // does not log anything

    value.set(3); // logs '{ value: 3 }'
});
