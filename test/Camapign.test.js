const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaign;
let campaignAddress;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
                        .deploy({ data: compiledFactory.bytecode })
                        .send({ from: accounts[0], gas: '1000000' });
    
    // Deploying Camapign  through the factory
    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'
    });

    [campaignAddress] = await factory.methods.getDeployedCampaign().call(); // To get the first address from the array

    // Getting the Campaign by the address of the instance
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );
});

describe('Campaigns', async () => {
    it('deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('allows people to contribute and marks them as approver', async () => {
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: '101'
        });

        const isContributor = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributor);

        // If the persom is not a contributor
        const isNotContributor = await campaign.methods.approvers(accounts[2]).call();
        assert(!isNotContributor);
    });

    it('require a minimum contribution', async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: '99'
            });
            throw(false);
        } catch (error) {
            assert(error);
        }  
    });

    it('allows manager to make a payment request', async () => {
        const description = 'Buy Batteries';
        const value = '18000';
        const recipient = accounts[2];
        await campaign.methods.createRequest(description, value, recipient).send({
            from: accounts[0],
            gas: '1000000'
        });
        const request = await campaign.methods.requests(0).call();
        assert.equal(description, request.description);
        assert.equal(value, request.value);
        assert.equal(recipient, request.recipient);
    });

    it('denies payment request by users other than manager', async () => {
        try {
            const description = 'Buy Batteries';
            const value = '18000';
            const recipient = accounts[2];
            await campaign.methods.createRequest(description, value, recipient).send({
                from: accounts[1],
                gas: '1000000'
            });
            throw(false);
        } catch (error) {
            assert(error);
        }
    });

    it('process requests', async () => {
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        const description = 'A';
        const value = web3.utils.toWei('5', 'ether');
        const recipient = accounts[1];

        await campaign.methods.createRequest(description, value, recipient).send({
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        let initial = await web3.eth.getBalance(recipient);
        initial = web3.utils.fromWei(initial, 'ether');
        initial = parseFloat(initial);

        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        let balance = await web3.eth.getBalance(recipient);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);

        assert(balance - initial == 5);
    });
})