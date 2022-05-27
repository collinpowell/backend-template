import { level, logger } from "../config/logger";
import { create } from "ipfs-http-client";
import nftModel, { FileTypes } from "../model/nft";
import auctionModel from "../model/auction"
import mongoose from "mongoose";
import moment from "moment-timezone";
import fs from "fs";
import fetch from "node-fetch";
import { BigNumber } from 'ethers'

const ipfsClient = async () => {
    const ipfs = await create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
    });
    return ipfs;
};
export const addNFTService = async (nft: any, metaData: string, auction: any) => {

    let tokenId = 0;

    if (nft.mintNft === 0) {
        // ! ETH CODE
        tokenId = BigNumber.from(nft.mintResponse.events[0].args[2]).toNumber();
    }

    if (nft.mintNft === 1) {
        // ! Polygon code
        tokenId = BigNumber.from(nft.mintResponse.events[0].args[2]).toNumber();
    }

    nft = {
        ...nft,
        nftTokenId: tokenId,
    };
    // http://ipfs.io/ipfs/
    const result = await (await fetch("http://ipfs.io/ipfs/" + metaData)).json();
    result.nftCategory = nft.nftCategory;
    await addArtWorkFunction(nft, result, auction);
    return;
}

export const addArtWorkFunction = (nft: any, metaData: any, auction: any) => {
    if (nft.formOfSale === "AUCTION") {
        const auctionEndTime = moment()
            .add(Number(auction.auctionEndHours), "hours")
            .toDate()
            .toISOString();
        auction = { ...auction, auctionEndTime };

    }
    nft = { ...nft, ...metaData };


    return new Promise((resolve, reject) => {
        try {

            const artWorkCreate = new nftModel(nft);
            if (nft.formOfSale === "AUCTION") {
                auction = { ...auction, nftId: artWorkCreate._id };
                const auctionCreate = new auctionModel(auction);
                artWorkCreate.auctionId = auctionCreate._id
                Promise.resolve(auctionCreate.save())
            }
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
        { $match: { status: "ACTIVE" } },
        {
            $project: {
                title: 1,
                isLiked: 1,
                totalLikes: { $size: "$nftLikes" },
                formOfSale: 1,
                file: 1,
                nftTokenId: 1,
                fixedPrice: { $toDouble: "$fixedPrice" },
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
                currentAuction: {
                    auctionEndHours: { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                    auctionEndTime: { $arrayElemAt: ["$auction.auctionEndTime", 0] },
                    auctionStartPrice: { $arrayElemAt: ["$auction.auctionStartPrice", 0] },
                    auctionEnded: { $arrayElemAt: ["$auction.auctionEnded", 0] },
                    ownerId: { $arrayElemAt: ["$auction.ownerId", 0] },
                    nftId: { $arrayElemAt: ["$auction.nftId", 0] },
                    auctionHighestBid: "$bids",
                    difference: {
                        $subtract: [
                            { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                            {
                                $divide: [
                                    { $subtract: [new Date(), { $arrayElemAt: ["$auction.createdAt", 0] }] },
                                    60 * 1000 * 60,
                                ],
                            },
                        ],
                    },
                },
                creator: {
                    userId: { $arrayElemAt: ["$userData._id", 0] },
                    fullName: { $arrayElemAt: ["$userData.fullName", 0] },
                    username: { $arrayElemAt: ["$userData.username", 0] },
                    avatar: { $arrayElemAt: ["$userData.avatar", 0] },
                    bio: { $arrayElemAt: ["$userData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$userData.coverImage", 0] },
                },
                currentOwner: {
                    userId: { $arrayElemAt: ["$currentOwnerData._id", 0] },
                    fullName: { $arrayElemAt: ["$currentOwnerData.fullName", 0] },
                    username: { $arrayElemAt: ["$currentOwnerData.username", 0] },
                    avatar: { $arrayElemAt: ["$currentOwnerData.avatar", 0] },
                    bio: { $arrayElemAt: ["$currentOwnerData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$currentOwnerData.coverImage", 0] },
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
                isOwner: {
                    $cond: {
                        if: {
                            $and: [{ $eq: ["$ownerId", filter.userId] }],
                        },
                        then: true,
                        else: false,
                    },
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
    if (filter.sortBy === "DATE") {
        if (!filter.orderBy || Number(filter.orderBy) === 0) {
            filter.orderBy = -1;
        }
        pipeline = [...pipeline, { $sort: { created_at: Number(filter.orderBy) } }];
    }

    // ? Show most liked artwork in ascending and descending order
    if (filter.sortBy === "POPULARITY") {
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
                    //auctionStartPrice: Number(filter.orderBy),
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
            let: { "userObjId": { "$toObjectId": "$auctionId" } },
            from: "auctions",
            pipeline: [
                { $match: { "$expr": { "$eq": ["$_id", "$$userObjId"] } } }
            ],
            as: "auction"
        }
    },
    {
        $lookup: {
            let: { "userObjId": { "$toObjectId": "$auctionId" } },
            from: "bids",
            pipeline: [
                { $match: { "$expr": { "$eq": ["$auctionId", "$$userObjId"] } } }
            ],
            as: "bids"
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
        { $match: { _id: new mongoose.Types.ObjectId(filter._id) } },
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
                let: { "userObjId": { "$toObjectId": "$nftData.auctionId" } },
                from: "auctions",
                pipeline: [
                    { $match: { "$expr": { "$eq": ["$_id", "$$userObjId"] } } }
                ],
                as: "auction"
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
                title: "$nftData.title",
                isLiked: 1,
                totalLikes: { $size: "$nftLikes" },
                formOfSale: "$nftData.formOfSale",
                file: "$nftData.file",
                nftTokenId: "$nftData.nftTokenId",
                fixedPrice: { $toDouble: "$nftData.fixedPrice" },
                description: "$nftData.description",
                royalty: "$nftData.royalty",
                _id: "$nftData._id",
                createdAt: "$nftData.createdAt",
                categoryId: "$categoryData.category.id",
                categoryName: "$categoryData.category.categoryName",
                coinId: { $arrayElemAt: ["$coinData.coins.id", 0] },
                coinName: { $arrayElemAt: ["$coinData.coins.coinName", 0] },
                contractType: "$nftData.contractType",
                saleQuantity: "$nftData.saleQuantity",
                contractAddress: "$nftData.contractAddress",
                mintNft: "$nftData.mintNft",
                currentAuction: {
                    auctionEndHours: { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                    auctionEndTime: { $arrayElemAt: ["$auction.auctionEndTime", 0] },
                    auctionStartPrice: { $arrayElemAt: ["$auction.auctionStartPrice", 0] },
                    auctionEnded: { $arrayElemAt: ["$auction.auctionEnded", 0] },
                    ownerId: { $arrayElemAt: ["$auction.ownerId", 0] },
                    nftId: { $arrayElemAt: ["$auction.nftId", 0] },
                    auctionHighestBid: "$bids",
                    difference: {
                        $subtract: [
                            { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                            {
                                $divide: [
                                    { $subtract: [new Date(), { $arrayElemAt: ["$auction.createdAt", 0] }] },
                                    60 * 1000 * 60,
                                ],
                            },
                        ],
                    },
                },
                creator: {
                    userId: { $arrayElemAt: ["$userData._id", 0] },
                    fullName: { $arrayElemAt: ["$userData.fullName", 0] },
                    username: { $arrayElemAt: ["$userData.username", 0] },
                    avatar: { $arrayElemAt: ["$userData.avatar", 0] },
                    bio: { $arrayElemAt: ["$userData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$userData.coverImage", 0] },
                },
                currentOwner: {
                    userId: { $arrayElemAt: ["$currentOwnerData._id", 0] },
                    fullName: { $arrayElemAt: ["$currentOwnerData.fullName", 0] },
                    username: { $arrayElemAt: ["$currentOwnerData.username", 0] },
                    avatar: { $arrayElemAt: ["$currentOwnerData.avatar", 0] },
                    bio: { $arrayElemAt: ["$currentOwnerData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$currentOwnerData.coverImage", 0] },
                },
                isCreator: {
                    $cond: {
                        if: {
                            $and: [{ $eq: ["$nftData.creatorId", filter.userId] }],
                        },
                        then: true,
                        else: false,
                    },
                },
                isOwner: {
                    $cond: {
                        if: {
                            $and: [{ $eq: ["$nftData.ownerId", filter.userId] }],
                        },
                        then: true,
                        else: false,
                    },
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
    if (count) {
        pipeline.push({ $count: "total" });
    }
    if (extraParams) {
        if (extraParams.skip) pipeline.push({ $skip: Number(extraParams.skip) });
        if (extraParams.limit) pipeline.push({ $limit: Number(extraParams.limit) });
    }
    return pipeline;

}

export const browseByBookmarkPipeline = (
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

    if (filter.formOfSale === "AUCTION" || filter.formOfSale === "FIXEDPRICE" ) {
        pipeline = [
            ...pipeline,
            { $match: { formOfSale: filter.formOfSale } },
        ];
    }

    pipeline = [
        ...pipeline,

        { $match: { userId: filter.userId } },
        { $match: { bookmarked: true } },
        {
            $lookup: {
                let: { "nftObjId": { "$toObjectId": "$nftId" } },
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
            $lookup: {
                let: { "userObjId": { "$toObjectId": "$nftData.auctionId" } },
                from: "auctions",
                pipeline: [
                    { $match: { "$expr": { "$eq": ["$_id", "$$userObjId"] } } }
                ],
                as: "auction"
            }
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
                title: "$nftData.title",
                isLiked: 1,
                totalLikes: { $size: "$nftLikes" },
                formOfSale: "$nftData.formOfSale",
                file: "$nftData.file",
                nftTokenId: "$nftData.nftTokenId",
                fixedPrice: { $toDouble: "$nftData.fixedPrice" },
                description: "$nftData.description",
                royalty: "$nftData.royalty",
                _id: "$nftData._id",
                createdAt: "$nftData.createdAt",
                categoryId: "$categoryData.category.id",
                categoryName: "$categoryData.category.categoryName",
                coinId: { $arrayElemAt: ["$coinData.coins.id", 0] },
                coinName: { $arrayElemAt: ["$coinData.coins.coinName", 0] },
                contractType: "$nftData.contractType",
                saleQuantity: "$nftData.saleQuantity",
                contractAddress: "$nftData.contractAddress",
                mintNft: "$nftData.mintNft",
                currentAuction: {
                    auctionEndHours: { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                    auctionEndTime: { $arrayElemAt: ["$auction.auctionEndTime", 0] },
                    auctionStartPrice: { $arrayElemAt: ["$auction.auctionStartPrice", 0] },
                    auctionEnded: { $arrayElemAt: ["$auction.auctionEnded", 0] },
                    ownerId: { $arrayElemAt: ["$auction.ownerId", 0] },
                    auctionHighestBid: "$bids",
                    nftId: { $arrayElemAt: ["$auction.nftId", 0] },
                    difference: {
                        $subtract: [
                            { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                            {
                                $divide: [
                                    { $subtract: [new Date(), { $arrayElemAt: ["$auction.createdAt", 0] }] },
                                    60 * 1000 * 60,
                                ],
                            },
                        ],
                    },
                },
                creator: {
                    userId: { $arrayElemAt: ["$userData._id", 0] },
                    fullName: { $arrayElemAt: ["$userData.fullName", 0] },
                    username: { $arrayElemAt: ["$userData.username", 0] },
                    avatar: { $arrayElemAt: ["$userData.avatar", 0] },
                    bio: { $arrayElemAt: ["$userData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$userData.coverImage", 0] },
                },
                currentOwner: {
                    userId: { $arrayElemAt: ["$currentOwnerData._id", 0] },
                    fullName: { $arrayElemAt: ["$currentOwnerData.fullName", 0] },
                    username: { $arrayElemAt: ["$currentOwnerData.username", 0] },
                    avatar: { $arrayElemAt: ["$currentOwnerData.avatar", 0] },
                    bio: { $arrayElemAt: ["$currentOwnerData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$currentOwnerData.coverImage", 0] },
                },
                isCreator: {
                    $cond: {
                        if: {
                            $and: [{ $eq: ["$nftData.creatorId", filter.userId] }],
                        },
                        then: true,
                        else: false,
                    },
                },
                isOwner: {
                    $cond: {
                        if: {
                            $and: [{ $eq: ["$nftData.ownerId", filter.userId] }],
                        },
                        then: true,
                        else: false,
                    },
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
    if (count) {
        pipeline.push({ $count: "total" });
    }
    if (extraParams) {
        if (extraParams.skip) pipeline.push({ $skip: Number(extraParams.skip) });
        if (extraParams.limit) pipeline.push({ $limit: Number(extraParams.limit) });
    }
    return pipeline;

}


export const getAllArtWorkPipeline = (
    filter: any,
    extraParams: any,
    count: boolean
) => {
    logger.log(level.info, `>> getAllArtWorkPipeline()`);
    let search = filter.search;
    if (!filter.search) {
        search = "";
    }
    let pipeline = [];

    if (filter.sortBy === "deadline") {
        pipeline = [
            ...pipeline,
            { $match: { formOfSale: "AUCTION" } },
        ];
    }

    if (filter.sortBy === "POPULARITY") {
        pipeline = [
            ...pipeline,
            { $match: { formOfSale: "FIXEDPRICE" } },
        ];
    }

    if (filter.sortBy === "DATE" || filter.sortBy === "PRICE") {

        pipeline = [...pipeline, {
            $match: {
                $or: [
                    { formOfSale: "FIXEDPRICE" },
                    { formOfSale: "AUCTION" }
                ]
            }

        }];

    }

    if (filter.formOfSale) {
        console.log(filter.formOfSale)
        pipeline = [...pipeline, { $match: { formOfSale: filter.formOfSale } }];
    }
    pipeline = [
        ...pipeline,
        ...commonArtworkPipeline,
        {
            $project: {
                title: 1,
                isLiked: 1,
                totalLikes: { $size: "$nftLikes" },
                formOfSale: 1,
                file: 1,
                nftTokenId: 1,
                fixedPrice: { $toDouble: "$fixedPrice" },
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
                currentAuction: {
                    auctionEndHours: { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                    auctionEndTime: { $arrayElemAt: ["$auction.auctionEndTime", 0] },
                    auctionStartPrice: { $arrayElemAt: ["$auction.auctionStartPrice", 0] },
                    auctionEnded: { $arrayElemAt: ["$auction.auctionEnded", 0] },
                    ownerId: { $arrayElemAt: ["$auction.ownerId", 0] },
                    nftId: { $arrayElemAt: ["$auction.nftId", 0] },
                    auctionHighestBid: "$bids",
                    difference: {
                        $subtract: [
                            { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                            {
                                $divide: [
                                    { $subtract: [new Date(), { $arrayElemAt: ["$auction.createdAt", 0] }] },
                                    60 * 1000 * 60,
                                ],
                            },
                        ],
                    },
                },
                creator: {
                    userId: { $arrayElemAt: ["$userData._id", 0] },
                    fullName: { $arrayElemAt: ["$userData.fullName", 0] },
                    username: { $arrayElemAt: ["$userData.username", 0] },
                    avatar: { $arrayElemAt: ["$userData.avatar", 0] },
                    bio: { $arrayElemAt: ["$userData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$userData.coverImage", 0] },
                },
                currentOwner: {
                    userId: { $arrayElemAt: ["$currentOwnerData._id", 0] },
                    fullName: { $arrayElemAt: ["$currentOwnerData.fullName", 0] },
                    username: { $arrayElemAt: ["$currentOwnerData.username", 0] },
                    avatar: { $arrayElemAt: ["$currentOwnerData.avatar", 0] },
                    bio: { $arrayElemAt: ["$currentOwnerData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$currentOwnerData.coverImage", 0] },
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
                isOwner: {
                    $cond: {
                        if: {
                            $and: [{ $eq: ["$ownerId", filter.userId] }],
                        },
                        then: true,
                        else: false,
                    },
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

    if (
        filter.nftCategory
    ) {
        pipeline = [
            ...pipeline,
            { $match: { categoryId: Number(filter.nftCategory) } },
        ];
    }


    if (filter.sortBy === "DATE") {
        if (!filter.orderBy || Number(filter.orderBy) === 0) {
            filter.orderBy = -1;
        }
        pipeline = [...pipeline, { $sort: { createdAt: Number(filter.orderBy) } }];
    }

    // ? Show most liked artwork in ascending and descending order
    if (filter.sortBy === "POPULARITY") {
        if (!filter.orderBy || Number(filter.orderBy) === 0) {
            filter.orderBy = -1;
        }
        pipeline = [...pipeline, { $sort: { totalLikes: Number(filter.orderBy) } }];
    }

    // ? Show most liked artwork in ascending and descending order
    if (filter.sortBy === "PRICE") {
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
    // ? Show artwork whose auction is about to end which is in 12 hours
    // ? and it will not show artworks whose end time is passed
    if (filter.sortBy === "deadline") {
        if (!filter.orderBy || Number(filter.orderBy) === 0) {
            filter.orderBy = -1;
        }
        pipeline = [...pipeline, { $sort: { difference: Number(filter.orderBy) } }];
    }

    // ? Show most liked artwork in ascending and descending order
    if (filter.sortBy === "POPULARITY") {
        if (!filter.orderBy || Number(filter.orderBy) === 0) {
            filter.orderBy = -1;
        }
        pipeline = [...pipeline, { $sort: { totalLikes: Number(filter.orderBy) } }];
    }

    if (!filter.sortBy) {
        if (!filter.orderBy || Number(filter.orderBy) === 0) {
            filter.orderBy = -1;
        }
        pipeline = [...pipeline, { $sort: { createdAt: Number(filter.orderBy) } }];
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

export const getTrendingArtWorkPipeline = (
    filter: any,
    extraParams: any,
    count: boolean
) => {
    logger.log(level.info, `>> getAllArtWorkPipeline()`);
    let pipeline = [];

    if (filter.formOfSale) {
        console.log(filter.formOfSale)
        pipeline = [...pipeline, { $match: { formOfSale: filter.formOfSale } }];
    }
    pipeline = [
        ...pipeline,
        ...commonArtworkPipeline,
        {
            $project: {
                title: 1,
                isLiked: 1,
                totalLikes: { $size: "$nftLikes" },
                formOfSale: 1,
                file: 1,
                nftTokenId: 1,
                fixedPrice: { $toDouble: "$fixedPrice" },
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
                currentAuction: {
                    auctionEndHours: { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                    auctionEndTime: { $arrayElemAt: ["$auction.auctionEndTime", 0] },
                    auctionStartPrice: { $arrayElemAt: ["$auction.auctionStartPrice", 0] },
                    auctionEnded: { $arrayElemAt: ["$auction.auctionEnded", 0] },
                    ownerId: { $arrayElemAt: ["$auction.ownerId", 0] },
                    nftId: { $arrayElemAt: ["$auction.nftId", 0] },
                    auctionHighestBid: "$bids",
                    difference: {
                        $subtract: [
                            { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                            {
                                $divide: [
                                    { $subtract: [new Date(), { $arrayElemAt: ["$auction.createdAt", 0] }] },
                                    60 * 1000 * 60,
                                ],
                            },
                        ],
                    },
                },
                creator: {
                    userId: { $arrayElemAt: ["$userData._id", 0] },
                    fullName: { $arrayElemAt: ["$userData.fullName", 0] },
                    username: { $arrayElemAt: ["$userData.username", 0] },
                    avatar: { $arrayElemAt: ["$userData.avatar", 0] },
                    bio: { $arrayElemAt: ["$userData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$userData.coverImage", 0] },
                },
                currentOwner: {
                    userId: { $arrayElemAt: ["$currentOwnerData._id", 0] },
                    fullName: { $arrayElemAt: ["$currentOwnerData.fullName", 0] },
                    username: { $arrayElemAt: ["$currentOwnerData.username", 0] },
                    avatar: { $arrayElemAt: ["$currentOwnerData.avatar", 0] },
                    bio: { $arrayElemAt: ["$currentOwnerData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$currentOwnerData.coverImage", 0] },
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
                isOwner: {
                    $cond: {
                        if: {
                            $and: [{ $eq: ["$ownerId", filter.userId] }],
                        },
                        then: true,
                        else: false,
                    },
                },

            },
        },
    ];

    pipeline = [
        ...pipeline,
        { $match: { totalLikes: {$ne:0 } }},
    ];
    pipeline = [...pipeline, { $sort: { totalLikes: Number(-1) } }];

    if (count) {
        pipeline.push({ $count: "total" });
    }
    if (extraParams) {
        if (extraParams.skip) pipeline.push({ $skip: Number(extraParams.skip) });
        if (extraParams.limit) pipeline.push({ $limit: Number(extraParams.limit) });
    }
    return pipeline;
};



export const getArtWorkDetailsPipeline = (filter: any) => {
    logger.log(level.info, `>> getArtWorkDetailsPipeline()`);
    let pipeline = [];
    if (filter.userId) {
        pipeline = [
            ...pipeline,
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

            {
                $lookup: {
                    from: "nftbookmarks",
                    let: { "nftId": { "$toString": "$_id" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$nftId", "$$nftId"] },
                                        { $eq: ["$bookmarked", true] },
                                        { $eq: ["$userId", filter.userId] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "isBookmarked",
                },
            },
            {
                $addFields: {
                    isBookmarked: {
                        $cond: {
                            if: { $gt: [{ $size: "$isBookmarked" }, 0] },
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
        { $match: { _id: new mongoose.Types.ObjectId(filter._id) } },
        ...commonArtworkPipeline,
        {
            $project: {
                title: 1,
                isLiked: 1,
                isBookmarked: 1,
                totalLikes: { $size: "$nftLikes" },
                formOfSale: 1,
                file: 1,
                nftTokenId: 1,
                fixedPrice: { $toDouble: "$fixedPrice" },
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
                currentAuction: {
                    auctionEndHours: { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                    auctionEndTime: { $arrayElemAt: ["$auction.auctionEndTime", 0] },
                    auctionStartPrice: { $arrayElemAt: ["$auction.auctionStartPrice", 0] },
                    auctionEnded: { $arrayElemAt: ["$auction.auctionEnded", 0] },
                    ownerId: { $arrayElemAt: ["$auction.ownerId", 0] },
                    nftId: { $arrayElemAt: ["$auction.nftId", 0] },
                    auctionHighestBid: "$bids",
                    difference: {
                        $subtract: [
                            { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                            {
                                $divide: [
                                    { $subtract: [new Date(), { $arrayElemAt: ["$auction.createdAt", 0] }] },
                                    60 * 1000 * 60,
                                ],
                            },
                        ],
                    },
                },
                creator: {
                    userId: { $arrayElemAt: ["$userData._id", 0] },
                    fullName: { $arrayElemAt: ["$userData.fullName", 0] },
                    username: { $arrayElemAt: ["$userData.username", 0] },
                    avatar: { $arrayElemAt: ["$userData.avatar", 0] },
                    bio: { $arrayElemAt: ["$userData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$userData.coverImage", 0] },
                },
                currentOwner: {
                    userId: { $arrayElemAt: ["$currentOwnerData._id", 0] },
                    fullName: { $arrayElemAt: ["$currentOwnerData.fullName", 0] },
                    username: { $arrayElemAt: ["$currentOwnerData.username", 0] },
                    avatar: { $arrayElemAt: ["$currentOwnerData.avatar", 0] },
                    bio: { $arrayElemAt: ["$currentOwnerData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$currentOwnerData.coverImage", 0] },
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
                isOwner: {
                    $cond: {
                        if: {
                            $and: [{ $eq: ["$ownerId", filter.userId] }],
                        },
                        then: true,
                        else: false,
                    },
                },

            },
        },
    ];
    return pipeline;
};

export const getAuctionPipeline = (filter: any) => {
    logger.log(level.info, `>> getArtWorkDetailsPipeline()`);
    let pipeline = [];
    if (filter.userId) {
        pipeline = [
            ...pipeline,
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
        { $match: { _id: new mongoose.Types.ObjectId(filter._id) } },
        ...commonArtworkPipeline,
        {
            $project: {
                title: 1,
                isLiked: 1,
                totalLikes: { $size: "$nftLikes" },
                formOfSale: 1,
                file: 1,
                nftTokenId: 1,
                fixedPrice: { $toDouble: "$fixedPrice" },
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
                currentAuction: {
                    auctionEndHours: { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                    auctionEndTime: { $arrayElemAt: ["$auction.auctionEndTime", 0] },
                    auctionStartPrice: { $arrayElemAt: ["$auction.auctionStartPrice", 0] },
                    auctionEnded: { $arrayElemAt: ["$auction.auctionEnded", 0] },
                    ownerId: { $arrayElemAt: ["$auction.ownerId", 0] },
                    nftId: { $arrayElemAt: ["$auction.nftId", 0] },
                    auctionHighestBid: "$bids",
                    difference: {
                        $subtract: [
                            { $arrayElemAt: ["$auction.auctionEndHours", 0] },
                            {
                                $divide: [
                                    { $subtract: [new Date(), { $arrayElemAt: ["$auction.createdAt", 0] }] },
                                    60 * 1000 * 60,
                                ],
                            },
                        ],
                    },
                },
                creator: {
                    userId: { $arrayElemAt: ["$userData._id", 0] },
                    fullName: { $arrayElemAt: ["$userData.fullName", 0] },
                    username: { $arrayElemAt: ["$userData.username", 0] },
                    avatar: { $arrayElemAt: ["$userData.avatar", 0] },
                    bio: { $arrayElemAt: ["$userData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$userData.coverImage", 0] },
                },
                currentOwner: {
                    userId: { $arrayElemAt: ["$currentOwnerData._id", 0] },
                    fullName: { $arrayElemAt: ["$currentOwnerData.fullName", 0] },
                    username: { $arrayElemAt: ["$currentOwnerData.username", 0] },
                    avatar: { $arrayElemAt: ["$currentOwnerData.avatar", 0] },
                    bio: { $arrayElemAt: ["$currentOwnerData.bio", 0] },
                    coverImage: { $arrayElemAt: ["$currentOwnerData.coverImage", 0] },
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
                isOwner: {
                    $cond: {
                        if: {
                            $and: [{ $eq: ["$ownerId", filter.userId] }],
                        },
                        then: true,
                        else: false,
                    },
                },

            },
        },
    ];
    return pipeline;
};

export const getSellerOtherArtworkPipeline = (art_work_id, seller_id, maxCount) => {
    let pipeline = [
        {
            $match: {
                $and: [
                    { ownerId: { $eq: seller_id } },
                    { _id: { $ne: new mongoose.Types.ObjectId(art_work_id) } }
                ]
            }
        },
        {
            $limit: maxCount
        },
        {
            $project: {
                _id:1,
                title: 1,
                file: 1,
                nftTokenId: 1

            }
        }
    ];

    return pipeline;
}


export const getPipelineForPurchaseHistory = (art_work_id: string) => {
    let pipeline = [];
    pipeline = [
        { $match: { art_work_id } },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "user_id",
                as: "userData",
            },
        },
        {
            $lookup: {
                from: "coins",
                let: { coin_id: "$coin" },
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
                owner_history_id: 1,
                owner_history_1155_id: 1,
                coin: 1,
                price: 1,
                user_id: 1,
                art_work_id: 1,
                created_at: 1,
                parent_art_work_id: 1,
                quantity: 1,
                transactionHash: 1,
                nickname: { $arrayElemAt: ["$userData.nickname", 0] },
                email: { $arrayElemAt: ["$userData.email", 0] },
                about_me: { $arrayElemAt: ["$userData.about_me", 0] },
                user_profile: { $arrayElemAt: ["$userData.profile_image", 0] },
                user_cover: { $arrayElemAt: ["$userData.cover_image", 0] },
                coin_id: { $arrayElemAt: ["$coinData.coins.id", 0] },
                coin_name: { $arrayElemAt: ["$coinData.coins.coin_name", 0] },
                mint_nft: 1,
            },
        },
    ];

    return pipeline;
};


export const getBidHistoryPipeline = (
    filter: any,
    extraParams: any,
    count: boolean
) => {
    logger.log(level.info, `>> getAllArtWorkPipeline()`);
    let pipeline = [];

    pipeline =  [
        { $match: { nftId: filter.nftId, auctionId: filter.auctionId } },
        {
          $lookup: {
            let: { "userObjId": { "$toObjectId": "$userId" } },
            from: "users",
            pipeline: [
              { $match: { "$expr": { "$eq": ["$_id", "$$userObjId"] } } }
            ],
            as: "bidder"
          }
        },
        {
          $project: {
            id: "$_id",
            nftId: 1,
            bidder: {
              userId: { $arrayElemAt: ["$bidder._id", 0] },
              fullName: { $arrayElemAt: ["$bidder.fullName", 0] },
              username: { $arrayElemAt: ["$bidder.username", 0] },
              avatar: { $arrayElemAt: ["$bidder.avatar", 0] },
              bio: { $arrayElemAt: ["$bidder.bio", 0] },
              coverImage: { $arrayElemAt: ["$bidder.coverImage", 0] },
            },
            transactionHash: 1,
            bidAmount: 1,
            status: 1,
            createdAt: 1,
          }
        }
      ]

    pipeline = [...pipeline, { $sort: { createdAt: Number(-1) } }];

    if (count) {
        pipeline.push({ $count: "total" });
    }
    if (extraParams) {
        if (extraParams.skip) pipeline.push({ $skip: Number(extraParams.skip) });
        if (extraParams.limit) pipeline.push({ $limit: Number(extraParams.limit) });
    }
    return pipeline;
};