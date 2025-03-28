# @lynx-js/web-constants

## 0.8.0

### Minor Changes

- refactor: remove web-elements/lazy and loadNewTag ([#123](https://github.com/lynx-family/lynx-stack/pull/123))

  - remove @lynx-js/web-elements/lazy
  - remove loadElement
  - remove loadNewTag callback

  **This is a breaking change**

  Now we removed the default lazy loading preinstalled in web-core

  Please add the following statement in your web project

  ```
  import "@lynx-js/web-elements/all";
  ```

### Patch Changes

- feat: `createRpcEndpoint` adds a new parameter: `hasReturnTransfer`. ([#194](https://github.com/lynx-family/lynx-stack/pull/194))

  When `isSync`: false, `hasReturn`: true, you can add `transfer` to the callback postMessage created.

  At this time, the return value structure of register-handler is changed: `{ data: unknown; transfer: Transferable[]; } | Promise<{ data: unknown; transfer: Transferable[];}>`.

- feat: add two prop of lynx-view about `napiLoader`: ([#173](https://github.com/lynx-family/lynx-stack/pull/173))

  - `napiModulesMap`: [optional] the napiModule which is called in lynx-core. key is module-name, value is esm url.

  - `onNapiModulesCall`: [optional] the NapiModule value handler.

  **Warning:** This is the internal implementation of `@lynx-js/lynx-core`. In most cases, this API is not required for projects.

  1. The `napiModulesMap` value should be a esm url which export default a function with two parameters:

  - `NapiModules`: oriented `napiModulesMap`, which you can use to call other Napi-Modules

  - `NapiModulesCall`: trigger `onNapiModulesCall`

  example:

  ```js
  const color_environment = URL.createObjectURL(
    new Blob(
      [
        `export default function(NapiModules, NapiModulesCall) {
    return {
      getColor() {
        NapiModules.color_methods.getColor({ color: 'green' }, color => {
          console.log(color);
        });
      },
      ColorEngine: class ColorEngine {
        getColor(name) {
          NapiModules.color_methods.getColor({ color: 'green' }, color => {
            console.log(color);
          });
        }
      },
    };
  };`,
      ],
      { type: 'text/javascript' },
    ),
  );

  const color_methods = URL.createObjectURL(
    new Blob(
      [
        `export default function(NapiModules, NapiModulesCall) {
    return {
      async getColor(data, callback) {
        const color = await NapiModulesCall('getColor', data);
        callback(color);
      },
    };
  };`,
      ],
      { type: 'text/javascript' },
    ),
  );

  lynxView.napiModuleMap = {
    color_environment: color_environment,
    color_methods: color_methods,
  };
  ```

  2. The `onNapiModulesCall` function has three parameters:

  - `name`: the first parameter of `NapiModulesCall`, the function name
  - `data`: the second parameter of `NapiModulesCall`, data
  - `moduleName`: the module-name of the called napi-module

  ```js
  lynxView.onNapiModulesCall = (name, data, moduleName) => {
    if (name === 'getColor' && moduleName === 'color_methods') {
      return data.color;
    }
  };
  ```

- Updated dependencies [[`ec4e1ce`](https://github.com/lynx-family/lynx-stack/commit/ec4e1ce0d7612d6c0701792a46c78cd52130bad4)]:
  - @lynx-js/web-worker-rpc@0.8.0

## 0.7.1

### Patch Changes

- Support NPM provenance. ([#30](https://github.com/lynx-family/lynx-stack/pull/30))

- fix: some valus should be updateable by global scope ([#130](https://github.com/lynx-family/lynx-stack/pull/130))

  Now we add an allowlist to allow some identifiers could be updated by globalThis.

  For those values in the allowlist:

  ```
  globalThis.foo = 'xx';
  console.log(foo); //'xx'
  ```

- refractor: improve some internal logic for element creating in MTS ([#71](https://github.com/lynx-family/lynx-stack/pull/71))

- Updated dependencies [[`c617453`](https://github.com/lynx-family/lynx-stack/commit/c617453aea967aba702967deb2916b5c883f03bb)]:
  - @lynx-js/web-worker-rpc@0.7.1

## 0.7.0

### Minor Changes

- 1abf8f0: feat(web):

  **This is a breaking change**

  1. A new param for `lynx-view`: `nativeModulesUrl`, which allows you to pass an esm url to add a new module to `NativeModules`. And we bind the `nativeModulesCall` method to each function on the module, run `this.nativeModulesCall()` to trigger onNativeModulesCall.

  ```typescript
  export type NativeModuleHandlerContext = {
    nativeModulesCall: (name: string, data: Cloneable) => Promise<Cloneable>;
  };
  ```

  a simple case:

  ```js
  lynxView.nativeModules = URL.createObjectURL(
    new Blob(
      [
        `export default {
    myNativeModules: {
      async getColor(data, callback) {
        // trigger onNativeModulesCall and get the result
        const color = await this.nativeModulesCall('getColor', data);
        // return the result to caller
        callback(color);
      },
    }
  };`,
      ],
      { type: 'text/javascript' },
    ),
  );
  ```

  2. `onNativeModulesCall` is no longer the value handler of `NativeModules.bridge.call`, it will be the value handler of all `NativeModules` modules.

  **Warning: This is a breaking change.**

  Before this commit, you listen to `NativeModules.bridge.call('getColor')` like this:

  ```js
  lynxView.onNativeModulesCall = (name, data, callback) => {
    if (name === 'getColor') {
      callback(data.color);
    }
  };
  ```

  Now you should use it like this:

  ```js
  lynxView.onNativeModulesCall = (name, data, moduleName) => {
    if (name === 'getColor' && moduleName === 'bridge') {
      return data.color;
    }
  };
  ```

  You need to use `moduleName` to determine the NativeModules-module. And you don’t need to run callback, just return the result!

### Patch Changes

- @lynx-js/web-worker-rpc@0.7.0

## 0.6.2

### Patch Changes

- 0412db0: fix: The runtime wrapper parameter name is changed from `runtime` to `lynx_runtime`.

  This is because some project logic may use `runtime`, which may cause duplication of declarations.

- 085b99e: feat: add `nativeApp.createJSObjectDestructionObserver`, it is a prerequisite for implementing mts event.
  - @lynx-js/web-worker-rpc@0.6.2

## 0.6.1

### Patch Changes

- 62b7841: feat: add lynx.requireModule in main-thread && \_\_LoadLepusChunk API.

  now the `lynx.requireModule` is available in mts.

  - @lynx-js/web-worker-rpc@0.6.1

## 0.6.0

### Minor Changes

- e406d69: refractor: update output json format

  **This is a breaking change**

  Before this change the style info is dump in Javascript code.

  After this change the style info will be pure JSON data.

  Now we're using the css-serializer tool's output only. If you're using plugins for it, now they're enabled.

### Patch Changes

- @lynx-js/web-worker-rpc@0.6.0

## 0.5.1

### Patch Changes

- c49b1fb: feat: updateData api needs to have the correct format, now you can pass a callback.
- b5ef20e: feat: updateData should also call `updatePage` in main-thread.
  - @lynx-js/web-worker-rpc@0.5.1

## 0.5.0

### Minor Changes

- 7b84edf: feat: introduce new output chunk format

  **This is a breaking change**

  After this commit, we new introduce a new output format for web platform.

  This new output file is a JSON file, includes all essential info.

  Now we'll add the chunk global scope wrapper on runtime, this will help us to provide a better backward compatibility.

  Also we have a intergrated output file cache for one session.

  Now your `output.filename` will work.

  The split-chunk feature has been temporary removed until the rspeedy team supports this feature for us.

### Patch Changes

- 3050faf: refractor: housekeeping
- Updated dependencies [04607bd]
- Updated dependencies [e0f0793]
  - @lynx-js/web-worker-rpc@0.5.0

## 0.4.2

### Patch Changes

- 168b4fa: feat: rename CloneableObject to Cloneable, Now its type refers to a structure that can be cloned; CloneableObject type is added, which only refers to object types that can be cloned.

## 0.4.1

## 0.4.0

## 0.3.1

## 0.3.0

### Minor Changes

- 267c935: feat: make cardType could be configurable

### Patch Changes

- 6e873bc: fix: incorrect parent component id value on publishComponentEvent

## 0.2.0

## 0.1.0

### Minor Changes

- 2973ba5: chore: add common constants
