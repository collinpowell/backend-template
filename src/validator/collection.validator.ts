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
        error = [
          query("sortBy", "Sort By is required")
            .not()
            .isEmpty()
            .custom((value) => {
              if (!["DATE", "POPULARITY"].includes(value)) {
                throw new Error("In Valid Sort by Enum");
              } else {
                return value;
              }
            }),
          query("orderBy", "Order By is required")
            .not()
            .isEmpty()
            .custom((value) => {
              if (value != 0 && value != 1) {
                throw new Error("Order By can ether be zero or one");
              } else {
                return value;
              }
            })]

      ];
      break;
    }

  }
  return error;
};
