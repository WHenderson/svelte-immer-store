export declare const symPath: unique symbol;
export declare type PathProxy<T> = {
    readonly [symPath]: PropertyKey[];
} & (T extends object ? {
    [P in keyof T]: PathProxy<T[P]>;
} : T);
export declare function createPathProxy<T = any>(path?: PropertyKey[]): PathProxy<T>;
//# sourceMappingURL=path.d.ts.map