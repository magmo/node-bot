"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HUB_ADDRESS = '0x100063c326b27f78b2cBb7cd036B8ddE4d4FCa7C';
exports.HUB_PRIVATE_KEY = '0x1b427b7ab88e2e10674b5aa92bb63c0ca26aa0b5a858e1d17295db6ad91c049b';
exports.PARTICIPANT_PRIVATE_KEY = '0xa205281c09d630f6639c3505b63d57013996ba037bdbe4d2979eb8bd5bed5b1b';
exports.PARTICIPANT_ADDRESS = '0xffff6147243897776F085aBF5F45F24FC2943669';
exports.OTHER_PRIVATE_KEY = '0xc19d583e30a7ab6ab346505c216491ac74dd988cf833a7c29cbf2e57ab41e20c';
exports.OTHER_ADDRESS = '0xd274673B5128F7E745Dc4ee16799721D2D835f1A';
exports.DUMMY_RULES_ADDRESS = '0xabcd10b5ea16F12f5bEFc45d511978CFF2780568';
exports.UNKNOWN_RULES_ADDRESS = '0x92b5b042047731FF882423cB555554F11F632Bd6';
// TODO: These should be in the seed file, but they got exported as undefined for some reason
exports.FUNDED_CHANNEL_NONCE = 3;
exports.FUNDED_CHANNEL_HOLDINGS = 3;
exports.BEGINNING_APP_CHANNEL_NONCE = 4;
exports.BEGINNING_APP_CHANNEL_HOLDINGS = 10;
exports.ONGOING_APP_CHANNEL_NONCE = 5;
exports.ONGOING_APP_CHANNEL_HOLDINGS = 12;
exports.SEEDED_CHANNELS = 5;
exports.SEEDED_COMMITMENTS = 6;
exports.SEEDED_ALLOCATIONS = exports.SEEDED_COMMITMENTS * 2;
exports.SEEDED_PARTICIPANTS = exports.SEEDED_CHANNELS * 2;
exports.NONCE = 1000; // just a big number that won't be hit in seeding
exports.ALLOCATION = ["0x05", "0x05"];
exports.DESTINATION = [exports.PARTICIPANT_ADDRESS, exports.HUB_ADDRESS];
exports.PARTICIPANTS = [exports.PARTICIPANT_ADDRESS, exports.HUB_ADDRESS];
//# sourceMappingURL=constants.js.map