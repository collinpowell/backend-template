import { Router } from "express";
const routes = Router({ mergeParams: true });
import * as nftController from "../../controller/nft/nft.controller";
import { UserAuthenticationMiddleware } from "../../middleware/authentication";
import { upload } from "../../service/multer/multer";

import { validate } from "../../validator/nft.validator";
import { constants as VALIDATOR } from "../../constant/validator/nft.constant";

const PATH = {
    ROOT: "/",
    EXPLORE: "/explore",
    ADDNFT: "/generation",
    IPFSUPLOAD: "/ipfsupload",
    UPDATE: "/update",
    STOPSALE: "/stopsale",
    BURNNFT: "/burnnft",
    MYNFTARTWORK: "/mynftartwork",
    MYCREATEDNFT: "/mycreatednft",
    USERCREATEDNFT: "/usercreatednft",
    USERSNFTARTWORK: "/usersnftartwork",
    BROWSEBYCOLLECTION: "/browsebycollection",
    BIDHISTORY: "/bidhistory",
    BROWSEBOOKMARKED: "/browsebookmarked",
    TRENDINGNFTS: "/trendingnfts",
    LIKE: "/like",
    BOOKMARK: "/bookmark",
    OWNNERHISTORY: "/ownnerhistory",
    NFTHISTORY: "/nfthistory",
    FIXEDSALE: "/fixedsale/purchase",
    AUCTION: "/auction/placebid",
    MYBIDS: "/mybids",
    NFTINAUCTION: "/nftinauction",
};

/**
* @api {GET} /api/nft/browsebycollection
* @desc Get NFT by collection
* @access PRIVATE
* **/
routes
    .route(PATH.BROWSEBYCOLLECTION + "/:collectionid")
    .get(nftController.browseByCollection)


/**
* @api {GET} /api/nft/usercreatednft
* @desc Get mynftartwork
* @access PUBLIC
* **/
routes
    .route(PATH.USERCREATEDNFT + "/:userid")
    .get(nftController.getUserCreatedArtWork)

/**
* @api {GET} /api/nft/usersnftartwork
* @desc Get mynftartwork
* @access PUBLIC
* **/
routes
    .route(PATH.USERSNFTARTWORK + "/:userid")
    .get(nftController.getUserAllOwnedNFT)

routes
    .route(PATH.ROOT + ":nftid")
    .get(nftController.getArtWorkDetails)

/**
 * @api {GET} /api/nft/explore
 * @desc Fetch Art work
 * @access Public
 * **/
routes.route(PATH.EXPLORE).get(nftController.getAllArtWork);

/**
 * * User Authorization middleware
 */
routes.use(UserAuthenticationMiddleware);

/**
 * @api {PUT} /api/user/nft/like
 * @desc Users Likes an art work
 * @access Private
 * **/
routes
    .route(PATH.LIKE + "/:nftid")
    .put(nftController.likeNFT);

/**
* @api {PUT} /api/user/nft/bookmark
* @desc Users Bookmarks an art work
* @access Private
* **/
routes
    .route(PATH.BOOKMARK + "/:nftid")
    .put(nftController.bookmarkNFT);

/**
 * @api {POST} /api/nft/generation
 * @desc Upload Art work
 * @access Private
 * **/
routes
    .route(PATH.ADDNFT)
    .post(nftController.addArtWork);

/**
* @api {PUT} /api/nft/update
* @desc Update Art work
* @access Private
* **/
routes
    .route(PATH.UPDATE + "/:nftid")
    .put(validate(VALIDATOR.NFTID), nftController.editArtWork)

/**
* @api {PUT} /api/nft/stopsale
* @desc Stop Sale of NFT
* @access Private
* **/
routes
    .route(PATH.STOPSALE + "/:nftid")
    .put(validate(VALIDATOR.NFTID), nftController.stopArtWorkSale)


/**
 * @api {DEL} /api/nft/burnnft
 * @desc Burn of NFT
 * @access PRIVATE
 * **/
routes
    .route(PATH.BURNNFT + "/:nftid")
    .delete(validate(VALIDATOR.NFTID), nftController.burnNFT)

/**
* @api {GET} /api/nft/mynftartwork
* @desc Get mynftartwork
* @access PRIVATE
* **/
routes
    .route(PATH.MYNFTARTWORK)
    .get(nftController.getMyAllArtWork)

/**
* @api {GET} /api/nft/mycreatednft
* @desc Get mynftartwork
* @access PRIVATE
* **/
routes
    .route(PATH.MYCREATEDNFT)
    .get(nftController.getMyAllCreatedArtWork)


/**
 * @api {POST} /api/nft/ipfsupload
 * @desc Upload Art work details to ipfs
 * @access Private
 * **/
routes
    .route(PATH.IPFSUPLOAD)
    .post(upload.array("file"), nftController.uploadToIPFS)


/**
 * @api {POST} /api/nft/auction/placebid
 * @desc Bid for NFT 
 * @access Private
 * **/
routes.route(PATH.AUCTION).post(nftController.purchaseArtWork);

/**
 * @api {POST} /api/nft/fixedsale/purchase
 * @desc Purchase Art 
 * @access Private
 * **/
routes.route(PATH.FIXEDSALE).post(nftController.purchaseArtWork);

/**
* @api {GET} /api/nft/browsebookmarked
* @desc Bookmarked nft
* @access Private
* **/
routes.route(PATH.BROWSEBOOKMARKED).get(nftController.browseByBookmarkedNFT);


export default routes;
