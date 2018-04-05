const HDWalletProvider = require ('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface, bytecode} = require ('./compile.js');

// HDWalletProvider used to connect to real network with unlocked account
// to connect to a real network, a real node is required
// hosting real node locally is very painful and expensive
// infura introduces free service to connec to real network via real node
// inputs: account mnominic 12 words & network url appended by user infura API token
const provider = new HDWalletProvider('talk decade foster ginger sleep error clump time worry idle concert guitar',
'https://rinkeby.infura.io/FAp0NiyW7NfWRYaPPWNI'
);

const web3 = new Web3(provider);

const deploy = async() => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode, arguments: ['Hi there!']})
    .send ({gas: '1000000', from: accounts[0]});

    console.log('Contract deployed to', result.options.address);
};

deploy();  
