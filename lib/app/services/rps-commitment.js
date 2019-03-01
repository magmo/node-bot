"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_eth_abi_1 = require("web3-eth-abi");
const SolidityRPSCommitmentType = {
    "RPSCommitmentStruct": {
        positionType: "uint8",
        stake: "uint256",
        preCommit: "bytes32",
        bPlay: "uint8",
        aPlay: "uint8",
        salt: "bytes32",
    },
};
var PositionType;
(function (PositionType) {
    PositionType[PositionType["Resting"] = 0] = "Resting";
    PositionType[PositionType["Proposed"] = 1] = "Proposed";
    PositionType[PositionType["Accepted"] = 2] = "Accepted";
    PositionType[PositionType["Reveal"] = 3] = "Reveal";
})(PositionType = exports.PositionType || (exports.PositionType = {}));
var Play;
(function (Play) {
    Play[Play["Rock"] = 0] = "Rock";
    Play[Play["Paper"] = 1] = "Paper";
    Play[Play["Scissors"] = 2] = "Scissors";
})(Play = exports.Play || (exports.Play = {}));
function encodeAppAttributes(appAttrs) {
    console.log(appAttrs);
    const { positionType, stake, preCommit, bPlay, aPlay, salt, } = appAttrs;
    console.log([positionType, stake, preCommit, bPlay, aPlay, salt,]);
    return web3_eth_abi_1.default.encodeParameter(SolidityRPSCommitmentType, [positionType, stake, preCommit, bPlay, aPlay, salt,]);
}
function decodeAppAttributes(appAttrs) {
    const parameters = web3_eth_abi_1.default.decodeParameter(SolidityRPSCommitmentType, appAttrs);
    return {
        positionType: parameters[0],
        stake: parameters[1],
        preCommit: parameters[2],
        bPlay: parameters[3],
        aPlay: parameters[4],
        salt: parameters[5],
    };
}
function fromCoreCommitment(commitment) {
    const { channel, commitmentType, turnNum, allocation, destination, commitmentCount, } = commitment;
    return Object.assign({ channel,
        commitmentType,
        turnNum,
        allocation,
        destination,
        commitmentCount }, decodeAppAttributes(commitment.appAttributes));
}
exports.fromCoreCommitment = fromCoreCommitment;
function asCoreCommitment(rpsCommitment) {
    const { channel, commitmentType, turnNum, allocation, destination, commitmentCount, positionType, stake, preCommit, bPlay, aPlay, salt, } = rpsCommitment;
    return {
        channel,
        commitmentType,
        turnNum,
        allocation,
        destination,
        commitmentCount,
        appAttributes: encodeAppAttributes({ positionType, stake, preCommit, bPlay, aPlay, salt }),
    };
}
exports.asCoreCommitment = asCoreCommitment;
//# sourceMappingURL=rps-commitment.js.map