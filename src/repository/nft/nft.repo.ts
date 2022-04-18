import { level, logger } from "../../config/logger";
import nftModel, { NftInput, UploadInput, Royalty } from "../../model/nft";
import { polygonContract,polygonProvider  } from "../../service/web3/web3";
import { ethContract,ethProvider } from "../../service/web3/web3_eth";
import bidModel from "../../model/bid";
import {
    addNFTService,
    uploadToIPFSService,
    getMyAllArtCreationsPipeline,
    browseByCollectionPipeline,
    getAllArtWorkPipeline
} from "../../service/nft.service";
import { decryptText,regexSpecialChar } from "../../utils/utility";
import moment from "moment-timezone";
import nftLikesModel from "../../model/nftLikes";
import nftBookmarksModel from "../../model/nftBookmarks";
import userModel from "../../model/user";
import ownerPurchaseModel from "../../model/nftOwnersHistory";
import collectionModel from "../../model/collection";
import { addOwnerHistory } from "../../service/ownerHistory.service";
import { addBid, highestBidPipeline } from "../../service/bid.service";





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

    const pipeline = getMyAllArtCreationsPipeline(filter, options, false,created);
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
        let countPipeline = getMyAllArtCreationsPipeline(filter, {}, true,created);
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
      nftModel.find({ _id: nftId}),
      nftLikesModel.find({ nftId, userId}),
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
      nftModel.find({ _id: nftId}),
      nftBookmarksModel.find({ nftId, userId}),
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
      bidderId:userId,
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
  if (query.sortBy) {
    filter = { ...filter, sortBy: query.sortBy };
  }
  if (query.orderBy) {
    filter = { ...filter, orderBy: query.orderBy };
  }
  if (query.formOfSale) {
    filter = { ...filter, formOfSale: query.formOfSale };
  }
  if (query.art_work_category) {
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
    if (data.formOfSale === "auction") {
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
  if (query.art_work_category) {
    filter = { ...filter, nftCategory: query.nftCategory };
  }

  let count = 0;

  if (user_id) {
    filter = { ...filter, user_id, auth: true };
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