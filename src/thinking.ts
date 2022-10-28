import Long from 'long';
import { Channel, ChannelSender } from './channels/channel_interfaces';
import { LongMap } from './utils/long_map';

interface Node {
  sessions: Session[];
}

// Manages:
// - The WS transport
// - Exchanges, including
//   - Routing inbound packets to existing exchange dispatch (RPC handlers)
//   - Routing inbound packets to new exchange dispatch (RPC call)
//   - Opening exchanges with the peer (remote RPC call)
interface Session {
  wsTransport: WsTransport;
  openExchanges: LongMap<ChannelSender<Uint8Array>>;

  // Non-streaming RPC calls are always made in one message, with:
  // - exchange_continues: false
  // - exchange_type: /some/rpc/path
  // - no_payload: false
  // This will not be added to `openExchanges`, it is stored entires in the
  // closure for the RPC handler.
}

// Ignored by the WsTransport, only used by the RtcTransport. Unreliable
// messages can only be sent as the middle part of a streamed RPC. Unary RPCS
// are always reliable, as are the start and end packets to any stream. This
// prevents memory leaks. A single RTC data channel is used for all unreliable
// traffic.
interface Reliability {
  reliable: boolean;
  ordered: boolean;
}

// == PROTO ====================================================================
// Encode like this:
// <exchange_id: varint64><exchange_continues: bool><RpcHeader><Payload>

interface ExchangeHeader {
  exchange_id: Long;
  exchange_continues?: boolean;
}

interface Rpc {
  error?: { code: number; message: string };
}

// =============================================================================

interface Transport {
  // Create an exchange sequence, but doesn't send anything until the first
  // packet comes through.
  createExchange: (id: Long, reliable: boolean) => Channel<Uint8Array>;
}

interface WsTransport {
  dataChannel: Channel<Uint8Array>;
}

interface RtcTransport {
  peerConnection: RTCPeerConnection;
  dataChannel: Channel<Uint8Array>;
}

interface RpcHost {
  interface: Channel<RpcHostMessage>;
}

interface RpcMessage {
  // Same as exchange_id.
  callId: Long;

  // Undefined: The call req/res is non-streaming.
  // False: The call is streaming, but not complete.
  // True: The call is streaming, and complete (final packet).
  stream_continues: boolean | undefined;

  // Proto message payload, type depends on the RPC being invoked. Can only be
  // undefined when this is the first or last call in a stream.
  payload: Uint8Array | undefined;

  // The stream (req or res) was `fail`ed.
  error: { code: number; message: string } | undefined;
}

interface RpcReqMessage extends RpcMessage {
  // Same as exchange_type.
  method: string;
}

interface RpcResMessage extends RpcMessage {}
