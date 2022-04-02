import { customAlphabet } from "nanoid";
import * as fs from "fs";
import * as path from "path";

import {
    encrypt,
  } from "../../utils/utility";

import { level, logger } from "../../config/logger";
import userModel, {
    UserInput,
  } from "../../model/user";

import * as userService from "../../service/auth.service";
import transporter from "../../utils/transport";



const nanoid = customAlphabet(process.env.CUSTOM_NUMBER, 8);

export interface accessTokenData {
    id: string;
    email: string;
    role: string;
  }

export const registerUser = async (registerInput: UserInput) => {
    logger.log(level.info, `>> registerUser()`);
    const userData = await userModel.find({
      email: registerInput.email,
      is_delete: false,
    });
    let data = {statuscode: 200, body: "", message: "" };
  
    if (registerInput.password !== registerInput.confirmPassword) {
      data = {
        statuscode: 400,
        body: "",
        message: "Err: Password and Confirm Password does not match",
      };
      return data;
    }
  
    const verificationCode = nanoid();
    if (!userData || userData.length <= 0) {
      const encryptPassword = await encrypt(registerInput.password);
  
      await userService.addUser({
        ...registerInput,
        verificationCode,
        password: encryptPassword,
      });
      try {
        await verificationEmail(registerInput.email, verificationCode);
  
      } catch (error) {
        console.log(error.message);
      }
      data = {statuscode: 200, body: "", message: "User Registered successfully" };
      return data;
    } else {
      const encryptPassword = await encrypt(registerInput.password);
      if (userData && userData.length > 0 && userData[0].status === 1) {
        data = {statuscode: 400, body: "", message: "Username already exist in DB								" };
        return data;
      }
      await userModel.findOneAndUpdate(
        { email: registerInput.email },
        { ...registerInput, verificationCode, password: encryptPassword }
      );
  
      try {
        await verificationEmail(registerInput.email, verificationCode);
  
      } catch (error) {
        console.log(error.message);
      }
  
      data = {statuscode: 200, body: "", message: "User Registered successfully" };
      return data;
    }
  };

  export const verificationEmail = async (
    email: string,
    verificationCode: string
  ) => {
    let html = fs.readFileSync(
      path.resolve("./src/template/verification.html"),
      "utf8"
    );
    let verificationTemplate = html.replace(/APP_USERNAME/g, email);
    verificationTemplate = verificationTemplate.replace(
      /VERIFICATION_CODE/g,
      verificationCode
    );
  
    await transporter.sendMail({
      from: 'Verify@nodexihub.com',
      to: email,
      subject: "Verification Code",
      text: verificationCode,
      html: verificationTemplate,
    });
    logger.log(level.info, `>> email sent successfully()`);
  };