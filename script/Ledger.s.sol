// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Ledger.sol";

contract DeployLedger is Script {
    function run() external {
        vm.startBroadcast();
        new Ledger();
        vm.stopBroadcast();
    }
}