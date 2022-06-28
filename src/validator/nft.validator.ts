import { query } from "express-validator";
import { constants as VALIDATOR } from "../constant/validator/nft.constant";

export const validate = (method: string) => {
  let error = [];
  switch (method) {
    case VALIDATOR.BROWSE3: {
      error = [
        query("formOfSale", "Form Of Sale is required")
          .not()
          .isEmpty()
          .custom((value) => {
            if (!["AUCTION", "NOT_FOR_SALE", "FIXEDPRICE", "ALL"].includes(value)) {
              throw new Error("In Valid Form Of Sale");
            } else {
              return value;
            }
          }),
        query("sortBy", "Sort By is required")
          .not()
          .isEmpty()
          .custom((value) => {
            if (!["DATE", "POPULARITY", "PRICE"].includes(value)) {
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
          })
      ];
      break;
    }
    case VALIDATOR.BROWSE2: {
      error = [
        query("sortBy", "Sort By is required")
          .not()
          .isEmpty()
          .custom((value) => {
            if (!["DATE", "POPULARITY", "PRICE"].includes(value)) {
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
      break;
    }
    case VALIDATOR.BROWSE1: {
      error = [
        query("formOfSale", "Form Of Sale is required")
          .not()
          .isEmpty()
          .custom((value) => {
            if (!["AUCTION", "NOT_FOR_SALE", "FIXEDPRICE", "ALL"].includes(value)) {
              throw new Error("In Valid Form Of Sale");
            } else {
              return value;
            }
          }),
      ]

      break;
    }
  }
  return error;
};
