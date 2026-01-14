import {
  createWalletClient,
  createPublicClient,
  custom,
  parseEther,
  formatEther
} from "https://esm.sh/viem";

import { sepolia } from "https://esm.sh/viem/chains";

const CONTRACT_ADDRESS = "0x79fB6856E7b25918419d3a3a56759351708FC358";

const ABI = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "payable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "userbalance",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256" }]
  }
];

let walletClient = null;
let publicClient = null;
let account = null;

document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const depositBtn = document.getElementById("depositBtn");

  refreshBtn.disabled = true;
  depositBtn.disabled = true;

  function setStatus(message, type = "") {
    const el = document.getElementById("status");
    el.className = type;
    el.innerText = message;
  }

  async function ensureSepolia() {
    const SEPOLIA_CHAIN_ID = "0xaa36a7";

    const currentChainId = await window.ethereum.request({
      method: "eth_chainId"
    });

    if (currentChainId !== SEPOLIA_CHAIN_ID) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }]
      });
    }
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      await ensureSepolia();

      walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum)
      });

      publicClient = createPublicClient({
        chain: sepolia,
        transport: custom(window.ethereum)
      });

      const addresses = await walletClient.requestAddresses();
      account = addresses[0];

      document.getElementById("account").innerText =
        "Connected: " + account;

      refreshBtn.disabled = false;
      depositBtn.disabled = false;

      setStatus("Wallet connected", "success");
      await refreshData();

    } catch (err) {
      setStatus(err.message, "error");
    }
  }

  async function refreshData() {
    try {
      if (!account) throw new Error("Connect wallet first");

      const userBal = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "userbalance",
        args: [account]
      });

      document.getElementById("userBalance").innerText =
        formatEther(userBal) + " ETH";

      const contractBal = await publicClient.getBalance({
        address: CONTRACT_ADDRESS
      });

      document.getElementById("contractBalance").innerText =
        formatEther(contractBal) + " ETH";

    } catch (err) {
      setStatus(err.message, "error");
    }
  }

  async function deposit() {
    try {
      if (!account) throw new Error("Connect wallet first");

      const ethAmount = document.getElementById("amount").value;
      if (!ethAmount) throw new Error("Enter ETH amount");

      setStatus("Waiting for wallet confirmation...");

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "deposit",
        value: parseEther(ethAmount),
        account
      });

      setStatus("Transaction sent. Waiting for confirmation...");

      await publicClient.waitForTransactionReceipt({ hash });

      setStatus("Deposit successful!");
      await refreshData();

    } catch (err) {
  
  if (err?.code === 4001 || err?.message?.toLowerCase().includes("user rejected")) {
    setStatus("User rejected transaction");
    return;
  }
}}
  connectBtn.onclick = connectWallet;
  refreshBtn.onclick = refreshData;
  depositBtn.onclick = deposit;
});
