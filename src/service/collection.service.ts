import { level, logger } from "../config/logger";
import collectionModel from "../model/collection";

export const addUserCollection = async (collection: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const collectionCreate = new collectionModel(collection);
      const addedCollection = await Promise.resolve(collectionCreate.save());
      resolve(addedCollection);
    } catch (err) {
      reject(err);
    }
  });
};

export const getMyCollectixonListPipeline = (
  filter: any,
  extraParams: any,
  count: boolean
) => {
  logger.log(level.info, `>> getMyCollectionListPipeline()`);
  let search = filter.search;
  if (!filter.search) {
    search = "";
  }
  let pipeline = [];
  if (filter.ownerId) {
    pipeline = [
      ...pipeline,
      { $match: { ownerId: filter.ownerId, status: "ACTIVE" }, },
    ];
  }

  if (filter.sortBy === "DATE") {
    if (!filter.orderBy || Number(filter.orderBy) === 0) {
      filter.orderBy = -1;
    }
    pipeline = [...pipeline, { $sort: { updatedAt: Number(filter.orderBy) } }];
  }

  // ? Show most liked artwork in ascending and descending order
  if (filter.sortBy === "POPULARITY") {
    if (!filter.orderBy || Number(filter.orderBy) === 0) {
      filter.orderBy = -1;
    }
    pipeline = [
      ...pipeline,
      { $sort: { total_likes: Number(filter.orderBy) } },
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



export const getMyCollectionListPipelineX = (
  filter: any,
  extraParams: any,
  count: boolean
) => {
  logger.log(level.info, `>> getMyCollectionListPipeline()`);
  let search = filter.search;
  if (!filter.search) {
    search = "";
  }
  let pipeline = [];
  if (filter.userId) {
    pipeline = [
      ...pipeline,
      { $match: { ownerId: filter.userId, status: "ACTIVE" } },
    ];
  }
  if (filter.authUserId) {
    pipeline = [
      ...pipeline,
      {
        $lookup: {
          from: "collectionlikes",
          let: { collectionId: { "$toString": "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$collectionId", "$$collectionId"] },
                    { $eq: ["$liked", true] },
                    {
                      $eq: ["$userId", filter.authUserId],
                    },
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
    { $match: { status: "ACTIVE" } },

    {
      $lookup: {
        let: { "userObjId": { "$toObjectId": "$ownerId" } },
        from: "users",
        pipeline: [
          { $match: { "$expr": { "$eq": ["$_id", "$$userObjId"] } } }
        ],
        as: "userData"
      }
    },

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
      $group: {
        _id: "$_id",
        isLiked: { $first: "$isLiked" },
        userId: { $first: "$userId" },
        title: { $first: "$title" },
        collectionData: {
          $push: {
            _id: "$nftData._id",
            userId: "$nftData.ownerId",
            title: "$nftData.title",
            nftCategory: "$nftData.nftCategory",
            formOfSale: "$nftData.formOfSale",
            totalSaleQuantity: "$nftData.totalSaleQuantity",
            contractType: "$nftData.contractType",
            contractAddress: "$nftData.contractAddress",
            files: "$nftData.file",
            saleCoin: "$nftData.saleCoin",
            mintNft: "$nftData.mintNft",
            fixedPrice: "$nftData.fixedPrice",
            description: "$nftData.description",
            royalty: "$nftData.royalty",
            mintResponse: "$nftData.mintResponse",
            nftToken: "$nftData.nftToken",
            createdAt: "$nftData.createdAt",
            coinId: { $arrayElemAt: ["$coinData.coins.id", 0] },
            coinName: { $arrayElemAt: ["$coinData.coins.coinName", 0] },
          },
        },
        collectionId: { $first: "$collectionId" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        userData: { $first: "$userData" },
      },
    },

    {
      $lookup: {
        from: "collectionlikes",
        let: { collectionId: { "$toString": "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$collectionId", "$$collectionId"] },
                  { $eq: ["$liked", true] },
                ],
              },
            },
          },
        ],
        as: "collectionLikes",
      },
    },

    {
      $project: {
        _id: 1,
        user_id: 1,
        isLiked: 1,
        title: 1,
        collectionData: 1,
        collectionId: 1,
        createdAt: 1,updatedAt: 1,


        totalLikes: { $size: "$collectionLikes" },
        creator: {
          userId: { $arrayElemAt: ["$userData._id", 0] },
          fullName: { $arrayElemAt: ["$userData.fullName", 0] },
          username: { $arrayElemAt: ["$userData.username", 0] },
          avatar: { $arrayElemAt: ["$userData.avatar", 0] },
          bio: { $arrayElemAt: ["$userData.bio", 0] },
          //email: { $arrayElemAt: ["$userData.email", 0] },
          coverImage: { $arrayElemAt: ["$userData.coverImage", 0] },
        }
      },
    },

    {
      $match: {
        $or: [{ title: { $regex: search, $options: "i" } }],
      },
    },
  ];

  if (filter.sortBy === "DATE") {
    if (!filter.orderBy || Number(filter.orderBy) === 0) {
      filter.orderBy = -1;
    }
    pipeline = [...pipeline, { $sort: { updatedAt: Number(filter.orderBy) } }];
  }

  // ? Show most liked artwork in ascending and descending order
  if (filter.sortBy === "POPULARITY") {
    if (!filter.orderBy || Number(filter.orderBy) === 0) {
      filter.orderBy = -1;
    }
    pipeline = [
      ...pipeline,
      { $sort: { totalLikes: Number(filter.orderBy) } },
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


export const getMyCollectionListPipeline = (
  filter: any,
  extraParams: any,
  count: boolean
) => {
  logger.log(level.info, `>> getMyCollectionListPipeline()`);
  let search = filter.search;
  if (!filter.search) {
    search = "";
  }
  let pipeline = [];
  if (filter.ownerId) {

    pipeline = [
      ...pipeline,
      { $match: { ownerId: filter.ownerId} },
    ];
  }
  if (filter._id) {

    pipeline = [
      ...pipeline,
      { $match: { _id: filter._id } },
    ];
  }
  if (filter.authUserId) {
    pipeline = [
      ...pipeline,
      {
        $lookup: {
          from: "collectionlikes",
          let: { collectionId: { "$toString": "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$collectionId", "$$collectionId"] },
                    { $eq: ["$liked", true] },
                    {
                      $eq: ["$userId", filter.authUserId],
                    },
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
    { $match: { status: "ACTIVE" } },
    {
      $lookup: {
        let: { "userObjId": { "$toObjectId": "$ownerId" } },
        from: "users",
        pipeline: [
          { $match: { "$expr": { "$eq": ["$_id", "$$userObjId"] } } }
        ],
        as: "userData"
      }
    },

    {
      $lookup: {
        from: "collectionlikes",
        let: { collectionId: { "$toString": "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$collectionId", "$$collectionId"] },
                  { $eq: ["$liked", true] },
                ],
              },
            },
          },
        ],
        as: "collectionLikes",
      },
    },

    {
      $project: {
        _id: 1,
        title: 1,
        image: 1,
        totalLikes: { $size: "$collectionLikes" },
        isLiked: "$isLiked",
        nftCount: { $size: "$collectionData" },
        createdAt: 1,updatedAt: 1,
        creator: {
          userId: { $arrayElemAt: ["$userData._id", 0] },
          fullName: { $arrayElemAt: ["$userData.fullName", 0] },
          username: { $arrayElemAt: ["$userData.username", 0] },
          avatar: { $arrayElemAt: ["$userData.avatar", 0] },
          bio: { $arrayElemAt: ["$userData.bio", 0] },
          coverImage: { $arrayElemAt: ["$userData.coverImage", 0] },
          //email: { $arrayElemAt: ["$userData.email", 0] }
        }
      },
    },

    {
      $match: {
        $or: [{ title: { $regex: search, $options: "i" } }],
      },
    },
  ];

  if (filter.sortBy === "DATE") {
    if (!filter.orderBy || Number(filter.orderBy) === 0) {
      filter.orderBy = -1;
    }
    pipeline = [...pipeline, { $sort: { updatedAt: Number(filter.orderBy) } }];
  }

  // ? Show most liked artwork in ascending and descending order
  if (filter.sortBy === "POPULARITY") {
    if (!filter.orderBy || Number(filter.orderBy) === 0) {
      filter.orderBy = -1;
    }
    pipeline = [
      ...pipeline,
      { $sort: { totalLikes: Number(filter.orderBy) } },
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

export const getMyCollectionListPipelineY = (
  filter: any,
  extraParams: any,
  count: boolean
) => {
  logger.log(level.info, `>> getMyCollectionListPipeline()`);
  let search = filter.search;
  if (!filter.search) {
    search = "";
  }
  let pipeline = [];
  if (filter.ownerId) {

    pipeline = [
      ...pipeline,
      { $match: { ownerId: filter.ownerId} },
    ];
  }
  if (filter._id) {

    pipeline = [
      ...pipeline,
      { $match: { _id: filter._id } },
    ];
  }
  if (filter.authUserId) {
    pipeline = [
      ...pipeline,
      {
        $lookup: {
          from: "collectionlikes",
          let: { collectionId: { "$toString": "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$collectionId", "$$collectionId"] },
                    { $eq: ["$liked", true] },
                    {
                      $eq: ["$userId", filter.authUserId],
                    },
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
    { $match: { status: "ACTIVE" } },
    {
      $lookup: {
        let: { "userObjId": { "$toObjectId": "$ownerId" } },
        from: "users",
        pipeline: [
          { $match: { "$expr": { "$eq": ["$_id", "$$userObjId"] } } }
        ],
        as: "userData"
      }
    },

    {
      $lookup: {
        from: "collectionlikes",
        let: { collectionId: { "$toString": "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$collectionId", "$$collectionId"] },
                  { $eq: ["$liked", true] },
                ],
              },
            },
          },
        ],
        as: "collectionLikes",
      },
    },

    {
      $project: {
        _id: 1,
        title: 1,
        image: 1,
        totalLikes: { $size: "$collectionLikes" },
        isLiked: "$isLiked",
        nftCount: { $size: "$collectionData" },
        createdAt: 1,updatedAt: 1,


 
        // creator: {
        //   userId: { $arrayElemAt: ["$userData._id", 0] },
        //   fullName: { $arrayElemAt: ["$userData.fullName", 0] },
        //   username: { $arrayElemAt: ["$userData.username", 0] },
        //   avatar: { $arrayElemAt: ["$userData.avatar", 0] },
        //   bio: { $arrayElemAt: ["$userData.bio", 0] },
        //   coverImage: { $arrayElemAt: ["$userData.coverImage", 0] },
        //   //email: { $arrayElemAt: ["$userData.email", 0] }
        // }
      },
    },

    {
      $match: {
        $or: [{ title: { $regex: search, $options: "i" } }],
      },
    },
  ];

  if (filter.sortBy === "DATE") {
    if (!filter.orderBy || Number(filter.orderBy) === 0) {
      filter.orderBy = -1;
    }
    pipeline = [...pipeline, { $sort: { updatedAt: Number(filter.orderBy) } }];
  }

  // ? Show most liked artwork in ascending and descending order
  if (filter.sortBy === "POPULARITY") {
    if (!filter.orderBy || Number(filter.orderBy) === 0) {
      filter.orderBy = -1;
    }
    pipeline = [
      ...pipeline,
      { $sort: { totalLikes: Number(filter.orderBy) } },
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

export const getMyCollectionListPipeline1 = (
  _id: any,
) => {
  logger.log(level.info, `>> getMyCollectionListPipeline()`);

  let pipeline = [];

  pipeline = [
    ...pipeline,
    { $match: { $expr : { $eq: [ '$_id' , { $toObjectId: _id } ] } } }
  ];


  pipeline = [
    ...pipeline,
    { $match: {  status: "ACTIVE" }},

    {
      $lookup: {
        let: { "userObjId": { "$toObjectId": "$ownerId" } },
        from: "users",
        pipeline: [
          { $match: { "$expr": { "$eq": ["$_id", "$$userObjId"] } } }
        ],
        as: "userData"
      }
    },

    {
      $lookup: {
        from: "collectionlikes",
        let: { collectionId: { "$toString": "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$collectionId", "$$collectionId"] },
                  { $eq: ["$liked", true] },
                ],
              },
            },
          },
        ],
        as: "collectionLikes",
      },
    },

    {
      $project: {
        _id: 1,
        title: 1,
        image: 1,
        totalLikes: { $size: "$collectionLikes" },
        isLiked: "$isLiked",
        nftCount: { $size: "$collectionData" },
        createdAt: 1,updatedAt: 1,
        creator: {
          userId: { $arrayElemAt: ["$userData._id", 0] },
          fullName: { $arrayElemAt: ["$userData.fullName", 0] },
          username: { $arrayElemAt: ["$userData.username", 0] },
          avatar: { $arrayElemAt: ["$userData.avatar", 0] },
          bio: { $arrayElemAt: ["$userData.bio", 0] },
          coverImage: { $arrayElemAt: ["$userData.coverImage", 0] },
          email: { $arrayElemAt: ["$userData.email", 0] }
        }
      },
    }
  ];


  return pipeline;
};