import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const fundButton = document.getElementById("fundButton");
const connectButton = document.getElementById("connectButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

const message = document.getElementById("message");

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await ethereum.request({ method: "eth_requestAccounts" });
        connectButton.innerHTML = "Connected";
    } else {
        connectButton.innerHTML = "Please install metamask";
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        try {
            const transactionResponse = await contract.withdraw();
            message.innerHTML = `Withdrawing`;
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done!");
            message.innerHTML = `Cashed out!! 🎉💃🏾`;

            setTimeout(() => {
                message.innerHTML = "Fund me";
            }, 5000);
        } catch (error) {
            console.log(error);
        }
    } else {
        fundButton.innerHTML = "Please install MetaMask";
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        const formattedBalance = ethers.utils.formatEther(balance);
        message.innerHTML = `Contract Balance ${formattedBalance}`;
    } else {
        fundButton.innerHTML = "Please install MetaMask";
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethInput").value;
    if (typeof window.ethereum !== "undefined") {
        message.innerHTML = `Funding with ${ethAmount} eth...`;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done!");
            message.innerHTML = `Thank you! 🥰`;

            setTimeout(() => {
                message.innerHTML = "Fund me";
            }, 5000);
        } catch (error) {
            console.log(error);
        }
    } else {
        fundButton.innerHTML = "Please install MetaMask";
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining transaction ${transactionResponse.hash}...`);
    message.innerHTML = `Mining transaction ${transactionResponse.hash}...`;
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            );
            resolve();
            message.innerHTML = `Completed with ${transactionReceipt.confirmations} confirmations`;
        });
    });
}