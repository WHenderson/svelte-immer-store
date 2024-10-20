export declare const symTrackerDetails: unique symbol;
export declare type TrackerProxy<T> = {
    readonly [symTrackerDetails]: {
        value: T;
        parent: object;
        property: PropertyKey;
    };
} & (T extends object ? {
    [P in keyof T]: TrackerProxy<T[P]>;
} : T);
export declare function createTrackerProxy<T>(value: T): TrackerProxy<T>;
export declare function createTrackerProxy<T>(value: T, parent: object, property: PropertyKey): TrackerProxy<T>;
//# sourceMappingURL=tracker.d.ts.map