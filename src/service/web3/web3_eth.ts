import { ethers } from "ethers";
// import { contract as CONTRACT } from "./contract";
// import { auctionContract as AUCTION_CONTRACT } from "./auction_contract";
// import { contract_1155 as CONTRACT_1155 } from "./rpc1155Polygon";

// let network = "rinkeby";

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

// // const getBaseNonce1 = async () => {
// //   let baseNonce = await ethProvider.getBalance(
// //     "0x368BB039F1B17F9c5C5D8BE6CEef79536B7168cA"
// //   );
// //   console.log("---------1---------", baseNonce.toString());
// // };
// // getBaseNonce1();
// let baseNonce;
// const getBaseNonce = async () => {
//   baseNonce = await ethProvider.getTransactionCount(
//     process.env.ADMIN_PUBLIC_ADDRESS,
//     "pending"
//   );
//   console.log("----------baseNonce----------", baseNonce);

//   return baseNonce + 1;
// };
// // getBaseNonce();
// // ? Ether transfer from admin to seller
// // ? seller_address and art_price
// export const ethTransferFunc = async (transferTo, price) => {
//   console.log("----------ethTransferFunc7----------", transferTo, price);
//   let nonce = await getBaseNonce();
//   console.log("----------ethTransferFunc--nonce--------", nonce);

//   await signerEther
//     .sendTransaction({
//       to: transferTo,
//       value: ethers.utils.parseEther(price),
//       gasLimit: 250000,
//       nonce: nonce,
//     })
//     .then((res) => {
//       console.log("----------ethTransferFunc----------", res);
//     })
//     .catch();
// };

// export const ethTransferFuncAuction = async (transferTo, price) => {
//   let nonce = await getBaseNonce();
//   console.log("----------ethTransferFuncAuction--nonce--------", nonce);
//   return new Promise(async (resolve, reject) => {
//     await signerEther
//       .sendTransaction({
//         to: transferTo,
//         value: ethers.utils.parseEther(price),
//         gasLimit: 250000,
//         nonce: nonce,
//       })
//       .then((res) => {
//         console.log("----------ethTransferFuncAuction----------", res);
//         resolve(res);
//       });
//   });
// };

// // ? nft transfer from seller to buyer
// // ? Contract address, tokenId, buyeraddress, seller address, admin private key
// export const nftETHTransferFunc = async (
//   contract_address,
//   send_token_amount,
//   to_address,
//   send_account,
//   private_key
// ) => {
//   let wallet = new ethers.Wallet(private_key);
//   let walletSigner = wallet.connect(ethProvider);
//   return new Promise(async (resolve, reject) => {
//     if (contract_address) {
//       let contract = new ethers.Contract(
//         contract_address,
//         CONTRACT,
//         walletSigner
//       );
//       await contract
//         .transferFrom(send_account, to_address, send_token_amount, {
//           gasLimit: 300000,
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

// export const distributedRoyaltyETH = async (
//   percentageArray,
//   transferToArray,
//   totalPrice
// ) => {
//   let wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_ADDRESS);
//   let walletSigner = wallet.connect(ethProvider);

//   let contract = new ethers.Contract(ethContract, CONTRACT, walletSigner);
//   console.log(
//     "-------ETH2.1------",
//     percentageArray,
//     transferToArray,
//     totalPrice
//   );
//   const values = percentageArray;
//   const addresses = transferToArray;
//   await contract
//     .distributeRoyalty(values, addresses, {
//       value: totalPrice,
//       gasLimit: 300000,
//     })
//     .then((res) => {
//       console.log("-------distributedRoyaltyETH--------", res);
//     })
//     .catch((err) => {
//       console.log("------distributedRoyalty----Error--------", err);
//     });
// };

// export const transferWrappedETH = async (
//   buyerAddress,
//   adminAddress,
//   bidPrice
// ) => {
//   console.log("---------transferWrappedETH---bidPrice------", bidPrice);

//   let wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_ADDRESS);
//   let walletSigner = wallet.connect(ethProvider);
//   let contract = new ethers.Contract(
//     wethContract,
//     AUCTION_CONTRACT,
//     walletSigner
//   );
//   return new Promise((resolve, reject) => {
//     contract
//       .transferFrom(
//         buyerAddress,
//         adminAddress,
//         ethers.utils.parseEther(bidPrice.toString()).toString(),
//         { gasLimit: 300000 }
//       )
//       .then(async (res) => {
//         console.log("---------transferWrappedETH---------", res);
//         await convertWETHToETH(ethers.utils.parseEther(bidPrice));
//         resolve(res);
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };

// export const convertWETHToETH = async (bidPrice) => {
//   console.log("---------convertWETHToETH---bidPrice------", bidPrice);

//   let wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_ADDRESS);
//   let walletSigner = wallet.connect(ethProvider);
//   let contract = new ethers.Contract(
//     wethContract,
//     AUCTION_CONTRACT,
//     walletSigner
//   );

//   const trasnfer = await contract.withdraw(bidPrice, { gasLimit: 300000 });
//   console.log("---------convertWETHToETH---------", trasnfer);
// };

// export const transferETH1155NFT = async (from, to, tokenId, quantity) => {
//   console.log("---------1--------", from, to, tokenId, quantity);

//   let wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_ADDRESS);
//   let walletSigner = wallet.connect(ethProvider);

//   return new Promise((resolve, reject) => {
//     let contract = new ethers.Contract(
//       eth1155Contract,
//       CONTRACT_1155,
//       walletSigner
//     );

//     contract
//       .safeTransferFrom(from, to, tokenId, quantity, "0x00", {
//         gasLimit: 300000,
//       })
//       .then((transferResult) => {
//         console.log("----------transferETH1155NFT----------", transferResult);
//         resolve(transferResult);
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };
