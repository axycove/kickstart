const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/CampaignFactory.json');
require('dotenv').config();

const provider = new HDWalletProvider({
  mnemonic: process.env.SECRET,
  providerOrUrl: process.env.RINKEBY_ENDPOINT,
});

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ data: compiledFactory.evm.bytecode.object })
    .send({ gas: 1_500_000, from: accounts[0] });

  console.log('Contract deployed to', result.options.address);
};
deploy();
