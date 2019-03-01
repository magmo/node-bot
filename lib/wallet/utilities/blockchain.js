"use strict";
/*import * as CommitmentArtifact from '../../../build/contracts/Commitment.json';
import * as nitroAdjudicatorArtifact from '../../../build/contracts/NitroAdjudicator.json';
import * as RulesArtifact from '../../../build/contracts/Rules.json';
*/
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
//import { getNetworkId, linkedByteCode, } from "magmo-devtools";
// TODO: This provider is obviously a local provider.
// We should set the provider to connect to ganache or infura, 
// based on the NODE_ENV variable.
const provider = new ethers_1.providers.JsonRpcProvider(`http://${process.env.DEV_GANACHE_HOST}:${process.env.DEV_GANACHE_PORT}`);
const providerSigner = provider.getSigner();
async function nitroAdjudicator() {
    //return setupContract(nitroAdjudicatorArtifact);
    return null;
}
exports.nitroAdjudicator = nitroAdjudicator;
async function setupContract(artifact) {
    //const networkId = await getNetworkId();
    /*Object.defineProperty(
      artifact,
      "bytecode",
      { value: linkedByteCode(artifact, CommitmentArtifact, networkId) }
    );
    Object.defineProperty(
      artifact,
      "bytecode",
      { value: linkedByteCode(artifact, RulesArtifact, networkId) }
    );
  
    const nitroFactory = await ContractFactory.fromSolidity(artifact, providerSigner);
    const contract = await nitroFactory.attach(artifact.networks[networkId].address);
  
    return contract;*/
    return null;
}
//# sourceMappingURL=blockchain.js.map