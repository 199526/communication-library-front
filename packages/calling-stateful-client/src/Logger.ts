// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { createClientLogger } from '@azure/logger';

/**
 * @private
 */
export const callingStatefulLogger = createClientLogger('communication-react:calling-stateful');

/**
 * @private
 */
export enum EventNames {
  // Info
  LOCAL_VIEW_RENDER_SUCCEED = 'LOCAL_VIEW_RENDER_SUCCEED',
  START_DISPOSE_LOCAL_STREAM = 'START_DISPOSE_LOCAL_STREAM',
  START_LOCAL_STREAM_RENDERING = 'START_LOCAL_STREAM_RENDERING',
  DISPOSING_REMOTE_RENDERER = 'DISPOSING_REMOTE_RENDERER',
  CREATING_REMOTE_VIEW = 'CREATING_REMOTE_VIEW',
  REMOTE_VIEW_RENDER_SUCCEED = 'REMOTE_VIEW_RENDER_SUCCEED',
  // Warning
  LOCAL_STREAM_ALREADY_RENDERED = 'LOCAL_STREAM_ALREADY_RENDERED',
  LOCAL_STREAM_STOPPING = 'LOCAL_STREAM_STOPPING',
  LOCAL_CREATED_STREAM_STOPPING = 'LOCAL_CREATED_STREAM_STOPPING',
  LOCAL_STREAM_RENDERING = 'LOCAL_STREAM_RENDERING',
  REMOTE_STREAM_ALREADY_RENDERED = 'REMOTE_STREAM_ALREADY_RENDERED',
  REMOTE_STREAM_RENDERING = 'REMOTE_STREAM_RENDERING',
  REMOTE_STREAM_STOPPING = 'REMOTE_STREAM_STOPPING',
  // Error
  LOCAL_STREAM_NOT_FOUND = 'LOCAL_STREAM_NOT_FOUND',
  LOCAL_RENDER_INFO_NOT_FOUND = 'LOCAL_RENDER_INFO_NOT_FOUND',
  REMOTE_STREAM_NOT_FOUND = 'REMOTE_STREAM_NOT_FOUND',
  REMOTE_DISPOSE_INFO_NOT_FOUND = 'REMOTE_DISPOSE_INFO_NOT_FOUND',
  REMOTE_RENDER_INFO_NOT_FOUND = 'REMOTE_RENDER_INFO_NOT_FOUND',
  REMOTE_RENDERER_NOT_FOUND = 'REMOTE_RENDERER_NOT_FOUND',

  CREATE_REMOTE_STREAM_FAIL = 'CREATE_REMOTE_STREAM_FAIL',
  CREATE_LOCAL_STREAM_FAIL = 'CREATE_LOCAL_STREAM_FAIL'
}
