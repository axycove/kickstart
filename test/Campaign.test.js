const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts, factory, campaignAddress, campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ data: compiledFactory.evm.bytecode.object })
    .send({ from: accounts[0], gas: 1_500_000 });

  await factory.methods.createCampaign('100').send({
    from: accounts[0],
    gas: 1_500_000,
  });

  [campaignAddress] = await factory.methods.getCampaigns().call();
  campaign = await new web3.eth.Contract(compiledCampaign.abi, campaignAddress);
});

describe('Campaigns', () => {
  it('deploys a factory and a campaign', () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('marks caller as the campaign manager', async () => {
    const manager = await campaign.methods.manager().call();
    assert.strictEqual(accounts[0], manager);
  });

  it('allows people to contribute and marks them as approvers', async () => {
    await campaign.methods.contribute().send({ value: '200', from: accounts[1] });
    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it('requires a minimum contribution', async () => {
    try {
      await campaign.methods.contribute().send({ from: accounts[1], value: '5' });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('allows a manager to make a payment request', async () => {
    const description = 'Buy groceries';
    await campaign.methods.createRequest(description, '100', accounts[1]).send({
      from: accounts[0],
      gas: 1_000_000,
    });

    const request = await campaign.methods.requests(0).call();

    assert.strictEqual(description, request.description);
  });

  it('processes requests', async () => {
    await campaign.methods.contribute().send({
      value: web3.utils.toWei('10', 'ether'),
      from: accounts[1],
    });

    await campaign.methods
      .createRequest('A cool spend request', web3.utils.toWei('5', 'ether'), accounts[2])
      .send({
        from: accounts[0],
        gas: 1_000_000,
      });

    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: 1_000_000,
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: 1_000_000,
    });

    let balance = await web3.eth.getBalance(accounts[2]);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = parseFloat(balance);

    assert(balance > 104);
  });
});
