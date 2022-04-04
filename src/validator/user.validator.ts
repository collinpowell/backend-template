import { body, query } from "express-validator";
import { constants as VALIDATOR } from "../constant/validator/user.constant";

export const validate = (method: string) => {
  let error = [];

  switch (method) {
    case VALIDATOR.REGISTER_USER: {
      error = [
        body("email", "Invalid Email").
          isEmail(),
        body("password")
          .isLength({ min: 8 })
          .withMessage("Password length must be greater than 8 characters")
          .custom((value, { req }) => {
            if (value !== req.body.confirmPassword) {
              throw new Error("Password and Confirm Password does not match");
            } else if(!value.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])")){
              throw new Error("Password length should be 8-10 characters(Must contain alphabets, numbers and special character)");
            }else{
              return value;
            }
          }),
        body("username", "Username is required")
          .not()
          .isEmpty()
          .custom((value) => {
            if (value.indexOf(' ') >= 0) {
              throw new Error("Username cannot have spaces");
            } else {
              return value;
            }
          }),
          body("fullName", "fullName is required")
          .not()
          .isEmpty()
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
        body("verificationCode", "Verification Code is required")
          .not()
          .isEmpty(),
      ];
      break;
    }
    case VALIDATOR.CHECKUSERNAME: {
      error = [
        query("username", "Username is required")
          .not()
          .isEmpty()
          //.isLength({ min: 6 })
          //.withMessage("Password length must be greater than 6 characters")
          .custom((value) => {
            if (value.indexOf(' ') >= 0) {
              throw new Error("Username cannot have spaces");
            } else {
              return value;
            }
          }),
      ];
      break;
    }

    case VALIDATOR.SEND_CHANGE_EMAIL: {
      error = [body("newEmail", "Email is required").isEmail()];
      break;
    }

    case VALIDATOR.VERIFY_CHANGE_EMAIL: {
      error = [body("newEmail", "Email is required").isEmail()];
      break;
    }
    case VALIDATOR.RESETCHANGEPASSWORD: {
      error = [
        body("resetPasswordToken", "Token is required")
        .not()
        .isEmpty(),
        body("newPassword")
          .isLength({ min: 8 })
          .withMessage("Password length must be greater than 8 characters")
          .custom((value, { req }) => {
            if (value !== req.body.confirmPassword) {
              throw new Error("Password and Confirm Password does not match");
            } else if(!value.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])")){
              throw new Error("Password length should be 8-10 characters(Must contain alphabets, numbers and special character)");
            }else{
              return value;
            }
          }),
      ];
      break;
    }
    case VALIDATOR.VERIFY_CHANGE_PASSWORD: {
      error = [
        body("currentPassword", "Current Password is required")
        .not()
        .isEmpty(),
        body("newPassword")
          .isLength({ min: 8 })
          .withMessage("Password length must be greater than 8 characters")
          .custom((value, { req }) => {
            if (value !== req.body.confirmPassword) {
              throw new Error("Password and Confirm Password does not match");
            } else if(!value.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])")){
              throw new Error("Password length should be 8-10 characters(Must contain alphabets, numbers and special character)");
            }else if(value === req.body.currentPassword){
              throw new Error("New password and old password should not be the same");
            }else{
              return value;
            }
          }),
      ];
      break;
    }

    
  }
  return error;
};
