/*import * as CommitmentArtifact from '../../../build/contracts/Commitment.json';
import * as nitroAdjudicatorArtifact from '../../../build/contracts/NitroAdjudicator.json';
import * as RulesArtifact from '../../../build/contracts/Rules.json';
*/

import { ContractFactory, providers } from "ethers";
import { getNetworkId, linkedByteCode, } from "magmo-devtools";

// TODO: This provider is obviously a local provider.
// We should set the provider to connect to ganache or infura, 
// based on the NODE_ENV variable.
const provider = new providers.JsonRpcProvider(`http://${process.env.DEV_GANACHE_HOST}:${process.env.DEV_GANACHE_PORT}`);
const providerSigner = provider.getSigner();

export async function nitroAdjudicator() {
  //return setupContract(nitroAdjudicatorArtifact);
  return null;
}

async function setupContract(artifact: any) {
  const networkId = await getNetworkId();

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