import { ethers } from "ethers";
import nftModel from "../model/nft";
import userModel from "../model/user";
import bidModel from "../model/bid";
import { level, logger } from "../config/logger";
import * as nftRepo from "../repository/nft/nft.repo";
import { environments, NODE_ENV } from "../constant/environments"

const ethProvider = new ethers.providers.JsonRpcProvider(
  environments.PROD == NODE_ENV ? process.env.POLYGON_RPC_MAINNET :
    process.env.POLYGON_RPC_TESTNET
);

const MintoContract = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_serviceFeePercentage",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "_admin",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "name_",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol_",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "auction",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "bid",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "userId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "sold",
        "type": "bool"
      }
    ],
    "name": "BuyOrBid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "auction",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "onSale",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "ExternalTransfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "accept",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "userId",
        "type": "string"
      }
    ],
    "name": "acceptOffer",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allNFT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      },
      {
        "internalType": "address payable",
        "name": "mintedBy",
        "type": "address"
      },
      {
        "internalType": "address payable",
        "name": "currentOwner",
        "type": "address"
      },
      {
        "internalType": "address payable",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "numberOfTransfers",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "forSale",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "numberOfRoyalties",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "auction",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allPresentAuctions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lowestBidAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "buyNowPrice",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "ended",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "highestBid",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "highestBidder",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "sold",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "userId",
        "type": "string"
      }
    ],
    "name": "buyToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_newPrice",
        "type": "uint256"
      }
    ],
    "name": "changeTokenPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "getTokenExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_tokenURI",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "onSale",
        "type": "bool"
      },
      {
        "internalType": "address payable[]",
        "name": "royaltyAddresses",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "royaltyPercentage",
        "type": "uint256[]"
      },
      {
        "internalType": "bool",
        "name": "auction",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "biddingTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minBid",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nftCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "royalties",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "royal",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "percentage",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "serviceFeePercentage",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_admin",
        "type": "address"
      }
    ],
    "name": "setAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "uri",
        "type": "string"
      }
    ],
    "name": "setBaseUri",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_serviceFeePercentage",
        "type": "uint256"
      }
    ],
    "name": "setServiceFeePercentage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "auction",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "biddingTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minBid",
        "type": "uint256"
      }
    ],
    "name": "toggleForSale",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const signerEther = new ethers.Wallet(
  process.env.ADMIN_PRIVATE_ADDRESS,
  ethProvider
);


let contract = new ethers.Contract(
  environments.PROD == NODE_ENV ? process.env.CONTRACT_ADDRESS_MAINNET :
    process.env.CONTRACT_ADDRESS_TESTNET,
  MintoContract,
  signerEther
);

contract.on("BuyOrBid", (tokenId, auction, bid, amount, userId, sold, events) => {
  console.log(tokenId, auction, bid, amount, userId, sold)
  Promise.resolve(events.getTransaction()).then((event) => {
    console.log("------Here 1");

    const nftTokenId = tokenId;

    console.log("------Here 2");
    new Promise((resolve, reject) => {
      try {
        console.log("------Here 3");
        Promise.resolve(nftModel.find({ nftTokenId })).then((artWorkData) => {
          //console.log(artWorkData);

          if (!artWorkData || artWorkData.length <= 0) {
            console.log("No art work found");
            return;

          }

          const id = userId;
          const body = {
            formOfSale: artWorkData[0].formOfSale,
            nftId: artWorkData[0]._id,
            saleQuantity: artWorkData[0].saleQuantity,
            transactionHash: event,
            bidAmount: amount
          }
          //console.log(tokenId, auction, bid, amount, userId, event);

          console.log(body);

          if (auction) {
            if (bid) {
              try {
                console.log("------Here Bid");

                Promise.resolve(nftRepo.purchaseArtWork(id, body, artWorkData[0])).then((result) => {
                  console.log(result);
                });

              } catch (error) {
                logger.log(level.error, `<< purchaseArtWork() Bid Won error=${error}`);
              }
            } else if (!sold) {
              Promise.resolve(nftRepo.rejectBid(id, body, artWorkData[0])).then((result) => {
                console.log(result);
              });
            } else {
              Promise.resolve(nftRepo.bidAccepted(id, body, artWorkData[0])).then((result) => {
                console.log(result);
              });
            }
          } else {

            try {
              console.log("------Here Buy");

              Promise.resolve(nftRepo.purchaseArtWork(id, body, artWorkData[0])).then((result) => {
                console.log(result);
              });

            } catch (error) {
              logger.log(level.error, `<< purchaseArtWork() Fixedprice error=${error}`);
            }

          }
          resolve("success");

        });

      } catch (err) {
        logger.log(level.error, `<< Error() Error error=${err}`);
        reject(err);
      }
    });

  });



});

contract.on("ExternalTransfer", (tokenId, auction, onSale, from, to, events) => {
  console.log(tokenId, auction, onSale, from, to,)
  Promise.resolve(events.getTransaction()).then((event) => {
    console.log("------Here 1");

    const nftTokenId = tokenId;

    console.log("------Here 2");
    new Promise((resolve, reject) => {
      try {
        console.log("------Here 3");
        Promise.resolve(nftModel.find({ nftTokenId })).then((artWorkData) => {
          //console.log(artWorkData);

          if (!artWorkData || artWorkData.length <= 0) {
            console.log("No art work found");
            return;

          }

          const body = {
            formOfSale: artWorkData[0].formOfSale,
            nftId: artWorkData[0]._id,
            saleQuantity: artWorkData[0].saleQuantity,
            transactionHash: event,
            from,
            to
          }

          console.log(body);

          Promise.resolve(userModel.find({
            connectedWallet: {
              $elemMatch: {
                walletAddress: { $eq: to },
              },
            }
          })).then((result) => {
            let userId;
            if (result && result.length > 0) {
              userId = result[0].id
            } else {
              userId = to
            }

            if (onSale) {
              if (auction) {

                Promise.resolve(bidModel.find(
                  { status: "BID", nftId: artWorkData[0]._id, auctionId: artWorkData[0].auctionId })).then((result) => {
                    if (result && result.length > 0) {
                      Promise.resolve(nftRepo.rejectBid(result[0].bidderId, body, artWorkData[0])).then((result) => {
                        console.log("Ownweship Transfered");
                      });
                    }
                  });
              }
            }
            Promise.resolve(nftRepo.transferOwnership(userId, body, artWorkData[0], "EXTERNALTX", "EXTERNAL")).then((result) => {
              console.log("Ownweship Transfered");
            });
          });

          resolve("success");

        });

      } catch (err) {
        logger.log(level.error, `<< Error() Error error=${err}`);
        reject(err);
      }
    });

  });



});

