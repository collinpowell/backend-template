

export const creatorsListPipeline = (extraParams: any, count: boolean) => {
    let pipeline = [];
    pipeline = [
        ...pipeline,
        {
            $lookup: {
                let: { "userId": { "$toString": "$_id" } },
                from: "nfts",
                pipeline: [
                    { $match: { "$expr": { "$eq": ["$creatorId", "$$userId"] } } }
                ],
                as: "nftData"
            }
        },
        { $unwind: "$nftData" },
     
        {
            $group: {
                _id: "$_id",
               //totalPolygonSold: { $sum: { $toDouble: "$ownerData.price" } },
                username: { $first: "$username" },
                avatar: { $first: "$avatar" },
                coverImage: { $first: "$coverImage" },
                fullName: { $first: "$fullName" },
                bio: { $first: "$bio" },
            },
        },
        {
            $lookup: {
                let: { "userId": { "$toString": "$_id" } },
                from: "collections",
                pipeline: [
                    { $match: { "$expr": { "$eq": ["$ownerId", "$$userId"] } } }
                ],
                as: "collectionsData",

            },
        },
        {
            $project: {
                _id : 0 ,
                userId: "$_id",
                totalSold: 1,
                fullName: 1,
                username: 1,
                bio: 1,
                avatar: 1,
                totalCreation: 1,
                totalEthSold:1,
                coverImage: 1,
                totalPolygonSold:1,
                totalCollection: { $size: "$collectionsData" },
                createdAt:1
            },
        },
        { $sort: { totalSold: -1 } },
        { $sort: { totalCollection: -1 } },
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

export const sellersListPipeline = (extraParams: any, count: boolean) => {
    let pipeline = [];
    pipeline = [
        ...pipeline,
        {
            $lookup: {
                let: { "userId": { "$toString": "$_id" } },
                from: "nfts",
                pipeline: [
                    { $match: { "$expr": { "$eq": ["$creatorId", "$$userId"] } } }
                ],
                as: "nftData"
            }
        },
        { $unwind: "$nftData" },
        {
            $lookup: {
                let: { "nftId": { "$toString": "$nftData._id" } },
                from: "ownerhistories",
                pipeline: [
                    { $match: { "$expr": { "$eq": ["$nftId", "$$nftId"] } } }
                ],
                as: "ownerData",
            },
        },
        { $unwind: "$ownerData" }, 
        {
            $group: {
                _id: "$_id",
                totalPolygonSold: { $sum: { $toDouble: "$ownerData.price" } },
                username: { $first: "$username" },
                avatar: { $first: "$avatar" },
                coverImage: { $first: "$coverImage" },
                fullName: { $first: "$fullName" },
                bio: { $first: "$bio" },
            },
        },
        {
            $lookup: {
                let: { "userId": { "$toString": "$_id" } },
                from: "collections",
                pipeline: [
                    { $match: { "$expr": { "$eq": ["$ownerId", "$$userId"] } } }
                ],
                as: "collectionsData",

            },
        },
        {
            $project: {
                _id : 0 ,
                userId: "$_id",
                totalSold: 1,
                fullName: 1,
                username: 1,
                bio: 1,
                avatar: 1,
                coverImage: 1,
                totalCreation: 1,
                totalEthSold:1,
                totalPolygonSold:1,
                totalCollection: { $size: "$collectionsData" },
                createdAt:1
            },
            
        },
        { $sort: { totalSold: -1 } },
        { $sort: { totalCollection: -1 } },
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