/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const NativeModules = require('NativeModules');
const RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');
const UIManager = require('UIManager');

const RCTAccessibilityInfo = NativeModules.AccessibilityInfo;

const REDUCE_MOTION_EVENT = 'reduceMotionDidChange';
const TOUCH_EXPLORATION_EVENT = 'touchExplorationDidChange';

type ChangeEventName = $Enum<{
  change: string,
  reduceMotionChanged: string,
  screenReaderChanged: string,
}>;

const _subscriptions = new Map();

/**
 * Sometimes it's useful to know whether or not the device has a screen reader
 * that is currently active. The `AccessibilityInfo` API is designed for this
 * purpose. You can use it to query the current state of the screen reader as
 * well as to register to be notified when the state of the screen reader
 * changes.
 *
 * See http://facebook.github.io/react-native/docs/accessibilityinfo.html
 */

const AccessibilityInfo = {
  /**
   * iOS only
   */
  isBoldTextEnabled: function(): Promise<boolean> {
    return Promise.resolve(false);
  },

  /**
   * iOS only
   */
  isGrayscaleEnabled: function(): Promise<boolean> {
    return Promise.resolve(false);
  },

  /**
   * iOS only
   */
  isInvertColorsEnabled: function(): Promise<boolean> {
    return Promise.resolve(false);
  },

  isReduceMotionEnabled: function(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      RCTAccessibilityInfo.isReduceMotionEnabled(resolve);
    });
  },

  /**
   * iOS only
   */
  isReduceTransparencyEnabled: function(): Promise<boolean> {
    return Promise.resolve(false);
  },

  isScreenReaderEnabled: function(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      RCTAccessibilityInfo.isTouchExplorationEnabled(resolve);
    });
  },

  /**
   * Deprecated
   *
   * Same as `isScreenReaderEnabled`
   */
  get fetch() {
    return this.isScreenReaderEnabled;
  },

  addEventListener: function(
    eventName: ChangeEventName,
    handler: Function,
  ): void {
    let listener;

    if (eventName === 'change' || eventName === 'screenReaderChanged') {
      listener = RCTDeviceEventEmitter.addListener(
        TOUCH_EXPLORATION_EVENT,
        enabled => {
          handler(enabled);
        },
      );
    } else if (eventName === 'reduceMotionChanged') {
      listener = RCTDeviceEventEmitter.addListener(
        REDUCE_MOTION_EVENT,
        enabled => {
          handler(enabled);
        },
      );
    }

    _subscriptions.set(handler, listener);
  },

  removeEventListener: function(
    eventName: ChangeEventName,
    handler: Function,
  ): void {
    const listener = _subscriptions.get(handler);
    if (!listener) {
      return;
    }
    listener.remove();
    _subscriptions.delete(handler);
  },

  /**
   * Set accessibility focus to a react component.
   *
   * See http://facebook.github.io/react-native/docs/accessibilityinfo.html#setaccessibilityfocus
   */
  setAccessibilityFocus: function(reactTag: number): void {
    UIManager.sendAccessibilityEvent(
      reactTag,
      UIManager.AccessibilityEventTypes.typeViewFocused,
    );
  },
};

module.exports = AccessibilityInfo;
