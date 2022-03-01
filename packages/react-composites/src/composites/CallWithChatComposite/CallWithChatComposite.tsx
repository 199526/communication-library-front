// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { PartialTheme, Stack, Theme } from '@fluentui/react';
import { CallComposite, CallCompositePage, CallControlOptions } from '../CallComposite';
import { CallAdapterProvider } from '../CallComposite/adapter/CallAdapterProvider';
import { EmbeddedChatPane } from './EmbeddedChatPane';
import { EmbeddedPeoplePane } from './EmbeddedPeoplePane';
import { CallWithChatControlBar } from './CallWithChatControlBar';
import { CallState } from '@azure/communication-calling';
import {
  callCompositeContainerStyles,
  compositeOuterContainerStyles,
  controlBarContainerStyles,
  drawerContainerStyles
} from './styles/CallWithChatCompositeStyles';
import { CallWithChatAdapter } from './adapter/CallWithChatAdapter';
import { CallWithChatBackedCallAdapter } from './adapter/CallWithChatBackedCallAdapter';
import { CallWithChatBackedChatAdapter } from './adapter/CallWithChatBackedChatAdapter';
import { CallAdapter } from '../CallComposite';
import { ChatCompositeProps } from '../ChatComposite';
import { BaseProvider, BaseCompositeProps } from '../common/BaseComposite';
import { CallWithChatCompositeIcons } from '../common/icons';
import { AvatarPersonaDataCallback } from '../common/AvatarPersona';
import { ChatAdapterProvider } from '../ChatComposite/adapter/ChatAdapterProvider';
import { CallWithChatAdapterState } from './state/CallWithChatAdapterState';
import { PreparedMoreDrawer } from './PreparedMoreDrawer';

/**
 * Props required for the {@link CallWithChatComposite}
 *
 * @beta
 */
export interface CallWithChatCompositeProps extends BaseCompositeProps<CallWithChatCompositeIcons> {
  callWithChatAdapter: CallWithChatAdapter;
  /**
   * Fluent theme for the composite.
   *
   * Defaults to a light theme if undefined.
   */
  fluentTheme?: PartialTheme | Theme;
  /**
   * Optimizes the composite form factor for either desktop or mobile.
   * @remarks `mobile` is currently only optimized for Portrait mode on mobile devices and does not support landscape.
   * @defaultValue 'desktop'
   * @beta
   */
  formFactor?: 'desktop' | 'mobile';
  /**
   * URL that can be used to copy a call-with-chat invite to the Users clipboard.
   */
  joinInvitationURL?: string;
  /**
   * Flags to enable/disable or customize UI elements of the {@link CallWithChatComposite}
   */
  options?: CallWithChatCompositeOptions;
}

/**
 * Optional features of the {@link CallWithChatComposite}.
 *
 * @beta
 */
export type CallWithChatCompositeOptions = {
  /**
   * Call control options to change what buttons show on the call-with-chat composite control bar.
   * If using the boolean values, true will cause default behavior across the whole control bar. False hides the whole control bar.
   */
  callControls?: boolean | CallWithChatControlOptions;
  /**
   * Mobile pane options to disable browser back button functionality when a mobile pane is active. Clicking
   * the back button will close the mobile pane instead.
   */
  mobilePane?: MobilePaneOptions;
};

/**
 * {@link CallWithChatComposite} mobile pane options.
 *
 * @beta
 */
export interface MobilePaneOptions {
  disabledBackButton?: boolean;
}

/**
 * {@link CallWithChatComposite} Call controls to show or hide buttons on the calling control bar.
 *
 * @beta
 */
export interface CallWithChatControlOptions
  extends Pick<CallControlOptions, 'cameraButton' | 'microphoneButton' | 'screenShareButton' | 'displayType'> {
  /**
   * Show or hide the chat button in the call-with-chat composite control bar.
   * @defaultValue true
   */
  chatButton?: boolean;
  /**
   * Show or hide the people button in the call-with-chat composite control bar.
   * @defaultValue true
   */
  peopleButton?: boolean;
}

type CallWithChatScreenProps = {
  callWithChatAdapter: CallWithChatAdapter;
  fluentTheme?: PartialTheme | Theme;
  formFactor?: 'desktop' | 'mobile';
  joinInvitationURL?: string;
  callControls?: boolean | CallWithChatControlOptions;
  onFetchAvatarPersonaData?: AvatarPersonaDataCallback;
  mobilePane?: MobilePaneOptions;
};

const CallWithChatScreen = (props: CallWithChatScreenProps): JSX.Element => {
  const { callWithChatAdapter, fluentTheme, formFactor = 'desktop' } = props;
  const isMobile = formFactor === 'mobile';

  if (!callWithChatAdapter) {
    throw new Error('CallWithChatAdapter is undefined');
  }

  const callAdapter: CallAdapter = useMemo(
    () => new CallWithChatBackedCallAdapter(callWithChatAdapter),
    [callWithChatAdapter]
  );

  const [currentCallState, setCurrentCallState] = useState<CallState>();
  const [currentPage, setCurrentPage] = useState<CallCompositePage>();
  const [showChat, setShowChat] = useState(false);
  const [showPeople, setShowPeople] = useState(false);

  useEffect(() => {
    const updateCallWithChatPage = (newState: CallWithChatAdapterState): void => {
      setCurrentPage(newState.page);
      setCurrentCallState(newState.call?.state);
    };
    callWithChatAdapter.onStateChange(updateCallWithChatPage);
    return () => {
      callWithChatAdapter.offStateChange(updateCallWithChatPage);
    };
  }, [callWithChatAdapter]);

  const closePane = useCallback(() => {
    setShowChat(false);
    setShowPeople(false);
  }, []);

  const toggleChat = useCallback(() => {
    setShowPeople(false);
    setShowChat(!showChat);
  }, [showChat]);

  const togglePeople = useCallback(() => {
    setShowChat(false);
    setShowPeople(!showPeople);
  }, [showPeople]);

  const [showDrawer, setShowDrawer] = useState(false);
  const onMoreButtonClicked = useCallback(() => {
    closePane();
    setShowDrawer(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setShowDrawer(false);
  }, []);
  const onMoreDrawerPeopleClicked = useCallback(() => {
    setShowDrawer(false);
    togglePeople();
  }, []);
  const selectPeople = useCallback(() => {
    setShowPeople(true);
    setShowChat(false);
  }, []);
  const selectChat = useCallback(() => {
    setShowChat(true);
    setShowPeople(false);
  }, []);

  const chatProps: ChatCompositeProps = useMemo(() => {
    return {
      adapter: new CallWithChatBackedChatAdapter(callWithChatAdapter)
    };
  }, [callWithChatAdapter]);

  const isInLobbyOrConnecting = currentPage === 'lobby';
  const hasJoinedCall = !!(currentPage && hasJoinedCallFn(currentPage, currentCallState ?? 'None'));
  const showControlBar = isInLobbyOrConnecting || hasJoinedCall;
  const showMobilePane = isMobile && (showChat || showPeople);

  return (
    <Stack verticalFill grow styles={compositeOuterContainerStyles}>
      <Stack horizontal grow>
        {!showMobilePane && (
          <Stack.Item grow styles={callCompositeContainerStyles}>
            <CallComposite
              {...props}
              formFactor={formFactor}
              options={{ callControls: false }}
              adapter={callAdapter}
              fluentTheme={fluentTheme}
            />
          </Stack.Item>
        )}
        {chatProps.adapter && hasJoinedCall && (
          <EmbeddedChatPane
            chatCompositeProps={chatProps}
            hidden={!showChat}
            chatAdapter={chatProps.adapter}
            fluentTheme={fluentTheme}
            onClose={closePane}
            onFetchAvatarPersonaData={props.onFetchAvatarPersonaData}
            onChatButtonClick={selectChat}
            onPeopleButtonClick={selectPeople}
            mobileView={isMobile}
            disableBackButton={props.mobilePane?.disabledBackButton}
          />
        )}
        {callAdapter && chatProps.adapter && hasJoinedCall && (
          <CallAdapterProvider adapter={callAdapter}>
            <EmbeddedPeoplePane
              hidden={!showPeople}
              inviteLink={props.joinInvitationURL}
              onClose={closePane}
              chatAdapter={chatProps.adapter}
              callAdapter={callAdapter}
              onFetchAvatarPersonaData={props.onFetchAvatarPersonaData}
              onChatButtonClick={selectChat}
              onPeopleButtonClick={selectPeople}
              mobileView={isMobile}
              disableBackButton={props.mobilePane?.disabledBackButton}
            />
          </CallAdapterProvider>
        )}
      </Stack>
      {showControlBar && !showMobilePane && (
        <ChatAdapterProvider adapter={chatProps.adapter}>
          <Stack.Item styles={controlBarContainerStyles}>
            <CallWithChatControlBar
              callAdapter={callAdapter}
              chatAdapter={chatProps.adapter}
              chatButtonChecked={showChat}
              onChatButtonClicked={toggleChat}
              peopleButtonChecked={showPeople}
              onPeopleButtonClicked={togglePeople}
              onMoreButtonClicked={onMoreButtonClicked}
              mobileView={props.formFactor === 'mobile'}
              disableButtonsForLobbyPage={isInLobbyOrConnecting}
              callControls={props.callControls}
            />
          </Stack.Item>
        </ChatAdapterProvider>
      )}
      {showControlBar && showDrawer && (
        <ChatAdapterProvider adapter={chatProps.adapter}>
          <CallAdapterProvider adapter={callAdapter}>
            <Stack styles={drawerContainerStyles}>
              <PreparedMoreDrawer onLightDismiss={closeDrawer} onPeopleButtonClicked={onMoreDrawerPeopleClicked} />
            </Stack>
          </CallAdapterProvider>
        </ChatAdapterProvider>
      )}
    </Stack>
  );
};

/**
 * CallWithChatComposite brings together key components to provide a full call with chat experience out of the box.
 *
 * @beta
 */
export const CallWithChatComposite = (props: CallWithChatCompositeProps): JSX.Element => {
  const { callWithChatAdapter, fluentTheme, formFactor, joinInvitationURL, options } = props;
  return (
    <BaseProvider fluentTheme={fluentTheme} locale={props.locale} icons={props.icons}>
      <CallWithChatScreen
        {...props}
        callWithChatAdapter={callWithChatAdapter}
        formFactor={formFactor}
        joinInvitationURL={joinInvitationURL}
        fluentTheme={fluentTheme}
        {...options}
      />
    </BaseProvider>
  );
};

const hasJoinedCallFn = (page: CallCompositePage, callStatus: CallState): boolean =>
  page === 'call' && callStatus === 'Connected';
