import ownerHistoryModel from "../model/nftOwnersHistory";
//import ownerPurchase1155Model from "../model/owner_purchase_history_1155";

interface PurchaseInput {
  userId: string;
  nftId: string;
  coin: number;
  price: string;
  transactionHash?: Object;
  nftTransfer?: Object;
  currentOwnerAddress?: string;
  quantity?: number;
  creatorUserId?: string;
  sellerUserId?: string;
  purchaseType?: string;
}


export const addOwnerHistory = async (purchaseData: PurchaseInput) => {
  return new Promise((resolve, reject) => {
    try {
      const ownerAdded = new ownerHistoryModel(purchaseData);
      const addedOwner = Promise.resolve(ownerAdded.save());
      resolve(addedOwner);
    } catch (err) {
      reject(err);
    }
  });
};

// export const addOwnerHistory1155 = async (purchaseData: PurchaseInput) => {
//   return new Promise((resolve, reject) => {
//     try {
//       const ownerAdded = new ownerPurchase1155Model(purchaseData);
//       const addedOwner = Promise.resolve(ownerAdded.save());
//       resolve(addedOwner);
//     } catch (err) {
//       reject(err);
//     }
//   });
// };
