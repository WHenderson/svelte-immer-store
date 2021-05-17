import {StartStopNotifier, Subscriber, Unsubscriber, Updater, Writable} from "svelte/store";
import {noop} from "svelte/internal";
import {Change, EnqueueChange} from "./history";
import {Action} from "./action";
import produce, {applyPatches, Draft, enablePatches, nothing, Patch, produceWithPatches} from "immer";
import {createPathProxy, PathProxy, symPath} from "./proxy/path";
import {createTrackerProxy, symTrackerDetails, TrackerProxy} from "./proxy/tracker";

export interface BaseImmerStore<T> extends Writable<T> {
    select<D>(property: PropertyKey): SubImmerStore<D>;
    select<D>(path: PropertyKey[]): SubImmerStore<D>;
    select<D>(path: PropertyKey[], relative: number): SubImmerStore<D>;
    select<D>(selector: (v: T) => D): SubImmerStore<D>;

    readonly path: PropertyKey[];
}

export interface ImmerStore<T> extends BaseImmerStore<T> {
}

export interface SubImmerStore<T> extends BaseImmerStore<T> {
    delete(): void;
}

enum ImmerStoreState { Initial, Changed, Deleted }

type ImmerStoreSubscriber<T> = (new_value: T, old_value?: T, state?: ImmerStoreState) => void;

type ImmerStoreInvalidator<T> = (value?: T) => void;

interface ImmerStoreSubscription<T> {
    subscriber: ImmerStoreSubscriber<T>;
    invalidator: ImmerStoreInvalidator<T>;
}

const subscriber_queue: Action[] = [];

export function immerStore<T>(
    value: T,
    start: StartStopNotifier<T> = noop,
    record?: EnqueueChange
) : ImmerStore<T> {

    // store subscriptions
    const subscriptions: ImmerStoreSubscription<T>[] = [];

    // called when subscribers reaches zero
    let stop: Unsubscriber | undefined;

    // current state
    let state: T = produce(value, () => {});

    // record change actions
    function recordChange(change: Change) {
        if (record)
            record(change);
    }

    // record raw state change
    function recordState(new_value: T, old_value: T) {
        recordChange({
            undo() {
                set(old_value);
            },
            redo() {
                set(new_value);
            }
        })
    }

    // turn a selector into a path
    //function findPath(property: PropertyKey): PropertyKey[];
    //function findPath(path: PropertyKey[]): PropertyKey[];
    //function findPath(path: PropertyKey[], relative: number): PropertyKey[];
    //function findPath<D>(selector: (v: T) => D): PropertyKey[];
    function findPath<D>(propertyOrPathOrSelector: PropertyKey | PropertyKey[] | ((v: T) => D), relative?: number): PropertyKey[] {
        if (typeof propertyOrPathOrSelector === 'number' || typeof propertyOrPathOrSelector === 'string' || typeof propertyOrPathOrSelector === 'symbol')
            return [propertyOrPathOrSelector];

        if (Array.isArray(propertyOrPathOrSelector)) {
            if (relative !== undefined && relative !== 0)
                throw new Error('invalid relative path');

            return propertyOrPathOrSelector;
        }

        return (<PathProxy<D>>propertyOrPathOrSelector(createPathProxy<T>()))[symPath];
    }

    // set new state and optionally record using supplied function
    function set(new_value: T, record?: (new_value: T, old_value: T) => void): void {
        if (state !== new_value) {
            const old_value = state;
            state = new_value;

            if (record)
                record(new_value, old_value);

            if (stop) {
                const run_queue = !subscriber_queue.length;

                // invalidate subscriptions and queue subscribers
                for (let i = 0; i < subscriptions.length; i += 1) {
                    const { subscriber, invalidator} = subscriptions[i]!;
                    invalidator(); // invalidate
                    subscriber_queue.push(() => {
                        subscriber(new_value, old_value, ImmerStoreState.Changed)
                    });
                }

                // exhaust the queue
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 1) {
                        subscriber_queue[i]!();
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }

    // update state
    function update(fn: Updater<T>): void {
        const result = produce(
            state,
            draft => {
                const result = fn(<T>draft);

                return (result !== undefined)
                    ? <Draft<T>>result
                    : <Draft<T>><unknown>nothing;
            }
        );

        set(
            result,
            recordState
        );
    }

    // subscribe to store
    function subscribe(run: ImmerStoreSubscriber<T>, invalidate: ImmerStoreInvalidator<T> = noop): Unsubscriber {
        const subscription: ImmerStoreSubscription<T> = {
            subscriber: run,
            invalidator: invalidate
        };

        subscriptions.push(subscription);
        if (subscriptions.length === 1) {
            stop = start(set) || noop;
        }

        run(state, undefined, ImmerStoreState.Initial);

        return () => {
            const index = subscriptions.indexOf(subscription);
            if (index !== -1) {
                subscriptions.splice(index, 1);
            }
            if (subscriptions.length === 0) {
                stop!();
                stop = undefined;
            }
        }
    }

    // create a sub store
    function select<D>(property: PropertyKey): SubImmerStore<D>;
    function select<D>(path: PropertyKey[]): SubImmerStore<D>;
    function select<D>(path: PropertyKey[], relative: number): SubImmerStore<D>;
    function select<D>(selector: (v: T) => D): SubImmerStore<D>;
    function select<D>(propertyOrPathOrSelector: PropertyKey | PropertyKey[] | ((v: T) => D), relative?: number): SubImmerStore<D> {
        // get the selector
        const selector = (() => {
            if (typeof propertyOrPathOrSelector === 'function')
                return propertyOrPathOrSelector;

            if (relative !== undefined && relative !== 0)
                throw new Error('invalid relative path');

            const path = (typeof propertyOrPathOrSelector === 'number' || typeof propertyOrPathOrSelector === 'string' || typeof propertyOrPathOrSelector === 'symbol')
            ? [propertyOrPathOrSelector]
            : propertyOrPathOrSelector;

            return (value: T): D => {
                let node: any = value;
                for (const segment of path) {
                    if (!{}.hasOwnProperty.call(node, segment))
                        node = undefined;
                    else
                        node = node[segment];
                }
                return <D>node;
            }
        })();

        // get the path
        const subPath = findPath<D>(propertyOrPathOrSelector, relative);

        // set the sub-store value
        function subSet(new_value: D) {
            update((old_value: T) => {
                const { value, parent, property } = (<TrackerProxy<D>>selector(createTrackerProxy(old_value)))[symTrackerDetails];
                if (parent) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
                    (<any>parent)[property] = new_value;
                    
                    return old_value;
                }
                else
                if (<T><unknown>value === old_value)
                    return <T><unknown>new_value;

                throw new Error('cannot set value, invalid path');
            });
        }

        // update the sub-store value
        function subUpdate(updater: (old_value: D) => D) {
            update((old_value: T) => {
                const { value, parent, property } = (<TrackerProxy<D>>selector(createTrackerProxy(old_value)))[symTrackerDetails];
                const new_value = updater(selector(old_value));
                if (parent) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
                    (<any>parent)[property] = new_value;

                    return old_value;
                }
                else
                if (<T><unknown>value === old_value)
                    return <T><unknown>new_value;

                throw new Error('cannot update value, invalid path');
            });
        }

        // update the sub-store value
        function subDelete() {
            update((old_value: T) => {
                const { value, parent, property } = (<TrackerProxy<D>>selector(createTrackerProxy(old_value)))[symTrackerDetails];
                if (parent) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
                    delete (<any>parent)[property];

                    return old_value;
                }
                else
                if (<T><unknown>value === old_value)
                    return old_value; // Cannot delete root value

                throw new Error('cannot delete value, invalid path');
            });
        }

        // subscribe
        function subSubscribe(run: Subscriber<D>, invalidate: ImmerStoreInvalidator<D> = noop) {
            return subscribe(
                (new_value, old_value, state) => {
                    const dummy = {};
                    function noTypeError<X>(fn: () => X): X {
                        try {
                            return fn();
                        }
                        catch (ex) {
                            if (ex instanceof TypeError)
                                return <X><unknown>dummy;

                            throw ex;
                        }
                    }

                    const new_sub_value = noTypeError(() => selector(new_value));
                    const old_sub_value = state !== ImmerStoreState.Initial && old_value !== undefined ? noTypeError(() => selector(old_value)) : undefined;

                    if (new_sub_value !== old_sub_value || state === ImmerStoreState.Initial)
                        run(new_sub_value === dummy ? <D><unknown>undefined : new_sub_value);
                },
                () => invalidate
            )
        }

        // create sub-sub-store
        // create a sub store
        function subSelect<V>(property: PropertyKey): SubImmerStore<V>;
        function subSelect<V>(path: PropertyKey[]): SubImmerStore<V>;
        function subSelect<V>(path: PropertyKey[], relative: number): SubImmerStore<V>;
        function subSelect<V>(selector: (v: D) => V): SubImmerStore<V>;
        function subSelect<V>(propertyOrPathOrSelector: PropertyKey | PropertyKey[] | ((v: D) => V), relative?: number): SubImmerStore<V> {
            if (typeof propertyOrPathOrSelector === 'function')
                return select<V>((v: T) => propertyOrPathOrSelector(selector(v)));

            if (typeof propertyOrPathOrSelector === 'string' || typeof propertyOrPathOrSelector === 'number' || typeof propertyOrPathOrSelector === 'symbol')
                return select<V>((v: T) => (<any>selector(v))[propertyOrPathOrSelector]);

            if (relative === undefined || relative === subPath.length)
                return select<V>(propertyOrPathOrSelector);

            if (relative < 0 || relative > subPath.length)
                throw new Error('invalid relative path');

            return select<V>(subPath.slice(0, subPath.length - relative).concat(propertyOrPathOrSelector));
        }

        return {
            set: subSet,
            update: subUpdate,
            delete: subDelete,
            subscribe: subSubscribe,
            select: subSelect,
            path: subPath
        }
    }

    return {
        set: (new_value: T) => set(new_value, recordState),
        update: update,
        subscribe: (run: Subscriber<T>, invalidate?: (value?: T) => void): Unsubscriber => subscribe((new_value) => run(new_value), invalidate),
        select: select,
        path: []
    }
}
