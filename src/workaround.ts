// Hack to get immer.js working
// https://github.com/immerjs/immer/issues/557
// https://github.com/immerjs/immer/issues/557
if (typeof window === 'object') {
    ((window.process ??= <any>{}).env ??= {}).NODE_ENV ??= "production";
}
