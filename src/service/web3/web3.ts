import { ethers } from "ethers";
// import { contract as CONTRACT } from "./contract";
// import { auctionContract as AUCTION_CONTRACT } from "./auction_contract";
// import { contract_1155 as CONTRACT_1155 } from "./rpc1155Polygon";

const polygonRPC = process.env.POLYGON_RPC;
const wMaticContract = process.env.WRAPPED_MATIC_CONTRACT;
export const polygonContract = process.env.CONTRACT_ADDRESS;
export const polygon1155Contract = process.env.RPC_1155_POLYGON;

export const polygonProvider = new ethers.providers.JsonRpcProvider(polygonRPC);
// const signerEther = new ethers.Wallet(
//   process.env.ADMIN_PRIVATE_ADDRESS,
//   polygonProvider
// );
// export const math10Pow18 = 1000000000000000000;

// let baseNonce;
// const getBaseNonce = async () => {
//   baseNonce = await polygonProvider.getTransactionCount(
//     process.env.ADMIN_PUBLIC_ADDRESS,
//     "pending"
//   );
//   return baseNonce + 1;
// };

// // ? Ether transfer from admin to seller
// // ? seller_address and art_price
// export const polygonTransferFunc = async (transferTo, price) => {
//   let nonce = await getBaseNonce();
//   console.log("----------polygonTransferFunc--nonce--------", nonce);

//   await signerEther
//     .sendTransaction({
//       to: transferTo,
//       value: ethers.utils.parseEther(price),
//       gasLimit: 250000,
//       nonce: nonce,
//     })
//     .then((res) => {
//       console.log("----------polygonTransferFunc----------", res);
//     })
//     .catch();
// };

// export const polygonTransferFuncAuction = async (transferTo, price) => {
//   let nonce = await getBaseNonce();
//   console.log("----------polygonTransferFuncAuction--nonce--------", nonce);
//   return new Promise(async (resolve, reject) => {
//     await signerEther
//       .sendTransaction({
//         to: transferTo,
//         value: ethers.utils.parseEther(price),
//         gasLimit: 250000,
//         nonce: nonce,
//       })
//       .then((res) => {
//         resolve(res);
//       });
//   });
// };

// // ? nft transfer from seller to buyer
// // ? Contract address, tokenId, buyeraddress, seller address, admin private key
// export const nftTransferFunc = async (
//   contract_address,
//   send_token_amount,
//   to_address,
//   send_account,
//   private_key
// ) => {
//   let wallet = new ethers.Wallet(private_key);
//   let walletSigner = wallet.connect(polygonProvider);
//   return new Promise((resolve, reject) => {
//     if (contract_address) {
//       let contract = new ethers.Contract(
//         contract_address,
//         CONTRACT,
//         walletSigner
//       );

//       contract
//         .transferFrom(send_account, to_address, send_token_amount, {
//           gasLimit: 250000,
//         })
//         .then((transferResult) => {
//           resolve(transferResult);
//         })
//         .catch((err) => {
//           reject(err);
//         });
//     }
//   });
// };

// export const transferWrappedMatic = async (
//   buyerAddress,
//   adminAddress,
//   bidPrice
// ) => {
//   let wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_ADDRESS);
//   let walletSigner = wallet.connect(polygonProvider);
//   let contract = new ethers.Contract(
//     wMaticContract,
//     AUCTION_CONTRACT,
//     walletSigner
//   );
//   return new Promise((resolve, reject) => {
//     contract
//       .transferFrom(
//         buyerAddress,
//         adminAddress,
//         ethers.utils.parseEther(bidPrice.toString()).toString(),
//         { gasLimit: 250000 }
//       )
//       .then(async (res) => {
//         console.log("---------transferWrappedMatic---------", res);

//         await convertWMaticToMatic(ethers.utils.parseEther(bidPrice));
//         res.wait();
//         resolve(res);
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };

// export const convertWMaticToMatic = async (bidPrice) => {
//   let wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_ADDRESS);
//   let walletSigner = wallet.connect(polygonProvider);
//   let contract = new ethers.Contract(
//     wMaticContract,
//     AUCTION_CONTRACT,
//     walletSigner
//   );

//   const trasnfer = await contract.withdraw(bidPrice, { gasLimit: 250000 });
//   console.log("---------convertWMaticToMatic---------", trasnfer);
// };

// export const transferRoyaltyWrappedMatic = async (
//   buyerAddress,
//   sellerAddress,
//   bidPrice
// ) => {
//   let wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_ADDRESS);
//   let walletSigner = wallet.connect(polygonProvider);
//   let contract = new ethers.Contract(
//     wMaticContract,
//     AUCTION_CONTRACT,
//     walletSigner
//   );
//   let nonce = await getBaseNonce();

//   return new Promise((resolve, reject) => {
//     contract
//       .transferFrom(
//         buyerAddress,
//         sellerAddress,
//         ethers.utils.parseEther(bidPrice.toString()).toString(),
//         { nonce, gasLimit: 250000 }
//       )
//       .then(async (res) => {
//         await getBaseNonce();
//         resolve(res);
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };

// export const distributedRoyalty = async (
//   percentageArray,
//   transferToArray,
//   totalPrice
// ) => {
//   let wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_ADDRESS);
//   let walletSigner = wallet.connect(polygonProvider);

//   let contract = new ethers.Contract(polygonContract, CONTRACT, walletSigner);
//   const values = percentageArray;
//   const addresses = transferToArray;
//   await contract
//     .distributeRoyalty(values, addresses, {
//       value: totalPrice,
//       gasLimit: 250000,
//     })
//     .then((res) => {
//       console.log("-------distributedRoyalty--------", res);
//     })
//     .catch((err) => {
//       console.log("------err--------", err);
//     });
// };

// export const transfer1155NFT = async (from, to, tokenId, quantity) => {
//   let wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_ADDRESS);
//   let walletSigner = wallet.connect(polygonProvider);

//   return new Promise((resolve, reject) => {
//     let contract = new ethers.Contract(
//       polygon1155Contract,
//       CONTRACT_1155,
//       walletSigner
//     );

//     contract
//       .safeTransferFrom(from, to, tokenId, quantity, "0x00", {
//         gasLimit: 200000,
//       })
//       .then((transferResult) => {
//         console.log("----------transfer1155NFT----------", transferResult);

//         resolve(transferResult);
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };
