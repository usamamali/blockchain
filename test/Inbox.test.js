const assert = require('assert');
const ganache = require('ganache-cli');
// retrieve data and modify data on the network
// it must be given a provider
const Web3 = require('web3');
// provider to tell which network and which accounts
// ganache is a provider used for local testing and it is fast
const web3 = new Web3(ganache.provider());
// import interface (ABI): communicates data from network to JS
// import data: compiled contract
const {interface, bytecode} = require ('../compile');

let accounts;
let inbox;
const INITIAL_STRING = 'Hi there!';

// using mocha for test cases
// run before each test case
// async and await used to indicate that calls are asynchronous 
// and we shall wait for result first
beforeEach(async() => {
    // get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // use of those account to deploy the contract
    inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode, arguments: [INITIAL_STRING]})
    .send({from: accounts[0], gas: '1000000'});
});

// group test cases
describe ('Inbox',() => {
    // test case
    it('deploys a contract',() => {
        assert.ok(inbox.options.address);
    });

    it('has a default message', async () => {
        const message = await inbox.methods.message().call();
        assert.equal(message, INITIAL_STRING);
    });

    it('can change the message', async () => {
        // from account indicates which account is going to pay for this tx.
        await inbox.methods.setMessage('bye').send({from: accounts[0]});
        const message = await inbox.methods.message().call();
        assert.notEqual(message, INITIAL_STRING);
    });
});