import { ethers } from "ethers";

export const ethContract = process.env.ERC_721_ETH_CONTRACT;
export const wethContract = process.env.WRAPPED_ETH_CONTRACT;
export const eth1155Contract = process.env.ERC_1155_ETH_CONTRACT;

 export const ethProvider = new ethers.providers.JsonRpcProvider(
   "https://data-seed-prebsc-1-s1.binance.org:8545"
 );

 export const signerEther = new ethers.Wallet(
   process.env.ADMIN_PRIVATE_ADDRESS,
   ethProvider
);
