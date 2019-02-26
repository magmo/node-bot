import LedgerChannelManager from "../ledgerChannelManagement";
import * as Services from "..";

process.env.NODE_ENV = 'test';

describe('services', () => {
  it.skip('works', async () => {
    // TODO: Figure out how to test this.
    const spy = spyOn(LedgerChannelManager, "openLedgerChannel");
    console.log(LedgerChannelManager.openLedgerChannel); // it is a spy
    console.log(Services.openLedgerChannel); // it is not a spy, even though it's defined as ChannelManagement.openAllocatorChannel
    const commitment: any = '';
    const signature: any = '';
    await Services.openLedgerChannel(commitment , signature);
    expect(LedgerChannelManager.openLedgerChannel).toHaveBeenCalledWith(commitment, signature);
  });
});