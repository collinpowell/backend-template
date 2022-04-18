import { param } from "express-validator";
import { constants as VALIDATOR } from "../constant/validator/nft.constant";

export const validate = (method: string) => {
  let error = [];
  switch (method) {
    case VALIDATOR.NFTID: {
      error = [param("nftid", "NFT Id is required").not().isEmpty()];
      break;
    }
  }
  return error;
};
