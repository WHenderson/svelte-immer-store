import { StartStopNotifier, Writable } from "svelte/store";
import { EnqueueChange } from "./history";
export declare const noop: () => void;
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
export declare function immerStore<T>(value: T, start?: StartStopNotifier<T>, record?: EnqueueChange): ImmerStore<T>;
//# sourceMappingURL=immer-store.d.ts.map