import produce, { nothing } from "immer";
import { createPathProxy, symPath } from "./proxy/path";
import { createTrackerProxy, symTrackerDetails } from "./proxy/tracker";
export const noop = () => { };
var ImmerStoreState;
(function (ImmerStoreState) {
    ImmerStoreState[ImmerStoreState["Initial"] = 0] = "Initial";
    ImmerStoreState[ImmerStoreState["Changed"] = 1] = "Changed";
    ImmerStoreState[ImmerStoreState["Deleted"] = 2] = "Deleted";
})(ImmerStoreState || (ImmerStoreState = {}));
const subscriber_queue = [];
export function immerStore(value, start = noop, record) {
    // store subscriptions
    const subscriptions = [];
    // called when subscribers reaches zero
    let stop;
    // current state
    let state = produce(value, () => { });
    // record change actions
    function recordChange(change) {
        if (record)
            record(change);
    }
    // record raw state change
    function recordState(new_value, old_value) {
        recordChange({
            undo() {
                set(old_value);
            },
            redo() {
                set(new_value);
            }
        });
    }
    // turn a selector into a path
    //function findPath(property: PropertyKey): PropertyKey[];
    //function findPath(path: PropertyKey[]): PropertyKey[];
    //function findPath(path: PropertyKey[], relative: number): PropertyKey[];
    //function findPath<D>(selector: (v: T) => D): PropertyKey[];
    function findPath(propertyOrPathOrSelector, relative) {
        if (typeof propertyOrPathOrSelector === 'number' || typeof propertyOrPathOrSelector === 'string' || typeof propertyOrPathOrSelector === 'symbol')
            return [propertyOrPathOrSelector];
        if (Array.isArray(propertyOrPathOrSelector)) {
            if (relative !== undefined && relative !== 0)
                throw new Error('invalid relative path');
            return propertyOrPathOrSelector;
        }
        return propertyOrPathOrSelector(createPathProxy())[symPath];
    }
    // set new state and optionally record using supplied function
    function set(new_value, record) {
        if (state !== new_value) {
            const old_value = state;
            state = new_value;
            if (record)
                record(new_value, old_value);
            if (stop) {
                const run_queue = !subscriber_queue.length;
                // invalidate subscriptions and queue subscribers
                for (let i = 0; i < subscriptions.length; i += 1) {
                    const { subscriber, invalidator } = subscriptions[i];
                    invalidator(); // invalidate
                    subscriber_queue.push(() => {
                        subscriber(new_value, old_value, ImmerStoreState.Changed);
                    });
                }
                // exhaust the queue
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 1) {
                        subscriber_queue[i]();
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    // update state
    function update(fn) {
        const result = produce(state, draft => {
            const result = fn(draft);
            return (result !== undefined)
                ? result
                : nothing;
        });
        set(result, recordState);
    }
    // subscribe to store
    function subscribe(run, invalidate = noop) {
        const subscription = {
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
                stop();
                stop = undefined;
            }
        };
    }
    function select(propertyOrPathOrSelector, relative) {
        // get the selector
        const selector = (() => {
            if (typeof propertyOrPathOrSelector === 'function')
                return propertyOrPathOrSelector;
            if (relative !== undefined && relative !== 0)
                throw new Error('invalid relative path');
            const path = (typeof propertyOrPathOrSelector === 'number' || typeof propertyOrPathOrSelector === 'string' || typeof propertyOrPathOrSelector === 'symbol')
                ? [propertyOrPathOrSelector]
                : propertyOrPathOrSelector;
            return (value) => {
                let node = value;
                for (const segment of path) {
                    if (!{}.hasOwnProperty.call(node, segment))
                        node = undefined;
                    else
                        node = node[segment];
                }
                return node;
            };
        })();
        // get the path
        const subPath = findPath(propertyOrPathOrSelector, relative);
        // set the sub-store value
        function subSet(new_value) {
            update((old_value) => {
                const { value, parent, property } = selector(createTrackerProxy(old_value))[symTrackerDetails];
                if (parent) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
                    parent[property] = new_value;
                    return old_value;
                }
                else if (value === old_value)
                    return new_value;
                throw new Error('cannot set value, invalid path');
            });
        }
        // update the sub-store value
        function subUpdate(updater) {
            update((old_value) => {
                const { value, parent, property } = selector(createTrackerProxy(old_value))[symTrackerDetails];
                const new_value = updater(selector(old_value));
                if (parent) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
                    parent[property] = new_value;
                    return old_value;
                }
                else if (value === old_value)
                    return new_value;
                throw new Error('cannot update value, invalid path');
            });
        }
        // update the sub-store value
        function subDelete() {
            update((old_value) => {
                const { value, parent, property } = selector(createTrackerProxy(old_value))[symTrackerDetails];
                if (parent) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
                    delete parent[property];
                    return old_value;
                }
                else if (value === old_value)
                    return old_value; // Cannot delete root value
                throw new Error('cannot delete value, invalid path');
            });
        }
        // subscribe
        function subSubscribe(run, invalidate = noop) {
            return subscribe((new_value, old_value, state) => {
                const dummy = {};
                function noTypeError(fn) {
                    try {
                        return fn();
                    }
                    catch (ex) {
                        if (ex instanceof TypeError)
                            return dummy;
                        throw ex;
                    }
                }
                const new_sub_value = noTypeError(() => selector(new_value));
                const old_sub_value = state !== ImmerStoreState.Initial && old_value !== undefined ? noTypeError(() => selector(old_value)) : undefined;
                if (new_sub_value !== old_sub_value || state === ImmerStoreState.Initial)
                    run(new_sub_value === dummy ? undefined : new_sub_value);
            }, () => invalidate);
        }
        function subSelect(propertyOrPathOrSelector, relative) {
            if (typeof propertyOrPathOrSelector === 'function')
                return select((v) => propertyOrPathOrSelector(selector(v)));
            if (typeof propertyOrPathOrSelector === 'string' || typeof propertyOrPathOrSelector === 'number' || typeof propertyOrPathOrSelector === 'symbol')
                return select((v) => selector(v)[propertyOrPathOrSelector]);
            if (relative === undefined || relative === subPath.length)
                return select(propertyOrPathOrSelector);
            if (relative < 0 || relative > subPath.length)
                throw new Error('invalid relative path');
            return select(subPath.slice(0, subPath.length - relative).concat(propertyOrPathOrSelector));
        }
        return {
            set: subSet,
            update: subUpdate,
            delete: subDelete,
            subscribe: subSubscribe,
            select: subSelect,
            path: subPath
        };
    }
    return {
        set: (new_value) => set(new_value, recordState),
        update: update,
        subscribe: (run, invalidate) => subscribe((new_value) => run(new_value), invalidate),
        select: select,
        path: []
    };
}
//# sourceMappingURL=immer-store.js.map