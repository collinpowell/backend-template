import { level, logger } from "../config/logger";
import { create } from "ipfs-http-client";
import nftModel, { FileTypes } from "../model/nft";
import moment from "moment-timezone";
import fs from "fs";
import fetch from "node-fetch";

const ipfsClient = async () => {
    const ipfs = await create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
    });
    return ipfs;
};
//  let ipfs = await ipfsClient();
// const result = await ipfs.get("QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u")

export const addNFTService = async (nft: any, metaData: string) => {

    let nftToken = {};

    let tokenId = 0;

    //console.log(nft.mintResponse.events.Transfer)
    if (nft.mintNft === 0) {
        // ! ETH CODE
        tokenId = nft.mintResponse.events.Transfer.returnValues.tokenId;
    }

    if (nft.mintNft === 1) {
        // ! Polygon code
        tokenId = nft.mintResponse.events.Transfer.returnValues.tokenId;
    }
    nftToken = {
        tokenId: tokenId,
        metaData: metaData,
    };

    nft = {
        ...nft,
        nftToken,
    };
    // http://ipfs.io/ipfs/
    const result = await (await fetch("http://ipfs.io/ipfs/" + metaData)).json();
    result.nftCategory = nft.nftCategory;
    await addArtWorkFunction(nft, result);
    return;
}

export const addArtWorkFunction = (nft: any, metaData: any) => {
    if (nft.formOfSale === "AUCTION") {
        const auctionEndTime = moment()
            .add(Number(nft.auctionEndHours), "hours")
            .toDate()
            .toISOString();
        nft = { ...nft, auctionEndTime };

    }
    nft = { ...nft, ...metaData };


    return new Promise((resolve, reject) => {
        try {

            const artWorkCreate = new nftModel(nft);
            const addedArtWork = Promise.resolve(artWorkCreate.save());
            // ipfs.io/ipfs/QmbSWW46MajGJBPRuXYutGATSnXZvY6MvUvvVLeg1SCQMu
            resolve(addedArtWork);
        } catch (err) {
            reject(err);
        }
    });
};

export const getMyAllArtCreationsPipeline = (
    filter: any,
    extraParams: any,
    count: boolean,
    created: boolean,
) => {
    logger.log(level.info, `>> getMyAllArtCreationsPipeline()`);
    let search = filter.search;
    if (!filter.search) {
        search = "";
    }
    let pipeline = [];

    if (filter.userId) {
        pipeline = [
            ...pipeline,
            created ?
                {
                    $match: {
                        $and: [
                            { creatorId: { $eq: filter.userId } },
                        ],
                    },
                }
                : {
                    $match: {
                        $and: [
                            { ownerId: { $eq: filter.userId } },
                        ],
                    },
                },
            {
                $lookup: {
                    from: "nftlikes",
                    let: { "nftId": { "$toString": "$_id" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$nftId", "$$nftId"] },
                                        { $eq: ["$liked", true] },
                                        { $eq: ["$userId", filter.userId] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "isLiked",
                },
            },
            {
                $addFields: {
                    isLiked: {
                        $cond: {
                            if: { $gt: [{ $size: "$isLiked" }, 0] },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
        ];
    }

    pipeline = [
        ...pipeline,
        ...commonArtworkPipeline,
        {
            $project: {
                title: 1,
                nftCategory: 1,
                isLiked: 1,
                totalLikes: { $size: "$nftLikes" },
                formOfSale: 1,
                file: 1,
                nftToken: 1,
                fixedPrice: { $toDouble: "$fixedPrice" },
                ownerId: 1,
                auctionEndTime: 1,
                auctionStartPrice: { $toDouble: "$auctionStartPrice" },
                description: 1,
                royalty: 1,
                _id: 1,
                createdAt: 1,
                categoryId: "$categoryData.category.id",
                categoryName: "$categoryData.category.categoryName",
                coinId: { $arrayElemAt: ["$coinData.coins.id", 0] },
                coinName: { $arrayElemAt: ["$coinData.coins.coinName", 0] },
                contractType: 1,
                saleQuantity: 1,
                contractAddress: 1,
                mintNft: 1,
                creator: {
                    creatorUsername: { $arrayElemAt: ["$userData.username", 0] },
                    creatorAbout: { $arrayElemAt: ["$userData.bio", 0] },
                    _id: { $arrayElemAt: ["$userData._id", 0] },
                    userAvatar: { $arrayElemAt: ["$userData.avatar", 0] },
                    userCover: { $arrayElemAt: ["$userData.coverImage", 0] },
                    creatorEmail: { $arrayElemAt: ["$userData.email", 0] },
                },
                currentOwner: {
                    currentOwnerUsername: {
                        $arrayElemAt: ["$currentOwnerData.username", 0],
                    },
                    currentOwnerAvatar: {
                        $arrayElemAt: ["$currentOwnerData.avatar", 0],
                    },
                    currentOwnerId: { $arrayElemAt: ["$currentOwnerData._id", 0] },
                    currentOwnerEmail: { $arrayElemAt: ["$currentOwnerData.email", 0] },
                },
                isCreator: {
                    $cond: {
                        if: {
                            $and: [{ $eq: ["$creatorId", filter.userId] }],
                        },
                        then: true,
                        else: false,
                    },
                },
                differance: {
                    $subtract: [
                        "$auctionEndHours",
                        {
                            $divide: [
                                { $subtract: [new Date(), "$createdAt"] },
                                60 * 1000 * 60,
                            ],
                        },
                    ],
                },
            },
        },
        {
            $match: {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { coinName: { $regex: search, $options: "i" } },
                ],
            },
        },
    ];

    if (filter.formOfSale) {
        pipeline = [...pipeline, { $match: { formOfSale: filter.formOfSale } }];
    }
    if (filter.sortBy === "latest") {
        if (!filter.orderBy || Number(filter.orderBy) === 0) {
            filter.orderBy = -1;
        }
        pipeline = [...pipeline, { $sort: { created_at: Number(filter.orderBy) } }];
    }

    // ? Show most liked artwork in ascending and descending order
    if (filter.sortBy === "popular") {
        if (!filter.orderBy || Number(filter.orderBy) === 0) {
            filter.orderBy = -1;
        }
        pipeline = [...pipeline, { $sort: { totalLikes: Number(filter.orderBy) } }];
    }

    // ? Show most liked artwork in ascending and descending order
    if (filter.sortBy === "price") {
        if (!filter.orderBy || Number(filter.orderBy) === 0) {
            filter.orderBy = -1;
        }
        pipeline = [
            ...pipeline,
            {
                $sort: {
                    fixedPrice: Number(filter.orderBy),
                    auctionStartPrice: Number(filter.orderBy),
                },
            },
        ];
    }

    if (count) {
        pipeline.push({ $count: "total" });
    }
    if (extraParams) {
        if (extraParams.skip) pipeline.push({ $skip: Number(extraParams.skip) });
        if (extraParams.limit) pipeline.push({ $limit: Number(extraParams.limit) });
    }

    return pipeline;
};

const commonArtworkPipeline = [
    {

        $match: {
            $or: [
                { contractType: "ERC721" },
                {
                    $and: [{ contractType: "ERC1155" }, { saleQuantity: { $gt: 0 } }],
                },
            ],
        },
    },
    {
        $lookup: {
            let: { "userObjId": { "$toObjectId": "$ownerId" } },
            from: "users",
            pipeline: [
                { $match: { "$expr": { "$eq": ["$_id", "$$userObjId"] } } }
            ],
            as: "currentOwnerData"
        }
    },
    {
        $lookup: {
            let: { "userObjId": { "$toObjectId": "$creatorId" } },
            from: "users",
            pipeline: [
                { $match: { "$expr": { "$eq": ["$_id", "$$userObjId"] } } }
            ],
            as: "userData"
        }
    },
    {
        $lookup: {
            from: "nftlikes",
            let: { "nftId": { "$toString": "$_id" } },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$nftId", "$$nftId"] },
                                { $eq: ["$liked", true] },
                            ],
                        },
                    },
                },
            ],
            as: "nftLikes",
        },
    },
    {
        $lookup: {
            from: "categories",
            let: { categoryId: "$nftCategory" },
            pipeline: [
                { $match: { $expr: { $in: ["$$categoryId", "$category.id"] } } },
                { $unwind: "$category" },
                { $match: { $expr: { $eq: ["$category.id", "$$categoryId"] } } },
            ],
            as: "categoryData",
        },
    },
    { $unwind: "$categoryData" },
    {
        $lookup: {
            from: "coins",
            let: { coinId: "$saleCoin" },
            pipeline: [
                { $match: { $expr: { $in: ["$$coinId", "$coins.id"] } } },
                { $unwind: "$coins" },
                { $match: { $expr: { $eq: ["$coins.id", "$$coinId"] } } },
            ],
            as: "coinData",
        },
    },
];

export const uploadToIPFSService = async (nftDetails: any, files: FileTypes[]) => {
    let ipfs = await ipfsClient();

    const res = await Promise.all(
        files.map(async (file: FileTypes, index) => {

            const data = fs.readFileSync(file.path);

            let options = {
                warpWithDirectory: false,
                progress: (prog: number) => true,
            };

            let result = await ipfs.add(data, options);

            const metaData = {
                ...nftDetails,
                file: "http://ipfs.io/ipfs/" + result.path
            }

            let metaResult = await ipfs.add(JSON.stringify(metaData), options);

            console.log(metaResult.path);

            //ipfs.io/ipfs/QmYp24NxCCoBybmyJbD4WF3Xcs3awf6dzcHhUfZunivyCJ

            //console.log(result.path);
            return metaResult.path;
        })
    );
    files.map((file: FileTypes) => {
        fs.unlink(file.path, () => {
            console.log("successfully Deleted");
        });
    });
    return res[0];
};


export const browseByCollectionPipeline = (
    filter: any,
    extraParams: any,
    count: boolean,
) => {
    logger.log(level.info, `>> browseByCollectionPipeline()`);
    let search = filter.search;
    if (!filter.search) {
        search = "";
    }
    let pipeline = [];

    pipeline = [
        ...pipeline,
        { $match: { status: "ACTIVE" } },
        { $unwind: "$collectionData" },
        {
            $lookup: {
                let: { "nftObjId": { "$toObjectId": "$collectionData.nftId" } },
                from: "nfts",
                pipeline: [
                    { $match: { "$expr": { "$eq": ["$_id", "$$nftObjId"] } } }
                ],
                as: "nftData"
            }
        },

        { $unwind: "$nftData" },
        {
            $lookup: {
                from: "nftlikes",
                let: { "nftId": { "$toString": "$nftData._id" } },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$nftId", "$$nftId"] },
                                    { $eq: ["$liked", true] },
                                    { $eq: ["$userId", filter.userId] },
                                ],
                            },
                        },
                    },
                ],
                as: "isLiked",
            },
        },
        {
            $addFields: {
                isLiked: {
                    $cond: {
                        if: { $gt: [{ $size: "$isLiked" }, 0] },
                        then: true,
                        else: false,
                    },
                },
            },
        },

        {

            $match: {
                $or: [
                    { "nftData.contractType": "ERC721" },
                    {
                        $and: [{ "nftData.contractType": "ERC1155" }, { "nftData.saleQuantity": { $gt: 0 } }],
                    },
                ],
            },
        },
        {
            $lookup: {
                let: { "userObjId": { "$toObjectId": "$nftData.ownerId" } },
                from: "users",
                pipeline: [
                    { $match: { "$expr": { "$eq": ["$_id", "$$userObjId"] } } }
                ],
                as: "currentOwnerData"
            }
        },
        {
            $lookup: {
                let: { "userObjId": { "$toObjectId": "$nftData.creatorId" } },
                from: "users",
                pipeline: [
                    { $match: { "$expr": { "$eq": ["$_id", "$$userObjId"] } } }
                ],
                as: "userData"
            }
        },
        {
            $lookup: {
                from: "nftlikes",
                let: { "nftId": { "$toString": "$nftData._id" } },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$nftId", "$$nftId"] },
                                    { $eq: ["$liked", true] },
                                ],
                            },
                        },
                    },
                ],
                as: "nftLikes",
            },
        },
        {
            $lookup: {
                from: "categories",
                let: { categoryId: "$nftData.nftCategory" },
                pipeline: [
                    { $match: { $expr: { $in: ["$$categoryId", "$category.id"] } } },
                    { $unwind: "$category" },
                    { $match: { $expr: { $eq: ["$category.id", "$$categoryId"] } } },
                ],
                as: "categoryData",
            },
        },
        { $unwind: "$categoryData" },
        {
            $lookup: {
                from: "coins",
                let: { coinId: "$nftData.saleCoin" },
                pipeline: [
                    { $match: { $expr: { $in: ["$$coinId", "$coins.id"] } } },
                    { $unwind: "$coins" },
                    { $match: { $expr: { $eq: ["$coins.id", "$$coinId"] } } },
                ],
                as: "coinData",
            },
        },
        {
            $project: {
                _id: "$nftData._id",
                title: "$nftData.title",
                nftCategory: "$nftData.title",
                isLiked: 1,
                totalLikes: { $size: "$nftLikes" },
                formOfSale: "$nftData.formOfSale",
                file: "$nftData.file",
                nftToken: "$nftData.nftToken",
                fixedPrice: { $toDouble: "$fixedPrice" },
                ownerId: "$nftData.ownerId",
                auctionEndTime: "$nftData.auctionEndTime",
                auctionStartPrice: { $toDouble: "$auctionStartPrice" },
                description: "$nftData.description",
                royalty: "$nftData.royalty",
                createdAt: "$nftData.createdAt",
                categoryId: "$categoryData.category.id",
                categoryName: "$categoryData.category.categoryName",
                coinId: { $arrayElemAt: ["$coinData.coins.id", 0] },
                coinName: { $arrayElemAt: ["$coinData.coins.coinName", 0] },
                contractType: "$nftData.contractType",
                saleQuantity: "$nftData.saleQuantity",
                contractAddress: "$nftData.contractAddress",
                mintNft: "$nftData.mintNft",
                creator: {
                    creatorUsername: { $arrayElemAt: ["$userData.username", 0] },
                    creatorAbout: { $arrayElemAt: ["$userData.bio", 0] },
                    _id: { $arrayElemAt: ["$userData._id", 0] },
                    userAvatar: { $arrayElemAt: ["$userData.avatar", 0] },
                    userCover: { $arrayElemAt: ["$userData.coverImage", 0] },
                    creatorEmail: { $arrayElemAt: ["$userData.email", 0] },
                },
                currentOwner: {
                    currentOwnerUsername: {
                        $arrayElemAt: ["$currentOwnerData.username", 0],
                    },
                    currentOwnerAvatar: {
                        $arrayElemAt: ["$currentOwnerData.avatar", 0],
                    },
                    currentOwnerId: { $arrayElemAt: ["$currentOwnerData._id", 0] },
                    currentOwnerEmail: { $arrayElemAt: ["$currentOwnerData.email", 0] },
                },
                isCreator: {
                    $cond: {
                        if: {
                            $and: [{ $eq: ["$creatorId", filter.userId] }],
                        },
                        then: true,
                        else: false,
                    },
                },
                differance: {
                    $subtract: [
                        "$auctionEndHours",
                        {
                            $divide: [
                                { $subtract: [new Date(), "$createdAt"] },
                                60 * 1000 * 60,
                            ],
                        },
                    ],
                },
            },
        },
        {
            $match: {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { coinName: { $regex: search, $options: "i" } },
                ],
            },
        },
    ]

    return pipeline;

}


export const getAllArtWorkPipeline = (
    filter: any,
    extraParams: any,
    count: boolean
  ) => {
    logger.log(level.info, `>> getAllArtWorkPipeline()`);
    let pipeline = [];
  
    if (filter.sortBy === "deadline") {
      pipeline = [
        ...pipeline,
        { $match: { form_of_sale: "auction", selling_available: true } },
      ];
    }
  
    if (filter.sortBy === "popular") {
      pipeline = [
        ...pipeline,
        { $match: { form_of_sale: "fixed_price", selling_available: true } },
      ];
    }
  
    if (filter.sortBy === "latest" || filter.sortBy === "price") {
      pipeline = [...pipeline, { $match: { selling_available: true } }];
    }
  
    if (filter.auth && filter.form_of_sale === "my_selling_work") {
      pipeline = [
        ...pipeline,
        {
          $match: {
            $or: [
              {
                $and: [
                  { user_id: { $ne: filter.user_id } },
                  { current_owner_id: { $eq: filter.user_id } },
                ],
              },
              {
                $and: [
                  { user_id: { $eq: filter.user_id } },
                  { current_owner_id: null },
                ],
              },
            ],
          },
        },
      ];
    }
  
    if (filter.user_id && filter.form_of_sale !== "my_selling_work") {
      pipeline = [
        ...pipeline,
  
        {
          $lookup: {
            from: "art_work_likes",
            let: { art_work_id: "$art_work_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$art_work_id", "$$art_work_id"] },
                      { $eq: ["$liked", true] },
                      { $eq: ["$user_id", filter.user_id] },
                    ],
                  },
                },
              },
            ],
            as: "isLiked",
          },
        },
        {
          $addFields: {
            is_liked: {
              $cond: {
                if: { $gt: [{ $size: "$isLiked" }, 0] },
                then: true,
                else: false,
              },
            },
          },
        },
      ];
    }
    pipeline = [
      ...pipeline,
      ...commonArtworkPipeline,
      {
        $project: {
          title: 1,
          art_work_category: 1,
          is_liked: 1,
          form_of_sale: 1,
          files: 1,
          nft_token: 1,
          sale_coin: 1,
          sale_price: 1,
          auction_end_time: 1,
          auction_start_price: 1,
          description: 1,
          royalty: 1,
          art_work_id: 1,
          created_at: 1,
          totalLikes: { $size: "$artworkLikes" },
          selling_available: 1,
          current_owner_id: 1,
          contract_type: 1,
          sale_quantity: 1,
          mint_nft: 1,
  
          total_sale_quantity: 1,
          parent_total_sale_quantity: 1,
          contract_address: 1,
          user_id: 1,
          category_id: "$categoryData.category.id",
          category_name: "$categoryData.category.category_name",
          coin_id: { $arrayElemAt: ["$coinData.coins.id", 0] },
          coin_name: { $arrayElemAt: ["$coinData.coins.coin_name", 0] },
          creator: {
            creator_nickname: { $arrayElemAt: ["$userData.nickname", 0] },
            creator_about: { $arrayElemAt: ["$userData.about_me", 0] },
            user_id: { $arrayElemAt: ["$userData.user_id", 0] },
            user_profile: { $arrayElemAt: ["$userData.profile_image", 0] },
            user_cover: { $arrayElemAt: ["$userData.cover_image", 0] },
            creator_email: { $arrayElemAt: ["$userData.email", 0] },
          },
          current_owner: {
            current_owner_nickname: {
              $arrayElemAt: ["$currentOwnerData.nickname", 0],
            },
            current_owner_profile: {
              $arrayElemAt: ["$currentOwnerData.profile_image", 0],
            },
            current_owner_id: { $arrayElemAt: ["$currentOwnerData.user_id", 0] },
            current_owner_email: { $arrayElemAt: ["$currentOwnerData.email", 0] },
          },
          differance: {
            $subtract: [
              "$auction_end_hours",
              {
                $divide: [
                  { $subtract: [new Date(), "$created_at"] },
                  60 * 1000 * 60,
                ],
              },
            ],
          },
        },
      },
    ];
    if (
      filter.form_of_sale &&
      filter.form_of_sale !== "waiting_for_sale" &&
      filter.form_of_sale !== "creator_owned_work" &&
      filter.form_of_sale !== "my_selling_work"
    ) {
      pipeline = [...pipeline, { $match: { form_of_sale: filter.form_of_sale } }];
    }
  
    if (filter.form_of_sale && filter.form_of_sale === "creator_owned_work") {
      pipeline = [
        ...pipeline,
        {
          $match: {
            $or: [
              // { $gt: ["$sale_quantity", 0] },
              { $and: [{ current_owner_id: null }] },
              { $expr: { $eq: ["$user_id", "$current_owner_id"] } },
            ],
          },
        },
      ];
    }
  
    if (
      filter.art_work_category === 0 ||
      filter.art_work_category === 1 ||
      filter.art_work_category
    ) {
      pipeline = [
        ...pipeline,
        { $match: { art_work_category: Number(filter.art_work_category) } },
      ];
    }
  
    if (filter.sortBy === "latest") {
      if (!filter.orderBy || Number(filter.orderBy) === 0) {
        filter.orderBy = -1;
      }
      pipeline = [...pipeline, { $sort: { created_at: Number(filter.orderBy) } }];
    }
  
    // ? Show most liked artwork in ascending and descending order
    if (filter.sortBy === "popular") {
      if (!filter.orderBy || Number(filter.orderBy) === 0) {
        filter.orderBy = -1;
      }
      pipeline = [...pipeline, { $sort: { totalLikes: Number(filter.orderBy) } }];
    }
  
    // ? Show most liked artwork in ascending and descending order
    if (filter.sortBy === "price") {
      if (!filter.orderBy || Number(filter.orderBy) === 0) {
        filter.orderBy = -1;
      }
      pipeline = [
        ...pipeline,
        {
          $sort: {
            sale_price: Number(filter.orderBy),
            auction_start_price: Number(filter.orderBy),
          },
        },
      ];
    }
    // ? Show artwork whose auction is about to end which is in 12 hours
    // ? and it will not show artworks whose end time is passed
    if (filter.sortBy === "deadline") {
      if (!filter.orderBy || Number(filter.orderBy) === 0) {
        filter.orderBy = -1;
      }
      pipeline = [...pipeline, { $sort: { differance: Number(filter.orderBy) } }];
    }
  
    // ? Show most liked artwork in ascending and descending order
    if (filter.sortBy === "popular") {
      if (!filter.orderBy || Number(filter.orderBy) === 0) {
        filter.orderBy = -1;
      }
      pipeline = [...pipeline, { $sort: { totalLikes: Number(filter.orderBy) } }];
    }
  
    if (!filter.sortBy) {
      if (!filter.orderBy || Number(filter.orderBy) === 0) {
        filter.orderBy = -1;
      }
      pipeline = [...pipeline, { $sort: { created_at: Number(filter.orderBy) } }];
    }
  
    if (count) {
      pipeline.push({ $count: "total" });
    }
    if (extraParams) {
      if (extraParams.skip) pipeline.push({ $skip: Number(extraParams.skip) });
      if (extraParams.limit) pipeline.push({ $limit: Number(extraParams.limit) });
    }
    return pipeline;
  };
  