import { level, logger } from "../../config/logger";

import userModel from "../../model/user";
import nftModel from "../../model/nft";
import collectionModel from "../../model/collection";


export const userAccount = async (_id: any) => {
    logger.log(level.info, `>> userAccount()`);
    const userData = await userModel.find({
      _id,
      status: "ACTIVE",
    });
  
    if (userData && userData.length > 0) {
      const [totalCreations, totalCollections] = await Promise.all([
        nftModel
          .find({
            $or: [
              {
                $and: [
                  { contractType: { $eq: "ERC721" } },
                  { userId: { $eq: _id } },
                ],
              },
              {
                $and: [
                  { contractType: { $eq: "ERC1155" } },
                  { userId: { $eq: _id } },
                ],
              },
            ],
          })
          .count(),
        collectionModel.find({ userId: _id }).count(),
      ]);
      const creation = await nftModel.count({
        $or: [
          {
            $and: [
              { contractType: { $eq: "ERC721" } },
              { userId: { $eq: _id } },
            ],
          },
          {
            $and: [
              { contractType: { $eq: "ERC1155" } },
              { userId: { $eq: _id } },
            ],
          },
        ],
      });
      const own = totalCreations;
      const myFixedSale = await nftModel.count({
        $or: [
          {
            $and: [
              { userId: { $eq: _id } },
              { formOfSale: { $eq: "FIXEDPRICE" } },
            ],
          },
        ],
      });

      const myAuction = await nftModel.count({
        $or: [
          {
            $and: [
              { userId: { $eq: _id } },
              { formOfSale: { $eq: "AUCTION" } },
            ],
          },
        ],
      });
      const userJson = {
        _id: userData[0]._id,
        email: userData[0].email,
        role: userData[0].role,
        status: userData[0].status,
        username: userData[0].username,
        bio: userData[0].bio,
        createdAt: userData[0].createdAt,
        totalCreations,
        totalCollections,
        creation,
        own,
        myFixedSale,
        myAuction,
        connectedWallet: userData[0].connectedWallet,
        avatar: userData[0].avatar,
        coverImage: userData[0].coverImage,
        kycStatus: userData[0].kycStatus
      };
      const data = {
        error: false,
        message: "User Data fetched successfully",
        data: userJson,
      };
      return data;
    }
    const data = {
      error: true,
      message: "User not found",
    };
    return data;
  };
  
  export const editProfile = async (_id: string, body: any) => {
    logger.log(level.info, `>> editProfile()`);
  
    const userExist = await userModel.find({
      _id,
      status: "ACTIVE",
    });
    if (!userExist || userExist.length <= 0) {
      const data = {
        error: true,
        message: "User not found",
      };
      return data;
    }
  
    let updateData = {};
    if (body.nickname && body.nickname.trim() === "") {
      updateData = { ...updateData, nickname: "" };
    }
    if (!body.nickname || body.nickname.trim() === "") {
      updateData = { ...updateData, nickname: "" };
    }
    if (body.nickname && body.nickname.length > 14) {
      const data = {
        error: true,
        message: "Nickname length must be less than equals to 15 characters",
      };
      return data;
    }
    if (body.nickname) {
      const nicknameExist = await userModel.find({
        _id: { $ne: _id },
        nickname: body.nickname.trim(),
      });
  
      if (nicknameExist && nicknameExist.length > 0) {
        const data = {
          error: true,
          message: "User Name already exist",
        };
        return data;
      }
  
      updateData = { ...updateData, nickname: body.nickname };
    }
  
    if (body.metamask_id && body.metamask_id.length > 0) {
      updateData = { ...updateData, metamask_id: body.metamask_id };
    }
  
    if (body.wallet_type && body.wallet_type.length <= 0) {
      const data = {
        error: true,
        message: "Wallet type is required",
      };
      return data;
    }
  
    if (body.wallet_type && body.wallet_type.length > 0) {
      const wallet_type = body.wallet_type;
      updateData = { ...updateData, wallet_type };
    }
  
    if (body.about_me && body.about_me.length > 200) {
      const data = {
        error: true,
        message: "About me length must be less than 200 characters",
      };
      return data;
    }
  
    if (body.about_me && body.about_me.length > 0) {
      updateData = {
        ...updateData,
        about_me: body.about_me,
      };
    }
    if (!body.about_me || body.about_me.trim() === "") {
      updateData = { ...updateData, about_me: "" };
    }
  
    await userModel.findOneAndUpdate({ _id }, { $set: updateData });
    const userData = await userModel.find({
      _id,
      is_deleted: false,
      status: "ACTIVE",
    });
    const data = {
      error: false,
      message: "Profile Updated Successfully",
      data: userData[0],
    };
    return data;
  };