import web3 from "./web3";
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    '0xC00e2dd92BA19bEf454167e13Af0708c55262A17'
);

export default instance;