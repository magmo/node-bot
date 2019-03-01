"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blockchain_1 = require("../utilities/blockchain");
class Blockchain {
    static async fund(channelID, value) {
        await Blockchain.attachNitro();
        const tx = await Blockchain.nitro.deposit(channelID, { value });
        await tx.wait();
        return (await Blockchain.nitro.holdings(channelID)).toString();
    }
    static async attachNitro() {
        Blockchain.nitro = Blockchain.nitro || await blockchain_1.nitroAdjudicator();
    }
}
exports.Blockchain = Blockchain;
//# sourceMappingURL=blockchain.js.map