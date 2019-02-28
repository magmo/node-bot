export {
  updateLedgerChannel,
  openLedgerChannel,
  channelExists,
  ChannelResponse
} from "./services";
import { Bytes } from "fmg-core";
import { queries } from "./db/queries/allocator_channels";
import {
  channelExists,
  formResponse,
  validSignature
} from "./services/channelManagement";

import errors from "./errors";
export { errors };

export default class Wallet {
  sanitize: (appAttrs: Bytes) => Bytes;
  formResponse = formResponse;
  validSignature = validSignature;
  channelExists = channelExists;
  openChannel = queries.openAllocatorChannel;
  updateChannel = queries.updateAllocatorChannel;

  constructor(sanitizeAppAttrs) {
    this.sanitize = sanitizeAppAttrs;
  }
}
