// © Microsoft Corporation. All rights reserved.

import { CallVideoIcon, MicIcon } from '@fluentui/react-icons-northstar';
import { Stack, Toggle, Image, ImageFit, IImageStyles } from '@fluentui/react';
import React, { useEffect } from 'react';
import { LocalVideoStream } from '@azure/communication-calling';
import {
  localPreviewContainerStyle,
  toggleButtonsBarStyle,
  toggleButtonsBarToken,
  toggleStyle
} from './styles/LocalPreview.styles';
import { MapToMediaControlsProps, MediaControlsContainerProps } from './consumers/MapToMediaControlsProps';
import {
  connectFuncsToContext,
  MapToLocalDeviceSettingsProps,
  LocalDeviceSettingsContainerProps,
  MapToErrorBarProps,
  MapToLocalVideoProps
} from '../../consumers';
import { StreamMedia, VideoTile, ErrorBar as ErrorBarComponent } from '../../components';
import staticMediaSVG from './assets/staticmedia.svg';
import { useCallContext } from '../../providers';
import { ErrorHandlingProps } from '../../providers/ErrorProvider';
import { WithErrorHandling } from '../../utils/WithErrorHandling';
import { CommunicationUiErrorFromError } from '../../types/CommunicationUiError';

const staticAvatarStyle: Partial<IImageStyles> = {
  image: { maxWidth: '10rem', maxHeight: '10rem', width: '100%', height: '100%' },
  root: { flexGrow: 1 }
};

const imageProps = {
  src: staticMediaSVG.toString(),
  imageFit: ImageFit.contain,
  maximizeFrame: true
};

export interface LocalPreviewProps extends LocalDeviceSettingsContainerProps, ErrorHandlingProps {
  localVideoElement: HTMLElement | undefined;
  localVideoStream: LocalVideoStream | undefined;
  /** Determines if video toggle button should be disabled. */
  localVideoBusy: boolean;
  /** Callback when video is toggled. */
  toggleLocalVideo: () => Promise<void>;
  /** Callback when microphone is toggled. */
  toggleMicrophone: () => Promise<void>;
  renderLocalVideo: () => Promise<void>;
}

const LocalPreviewComponentBase = (
  // props: MediaControlsContainerProps & LocalDeviceSettingsContainerProps & ErrorHandlingProps
  props: LocalPreviewProps
): JSX.Element => {
  const {
    localVideoElement,
    localVideoStream,
    audioDeviceList,
    audioDeviceInfo,
    videoDeviceList,
    videoDeviceInfo,
    renderLocalVideo,
    localVideoBusy
  } = props;
  const isAudioDisabled = !audioDeviceInfo || audioDeviceList.length === 0;
  const isVideoDisabled = !videoDeviceInfo || videoDeviceList.length === 0 || localVideoBusy;
  // get the stream in here instead of the mapper for now
  // we haven't properly properly exported this component to make it re-usable
  // we should create a MapToLocalPreviewProps, instead of using MapToMediaControlsProps and MapToLocalDeviceSettingsProps
  // const { localVideoStream } = useCallContext();

  // const { isVideoReady, videoStreamElement } = MapToLocalVideoProps({
  //   stream: localVideoStream,
  //   scalingMode: 'Crop'
  // });

  useEffect(() => {
    // fire and forget
    renderLocalVideo();

    // fake depedency on localVideoStream
    const _triggerMe = !!localVideoStream;
  }, [localVideoStream, renderLocalVideo]);

  return (
    <Stack className={localPreviewContainerStyle}>
      <VideoTile
        isVideoReady={!!localVideoElement} //{isVideoReady}
        videoProvider={<StreamMedia videoStreamElement={localVideoElement!} />}
        placeholderProvider={
          <Image styles={staticAvatarStyle} aria-label="Local video preview image" {...imageProps} />
        }
      />
      <Stack
        horizontal
        horizontalAlign="center"
        verticalAlign="center"
        tokens={toggleButtonsBarToken}
        className={toggleButtonsBarStyle}
      >
        <CallVideoIcon size="medium" />
        <Toggle
          styles={toggleStyle}
          disabled={isVideoDisabled}
          onChange={() => {
            props.toggleLocalVideo().catch((error) => {
              if (props.onErrorCallback) {
                props.onErrorCallback(CommunicationUiErrorFromError(error));
              } else {
                throw error;
              }
            });
          }}
          ariaLabel="Video Icon"
        />
        <MicIcon size="medium" />
        <Toggle
          styles={toggleStyle}
          disabled={isAudioDisabled}
          onChange={() => {
            props.toggleMicrophone().catch((error) => {
              if (props.onErrorCallback) {
                props.onErrorCallback(CommunicationUiErrorFromError(error));
              } else {
                throw error;
              }
            });
          }}
          ariaLabel="Microphone Icon"
        />
      </Stack>
      <ErrorBar />
    </Stack>
  );
};

export const LocalPreviewComponent = (
  // props: MediaControlsContainerProps & LocalDeviceSettingsContainerProps & ErrorHandlingProps
  props: LocalPreviewProps
): JSX.Element => WithErrorHandling(LocalPreviewComponentBase, props);

// export const LocalPreview = connectFuncsToContext(
//   LocalPreviewComponent,
//   MapToLocalDeviceSettingsProps,
//   MapToMediaControlsProps
// );

export const LocalPreview = LocalPreviewComponent;
