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
      { $match: { ownerId: filter.ownerId, status: "ACTIVE" } ,},
    ];
  }
  // if (filter.auth_user_id) {
  //   pipeline = [
  //     ...pipeline,
  //     {
  //       $lookup: {
  //         from: "collection_likes",
  //         let: { collection_id: "$collection_id" },
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $and: [
  //                   { $eq: ["$collection_id", "$$collection_id"] },
  //                   { $eq: ["$liked", true] },
  //                   {
  //                     $eq: ["$user_id", filter.auth_user_id],
  //                   },
  //                 ],
  //               },
  //             },
  //           },
  //         ],
  //         as: "isLiked",
  //       },
  //     },
  //     {
  //       $addFields: {
  //         is_liked: {
  //           $cond: {
  //             if: { $gt: [{ $size: "$isLiked" }, 0] },
  //             then: true,
  //             else: false,
  //           },
  //         },
  //       },
  //     },
  //   ];
  // }
  // pipeline = [
  //   ...pipeline,
  //   { $match: { status: "ACTIVE" } },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "user_id",
  //       foreignField: "user_id",
  //       as: "userData",
  //     },
  //   },
  //   { $unwind: "$collection_data" },
  //   {
  //     $lookup: {
  //       from: "artworks",
  //       localField: "collection_data.art_work_id",
  //       foreignField: "art_work_id",
  //       as: "artWorkData",
  //     },
  //   },
  //   { $unwind: "$artWorkData" },
  //   {
  //     $lookup: {
  //       from: "coins",
  //       let: { coin_id: "$artWorkData.sale_coin" },
  //       pipeline: [
  //         { $match: { $expr: { $in: ["$$coin_id", "$coins.id"] } } },
  //         { $unwind: "$coins" },
  //         { $match: { $expr: { $eq: ["$coins.id", "$$coin_id"] } } },
  //       ],
  //       as: "coinData",
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$_id",
  //       is_liked: { $first: "$is_liked" },
  //       user_id: { $first: "$user_id" },
  //       title: { $first: "$title" },
  //       collection_data: {
  //         $push: {
  //           _id: "$artWorkData._id",
  //           user_id: "$artWorkData.user_id",
  //           title: "$artWorkData.title",
  //           art_work_category: "$artWorkData.art_work_category",
  //           form_of_sale: "$artWorkData.form_of_sale",
  //           total_sale_quantity: "$artWorkData.total_sale_quantity",
  //           contract_type: "$artWorkData.contract_type",
  //           contract_address: "$artWorkData.contract_address",
  //           files: "$artWorkData.files",
  //           sale_coin: "$artWorkData.sale_coin",
  //           mint_nft: "$artWorkData.mint_nft",
  //           sale_price: "$artWorkData.sale_price",
  //           common_art_id: "$artWorkData.common_art_id",
  //           description: "$artWorkData.description",
  //           royalty: "$artWorkData.royalty",
  //           mint_response: "$artWorkData.mint_response",
  //           selling_available: "$artWorkData.selling_available",
  //           nft_token: "$artWorkData.nft_token",
  //           art_work_id: "$artWorkData.art_work_id",
  //           parent_art_work_id: "$artWorkData.parent_art_work_id",
  //           created_at: "$artWorkData.created_at",
  //           coin_id: { $arrayElemAt: ["$coinData.coins.id", 0] },
  //           coin_name: { $arrayElemAt: ["$coinData.coins.coin_name", 0] },
  //         },
  //       },
  //       collection_id: { $first: "$collection_id" },
  //       created_at: { $first: "$created_at" },
  //       updated_at: { $first: "$updated_at" },
  //       userData: { $first: "$userData" },
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "collection_likes",
  //       let: { collection_id: "$collection_id" },
  //       pipeline: [
  //         {
  //           $match: {
  //             $expr: {
  //               $and: [
  //                 { $eq: ["$collection_id", "$$collection_id"] },
  //                 { $eq: ["$liked", true] },
  //               ],
  //             },
  //           },
  //         },
  //       ],
  //       as: "collectionLikes",
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       user_id: 1,
  //       is_liked: 1,
  //       title: 1,
  //       collection_data: 1,
  //       collection_id: 1,
  //       created_at: 1,
  //       totalLikes: { $size: "$collectionLikes" },
  //       creator_nickname: { $arrayElemAt: ["$userData.nickname", 0] },
  //       creator_profile: { $arrayElemAt: ["$userData.profile_image", 0] },
  //       creator_cover: { $arrayElemAt: ["$userData.cover_image", 0] },
  //       creator_email: { $arrayElemAt: ["$userData.email", 0] },
  //     },
  //   },
  //   {
  //     $match: {
  //       $or: [{ title: { $regex: search, $options: "i" } }],
  //     },
  //   },
  // ];

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
