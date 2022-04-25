import { level, logger } from "../../config/logger";
import nftModel, { NftInput, UploadInput, Royalty } from "../../model/nft";
import { polygonContract, polygonProvider } from "../../service/web3/web3";
import { ethContract, ethProvider } from "../../service/web3/web3_eth";
import bidModel from "../../model/bid";
import ownerHistoryModel from "../../model/nftOwnersHistory";
import ownerHistory1155Model from "../../model/nftOwnersHistory";
import nftBookmarks from "../../model/nftBookmarks";

import {
  addNFTService,
  uploadToIPFSService,
  getMyAllArtCreationsPipeline,
  browseByCollectionPipeline,
  getAllArtWorkPipeline,
  getArtWorkDetailsPipeline,
  getPipelineForPurchaseHistory,
  getSellerOtherArtworkPipeline,
  browseByBookmarkPipeline
} from "../../service/nft.service";
import { decryptText, regexSpecialChar } from "../../utils/utility";
import moment from "moment-timezone";
import nftLikesModel from "../../model/nftLikes";
import nftBookmarksModel from "../../model/nftBookmarks";
import userModel from "../../model/user";
import ownerPurchaseModel from "../../model/nftOwnersHistory";
import collectionModel from "../../model/collection";
import { addOwnerHistory } from "../../service/ownerHistory.service";
import { addBid, highestBidPipeline } from "../../service/bid.service";
import nft from "../../model/nft";





export const addArtWork = async (
  _id: String,
  body: NftInput,
) => {
  logger.log(level.info, `>> addArtWork()`);
  let inputJSON = {};
  let data = { error: false, message: "" };

  if (!body.metaData) {
    data = {
      error: true,
      message:
        "NFT must have meta data",
    };
    return data;
  }

  if (Number(body.mintNft) !== 0 && Number(body.mintNft) !== 1) {
    data = { error: true, message: "mint nft field is required" };
    return data;
  }

  inputJSON = {
    ...inputJSON,
    ownerId: _id,
    creatorId: _id,
    nftCategory: body.nftCategory,
    mintResponse: JSON.parse(body.mintResponse),
    contractType: body.contractType,
    totalSaleQuantity: 1,
    mintNft: Number(body.mintNft),
  };
  if (Number(body.mintNft) === 0) {
    inputJSON = { ...inputJSON, contractAddress: ethContract };
  }
  if (Number(body.mintNft) === 1) {
    inputJSON = { ...inputJSON, contractAddress: polygonContract };
  }
  if (
    !["AUCTION", "NOT_FOR_SALE", "FIXEDPRICE"].includes(body.formOfSale)
  ) {
    data = { error: true, message: "Form of sale is not valid" };
    return data;
  }

  inputJSON = { ...inputJSON, formOfSale: body.formOfSale };

  if (body.formOfSale === "AUCTION") {
    if (
      !Number(body.auctionEndHours) ||
      Number(body.auctionEndHours) <= 0
    ) {
      data = { error: true, message: "auction end time is requied" };
      return data;
    }

    if (
      !Number(body.auctionStartPrice) ||
      Number(body.auctionStartPrice) <= 0
    ) {
      data = { error: true, message: "Auction Start price is requied" };
      return data;
    }
    if (!Number(body.fixedPrice) || Number(body.fixedPrice) <= 0) {
      data = { error: true, message: "Buy Now Price is requied" };
      return data;
    }
    inputJSON = {
      ...inputJSON,
      auctionEndHours: Number(body.auctionEndHours),
      fixedPrice: Number(body.fixedPrice),
      auctionStartPrice: body.auctionStartPrice,
    };
  }

  if (body.formOfSale === "FIXEDPRICE") {
    if (!Number(body.fixedPrice) || Number(body.fixedPrice) <= 0) {
      data = { error: true, message: "Sale Price is requied" };
      return data;
    }
    inputJSON = { ...inputJSON, sale_price: body.fixedPrice };
  }

  if (body.formOfSale !== "NOT_FOR_SALE") {
    if (Number(body.saleCoin) !== 0 && Number(body.saleCoin) !== 1) {
      data = { error: true, message: "Sale Coin type is required" };
      return data;
    }
    inputJSON = { ...inputJSON, saleCoin: Number(body.saleCoin) };
  }

  const royalty = JSON.parse(body.royalty);
  if (royalty && royalty.length > 0) {
    let fixedPercentage = 100;
    royalty.map((royal: Royalty) => {
      fixedPercentage = fixedPercentage - royal.percentage;
      if (fixedPercentage < 0) {
        data = { error: true, message: "Royalty percentage must be under 100%" };
        return data;
      }
      return fixedPercentage;
    });

    if (fixedPercentage < 0) {
      data = { error: true, message: "Royalty percentage must be under 100%" };
      return data;
    }

    inputJSON = { ...inputJSON, royalty };
  }




  await addNFTService(inputJSON, body.metaData);

  data = {
    error: false,
    message: "Artwork added successfully. NFT token will be issued soon.",
  };
  return data;
};

export const editArtWork = async (
  ownerId: string,
  nftId: any,
  body: any
) => {
  logger.log(level.info, `>> editArtWork()`);

  const artWorkData = await nftModel.find({
    ownerId: ownerId,
    _id: nftId,
    formOfSale: "NOT_FOR_SALE",
  });

  let inputJSON = {};
  let data = { error: false, message: "" };

  if (!artWorkData || artWorkData.length <= 0) {
    data = {
      error: true,
      message: "NFT cannot be edited",
    };
    return data;
  }

  if (!["AUCTION", "FIXEDPRICE"].includes(body.formOfSale)) {
    data = { error: true, message: "Form of sale is not valid" };
    return data;
  }
  inputJSON = {
    ...inputJSON,
    formOfSale: body.formOfSale,
  };

  if (body.formOfSale === "AUCTION") {
    if (
      !Number(body.auctionEndHours) ||
      Number(body.auctionEndHours) <= 0
    ) {
      data = { error: true, message: "auction end hours is requied" };
      return data;
    }

    if (
      !Number(body.auctionStartPrice) ||
      Number(body.auctionStartPrice) <= 0
    ) {
      data = { error: true, message: "Auction Start price is requied" };
      return data;
    }
    inputJSON = {
      ...inputJSON,
      auctionEndTime: Number(body.auctionEndTime),
      auctionStartPrice: body.auctionStartPrice,
    };
  }
  if (Number(body.saleCoin) !== 0 && Number(body.saleCoin) !== 1) {
    data = { error: true, message: "Sale Coin is requied" };
    return data;
  }
  inputJSON = { ...inputJSON, saleCoin: body.saleCoin };

  if (body.formOfSale === "FIXEDPRICE") {
    if (!Number(body.fixedPrice) || Number(body.fixedPrice) <= 0) {
      data = { error: true, message: "Sale Price is requied" };
      return data;
    }

    inputJSON = { ...inputJSON, fixedPrice: body.fixedPrice };
  }

  if (body.formOfSale === "AUCTION") {
    const auctionEndTime = moment()
      .add(Number(body.auction_end_hours), "hours")
      .toDate()
      .toISOString();
    inputJSON = {
      ...inputJSON,
      auctionEndTime,
      auction_end_hours: body.auction_end_hours,
    };
  }

  if (artWorkData[0].contractType === "ERC1155") {
    if (body.formOfSale === "AUCTION") {
      data = { error: true, message: "Form of sale auction is not valid" };
      return data;
    }

    if (Number(body.saleQuantity) <= 0 || !body.saleQuantity) {
      data = { error: true, message: "sale quantity required" };
      return data;
    }

    if (Number(body.saleQuantity) > Number(artWorkData[0].saleQuantity)) {
      data = {
        error: true,
        message: "sale quantity must be less than or equals to available quantity",
      };
      return data;
    }

    if (
      Number(body.saleQuantity) === Number(artWorkData[0].saleQuantity) &&
      Number(body.saleCoin) === Number(artWorkData[0].saleCoin)
    ) {
      await nftModel.findOneAndUpdate({ nftId }, inputJSON);
      data = {
        error: false,
        message: "Artwork Updated successfully",
      };
      return data;
    } else {
      await nftModel.findOneAndUpdate(
        { _id: nftId },
        { $inc: { saleQuantity: Number(Number(body.saleQuantity) * -1) } }
      );
      // let addArtWorkJSON = {
      //     user_id: artWorkData[0].user_id,
      //     title: artWorkData[0].title,
      //     art_work_category: artWorkData[0].art_work_category,
      //     sale_quantity: Number(body.sale_quantity),
      //     formOfSale: "fixed_price",
      //     contract_type: "erc_1155",
      //     contract_address: artWorkData[0].contract_address,
      //     files: artWorkData[0].files,
      //     sale_coin: Number(body.sale_coin),
      //     sale_price: artWorkData[0].sale_price,
      //     parent_art_work_id: artWorkData[0].parent_art_work_id,
      //     parent_total_sale_quantity: artWorkData[0].parent_total_sale_quantity,
      //     common_art_id: artWorkData[0].common_art_id,
      //     last_art_work_id: artWorkData[0].art_work_id,
      //     description: artWorkData[0].description,
      //     royalty: artWorkData[0].royalty,
      //     mint_response: artWorkData[0].mint_response,
      //     selling_available: true,
      //     nft_token: artWorkData[0].nft_token,
      //     current_owner_id: user_id,
      //     total_sale_quantity: Number(body.sale_quantity),
      //     mint_nft: artWorkData[0].mint_nft,
      // };
      //await addArtWorkFunction(addArtWorkJSON);
      data = {
        error: false,
        message: "Artwork Updated successfully",
      };
      return data;
    }
  }

  await nftModel.findOneAndUpdate({ _id: nftId }, inputJSON);
  data = {
    error: false,
    message: "Artwork Updated successfully",
  };
  return data;
};

export const stopArtWorkSale = async (ownerId: string, nftId: any) => {
  logger.log(level.info, `>> stopArtWorkSale()`);
  const artWorkExist = await nftModel.find({ _id: nftId, ownerId });
  let data = { error: false, message: "" };
  if (!artWorkExist || artWorkExist.length <= 0) {
    data = {
      error: true,
      message: "Art work not found",
    };
    return data;
  }

  if (artWorkExist[0].formOfSale === "AUCTION") {
    // ! Bidding exist do not update it
    const bidExist = await bidModel.find({ nftId, status: "ALLOTED" || "REFUNDED" });
    if (bidExist && bidExist.length > 0) {
      data = {
        error: true,
        message: "This art work has bids",
      };
      return data;
    }
  }
  await nftModel.findOneAndUpdate(
    { ownerId, _id: nftId },
    { $set: { formOfSale: "NOT_FOR_SALE" } }
  );
  data = {
    error: false,
    message: "Art Work sale is stopped",
  };
  return data;
};


export const burnNFT = async (ownerId: string, nftId: any) => {
  logger.log(level.info, `>> stopArtWorkSale()`);
  const artWorkExist = await nftModel.find({ _id: nftId, ownerId, formOfSale: "NOT_FOR_SALE" });
  let data = { error: false, message: "" };
  if (!artWorkExist || artWorkExist.length <= 0) {
    data = {
      error: true,
      message: "Art work cannot be deleted",
    };
    return data;
  }

  await nftModel.findOneAndUpdate(
    { ownerId, _id: nftId },
    { $set: { status: "DELETED" } }
  );
  data = {
    error: false,
    message: "NFT deleted Successfully",
  };
  return data;
};

export const getMyAllArtWork = async (
  id: string,
  query: any,
  options: any,
  created: boolean
) => {
  logger.log(level.info, `>> getMyAllArtWork`);
  let filter = {};
  if (query.sortBy) {
    filter = { ...filter, sortBy: query.sortBy };
  }
  if (query.orderBy) {
    filter = { ...filter, orderBy: query.orderBy };
  }
  if (query.formOfSale) {
    filter = { ...filter, formOfSale: query.formOfSale };
  }
  if (query.search) {
    console.log(query.search)
    const search = regexSpecialChar(query.search);
    filter = { ...filter, search };
  }
  filter = { ...filter, userId: id };

  const pipeline = getMyAllArtCreationsPipeline(filter, options, false, created);
  let artWorkList = await nftModel.aggregate(pipeline).exec();
  artWorkList = artWorkList.map((data) => {

    if (data.formOfSale === "AUCTION") {
      if (
        !moment(data.auctionEndTime).isAfter(moment(new Date().toISOString()))
      ) {
        data.auctionEnded = true;
      } else {
        data.auctionEnded = false;
      }
    }
    data.creator.creator_email = decryptText(data.creator.creator_email);
    if (data.currentOwner.currentOwnerEmail !== undefined) {
      data.currentOwner.currentOwnerEmail = decryptText(
        data.currentOwner.currentOwnerEmail
      );
    } else {
      data.currentOwner = {
        currentOwnerUsername: data.creator.creatorUsername,
        currentOwnerAvatar: data.creator.userProfile,
        currentOwnerId: data.creator.Id,
        currentOwnerEmail: data.creator.creatorEmail,
      };
    }

    if (
      data.currentOwnerId === null ||
      data.currentOwnerId === undefined ||
      id === data.currentOwnerId ||
      data.userId === data.currentOwnerId
    ) {
      data.isOwner = true;
    } else {
      data.isOwner = false;
    }
    return data;
  });
  let data = {};
  let count = 0;
  if (artWorkList && artWorkList.length > 0) {
    let countPipeline = getMyAllArtCreationsPipeline(filter, {}, true, created);
    const totalCount = await nftModel.aggregate(countPipeline);
    count = totalCount[0].total;

    data = {
      error: false,
      message: "Users All ArtWork Fetched Successfully",
      data: {
        totalItems: count,
        currentPage: Number(query.page),
        itemPerPage: Number(query.limit),
        totalPages:
          Math.round(count / Number(query.limit)) < count / Number(query.limit)
            ? Math.round(count / Number(query.limit)) + 1
            : Math.round(count / Number(query.limit)),
        currentItemCount: artWorkList.length,
        lastPage: count / Number(query.limit) <= Number(query.page),
        data: artWorkList,
      }
    };
    return data;
  }
  data = {
    error: false,
    message: "Users All ArtWork Fetched Successfully",
    data: {
      totalItems: 0,
      currentPage: Number(query.page),
      itemPerPage: Number(query.limit),
      totalPages:
        Math.round(count / Number(query.limit)) < count / Number(query.limit)
          ? Math.round(count / Number(query.limit)) + 1
          : Math.round(count / Number(query.limit)),
      currentItemCount: artWorkList.length,
      lastPage: count / Number(query.limit) <= Number(query.page),
      data: []
    }
  };
  return data;
};

export const uploadToIPFS = async (
  user_id: String,
  body: UploadInput,
  files: any
) => {
  logger.log(level.info, `>> addArtWork()`);
  let inputJSON = {};
  let data = { error: false, message: "", data: null };


  if (!files || files.length <= 0) {
    data = { error: true, message: "No files Found", data: null };
    return data;
  }

  if (body.title && body.title.trim().length > 20) {
    data = {
      error: true,
      message:
        "Art work title length must be less than equals to 20 characters",
      data: null
    };
    return data;
  }


  inputJSON = {
    ...inputJSON,
    title: body.title,
    description: body.description,
    nftCategory: body.nftCategory,
    properties: JSON.parse(body.properties),
  };

  const result = await uploadToIPFSService(inputJSON, files);

  data = {
    error: false,
    message: "Upload Successful",
    data: { metaData: result }
  };
  return data;
};

export const likeNFT = async (userId: string, nftId: any) => {
  logger.log(level.info, `>> likeArtWork()`);
  const [artWorkData, artWorkLiked] = await Promise.all([
    nftModel.find({ _id: nftId }),
    nftLikesModel.find({ nftId, userId }),
  ]);
  let data = { error: false, message: "" };
  if (!artWorkData && artWorkData.length < 0) {
    data = { error: true, message: "Art Work not found" };
    return data;
  }
  if (!artWorkLiked || artWorkLiked.length <= 0) {
    const likeAdded = new nftLikesModel({
      nftId,
      userId,
      liked: true,
    });
    Promise.resolve(likeAdded.save());
    data = { error: false, message: "Liked Added Successfully" };
    return data;
  } else {
    await nftLikesModel.findOneAndUpdate(
      { userId, nftId },
      { $set: { liked: !artWorkLiked[0].liked } }
    );
    if (!artWorkLiked[0].liked === false) {
      data = { error: false, message: "Liked removed Successfully" };
    } else {
      data = { error: false, message: "Liked Added Successfully" };
    }
    return data;
  }
};


export const bookmarkNFT = async (userId: string, nftId: any) => {
  logger.log(level.info, `>> likeArtWork()`);
  const [artWorkData, artWorkLiked] = await Promise.all([
    nftModel.find({ _id: nftId }),
    nftBookmarksModel.find({ nftId, userId }),
  ]);
  let data = { error: false, message: "" };
  if (!artWorkData && artWorkData.length < 0) {
    data = { error: true, message: "NFT not found" };
    return data;
  }
  if (!artWorkLiked || artWorkLiked.length <= 0) {
    const likeAdded = new nftBookmarksModel({
      nftId,
      userId,
      bookmarked: true,
    });
    Promise.resolve(likeAdded.save());
    data = { error: false, message: "Bookmark Added Successfully" };
    return data;
  } else {
    await nftBookmarksModel.findOneAndUpdate(
      { userId, nftId },
      { $set: { bookmarked: !artWorkLiked[0].bookmarked } }
    );
    if (!artWorkLiked[0].bookmarked === false) {
      data = { error: false, message: "Bookmark removed Successfully" };
    } else {
      data = { error: false, message: "Bookmark Added Successfully" };
    }
    return data;
  }
};


export const purchaseArtWork = async (userId: string, body: any) => {
  logger.log(level.info, `>> purchaseArtWork()`);
  let data = { error: false, message: "" };

  const [artWorkData, userDetails] = await Promise.all([
    nftModel.find({
      formOfSale: "FIXEDPRICE" || "AUCTION",
      _id: body.nftId,
    }),
    userModel.find({ userId }),
  ]);
  console.log("----------1---------", artWorkData, userDetails);

  if (!artWorkData || artWorkData.length <= 0) {
    data = { error: true, message: "NFT not found" };
    return data;
  }
  if (!userDetails[0].connectedWallet || userDetails[0].connectedWallet.length <= 0) {
    data = { error: true, message: "Wallet is required" };
    return data;
  }

  let recipt;
  if (artWorkData[0].saleCoin === 0) {
    // ? ETH coin
    recipt = await ethProvider.getTransaction(
      body.transactionHash.transactionHash
    );
    console.log("-------ETH------", recipt);
  }
  if (artWorkData[0].saleCoin === 1) {
    // ? Polygon coin
    recipt = await polygonProvider.getTransaction(
      body.transactionHash.transactionHash
    );
    console.log("-------polygon------", recipt);
  }

  if (body.formOfSale === "FIXEDPRICE") {
    if (
      Number(recipt.value.toString()) / Math.pow(10, 18) <
      Number(artWorkData[0].fixedPrice)
    ) {
      data = { error: true, message: "Amount is less than art works price" };
      return data;
    }

    // ? Check for current owner too
    let artWorkSeller = [];
    if (
      !artWorkData[0].ownerId ||
      artWorkData[0].ownerId === null ||
      artWorkData[0].ownerId === undefined
    ) {
      data = { error: true, message: "Art work must have an owner" };
      return data;
    } else {
      artWorkSeller = await userModel.find({
        _id: artWorkData[0].ownerId,
      });
    }
    let totalPrice = Number(artWorkData[0].fixedPrice);
    console.log("-------2------", artWorkSeller);
    console.log("-------3------", totalPrice);

    const artWorkResell = await ownerPurchaseModel
      .find({
        nftId: body.nftId,
        userId: artWorkSeller[0].userId,
      })
      .sort({ createAt: -1 });

    console.log("-------4------", artWorkResell);

    await Promise.all([
      nftModel.findOneAndUpdate(
        { _id: body.nftId },
        {
          $set: {
            ownerId: userId,
            formOfSale: "NOT_FOR_SALE",
            saleCoin: null,
            fixedPrice: null,
          },
        }
      ),
      collectionModel.updateMany(
        { collectionData: { $elemMatch: { nftId: body.nftId } } },
        { $set: { isDeleted: true } }
      ),
      addOwnerHistory({
        userId,
        nftId: body.nftId,
        coin: artWorkData[0].saleCoin,
        price: artWorkData[0].fixedPrice,
        creatorUserId: artWorkData[0].creatorId,
        sellerUserId: artWorkData[0].ownerId,
        transactionHash: body.transactionHash,
        currentOwnerAddress: userDetails[0].connectedWallet.walletType[0].walletKey,
        purchaseType: "FIXEDPRICE",
      }),
    ]);
    data = { error: false, message: "Art work purchased successfully" };
    return data;
  }
  if (body.formOfSale === "AUCTION") {
    const makeaBidFunc = await bidArtWork(artWorkData[0], userId, body);
    return makeaBidFunc;
  }
};

const bidArtWork = async (nftData: any, userId: string, body: any) => {
  logger.log(level.info, `>> bidArtWork()`);
  let data = { error: false, message: "" };
  // ? Check art work is auction
  if (nftData.formOfSale !== "AUCTION") {
    data = { error: true, message: "Art is not for auction" };
    return data;
  }

  // ? Auction is ended or not
  if (
    !moment(nftData.auctionEndTime).isAfter(
      moment(new Date().toISOString())
    )
  ) {
    data = { error: true, message: "Auction ended" };
    return data;
  }

  // ? Get the highest big of art work
  let pipeline = highestBidPipeline(nftData._id);
  const currentBid = await bidModel.aggregate(pipeline);
  if (
    (currentBid &&
      currentBid.length > 0 &&
      Number(currentBid[0].bidAmount) >= body.bidAmount) ||
    nftData.auctionStartPrice >= body.bidAmount
  ) {
    data = {
      error: true,
      message: "Bid Must be greater than last bid and auction start price",
    };
    return data;
  }

  // ? Add bid
  await addBid({
    bidderId: userId,
    nftId: body.nftId,
    saleCoin: nftData.saleCoin,
    bidAmount: body.bidAmount,
    transactionHash: body.transactionHash,
  });
  data = {
    error: false,
    message: "Bid added successfully",
  };
  return data;
};


export const browseByCollection = async (
  id: string,
  query: any,
  options: any,
) => {
  logger.log(level.info, `>> getMyAllArtWork`);
  let filter = {};
  if (query.sortBy) {
    filter = { ...filter, sortBy: query.sortBy };
  }
  if (query.orderBy) {
    filter = { ...filter, orderBy: query.orderBy };
  }
  if (query.formOfSale) {
    filter = { ...filter, formOfSale: query.formOfSale };
  }
  if (query.search) {
    console.log(query.search)
    const search = regexSpecialChar(query.search);
    filter = { ...filter, search };
  }
  filter = { ...filter, _id: id };

  const pipeline = browseByCollectionPipeline(filter, options, false);
  let artWorkList = await collectionModel.aggregate(pipeline).exec();
  artWorkList = artWorkList.map((data) => {

    if (data.formOfSale === "AUCTION") {
      if (
        !moment(data.auctionEndTime).isAfter(moment(new Date().toISOString()))
      ) {
        data.auctionEnded = true;
      } else {
        data.auctionEnded = false;
      }
    }
    // data.creator.creator_email = decryptText(data.creator.creator_email);
    // if (data.currentOwner.currentOwnerEmail !== undefined) {
    //     data.currentOwner.currentOwnerEmail = decryptText(
    //         data.currentOwner.currentOwnerEmail
    //     );
    // } else {
    //     data.currentOwner = {
    //         currentOwnerUsername: data.creator.creatorUsername,
    //         currentOwnerAvatar: data.creator.userProfile,
    //         currentOwnerId: data.creator.Id,
    //         currentOwnerEmail: data.creator.creatorEmail,
    //     };
    // }

    // if (
    //     data.currentOwnerId === null ||
    //     data.currentOwnerId === undefined ||
    //     id === data.currentOwnerId ||
    //     data.userId === data.currentOwnerId
    // ) {
    //     data.isOwner = true;
    // } else {
    //     data.isOwner = false;
    // }
    return data;
  });
  let data = {};
  let count = 0;
  if (artWorkList && artWorkList.length > 0) {
    let countPipeline = browseByCollectionPipeline(filter, {}, true);
    const totalCount = await collectionModel.aggregate(countPipeline);
    count = totalCount[0]?.total;

    data = {
      error: false,
      message: "Users All ArtWork Fetched Successfully",
      data: {
        totalItems: count,
        currentPage: Number(query.page),
        itemPerPage: Number(query.limit),
        totalPages:
          Math.round(count / Number(query.limit)) < count / Number(query.limit)
            ? Math.round(count / Number(query.limit)) + 1
            : Math.round(count / Number(query.limit)),
        currentItemCount: artWorkList.length,
        lastPage: count / Number(query.limit) <= Number(query.page),
        data: artWorkList,
      }
    };
    return data;
  }
  data = {
    error: false,
    message: "Users All ArtWork Fetched Successfully",
    data: {
      totalItems: 0,
      currentPage: Number(query.page),
      itemPerPage: Number(query.limit),
      totalPages:
        Math.round(count / Number(query.limit)) < count / Number(query.limit)
          ? Math.round(count / Number(query.limit)) + 1
          : Math.round(count / Number(query.limit)),
      currentItemCount: artWorkList.length,
      lastPage: count / Number(query.limit) <= Number(query.page),
      data: []
    }
  };
  return data;
};


export const getAllWithoutUserIdArtWork = async (query: any, options: any) => {
  logger.log(level.info, `>> getAllWithoutUserIdArtWork()`);
  let filter = {};
  console.log(query.sortBy)

  if (query.sortBy) {
    filter = { ...filter, sortBy: query.sortBy };
  }
  if (query.orderBy) {
    filter = { ...filter, orderBy: query.orderBy };
  }
  if (query.formOfSale) {
    filter = { ...filter, formOfSale: query.formOfSale };
  }
  if (query.nftCategory) {
    filter = { ...filter, nftCategory: query.nftCategory };
  }
  // if (query.formOfSale === "my_selling_work") {
  //   const data = {
  //     error: true,
  //     message: "Login is required",
  //   };
  //   return data;
  // }
  const pipeline = getAllArtWorkPipeline(filter, options, false);
  let artWorkList = await nftModel.aggregate(pipeline).exec();
  artWorkList = artWorkList.map((data) => {
    if (data.formOfSale === "AUCTION") {
      if (
        !moment(data.auctionEndTime).isAfter(moment(new Date().toISOString()))
      ) {
        data.auctionEnded = true;
      } else {
        data.auctionEnded = false;
      }
    }
    /*  data.creator.creator_email = decryptText(data.creator.creator_email);
     if (data.current_owner.current_owner_email !== undefined) {
       data.current_owner.current_owner_email = decryptText(
         data.current_owner.current_owner_email
       );
     } else {
       data.current_owner = {
         current_owner_nickname: data.creator.creator_nickname,
         current_owner_profile: data.creator.user_profile,
         current_owner_id: data.creator.user_id,
         current_owner_email: data.creator.creator_email,
       };
     } */
    return data;
  });

  console.log("data");

  if (query.sortBy === "deadline") {
    filter = { ...filter, formOfSale: "AUCTION" };
  }

  if (query.sortBy === "popular") {
    filter = { ...filter, formOfSale: "FIXEDPRICE" };
  }
  let count = 0;
  if (artWorkList && artWorkList.length > 0) {
    let countPipeline = getAllArtWorkPipeline(filter, {}, true);
    const totalCount = await nftModel.aggregate(countPipeline);
    count = totalCount[0].total;

    const data = {
      error: false,
      message: "All ArtWork Fetched Successfully",
      totalItems: count,
      currentPage: Number(query.page),
      itemPerPage: Number(query.limit),
      totalPages:
        Math.round(count / Number(query.limit)) < count / Number(query.limit)
          ? Math.round(count / Number(query.limit)) + 1
          : Math.round(count / Number(query.limit)),
      currentItemCount: artWorkList.length,
      lastPage: count / Number(query.limit) <= Number(query.page),
      data: artWorkList,
    };
    return data;
  }
  const data = {
    error: false,
    message: "All ArtWork Fetched Successfully",
    totalItems: 0,
    currentPage: Number(query.page),
    itemPerPage: Number(query.limit),
    totalPages:
      Math.round(count / Number(query.limit)) < count / Number(query.limit)
        ? Math.round(count / Number(query.limit)) + 1
        : Math.round(count / Number(query.limit)),
    currentItemCount: artWorkList.length,
    lastPage: count / Number(query.limit) <= Number(query.page),
    data: [],
  };
  return data;
};

export const getAllArtWork = async (
  user_id: string,
  query: any,
  options: any
) => {
  logger.log(level.info, `>> getAllArtWork()`);
  let filter = {};
  if (query.sortBy) {
    filter = { ...filter, sortBy: query.sortBy };
  }
  if (query.orderBy) {
    filter = { ...filter, orderBy: query.orderBy };
  }
  if (query.formOfSale) {
    filter = { ...filter, formOfSale: query.formOfSale };
  }
  if (query.nftCategory) {
    filter = { ...filter, nftCategory: query.nftCategory };
  }
  let count = 0;

  if (user_id) {
    filter = { ...filter, ownerId: user_id, auth: true };
  }

  if (
    (!user_id || user_id === undefined || user_id === null)
  ) {
    const data = {
      error: true,
      message: "Login is required",
    };
    return data;
  }

  const pipeline = getAllArtWorkPipeline(filter, options, false);
  let artWorkList = await nftModel.aggregate(pipeline).exec();
  artWorkList = artWorkList.map((data) => {
    if (data.formOfSale === "AUCTION") {
      if (
        !moment(data.auctionEndTime).isAfter(moment(new Date().toISOString()))
      ) {
        data.auctionEnded = true;
      } else {
        data.auctionEnded = false;
      }
    }
    data.creator.creator_email = decryptText(data.creator.creator_email);
    if (data.current_owner.current_owner_email !== undefined) {
      data.current_owner.current_owner_email = decryptText(
        data.current_owner.current_owner_email
      );
    } else {
      data.current_owner = {
        current_owner_nickname: data.creator.creator_nickname,
        current_owner_profile: data.creator.user_profile,
        current_owner_id: data.creator.user_id,
        current_owner_email: data.creator.creator_email,
      };
    }
    return data;
  });

  if (artWorkList && artWorkList.length > 0) {
    let countPipeline = getAllArtWorkPipeline(filter, {}, true);
    const totalCount = await nftModel.aggregate(countPipeline);
    count = totalCount[0].total;
    const data = {
      error: false,
      message: "All ArtWork Fetched Successfully",
      totalItems: count,
      currentPage: Number(query.page),
      itemPerPage: Number(query.limit),
      totalPages:
        Math.round(count / Number(query.limit)) < count / Number(query.limit)
          ? Math.round(count / Number(query.limit)) + 1
          : Math.round(count / Number(query.limit)),
      currentItemCount: artWorkList.length,
      lastPage: count / Number(query.limit) <= Number(query.page),
      data: artWorkList,
    };
    return data;
  }
  const data = {
    error: false,
    message: "All ArtWork Fetched Successfully",
    totalItems: 0,
    currentPage: Number(query.page),
    itemPerPage: Number(query.limit),
    totalPages:
      Math.round(count / Number(query.limit)) < count / Number(query.limit)
        ? Math.round(count / Number(query.limit)) + 1
        : Math.round(count / Number(query.limit)),
    currentItemCount: artWorkList.length,
    lastPage: count / Number(query.limit) <= Number(query.page),
    data: [],
  };
  return data;
};


export const getArtWorkDetails = async (filter: any) => {
  logger.log(level.info, `>> getArtWorkDetails()`);
  const pipeline = getArtWorkDetailsPipeline(filter);

  let artWorkDetails = await nftModel.aggregate(pipeline).exec();

  if (artWorkDetails && artWorkDetails.length > 0) {
    artWorkDetails = artWorkDetails.map((data) => {
      data.creator.creator_email = decryptText(data.creator.creator_email);
      data.current_owner.current_owner_email = decryptText(
        data.current_owner.current_owner_email
      );
      if (
        !moment(data.auction_end_time).isAfter(moment(new Date().toISOString()))
      ) {
        data.auction_ended = true;
      } else {
        data.auction_ended = false;
      }
      return data;
    });
    let ownerHistory = await getArtWorkPurchaseHistory(filter.art_work_id);

    let purchase_history = [];
    if (ownerHistory && ownerHistory.data && ownerHistory.data.length > 0) {
      ownerHistory.data.map((data) => {
        let transactionHash;
        if (data.transactionHash.transactionHash) {
          transactionHash = data.transactionHash.transactionHash;
        }
        if (data.transactionHash.hash) {
          transactionHash = data.transactionHash.hash;
        }
        let coin_name = "";
        if (data.coin === 0) {
          coin_name = "ETH";
        }
        if (data.coin === 1) {
          coin_name = "Polygon";
        }
        purchase_history.push({
          coin: data.coin,
          coin_name,
          price: data.price,
          user_id: data.user_id,
          purchased_at: data.created_at,
          nickname: data.nickname,
          email: data.email,
          about_me: data.about_me,
          user_profile: data.user_profile,
          user_cover: data.user_cover,
          transactionHash,
        });
      });
    }

    let artWorkData = {
      ...artWorkDetails[0],
      purchase_history,
    };
    let highest_bid = 0;
    if (artWorkDetails[0].form_of_sale === "auction") {
      let pipeline = highestBidPipeline(filter.art_work_id);
      const currentBid = await bidModel.aggregate(pipeline);
      if (currentBid && currentBid.length > 0) {
        highest_bid = currentBid[0].sale_price;
      }
    }
    artWorkData = { ...artWorkData, highest_bid };
    if (filter.user_id) {
      const artWorkOwner = await nftModel.find({
        art_work_id: filter.art_work_id,
        $or: [
          {
            $and: [
              { user_id: { $eq: filter.user_id } },
              { current_owner_id: { $exists: false } },
            ],
          },
          {
            $and: [
              { user_id: { $eq: filter.user_id } },
              { current_owner_id: { $eq: filter.user_id } },
            ],
          },
          {
            $and: [
              { user_id: { $ne: filter.user_id } },
              { current_owner_id: { $eq: filter.user_id } },
            ],
          },
        ],
      });
      let isBidActive = await bidModel.find({ ...filter, is_deleted: false });
      let is_first_bid = true;
      if (isBidActive && isBidActive.length > 0) {
        is_first_bid = false;
      }
      artWorkData = { ...artWorkData, is_first_bid };
      if (artWorkOwner && artWorkOwner.length > 0) {
        artWorkData = { ...artWorkData, is_current_owner: true };
      } else {
        artWorkData = { ...artWorkData, is_current_owner: false };
      }
    }
    if (
      !artWorkData.current_owner ||
      artWorkData.current_owner.current_owner_email === undefined
    ) {
      artWorkData.current_owner = {
        current_owner_nickname: artWorkDetails[0].creator.creator_nickname,
        current_owner_profile: artWorkDetails[0].creator.user_profile,
        current_owner_id: artWorkDetails[0].creator.user_id,
        current_owner_email: artWorkDetails[0].creator.creator_email,
      };
    }
    const data = {
      error: false,
      message: "Art work details fetched succssfully",
      data: artWorkData,
    };
    return data;
  }
  const data = {
    error: true,
    message: "No Artwork found",
    data: "",
  };
  return data;
};

export const getSellerOtherArtworks = async (art_work_id) => {
  let artWork = await nftModel.findOne({ art_work_id });
  const pipeline = getSellerOtherArtworkPipeline(art_work_id, artWork.ownerId, 3);
  let similarArtWork = await nftModel.aggregate(pipeline).exec();
  return similarArtWork;
}

export const getArtWorkPurchaseHistory = async (art_work_id: any) => {
  logger.log(level.info, `>> getArtWorkPurchaseHistory()`);
  const artWorkData = await nftModel.find({ art_work_id });
  if (artWorkData[0].contract_type === "erc_721") {
    const pipeline = getPipelineForPurchaseHistory(art_work_id);
    let ownerHistory = await ownerHistoryModel.aggregate(pipeline);

    if (ownerHistory && ownerHistory.length > 0) {
      ownerHistory = ownerHistory.map((data) => {
        data.email = decryptText(data.email);
        return data;
      });
      const data = {
        message: "Purchase History Fetch Sucessfully",
        data: ownerHistory,
      };
      return data;
    }
    const data = {
      message: "Purchase History Fetch Sucessfully",
      data: [],
    };
    return data;
  }
  if (artWorkData[0].contract_type === "erc_1155") {
    const pipeline = getPipelineForPurchaseHistory(art_work_id);
    let ownerHistory = await ownerHistory1155Model.aggregate(pipeline);

    if (ownerHistory && ownerHistory.length > 0) {
      ownerHistory = ownerHistory.map((data) => {
        data.email = decryptText(data.email);
        return data;
      });
      const data = {
        message: "Purchase History Fetch Sucessfully",
        data: ownerHistory,
      };
      return data;
    }
    const data = {
      message: "Purchase History Fetch Sucessfully",
      data: [],
    };
    return data;
  }
};


export const browseByBookmarkedNFT = async (
  id: string,
  query: any,
  options: any,
) => {
  logger.log(level.info, `>> browseByBookmarkedNFT`);
  let filter = {};
  if (query.sortBy) {
    filter = { ...filter, sortBy: query.sortBy };
  }
  if (query.orderBy) {
    filter = { ...filter, orderBy: query.orderBy };
  }
  if (query.formOfSale) {
    filter = { ...filter, formOfSale: query.formOfSale };
  }
  if (query.search) {
    console.log(query.search)
    const search = regexSpecialChar(query.search);
    filter = { ...filter, search };
  }
  filter = { ...filter, userId: id };

  const pipeline = browseByBookmarkPipeline(filter, options, false);
  let artWorkList = await nftBookmarks.aggregate(pipeline).exec();

  console.log(artWorkList.length)
  artWorkList = artWorkList.map((data) => {

    if (data.formOfSale === "AUCTION") {
      if (
        !moment(data.auctionEndTime).isAfter(moment(new Date().toISOString()))
      ) {
        data.auctionEnded = true;
      } else {
        data.auctionEnded = false;
      }
    }
    // data.creator.creator_email = decryptText(data.creator.creator_email);
    // if (data.currentOwner.currentOwnerEmail !== undefined) {
    //     data.currentOwner.currentOwnerEmail = decryptText(
    //         data.currentOwner.currentOwnerEmail
    //     );
    // } else {
    //     data.currentOwner = {
    //         currentOwnerUsername: data.creator.creatorUsername,
    //         currentOwnerAvatar: data.creator.userProfile,
    //         currentOwnerId: data.creator.Id,
    //         currentOwnerEmail: data.creator.creatorEmail,
    //     };
    // }

    // if (
    //     data.currentOwnerId === null ||
    //     data.currentOwnerId === undefined ||
    //     id === data.currentOwnerId ||
    //     data.userId === data.currentOwnerId
    // ) {
    //     data.isOwner = true;
    // } else {
    //     data.isOwner = false;
    // }
    return data;
  });
  let data = {};
  let count = 0;
  if (artWorkList && artWorkList.length > 0) {
    let countPipeline = browseByBookmarkPipeline(filter, {}, true);
    const totalCount = await nftBookmarks.aggregate(countPipeline);
    count = totalCount[0]?.total;

    data = {
      error: false,
      message: "Users All Bookmarked NFT Fetched Successfully",
      data: {
        totalItems: count,
        currentPage: Number(query.page),
        itemPerPage: Number(query.limit),
        totalPages:
          Math.round(count / Number(query.limit)) < count / Number(query.limit)
            ? Math.round(count / Number(query.limit)) + 1
            : Math.round(count / Number(query.limit)),
        currentItemCount: artWorkList.length,
        lastPage: count / Number(query.limit) <= Number(query.page),
        data: artWorkList,
      }
    };
    return data;
  }
  data = {
    error: false,
    message: "Users All Bookmarked NFT Fetched Successfully",
    data: {
      totalItems: 0,
      currentPage: Number(query.page),
      itemPerPage: Number(query.limit),
      totalPages:
        Math.round(count / Number(query.limit)) < count / Number(query.limit)
          ? Math.round(count / Number(query.limit)) + 1
          : Math.round(count / Number(query.limit)),
      currentItemCount: artWorkList.length,
      lastPage: count / Number(query.limit) <= Number(query.page),
      data: []
    }
  };
  return data;
};


export const getMyAllBids = async (
  userId: string,
  query: any,
  options: any
) => {
  logger.log(level.info, `>> getMyAllBids()`);
  let search = "";
  if (query.search) {
    search = regexSpecialChar(query.search);
  }
  let filter = {};
  if (query.sortBy) {
    filter = { ...filter, sortBy: query.sortBy };
  }
  if (query.orderBy) {
    filter = { ...filter, orderBy: query.orderBy };
  }
  let pipeline = pipelineForBidList(userId, search, filter, options, false);
  let myBidsList = await bidModel.aggregate(pipeline);
  let count = 0;
  if (myBidsList && myBidsList.length > 0) {
    let countPipeline = pipelineForBidList(userId, search, filter, {}, true);
    const totalCount = await bidModel.aggregate(countPipeline);

    count = totalCount[0].total;
    let data = {
      message: "All bids fetched successfully",
      totalItems: count,
      currentPage: Number(query.page),
      itemPerPage: Number(query.limit),
      totalPages:
        Math.round(count / Number(query.limit)) < count / Number(query.limit)
          ? Math.round(count / Number(query.limit)) + 1
          : Math.round(count / Number(query.limit)),
      currentItemCount: myBidsList.length,
      lastPage: count / Number(query.limit) <= Number(query.page),
      data: myBidsList,
    };
    return data;
  }
  let data = {
    message: "All bids fetched successfully",
    totalItems: 0,
    currentPage: Number(query.page),
    itemPerPage: Number(query.limit),
    totalPages:
      Math.round(count / Number(query.limit)) < count / Number(query.limit)
        ? Math.round(count / Number(query.limit)) + 1
        : Math.round(count / Number(query.limit)),
    currentItemCount: myBidsList.length,
    lastPage: count / Number(query.limit) <= Number(query.page),
    data: [],
  };
  return data;
};

export const pipelineForBidList = (
  user_id: string,
  search: string,
  filter: any,
  extraParams: any,
  count: boolean
) => {

  let pipeline = [];
  pipeline = [
    ...pipeline,
    { $match: { user_id, auctionEnded: false } },
    {
      $lookup: {
        let: { "nftObjId": { "$toObjectId": "nftId" } },
        from: "nfts",
        pipeline: [
          { $match: { "$expr": { "$eq": ["$_id", "$$nftObjId"] } } }
        ],
        as: "nftData"
      }
    },
    { $unwind: "$nftData" },
    {
      $project: {
        art_work_id: 1,
        sale_coin: 1,
        sale_price: { $toDouble: "$bidAmount" },
        user_id: 1,
        transactionHash: 1,
        is_deleted: 1,
        auction_ended: 1,
        bid_id: 1,
        created_at: 1,
        nftData: 1,
      },
    },
  ];
  if (search.trim().length > 0) {
    pipeline = [
      ...pipeline,
      {
        $match: {
          $or: [
            { "nftData.title": { $regex: search, $options: "i" } },
          ],
        },
      },
    ];
  }
  if (filter.sortBy === "latest") {
    if (!filter.orderBy || Number(filter.orderBy) === 0) {
      filter.orderBy = -1;
    }
    pipeline = [...pipeline, { $sort: { createdAt: Number(filter.orderBy) } }];
  }

  if (filter.sortBy === "price") {
    if (!filter.orderBy || Number(filter.orderBy) === 0) {
      filter.orderBy = -1;
    }
    pipeline = [...pipeline, { $sort: { fixedPrice: Number(filter.orderBy) } }];
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