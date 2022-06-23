// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import { _formatString } from '@internal/acs-ui-common';
import { Parser } from 'html-to-react';
import Linkify from 'react-linkify';
import { ChatMessage } from '../../types/ChatMessage';
import { LiveMessage } from 'react-aria-live';
import { Link } from '@fluentui/react';

type ChatMessageContentProps = {
  message: ChatMessage;
  liveAuthorIntro: string;
};

/** @private */
export const ChatMessageContent = (props: ChatMessageContentProps): JSX.Element => {
  switch (props.message.contentType) {
    case 'text':
      return MessageContentAsText(props.message, props.liveAuthorIntro);
    case 'html':
      return MessageContentAsRichTextHTML(props.message, props.liveAuthorIntro);
    case 'richtext/html':
      return MessageContentAsRichTextHTML(props.message, props.liveAuthorIntro);
    default:
      console.warn('unknown message content type');
      return <></>;
  }
};

const MessageContentAsRichTextHTML = (message: ChatMessage, liveAuthorIntro: string): JSX.Element => {
  const htmlToReactParser = new Parser();
  return <div data-ui-status={message.status}>{htmlToReactParser.parse(message.content)}</div>;
};

const MessageContentAsText = (message: ChatMessage, liveAuthorIntro: string): JSX.Element => {
  return (
    <div data-ui-status={message.status}>
      <Linkify
        componentDecorator={(decoratedHref: string, decoratedText: string, key: number) => {
          return (
            <Link target="_blank" href={decoratedHref} key={key}>
              {decoratedText}
            </Link>
          );
        }}
      >
        {message.content}
      </Linkify>
    </div>
  );
};
