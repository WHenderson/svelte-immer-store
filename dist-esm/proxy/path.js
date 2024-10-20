/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/ban-types */
export const symPath = Symbol('details');
export function createPathProxy(path = []) {
    return new Proxy({}, {
        get(target, p, receiver) {
            if (p === symPath)
                return path;
            // Note: p is never left as a string by the Proxy, so we have to assume that a string which looks like a number /is/ a number.
            const prop = (typeof p === 'string' && /^(0|[1-9][0-9]*)$/.test(p))
                ? parseInt(p, 10)
                : p;
            return createPathProxy([...path, prop]);
        }
    });
}
//# sourceMappingURL=path.js.map