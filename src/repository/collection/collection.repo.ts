import { level, logger } from "../../config/logger";
import nftModel from "../../model/nft";
import collectionModel from "../../model/collection";
import userModel from "../../model/user";
import collectionLikesModel from "../../model/collectionLikes";
import {
  addUserCollection,
  getMyCollectionListPipeline,
  getMyCollectionListPipeline1,
  getMyCollectionListPipelineY
} from "../../service/collection.service";
import * as fs from "fs";
import { Storage } from "@google-cloud/storage";


import { decryptText, regexSpecialChar } from "../../utils/utility";

const googleCloud = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
});

const profileBucket = googleCloud.bucket(process.env.GOOGLE_BUCKET);

export const createCollection = async (id: string, body: any, file: any) => {
  logger.log(level.info, `>> createCollection()`);
  
  let data = { error: false, message: "" };

  if(!body.title || body.title.trim().length < 1) {
    data = {
      error: true,
      message:
        "Title is required",
    };
    return data;
  }
  if (body.title.trim().length > 20) {
    data = {
      error: true,
      message:
        "Collection title length must be less than equals to 20 characters",
    };
    return data;
  }


  if (data.error) {
    return data;
  }

  if (body.title) {

    const existTitle = await collectionModel.findOne({ title: body.title.toLocaleLowerCase(),status: "ACTIVE" });
    if (existTitle) {
      const data = { error: true, message: "Collection title is taken" };
      return data;
    }
  }


  let createData = {};

  createData = await uploadProfilePromise(file);

  createData = {
    ...createData,
    title: body.title.toLocaleLowerCase(),
    ownerId: id
  }


  await addUserCollection(createData);
  data = { error: false, message: "Collection Added Successfully" };
  return data;
};

export const uploadProfilePromise = async (file: any) => {
  let updateData = {};
  const profileData = fs.readFileSync(file.path);
  const blobProfile = profileBucket.file(`profile-${file.filename}`);

  return new Promise((resolve, reject) => {
    const blobStream = blobProfile.createWriteStream({ resumable: false });
    blobStream.on("error", (err) => {
      fs.unlink(file.path, () => {
        console.log("successfully Deleted");
      });
    });

    blobStream.on("finish", async () => {
      updateData = {
        ...updateData,
        image: `https://storage.googleapis.com/${profileBucket.name}/${blobProfile.name}`,
      };
      resolve(updateData);
    });
    blobStream.end(profileData);
    fs.unlink(file.path, () => {
      console.log("successfully Deleted");
    });
  });
};

export const getMyCollection = async (
  user_id: string,
  query: any,
  options: any,
  collectionId?: any
) => {
  logger.log(level.info, `>> getMyCollection()`);
  let filter = {};
  filter = { ...filter, ownerId: user_id, authUserId: user_id };
  if (query.sortBy) {
    filter = { ...filter, sortBy: query.sortBy };
  }
  if (collectionId) {
    filter = { ...filter, _id: collectionId };
  }
  if (query.orderBy) {
    filter = { ...filter, orderBy: query.orderBy };
  }
  if (query.search) {
    const search = regexSpecialChar(query.search);
    filter = { ...filter, search };
  }

  return await commonGetCollectionFunctionX(filter, options, query);
};

const commonGetCollectionFunctionX = async (
  filter: any,
  options: any,
  query?: any
) => {
  const pipeline = getMyCollectionListPipelineY(filter, options, false);
  let collectionList = await collectionModel.aggregate(pipeline).exec();

  let data = {};
  const count = await collectionModel.find({ ...filter }).count();
  console.log(collectionList.length)
  if (collectionList && collectionList.length > 0) {
    data = {
      error: false,
      message: "All Collection Fetched Successfully",
      data: {
        count,
        totalItems: count,
        currentPage: Number(query.page),
        itemPerPage: Number(query.limit),
        totalPages:
          Math.round(count / Number(query.limit)) < count / Number(query.limit)
            ? Math.round(count / Number(query.limit)) + 1
            : Math.round(count / Number(query.limit)),
        currentItemCount: collectionList.length,
        lastPage: count / Number(query.limit) <= Number(query.page),
        data: collectionList,
      }
    };
    return data;
  }
  data = {
    error: false,
    message: "All Collection Fetched Successfully",
    data: {
      totalItems: 0,count: 0,
      currentPage: Number(query.page),
      itemPerPage: Number(query.limit),
      totalPages:
        Math.round(count / Number(query.limit)) < count / Number(query.limit)
          ? Math.round(count / Number(query.limit)) + 1
          : Math.round(count / Number(query.limit)),
      currentItemCount: collectionList.length,
      lastPage: count / Number(query.limit) <= Number(query.page),
      data: [],
    }
  };
  return data;
};

const commonGetCollectionFunction = async (
  filter: any,
  options: any,
  query?: any
) => {
  const pipeline = getMyCollectionListPipeline(filter, options, false);
  let collectionList = await collectionModel.aggregate(pipeline).exec();

  let data = {};
  const count = await collectionModel.find({ ...filter }).count();
  console.log(collectionList.length)
  if (collectionList && collectionList.length > 0) {
    data = {
      error: false,
      message: "All Collection Fetched Successfully",
      data: {
        count,
        totalItems: count,
        currentPage: Number(query.page),
        itemPerPage: Number(query.limit),
        totalPages:
          Math.round(count / Number(query.limit)) < count / Number(query.limit)
            ? Math.round(count / Number(query.limit)) + 1
            : Math.round(count / Number(query.limit)),
        currentItemCount: collectionList.length,
        lastPage: count / Number(query.limit) <= Number(query.page),
        data: collectionList,
      }
    };
    return data;
  }
  data = {
    error: false,
    message: "All Collection Fetched Successfully",
    data: {
      totalItems: 0,count: 0,
      currentPage: Number(query.page),
      itemPerPage: Number(query.limit),
      totalPages:
        Math.round(count / Number(query.limit)) < count / Number(query.limit)
          ? Math.round(count / Number(query.limit)) + 1
          : Math.round(count / Number(query.limit)),
      currentItemCount: collectionList.length,
      lastPage: count / Number(query.limit) <= Number(query.page),
      data: [],
    }
  };
  return data;
};
export const getAllUsersCollection = async (query: any, options: any) => {
  logger.log(level.info, `>> getAllUsersCollection()`);
  let filter = {};
  if (query.authUserId) {
    filter = { ...filter, authUserId: query.authUserId };
  }

  if (query.userId) {
    filter = { ...filter, ownerId: query.userId };
  }
  if (query.sortBy) {
    filter = { ...filter, sortBy: query.sortBy };
  }
  if (query.orderBy) {
    filter = { ...filter, orderBy: query.orderBy };
  }
  if (query.search) {
    const search = regexSpecialChar(query.search);
    filter = { ...filter, search };
  }

  return await commonGetCollectionFunction(filter, options, query);
};


export const getCollectionDetails = async (query: any) => {
  logger.log(level.info, `>> getCollectionDetails()`);

  let pipeline = [];
  if (query.user_id) {
    pipeline = [
      ...pipeline,
      {
        $lookup: {
          from: "collection_likes",
          let: { collection_id: "$collection_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$collection_id", "$$collection_id"] },
                    { $eq: ["$liked", true] },
                    {
                      $eq: ["$user_id", query.user_id],
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
  let collectionExist = await collectionModel.aggregate([
    ...pipeline,
    { $match: { is_deleted: false, collection_id: query.collection_id } },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "user_id",
        as: "userData",
      },
    },
    { $unwind: "$collection_data" },
    {
      $lookup: {
        from: "artworks",
        localField: "collection_data.art_work_id",
        foreignField: "art_work_id",
        as: "artWorkData",
      },
    },
    { $unwind: "$artWorkData" },
    {
      $lookup: {
        from: "coins",
        let: { coin_id: "$artWorkData.sale_coin" },
        pipeline: [
          { $match: { $expr: { $in: ["$$coin_id", "$coins.id"] } } },
          { $unwind: "$coins" },
          { $match: { $expr: { $eq: ["$coins.id", "$$coin_id"] } } },
        ],
        as: "coinData",
      },
    },
    {
      $group: {
        _id: "$_id",
        user_id: { $first: "$user_id" },
        is_liked: { $first: "$is_liked" },
        title: { $first: "$title" },
        collection_data: {
          $push: {
            _id: "$artWorkData._id",
            user_id: "$artWorkData.user_id",
            title: "$artWorkData.title",
            art_work_category: "$artWorkData.art_work_category",
            formOfSale: "$artWorkData.formOfSale",
            total_sale_quantity: "$artWorkData.total_sale_quantity",
            contract_type: "$artWorkData.contract_type",
            contract_address: "$artWorkData.contract_address",
            files: "$artWorkData.files",
            sale_coin: "$artWorkData.sale_coin",
            mint_nft: "$artWorkData.mint_nft",
            sale_price: "$artWorkData.sale_price",
            common_art_id: "$artWorkData.common_art_id",
            description: "$artWorkData.description",
            royalty: "$artWorkData.royalty",
            mint_response: "$artWorkData.mint_response",
            selling_available: "$artWorkData.selling_available",
            nft_token: "$artWorkData.nft_token",
            art_work_id: "$artWorkData.art_work_id",
            parent_art_work_id: "$artWorkData.parent_art_work_id",
            created_at: "$artWorkData.created_at",
            coin_id: { $arrayElemAt: ["$coinData.coins.id", 0] },
            coin_name: { $arrayElemAt: ["$coinData.coins.coin_name", 0] },
          },
        },
        collection_id: { $first: "$collection_id" },
        created_at: { $first: "$created_at" },
        updated_at: { $first: "$updated_at" },
        userData: { $first: "$userData" },
      },
    },
    {
      $lookup: {
        from: "collection_likes",
        let: { collection_id: "$collection_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$collection_id", "$$collection_id"] },
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
        title: 1,
        is_liked: 1,
        collection_data: 1,
        collection_id: 1,
        created_at: 1,
        creator: {
          creator_nickname: { $arrayElemAt: ["$userData.nickname", 0] },
          creator_profile: { $arrayElemAt: ["$userData.profile_image", 0] },
          creator_cover: { $arrayElemAt: ["$userData.cover_image", 0] },
          creator_email: { $arrayElemAt: ["$userData.email", 0] },
        },
        totalLikes: { $size: "$collectionLikes" },
      },
    },
  ]);

  if (!collectionExist || collectionExist.length <= 0) {
    const data = { error: true, message: "Collection Not Found" };
    return data;
  }

  let collectionData = {};
  let artWorkData = [];
  await Promise.all(
    collectionExist[0].collection_data.map(async (data) => {
      const userData = await userModel.find({ user_id: data.user_id });
      let currentUserData;
      if (
        data.current_owner_id !== null &&
        data.current_owner_id !== undefined
      ) {
        currentUserData = await userModel.find({
          user_id: data.current_owner_id,
        });
      } else {
        currentUserData = userData;
      }
      artWorkData.push({
        ...data,
        art_work: data.title,
        creator: {
          // creator_nickname: userData[0].nickname,
          // creator_about: userData[0].about_me,
          // user_id: userData[0].user_id,
          // user_profile: userData[0].profile_image,
          // user_cover: userData[0].cover_image,
          // creator_email: userData[0].email,
        },
        current_owner: {
          current_owner_nickname: currentUserData[0].nickname,
          current_owner_profile: currentUserData[0].profile_image,
          current_owner_about_me: currentUserData[0].about_me,
          current_owner_id: currentUserData[0].user_id,
          current_owner_email: currentUserData[0].email,
        },
      });
    })
  );
  collectionData = { ...collectionExist[0], collection_data: artWorkData };
  const data = {
    error: false,
    message: "Collection Details Fetched",
    data: collectionData,
  };
  return data;
};

export const editCollection = async (
  ownerId: string,
  _id: any,
  body: any,
  file?: any
) => {
  logger.log(level.info, `>> editCollection()`);
  console.log(ownerId)
  console.log(_id)

  const collectionExist = await collectionModel.find({
    ownerId,
    _id,
    status: "ACTIVE"
  });
  let data = { error: false, message: "" };
  if (!collectionExist || collectionExist.length <= 0) {
    data = { error: true, message: "Collection Not Found" };
    return data;
  }
  let createData = {};
  if (file) {
    createData = await uploadProfilePromise(file);
  }

  if (!body.title) {
    body.title = collectionExist[0].title;
  } else {
    const existTitle = await collectionModel.findOne({ title: body.title.toLocaleLowerCase() });
    if (existTitle) {
      const data = { error: true, message: "Collection title is taken choose another" };
      return data;
    }
  }
  if (!createData || createData == {}) {
    createData = {
      image: collectionExist[0].image,
    }
  }

  if (data.error) {
    return data;
  }

  createData = {
    ...createData,
    title: body.title.toLocaleLowerCase()
  }
  await collectionModel.findOneAndUpdate(
    { ownerId, _id },
    { $set: createData },
  );
  data = { error: false, message: "Collection Edited Successfully" };
  return data;
};

export const deleteCollection = async (ownerId: string, _id: any) => {
  logger.log(level.info, `>> deleteCollection()`);

  const collectionExist = await collectionModel.find({
    ownerId,
    status: "ACTIVE",
    _id,
  });
  let data = { error: false, message: "" };
  if (!collectionExist || collectionExist.length <= 0) {
    data = { error: true, message: "Collection Not Found" };
    return data;
  }
  await collectionModel.findOneAndUpdate(
    { ownerId, _id },
    { $set: { status: "DELETED" } }
  );
  data = { error: false, message: "Collection Deleted Successfully" };
  return data;
};

export const likeCollection = async (userId: string, collectionId: any) => {
  logger.log(level.info, `>> likeCollection()`);
  const [collectionData, collectionLiked] = await Promise.all([
    collectionModel.find({ _id: collectionId }),
    collectionLikesModel.find({ collectionId, userId }),
  ]);
  let data = { error: false, message: "" };
  if (!collectionData && collectionData.length < 0) {
    data = { error: true, message: "Collection not found" };
    return data;
  }
  if (!collectionLiked || collectionLiked.length <= 0) {
    const likeAdded = new collectionLikesModel({
      collectionId,
      userId,
      liked: true,
    });
    Promise.resolve(likeAdded.save());
    data = { error: false, message: "Liked Added Successfully" };
    return data;
  } else {
    await collectionLikesModel.findOneAndUpdate(
      { userId, collectionId },
      { $set: { liked: !collectionLiked[0].liked } }
    );
    if (!collectionLiked[0].liked === false) {
      data = { error: false, message: "Liked removed Successfully" };
    } else {
      data = { error: false, message: "Liked Added Successfully" };
    }
    return data;
  }
};

export const addNFT = async (
  userId: string,
  collectionId: any,
  body: any
) => {
  logger.log(level.info, `>> editCollection()`);
  const collectionExist = await collectionModel.find({
    ownerId: userId,
    _id: collectionId,
    status: "ACTIVE"
  });
  let data = { error: false, message: "" };
  if (!collectionExist || collectionExist.length <= 0) {
    data = { error: true, message: "Collection Not Found" };
    return data;
  }
  const collectionData = body;
  await Promise.all(
    collectionData.map(async (collection) => {
      const [artWorkExist, artWorkInUse] = await Promise.all([
        nftModel.find({
          ownerId: userId,
          _id: collection.nftId,
        }),
        collectionModel.find({
          ownerId: userId,
          status: "ACTIVE",
          $or: [
            { _id: { $ne: collectionId } },
            { _id: { $eq: collectionId } },
          ],
          collectionData: {
            $elemMatch: { nftId: collection.nftId },
          },
        }),
      ]);

      if (!artWorkExist || artWorkExist.length <= 0) {
        data = { error: true, message: "Art work does not exist" };
        return data;
      }
      if (artWorkInUse && artWorkInUse.length >= 1) {
        data = { error: true, message: "Art work Already in use or Already Added" };
        return data;
      }
      return data;
    })
  );

  if (data.error) {
    return data;
  }

  await Promise.all(
    collectionData.map(async (collection) => {
      await collectionModel.findOneAndUpdate(
        { userId, _id: collectionId },
        { $push: { collectionData: { nftId: collection.nftId } } }
      );
    }));


  data = { error: false, message: "NFT Added Successfully" };
  return data;
};

export const removeNFT = async (
  userId: string,
  collectionId: any,
  nftId: any
) => {
  logger.log(level.info, `>> editCollection()`);
  const collectionExist = await collectionModel.find({
    ownerId: userId,
    _id: collectionId,
    status: "ACTIVE",
    collectionData: {
      $elemMatch: { nftId },
    },
  });
  let data = { error: false, message: "" };
  if (!collectionExist || collectionExist.length <= 0) {
    data = { error: true, message: "NFT Not Found" };
    return data;
  }

  if (data.error) {
    return data;
  }

  await collectionModel.findOneAndUpdate(
    { userId, _id: collectionId },
    { $pull: { collectionData: { nftId } } }
  );



  data = { error: false, message: "NFT deleted Successfully " };
  return data;
};

export const getUserCollection = async (param: any,) => {
  logger.log(level.info, `>> getAllUsersCollection()`);

  let data = { error: false, message: "", data: {} };
  if (!param) {
    data = { error: true, message: "Collection ID is required", data: {} };
    return data;
  }

  const pipeline = getMyCollectionListPipeline1(param);
  let collectionList = await collectionModel.aggregate(pipeline).exec();

  if (!collectionList || collectionList.length <= 0) {
    data = { error: true, message: "Collection Not Found", data: {} };
    return data;
  }
  data = {
    error: false,
    message: "Collection Found",
    data: collectionList[0]
  };
  return data;
};
