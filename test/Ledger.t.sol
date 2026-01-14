// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import "../src/Ledger.sol";

contract LedgerTest is Test {
    Ledger ledger;

    address user = address(0x1);

    function setUp() public {
        ledger = new Ledger();
        vm.deal(user, 5 ether);
    }

    function test_Deposit() public {
        vm.prank(user);
        ledger.deposit{value: 1 ether}();
        uint256 balance = ledger.userbalance(user);
        assertEq(balance, 1 ether);
    }

    function test_RevertOnInvalidDepositor() public {
        vm.expectRevert();
        ledger.depositors(0);
    }
}
