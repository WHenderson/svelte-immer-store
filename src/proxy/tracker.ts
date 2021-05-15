/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/ban-types */
export const symDetails = Symbol('details');

export type Tracker<T> = {
    readonly [symDetails]: {
        value: T;
        parent: object;
        property: PropertyKey;
    };
} & (
    T extends object
    ? { [ P in keyof T]: Tracker<T[P]> }
    : T
);

export function createTrackerProxy<T>(
    value: T
) : Tracker<T>;

export function createTrackerProxy<T>(
    value: T,
    parent: object,
    property: PropertyKey
) : Tracker<T>;

export function createTrackerProxy<T>(
    value: T,
    parent?: object,
    property?: PropertyKey
) : Tracker<T> {
    const details = { value, parent, property };

    return <Tracker<T>><unknown>new Proxy(
        {},
        {
            get(target: never, p: PropertyKey, receiver: never) {
                if (p === symDetails)
                    return details;

                const result = (() => {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        const result: object = Reflect.get(<object><unknown>value, p, receiver);
                        if (result && typeof result === 'object')
                            return result;
                    }
                    catch (ex) {
                        return;
                    }
                    return;
                })();

                return createTrackerProxy(result, <object><unknown>(value && typeof value === 'object' ? value : undefined), p);
            }
        }
    );
}
