import { body } from "express-validator";
import { constants as VALIDATOR } from "../constant/validator/user.constant";

export const validate = (method: string) => {
  let error = [];
  
  switch (method) {
    case VALIDATOR.REGISTER_USER: {
      error = [
        body("email", "Email is required").isEmail(),
        body("password")
          .isLength({ min: 6 })
          .withMessage("Password length must be greater than 6 characters")
          .custom((value, { req }) => {
            if (value !== req.body.confirmPassword) {
              throw new Error("Confirm password does not match with password");
            } else {
              return value;
            }
          }),
      ];
      break;
    }

    case VALIDATOR.LOGIN: {
      error = [
        body("email", "Email is required").isEmail(),
        body("password", "Password is required")
          .isLength({ min: 6 })
          .withMessage("Password length must be greater than 6 characters"),
      ];
      break;
    }

    case VALIDATOR.VERIFY_USER: {
      error = [
        body("email", "Email is required").isEmail(),
        body("verification_code", "Verification Code is required")
          .not()
          .isEmpty(),
      ];
      break;
    }

    case VALIDATOR.SEND_CHANGE_EMAIL: {
      error = [body("email", "Email is required").isEmail()];
      break;
    }

    case VALIDATOR.VERIFY_CHANGE_EMAIL: {
      error = [body("new_email", "Email is required").isEmail()];
      break;
    }
  }
  return error;
};
