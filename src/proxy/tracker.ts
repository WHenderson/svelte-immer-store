/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/ban-types */
export const symTrackerDetails = Symbol('details');

export type TrackerProxy<T> = {
    readonly [symTrackerDetails]: {
        value: T;
        parent: object;
        property: PropertyKey;
    };
} & (
    T extends object
        ? { [ P in keyof T]: TrackerProxy<T[P]> }
        : T
);

export function createTrackerProxy<T>(
    value: T
) : TrackerProxy<T>;

export function createTrackerProxy<T>(
    value: T,
    parent: object,
    property: PropertyKey
) : TrackerProxy<T>;

export function createTrackerProxy<T>(
    value: T,
    parent?: object,
    property?: PropertyKey
) : TrackerProxy<T> {
    const details = { value, parent, property };

    return <TrackerProxy<T>><unknown>new Proxy(
        {},
        {
            get(target: never, p: PropertyKey, receiver: never) {
                if (p === symTrackerDetails)
                    return details;

                const result = (() => {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        return <object>Reflect.get(<object><unknown>value, p, receiver);
                    }
                    catch (ex) {
                        return;
                    }
                })();

                // Note: p is never left as a string by the Proxy, so we have to assume that a string which looks like a number /is/ a number.
                const prop = (typeof p === 'string' && Array.isArray(value) && /^(0|[1-9][0-9]*)$/.test(p))
                    ? parseInt(p, 10)
                    : p;

                return createTrackerProxy(result, <object><unknown>(value && typeof value === 'object' ? value : undefined), prop);
            }
        }
    );
}
