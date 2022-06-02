import bidModel from "../model/bid";

export const highestBidPipeline = (nftId: string) => {
  let pipeline = [];
  pipeline = [
    ...pipeline,
    { $match: { nftId, status: "BID" } },
    {
      $lookup: {
        let: { "bidderId": { "$toObjectId": "$bidderId" } },
        from: "users",
        pipeline: [
          { $match: { "$expr": { "$eq": ["$_id", "$$bidderId"] } } }
        ],
        as: "userData"
      }
    },
    { $unwind: "$userData" },
    {
      $project: {
        nftId: 1,
        saleCoin: 1,
        bidAmount: { $toDouble: "$bidAmount" },
        bidderId: 1,
        createdAt: 1,updatedAt: 1,


        email: "$userData.email",
        username: "$userData.username",
        transactionHash: 1,
      },
    },
    { $sort: { bidAmount: -1 } },
    { $limit: 1 },
  ];
  return pipeline;
};

interface PurchaseInput {
  bidderId: string;
  nftId: string;
  saleCoin: number;
  auctionId: string;
  bidAmount: string;
  transactionHash?: any;
}

export const addBid = async (purchaseData: PurchaseInput) => {
  return new Promise((resolve, reject) => {
    try {
      const ownerAdded = new bidModel(purchaseData);
      const addedOwner = Promise.resolve(ownerAdded.save());
      resolve(addedOwner);
    } catch (err) {
      reject(err);
    }
  });
};


export const bidHistoryPipeline = (
  art_work_id: any,
  extraParams: any,
  count: boolean
) => {
  let pipeline = [];
  pipeline = [
    ...pipeline,
    { $match: { art_work_id, auction_ended: false } },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "user_id",
        as: "userData",
      },
    },
    { $unwind: "$userData" },
    {
      $lookup: {
        from: "coins",
        let: { coin_id: "$sale_coin" },
        pipeline: [
          { $match: { $expr: { $in: ["$$coin_id", "$coins.id"] } } },
          { $unwind: "$coins" },
          { $match: { $expr: { $eq: ["$coins.id", "$$coin_id"] } } },
        ],
        as: "coinData",
      },
    },
    {
      $project: {
        art_work_id: 1,
        sale_coin: 1,
        sale_price: { $toDouble: "$sale_price" },
        user_id: 1,
        bid_id: 1,
        created_at: 1,
        transactionHash: "$transactionHash.transactionHash",
        coin_id: { $arrayElemAt: ["$coinData.coins.id", 0] },
        coin_name: { $arrayElemAt: ["$coinData.coins.coin_name", 0] },
        email: "$userData.email",
        nickname: "$userData.nickname",
        profile_image: "$userData.profile_image",
      },
    },
    { $sort: { created_at: -1 } },
  ];

  if (count) {
    pipeline.push({ $count: "total" });
  }
  if (extraParams) {
    if (extraParams.skip) pipeline.push({ $skip: Number(extraParams.skip) });
    if (extraParams.limit) pipeline.push({ $limit: Number(extraParams.limit) });
  }

  return pipeline;
};
