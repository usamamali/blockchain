const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const {interface, bytecode} = require('../compile');

let accounts;
let lottery;

beforeEach(async()=> {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode})
    .send({from: accounts[0], gas: '1000000'});
});

describe('Lottery', () => {
    it('deploys lottery contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows players to enter', async() => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.03', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[3],
            value: web3.utils.toWei('0.04', 'ether')
        });

        const players = await lottery.methods.getPlayers().call();

        assert.equal(players[0], accounts[1]);
        assert.equal(players[1], accounts[2]);
        assert.equal(players[2], accounts[3]);
        assert.equal(players.length, 3);
    });

    it('requires minimum amount of ether', async () => {
        try{
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.0001','ether')
            });

            assert(false);
        } catch (err){
            assert.ok(err);
        }
    });

    it('only managers to pick winner', async () => {
        try{
            // enter some players
            await lottery.methods.enter().send({
                from: accounts[1],
                value: web3.utils.toWei('0.02', 'ether')
            });
    
            await lottery.methods.enter().send({
                from: accounts[2],
                value: web3.utils.toWei('0.03', 'ether')
            });
    
            await lottery.methods.enter().send({
                from: accounts[3],
                value: web3.utils.toWei('0.04', 'ether')
            });

            await lottery.methods.pickWinner().send({
                from:accounts[1]
            });
           
            assert(false);
        } catch (err){
            assert(err);
        }
    });

    it('winner takes money and lottery players are reset', async() => {
        const player = accounts[1];

        const lotteryInitialBalance = await web3.eth.getBalance(lottery.options.address);
        
        const playerInitialBalance = await web3.eth.getBalance(player);
        await lottery.methods.enter().send({
            from: player,
            value: web3.utils.toWei('2', 'ether')
        });

        const lotteryEndBalance = await web3.eth.getBalance(lottery.options.address);

        const playerBalanceAfterEnterLottery = await web3.eth.getBalance(player);

        await lottery.methods.pickWinner().send({
            from:accounts[0]
        });

        const playerBalanceAfterWinningLottery = await web3.eth.getBalance(player);

        console.log(lotteryInitialBalance,playerInitialBalance,lotteryEndBalance, 
            playerBalanceAfterEnterLottery,playerBalanceAfterWinningLottery);

        const difference = playerBalanceAfterWinningLottery - playerBalanceAfterEnterLottery;

        assert(difference > web3.utils.toWei('1.8', 'ether'));

        const players = await lottery.methods.getPlayers().call();

        assert(players.length == 0);
    });
});