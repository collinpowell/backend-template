import { body,query } from "express-validator";
import { constants as VALIDATOR } from "../constant/validator/collection.constant";

export const validate = (method: string) => {
  let error = [];

  switch (method) {
    case VALIDATOR.CREATECOLLECTION: {
      error = [
        body("title", "Title is required")
          .not()
          .isEmpty(),

        body("image", "Image is required")
          .not()
          .isEmpty()

      ];
      break;
    }
    case VALIDATOR.SORTPARAMS: {
      error = [
        query("orderBy", "orderBy is required")
          .not()
          .isEmpty(),
          query("sortBy", "sortBy is required")
          .not()
          .isEmpty()

      ];
      break;
    }

  }
  return error;
};
