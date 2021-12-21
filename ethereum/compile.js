const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build'); // To delete the existing build dir
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf-8');

const output = solc.compile(source, 1).contracts;
fs.ensureDirSync(buildPath); // To ensure if there is build dir if not create it

for(let contract in output) {
    fs.outputJSONSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output[contract]
    );
}
