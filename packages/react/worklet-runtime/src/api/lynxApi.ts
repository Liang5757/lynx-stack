// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import { querySelector, querySelectorAll } from './lepusQuerySelector.js';
import { isSdkVersionGt } from '../utils/version.js';

function initApiEnv(): void {
  // @ts-ignore
  lynx.querySelector = querySelector;
  // @ts-ignore
  lynx.querySelectorAll = querySelectorAll;
  // @ts-ignore
  globalThis.setTimeout = lynx.setTimeout;
  // @ts-ignore
  globalThis.setInterval = lynx.setInterval;
  // @ts-ignore
  globalThis.clearTimeout = lynx.clearTimeout;
  // In lynx 2.14 `clearInterval` is mistakenly spelled as `clearTimeInterval`. This is fixed in lynx 2.15.
  // @ts-ignore
  globalThis.clearInterval = lynx.clearInterval ?? lynx.clearTimeInterval;

  {
    // @ts-ignore
    const requestAnimationFrame = lynx.requestAnimationFrame;
    // @ts-ignore
    lynx.requestAnimationFrame = globalThis.requestAnimationFrame = (
      callback: () => {},
    ) => {
      if (!isSdkVersionGt(2, 15)) {
        throw new Error(
          'requestAnimationFrame in main thread script requires Lynx sdk version 2.16',
        );
      }
      return requestAnimationFrame(callback);
    };
  }

  // @ts-ignore
  globalThis.cancelAnimationFrame = lynx.cancelAnimationFrame;
}

export { initApiEnv };
