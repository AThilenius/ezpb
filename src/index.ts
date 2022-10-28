import { biChannel, channel } from './channels/buffered_channel';
import {
  Channel,
  ChannelReceiver,
  ChannelSender,
} from './channels/channel_interfaces';
import './gen/proto_gen';
import { Node } from './node';
import * as ProtoGenAPI from './proto_gen_api';
import { CallContext } from './proto_gen_api';
import { injectProtoGenApi } from './proto_gen_api_injected';
import { Log } from './utils/log';
import { Code, StatusError } from './rpc/errors';
import { wlabs } from './gen/proto_gen';
import { Host, HostContext } from './host';

// Wire up injected generated proto code.
injectProtoGenApi(ProtoGenAPI.injected);

export {
  CallContext,
  Channel,
  ChannelReceiver,
  ChannelSender,
  Code,
  Host,
  HostContext,
  Log,
  Node,
  ProtoGenAPI,
  StatusError,
  biChannel,
  channel,
  wlabs,
};
