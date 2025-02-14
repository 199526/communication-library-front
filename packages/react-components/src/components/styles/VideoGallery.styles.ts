// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  mergeStyles,
  IStackStyles,
  IModalStyleProps,
  IModalStyles,
  IStyleFunctionOrObject,
  Theme,
  IStyle,
  concatStyleSets,
  IButtonStyles
} from '@fluentui/react';
import { VideoTileStylesProps } from '../VideoTile';
import { HorizontalGalleryStyles } from '../HorizontalGallery';
import { _pxToRem } from '@internal/acs-ui-common';

/**
 * @private
 */
export const videoGalleryOuterDivStyle = mergeStyles({ position: 'relative', width: '100%', height: '100%' });

/**
 * @private
 */
export const videoGalleryContainerStyle: IStackStyles = {
  root: { position: 'relative', height: '100%', width: '100%', padding: '0.5rem' }
};

/**
 * Small floating modal width and height in rem for small screen
 */
export const SMALL_FLOATING_MODAL_SIZE_PX = { width: 64, height: 88 };

/**
 * Large floating modal width and height in rem for large screen
 */
export const LARGE_FLOATING_MODAL_SIZE_PX = { width: 160, height: 120 };

/**
 * @private
 * z-index to ensure that the local video tile is above the video gallery.
 */
export const LOCAL_VIDEO_TILE_ZINDEX = 2;

/**
 * @private
 */
export const floatingLocalVideoModalStyle = (
  theme: Theme,
  isNarrow?: boolean
): IStyleFunctionOrObject<IModalStyleProps, IModalStyles> => {
  return concatStyleSets(
    {
      main: localVideoTileContainerStyle(theme, isNarrow)
    },
    {
      main: {
        boxShadow: theme.effects.elevation8,
        ':focus-within': {
          boxShadow: theme.effects.elevation16,
          border: `${_pxToRem(2)} solid ${theme.palette.neutralPrimary}`
        }
      }
    },
    localVideoModalStyles
  );
};

/**
 * Padding equal to the amount the modal should stay inside the bounds of the container.
 * i.e. if this is 8px, the modal should always be at least 8px inside the container at all times on all sides.
 * @private
 */
export const localVideoTileOuterPaddingPX = 8;

/**
 * @private
 */
export const localVideoTileContainerStyle = (theme: Theme, isNarrow?: boolean): IStyle => {
  return {
    minWidth: isNarrow ? _pxToRem(SMALL_FLOATING_MODAL_SIZE_PX.width) : _pxToRem(LARGE_FLOATING_MODAL_SIZE_PX.width),
    minHeight: isNarrow ? _pxToRem(SMALL_FLOATING_MODAL_SIZE_PX.height) : _pxToRem(LARGE_FLOATING_MODAL_SIZE_PX.height),
    position: 'absolute',
    bottom: _pxToRem(localVideoTileOuterPaddingPX),
    borderRadius: theme.effects.roundedCorner4,
    overflow: 'hidden',
    ...(theme.rtl
      ? { left: _pxToRem(localVideoTileOuterPaddingPX) }
      : { right: _pxToRem(localVideoTileOuterPaddingPX) })
  };
};

/**
 * @private
 */
export const localVideoTileWithControlsContainerStyle = (theme: Theme, isNarrow?: boolean): IStackStyles => {
  return concatStyleSets(localVideoTileContainerStyle(theme, isNarrow), {
    root: { boxShadow: theme.effects.elevation8 }
  });
};

/**
 * @private
 */
export const floatingLocalVideoTileStyle: VideoTileStylesProps = {
  root: {
    position: 'absolute',
    zIndex: LOCAL_VIDEO_TILE_ZINDEX,
    height: '100%',
    width: '100%'
  }
};

/**
 * @private
 */
export const horizontalGalleryContainerStyle = (shouldFloatLocalVideo: boolean, isNarrow: boolean): IStyle => {
  return {
    minHeight: isNarrow
      ? `${SMALL_HORIZONTAL_GALLERY_TILE_SIZE_REM.height}rem`
      : `${LARGE_HORIZONTAL_GALLERY_TILE_SIZE_REM.height}rem`,
    width: shouldFloatLocalVideo
      ? isNarrow
        ? `calc(100% - ${_pxToRem(SMALL_FLOATING_MODAL_SIZE_PX.width)})`
        : `calc(100% - ${_pxToRem(LARGE_FLOATING_MODAL_SIZE_PX.width)})`
      : '100%',
    paddingRight: '0.5rem'
  };
};

/**
 * @private
 */
export const horizontalGalleryStyle = (isNarrow: boolean): HorizontalGalleryStyles => {
  return {
    children: isNarrow ? SMALL_HORIZONTAL_GALLERY_TILE_STYLE : LARGE_HORIZONTAL_GALLERY_TILE_STYLE
  };
};

/**
 * Small horizontal gallery tile size in rem
 * @private
 */
export const SMALL_HORIZONTAL_GALLERY_TILE_SIZE_REM = { height: 5.5, width: 5.5 };
/**
 * Large horizontal gallery tile size in rem
 * @private
 */
export const LARGE_HORIZONTAL_GALLERY_TILE_SIZE_REM = { height: 7.5, width: 10 };

/**
 * @private
 */
export const SMALL_HORIZONTAL_GALLERY_TILE_STYLE = {
  minHeight: `${SMALL_HORIZONTAL_GALLERY_TILE_SIZE_REM.height}rem`,
  minWidth: `${SMALL_HORIZONTAL_GALLERY_TILE_SIZE_REM.width}rem`,
  maxHeight: `${SMALL_HORIZONTAL_GALLERY_TILE_SIZE_REM.height}rem`,
  maxWidth: `${SMALL_HORIZONTAL_GALLERY_TILE_SIZE_REM.width}rem`
};
/**
 * @private
 */
export const LARGE_HORIZONTAL_GALLERY_TILE_STYLE = {
  minHeight: `${LARGE_HORIZONTAL_GALLERY_TILE_SIZE_REM.height}rem`,
  minWidth: `${LARGE_HORIZONTAL_GALLERY_TILE_SIZE_REM.width}rem`,
  maxHeight: `${LARGE_HORIZONTAL_GALLERY_TILE_SIZE_REM.height}rem`,
  maxWidth: `${LARGE_HORIZONTAL_GALLERY_TILE_SIZE_REM.width}rem`
};

/**
 * @private
 */
export const layerHostStyle: IStyle = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  // pointer events for layerHost set to none to make descendants interactive
  pointerEvents: 'none'
};

/**
 * @private
 */
export const localVideoCameraCycleButtonStyles = (theme: Theme): IButtonStyles => {
  return {
    root: {
      position: 'absolute',
      width: _pxToRem(32),
      height: _pxToRem(32),
      right: '0rem',
      top: '0rem',
      color: '#FFFFFF', // only shows up on running video feed to we want to force specific colours.
      zIndex: 2, // shows the button directly over the local video feed.
      background: 'rgba(0,0,0,0.4)',
      borderRadius: theme.effects.roundedCorner2
    },
    rootFocused: {
      // styles to remove the unwanted white highlight and blue colour after tapping on button.
      color: '#FFFFFF',
      background: 'rgba(0,0,0,0.4)' // sets opacity of background to be visible on all backdrops in video stream.
    },
    icon: {
      paddingLeft: _pxToRem(3),
      paddingRight: _pxToRem(3),
      margin: 0
    },
    flexContainer: {
      paddingBottom: _pxToRem(8)
    }
  };
};

/**
 * Styles for the local video tile modal when it is focused, will cause keyboard move icon to appear over video
 * @private
 */
export const localVideoModalStyles: Partial<IModalStyles> = {
  keyboardMoveIconContainer: {
    zIndex: LOCAL_VIDEO_TILE_ZINDEX + 1 // zIndex to set the keyboard movement Icon above the other layers in the video tile.
  }
};
