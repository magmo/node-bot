import ChannelManagement from "../channelManagement";
import * as Services from "..";

process.env.NODE_ENV = 'test';

describe('services', () => {
  it.skip('works', async () => {
    // TODO: Figure out how to test this.
    const spy = spyOn(ChannelManagement, "openAllocatorChannel")
    console.log(ChannelManagement.openAllocatorChannel); // it is a spy
    console.log(Services.openAllocatorChannel) // it is not a spy, even though it's defined as ChannelManagement.openAllocatorChannel
    const commitment: any = '';
    const signature: any = '';
    await Services.openAllocatorChannel(commitment , signature);
    expect(ChannelManagement.openAllocatorChannel).toHaveBeenCalledWith(commitment, signature);
  });
});