// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React, { useRef, useState } from 'react';
import { Link, MessageBar, MessageBarType } from '@fluentui/react';
import { ComplianceBannerVariant, ComplianceState, computeVariant } from './Utils';

/**
 * Subset of `CallCompositeStrings` needed by the ComplianceBanner component.
 * @internal
 */
export interface _ComplianceBannerStrings {
  close: string;
  complianceBannerNowOnlyRecording: string;
  complianceBannerNowOnlyTranscription: string;
  complianceBannerRecordingAndTranscriptionSaved: string;
  complianceBannerRecordingAndTranscriptionStarted: string;
  complianceBannerRecordingAndTranscriptionStopped: string;
  complianceBannerRecordingSaving: string;
  complianceBannerRecordingStarted: string;
  complianceBannerRecordingStopped: string;
  complianceBannerTranscriptionConsent: string;
  complianceBannerTranscriptionSaving: string;
  complianceBannerTranscriptionStarted: string;
  complianceBannerTranscriptionStopped: string;
  learnMore: string;
  privacyPolicy: string;
}

/**
 * @internal
 */
export type _ComplianceBannerProps = {
  callTranscribeState?: boolean;
  callRecordState?: boolean;
  strings: _ComplianceBannerStrings;
};

// latestBooleanState so we can compare with props.callRecordState and props.callTranscribeState easily
// latestStringState is on, off, stopped state generated by function determineStates using previous and current state values, this is used for computeVariants later
type CachedComplianceBannerProps = {
  latestBooleanState: {
    callTranscribeState?: boolean;
    callRecordState?: boolean;
  };
  latestStringState: {
    callTranscribeState: ComplianceState;
    callRecordState: ComplianceState;
  };
  updated: number;
};

const BANNER_OVERWRITE_DELAY_MS = 3000;
/**
 * A component that displays banners to notify the user when call recording and
 * transcription is enabled or disabled in a call.
 *
 * This component implements a state machine that tracks the changes to call
 * recording and transcription state and shows the corresponding message.
 *
 * @internal
 */
export const _ComplianceBanner = (props: _ComplianceBannerProps): JSX.Element => {
  //set variant when incoming state is different from current state
  //when variant change, return message bar
  //when message bar is dismissed,set variant to default nostate and if current state is stopped, set to off

  const cachedProps = useRef<CachedComplianceBannerProps>({
    latestBooleanState: {
      callTranscribeState: false,
      callRecordState: false
    },
    latestStringState: {
      callTranscribeState: 'off',
      callRecordState: 'off'
    },
    updated: new Date().getTime()
  });

  // Only update cached props and variant if there is _some_ change in the latest props.
  // This ensures that state machine is only updated if there is an actual change in the props.
  if (
    props.callRecordState !== cachedProps.current.latestBooleanState.callRecordState ||
    props.callTranscribeState !== cachedProps.current.latestBooleanState.callTranscribeState
  ) {
    cachedProps.current = {
      latestBooleanState: props,
      latestStringState: {
        callRecordState: determineStates(cachedProps.current.latestStringState.callRecordState, props.callRecordState),
        callTranscribeState: determineStates(
          cachedProps.current.latestStringState.callTranscribeState,
          props.callTranscribeState
        )
      },
      updated: new Date().getTime()
    };
  }
  return (
    <VariantBanner
      variant={computeVariant(
        cachedProps.current.latestStringState.callRecordState,
        cachedProps.current.latestStringState.callTranscribeState
      )}
      updated={cachedProps.current.updated}
      strings={props.strings}
      onDismiss={() => {
        if (cachedProps.current.latestStringState.callRecordState === 'stopped') {
          cachedProps.current.latestStringState.callRecordState = 'off';
        }
        if (cachedProps.current.latestStringState.callTranscribeState === 'stopped') {
          cachedProps.current.latestStringState.callTranscribeState = 'off';
        }
      }}
    />
  );
};

function determineStates(previous: ComplianceState, current: boolean | undefined): ComplianceState {
  // if current state is on, then return on
  if (current) {
    return 'on';
  }
  // if current state is off
  else {
    // if previous state is on and current state is off, return stopped (on -> off)
    if (previous === 'on') {
      return 'stopped';
    }
    // otherwise remain previous state unchanged
    else {
      return previous;
    }
  }
}

function VariantBanner(props: {
  variant: ComplianceBannerVariant;
  updated: number;
  onDismiss: () => void;
  strings: _ComplianceBannerStrings;
}): JSX.Element {
  const newVariant = props.variant;

  const [variant, setVariant] = useState<ComplianceBannerVariant>(newVariant);
  const [lastUpdate, setLastUpdate] = useState<number>(new Date().getTime());
  const pendingUpdateHandle = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (newVariant !== variant && props.updated > lastUpdate) {
    // Always clear pending updates.
    // We'll either update now, or schedule an update for later.
    if (pendingUpdateHandle.current) {
      clearTimeout(pendingUpdateHandle.current);
    }

    const now = new Date().getTime();
    const timeToNextUpdate = BANNER_OVERWRITE_DELAY_MS - (now - lastUpdate);
    if (newVariant === 'NO_STATE' || timeToNextUpdate <= 0) {
      setVariant(newVariant);
      setLastUpdate(now);
    } else {
      pendingUpdateHandle.current = setTimeout(() => {
        setVariant(newVariant);
        // Set the actual update time, not the computed time when the update should happen.
        // The actual update might be later than we planned.
        setLastUpdate(new Date().getTime());
      }, timeToNextUpdate);
    }
  }

  if (variant === 'NO_STATE') {
    return <></>;
  }

  return (
    <MessageBar
      messageBarType={MessageBarType.warning}
      onDismiss={() => {
        // when closing the banner, change variant to nostate and change stopped state to off state.
        // Reason: on banner close, going back to the default state
        setVariant('NO_STATE');
        setLastUpdate(new Date().getTime());
        props.onDismiss();
      }}
      dismissButtonAriaLabel={props.strings.close}
    >
      <BannerMessage variant={variant} strings={props.strings} />
    </MessageBar>
  );
}

function BannerMessage(props: { variant: ComplianceBannerVariant; strings: _ComplianceBannerStrings }): JSX.Element {
  const { variant, strings } = props;
  switch (variant) {
    case 'TRANSCRIPTION_STOPPED_STILL_RECORDING':
      return (
        <>
          <b>{strings.complianceBannerTranscriptionStopped}</b>
          {` ${strings.complianceBannerNowOnlyRecording}`}
          <PrivacyPolicy linkText={strings.privacyPolicy} />
        </>
      );
    case 'RECORDING_STOPPED_STILL_TRANSCRIBING':
      return (
        <>
          <b>{strings.complianceBannerRecordingStopped}</b>
          {` ${strings.complianceBannerNowOnlyTranscription}`}
          <PrivacyPolicy linkText={strings.privacyPolicy} />
        </>
      );
    case 'RECORDING_AND_TRANSCRIPTION_STOPPED':
      return (
        <>
          <b>{strings.complianceBannerRecordingAndTranscriptionSaved}</b>
          {` ${strings.complianceBannerRecordingAndTranscriptionStopped}`}
          <LearnMore linkText={strings.learnMore} />
        </>
      );
    case 'RECORDING_AND_TRANSCRIPTION_STARTED':
      return (
        <>
          <b>{strings.complianceBannerRecordingAndTranscriptionStarted}</b>
          {` ${strings.complianceBannerTranscriptionConsent}`}
          <PrivacyPolicy linkText={strings.privacyPolicy} />
        </>
      );
    case 'TRANSCRIPTION_STARTED':
      return (
        <>
          <b>{strings.complianceBannerTranscriptionStarted}</b>
          {` ${strings.complianceBannerTranscriptionConsent}`}
          <PrivacyPolicy linkText={strings.privacyPolicy} />
        </>
      );
    case 'RECORDING_STOPPED':
      return (
        <>
          <b>{strings.complianceBannerRecordingSaving}</b>
          {` ${strings.complianceBannerRecordingStopped}`}
          <LearnMore linkText={strings.learnMore} />
        </>
      );
    case 'RECORDING_STARTED':
      return (
        <>
          <b>{strings.complianceBannerRecordingStarted}</b>
          {` ${strings.complianceBannerTranscriptionConsent}`}
          <PrivacyPolicy linkText={strings.privacyPolicy} />
        </>
      );
    case 'TRANSCRIPTION_STOPPED':
      return (
        <>
          <b>{strings.complianceBannerTranscriptionSaving}</b>
          {` ${strings.complianceBannerTranscriptionStopped}`}
          <LearnMore linkText={strings.learnMore} />
        </>
      );
  }
  return <></>;
}

function PrivacyPolicy(props: { linkText: string }): JSX.Element {
  return (
    <Link href="https://privacy.microsoft.com/privacystatement#mainnoticetoendusersmodule" target="_blank" underline>
      {props.linkText}
    </Link>
  );
}

function LearnMore(props: { linkText: string }): JSX.Element {
  return (
    <Link
      href="https://support.microsoft.com/office/record-a-meeting-in-teams-34dfbe7f-b07d-4a27-b4c6-de62f1348c24"
      target="_blank"
      underline
    >
      {props.linkText}
    </Link>
  );
}
