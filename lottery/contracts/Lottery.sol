pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] private players;

    function Lottery() public {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }

    function pickWinner() public restricted {
        uint winningPlayerIndex = getRandomNumber() % players.length;
        address winningPlayer = players[winningPlayerIndex];
        winningPlayer.transfer(this.balance);
        
        // reset lottery game
        players = new address[](0);
    }

    modifier restricted () {
        require(msg.sender == manager);
        _;
    }

    function getRandomNumber() private view returns(uint) {
        return uint(keccak256(block.difficulty, now, players));
    }

    function getPlayers() public view restricted returns (address[]){
        return players;
    }
}