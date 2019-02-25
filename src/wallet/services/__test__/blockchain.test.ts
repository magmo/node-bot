import { nitroAdjudicator } from "../../utilities/blockchain"
import { Blockchain } from "../blockchain";
import { DUMMY_RULES_ADDRESS } from "../../../constants";

process.env.NODE_ENV = 'test';

let nitro: any;

beforeAll(async () => {
  nitro = await nitroAdjudicator();
})

describe('fund', () => {
  it('works', async () => {
    const address = DUMMY_RULES_ADDRESS; // just needs to be a valid address
    const oldBalance = await nitro.holdings(address);
    await Blockchain.fund(address, '0x05');
    expect(await nitro.holdings(address)).toMatchObject(oldBalance.add('0x05'))
  });
});