// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Ledger {
    mapping (address => uint256) public userbalance;

    address[] public depositors;

    event Deposit(address user, uint256 amount);

    function deposit() public payable {
        if (userbalance[msg.sender] == 0){
            depositors.push(msg.sender);
        }
        userbalance[msg.sender] += msg.value;
        emit Deposit (msg.sender, msg.value);
    }
}