"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blockchain_1 = require("./blockchain");
const ChannelManagement = require("./channelManagement");
const LedgerChannelManager = require("./ledgerChannelManager");
exports.channelExists = ChannelManagement.channelExists;
exports.openLedgerChannel = LedgerChannelManager.openLedgerChannel;
exports.updateLedgerChannel = LedgerChannelManager.updateLedgerChannel;
exports.fund = blockchain_1.Blockchain.fund;
//# sourceMappingURL=index.js.map