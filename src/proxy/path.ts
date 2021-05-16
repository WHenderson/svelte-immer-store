/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/ban-types */
export const symPath = Symbol('details');

export type PathProxy<T> = {
    readonly [symPath]: PropertyKey[];
} & (
    T extends object
        ? { [ P in keyof T]: PathProxy<T[P]> }
        : T
);

export function createPathProxy<T = any>(
    path: PropertyKey[] = []
) : PathProxy<T> {
    return <PathProxy<T>><unknown>new Proxy(
        {},
        {
            get(target: never, p: string | symbol, receiver: never) {
                if (p === symPath)
                    return path;

                // Note: p is never left as a string by the Proxy, so we have to assume that a string which looks like a number /is/ a number.
                const prop = (typeof p === 'string' && /^(0|[1-9][0-9]*)$/.test(p))
                    ? parseInt(p, 10)
                    : p;

                return createPathProxy([...path, prop]);
            }
        }
    );
}
