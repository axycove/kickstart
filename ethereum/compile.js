const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, 'build');

const campaignPath = path.resolve(__dirname, 'contracts', 'campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf-8');

const input = {
  language: 'Solidity',
  sources: {
    'campaign.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts['campaign.sol'];

(function () {
  try {
    fs.removeSync(buildPath);
    fs.ensureDirSync(buildPath);

    for (let contract in output) {
      fs.outputJSONSync(path.resolve(buildPath, contract + '.json'), output[contract]);
    }
  } catch (Ex) {}

  process.exit;
})();
