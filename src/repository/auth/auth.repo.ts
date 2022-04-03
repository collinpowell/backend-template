import { customAlphabet } from "nanoid";
import * as fs from "fs";
import * as path from "path";

import {
  encrypt,
  decrypt
} from "../../utils/utility";

import { level, logger } from "../../config/logger";
import userModel, {
  UserInput,
  VerificationInput,
  LoginInput
} from "../../model/user";

import nftModel from "../../model/nft";
import collectionModel from "../../model/collection";

import JWTAuth from "../../service/jwt_auth/jwt_auth";

import * as authService from "../../service/auth.service";
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

  });
  let data = { error: false, message: "" };
  if (registerInput.password !== registerInput.confirmPassword) {
    data = {
      error: true,
      message: "Password and Confirm Password does not match",
    };
    return data;
  }

  const verificationCode = nanoid();
  if (!userData || userData.length <= 0) {
    const encryptPassword = await encrypt(registerInput.password);
    await authService.addUser({
      ...registerInput,
      verificationCode,
      password: encryptPassword,
    });
    try {
      await verificationEmail(registerInput.email, verificationCode);

    } catch (error) {
      console.log(error.message);
    }
    data = { error: false, message: "User Registered successfully" };
    return data;
  } else {

    const encryptPassword = await encrypt(registerInput.password);
    if (userData && userData.length > 0 && userData[0].status.toString() == 'ACTIVE') {
      data = { error: false, message: "Username already exist in DB" };
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

    data = { error: false, message: "User Registered successfully" };
    return data;
  }
};

export const verifyUser = async (verificationData: VerificationInput) => {
  logger.log(level.info, `>> verifyUser()`);
  const userData = await userModel.find({
    email: verificationData.email.toLowerCase(),
  });

  if (!userData || userData.length <= 0) {
    const data = { error: true, message: "User does not exist" };
    return data;
  }

  if (userData[0].status.toString() == "ACTIVE") {
    const data = { error: true, message: "User is already verified" };
    return data;
  }

  if (userData[0].verificationCode !== verificationData.verificationCode) {
    const data = { error: true, message: "Verification code is not correct" };
    return data;
  }

  const tokenPayload: accessTokenData = {
    id: userData[0]._id,
    email: userData[0].email,
    role: userData[0].role,
  };

  const auth = new JWTAuth();
  const accessToken = await auth.createToken(tokenPayload);

  await userModel.findOneAndUpdate(
    { email: verificationData.email },
    { $set: { status: "ACTIVE", verificationCode: "" } }
  );
  const data = {
    error: false,
    message: "Verification is Successful",
    data: {
      userId: userData[0]._id.toString(),
      email: tokenPayload.email,
      fullName: userData[0].fullName,
      username: userData[0].username,
      role: tokenPayload.role,
      kycStatus: userData[0].kycStatus,
      createdAt: userData[0].createdAt,
      updatedAt: userData[0].updatedAt,
      status: 'ACTIVE',
      authProvider: userData[0].authProvider,
      accessToken,
    },
  };
  return data;
};

export const loginUser = async (loginInput: LoginInput) => {
  logger.log(level.info, `>> loginUser()`);
  const userData = await userModel.find({
    email: loginInput.email.toLowerCase(),
  });

  if (!userData || userData.length <= 0) {
    const data = { error: true, message: "User does not exist" };
    return data;
  }
  if (userData[0].googleId !== "null") {
    const data = {
      error: true,
      message: "Login via google",
    };
    return data;
  }

  if (userData[0].status === 0) {
    const data = { error: true, message: "User does not exist" };
    return data;
  }

  const decryptPassword = await decrypt(
    loginInput.password,
    userData[0].password
  );

  if (!decryptPassword) {
    const data = { error: true, message: "Password not matched" };
    return data;
  }

  const tokenPayload: accessTokenData = {
    id: userData[0]._id,
    email: userData[0].email,
    role: userData[0].role,
  };

  const auth = new JWTAuth();
  const accessToken = await auth.createToken(tokenPayload);
  const [totalCreations, totalCollections] = await Promise.all([
    nftModel.find({ userId: userData[0]._id }).count(),
    collectionModel
      .find({ userId: userData[0]._id })
      .count(),
  ]);
  const data = {
    error: false,
    message: "Login Successful",
    data: {
      userId: userData[0]._id.toString(),
      email: tokenPayload.email,
      fullName: userData[0].fullName,
      username: userData[0].username,
      role: tokenPayload.role,
      kycStatus: userData[0].kycStatus,
      createdAt: userData[0].createdAt,
      updatedAt: userData[0].updatedAt,
      status: 'ACTIVE',
      authProvider: userData[0].authProvider,
      accessToken,
      connectedWallet: userData[0].connectedWallet,
      totalCreations,
      totalCollections,
    },
  };
  return data;
};


export const googleLogin = async (
  email: string,
  googleId: string,
  idToken: string,
  username: string
) => {
  logger.log(level.info, `>> googleLogin()`);
  const idData = await authService.googleUserVerify(idToken);

  if (idData !== googleId) {
    const data = {
      error: true,
      message: "Login fails",
    };
    return data;
  }
  const userData = await userModel.find({ email: email });
  if (
    userData &&
    userData.length > 0 &&
    userData[0].status.toString() === 'ACTIVE' &&
    userData[0].googleId === "null"
  ) {
    const data = { error: true, message: "This user need password login" };
    return data;
  }
  if (!userData || userData.length <= 0) {
    await authService.addGoogleUser({
      username: username,
      googleId: idData,
      authProvider: 'GOOGLE',
      email,
      status: 1,
    });

    const userDetails = await userModel.find({
      email: email,
      is_deleted: false,
    });
    const tokenPayload: accessTokenData = {
      id: userDetails[0]._id,
      email: userDetails[0].email,
      role: userDetails[0].role,
    };
    const auth = new JWTAuth();
    const accessToken = await auth.createToken(tokenPayload);
    const [totalCreations, totalCollections] = await Promise.all([
      nftModel.find({ userId: userData[0]._id }).count(),
      collectionModel
        .find({ userId: userData[0]._id })
        .count(),
    ]);
    const data = {
      error: false,
      message: "User Registered successfully",
      data: {
        userId: userData[0]._id.toString(),
        email: tokenPayload.email,
        fullName: userData[0].fullName,
        username: userData[0].username,
        role: tokenPayload.role,
        kycStatus: userData[0].kycStatus,
        createdAt: userData[0].createdAt,
        updatedAt: userData[0].updatedAt,
        status: 'ACTIVE',
        authProvider: userData[0].authProvider,
        accessToken,
        connectedWallet: userData[0].connectedWallet,
        totalCreations,
        totalCollections,
      },
    };
    return data;
  }

  const tokenPayload: accessTokenData = {
    id: userData[0]._id,
    email: userData[0].email,
    role: userData[0].role,
  };
  const auth = new JWTAuth();
  const accessToken = await auth.createToken(tokenPayload);
  const [totalCreations, totalCollections] = await Promise.all([
    nftModel.find({ userId: userData[0]._id }).count(),
    collectionModel
      .find({ userId: userData[0]._id })
      .count(),
  ]);
  const data = {
    error: false,
    message: "Login Successful",
    data: {
      userId: userData[0]._id.toString(),
      email: tokenPayload.email,
      fullName: userData[0].fullName,
      username: userData[0].username,
      role: tokenPayload.role,
      kycStatus: userData[0].kycStatus,
      createdAt: userData[0].createdAt,
      updatedAt: userData[0].updatedAt,
      status: 'ACTIVE',
      authProvider: userData[0].authProvider,
      accessToken,
      connectedWallet: userData[0].connectedWallet,
      totalCreations,
      totalCollections,
    },
  };
  return data;
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