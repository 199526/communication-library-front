// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DeviceManagerState } from '@internal/calling-stateful-client';
import * as reselect from 'reselect';
import { getDeviceManager } from './baseSelectors';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function selectLocalPreview(deviceManager: DeviceManagerState) {
  // TODO: we should take in a LocalVideoStream that developer wants to use as their 'Preview' view. We should also
  // handle cases where 'Preview' view is in progress and not necessary completed.
  const view = deviceManager.unparentedViews.length > 0 && deviceManager.unparentedViews[0].view;
  return {
    videoStreamElement: view ? view.target : null
  };
}

/**
 * @private
 */
export const localPreviewSelector = reselect.createSelector([getDeviceManager], selectLocalPreview);
