import { customAlphabet } from "nanoid";
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";

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
import user from "../../model/user";



const nanoid = customAlphabet(process.env.CUSTOM_NUMBER, 8);

export interface accessTokenData {
  id: string;
  email: string;
  role: string;
}

export interface ForgotPassword {
  email: string;
}

export const registerUser = async (registerInput: UserInput) => {
  logger.log(level.info, `>> registerUser()`);
  const userData = await userModel.find({
    email: registerInput.email,

  });
  const usernameAvailable = await checkUsername(registerInput.username)
  if (!usernameAvailable.body.available) {
    const data = {
      error: true,
      message: "Username is taken"
    };
    return data;
  }
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
      data = { error: true, message: "Email already exists" };
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

  if (userData[0].verificationCode != verificationData.verificationCode) {
    console.log(userData[0].verificationCode)
    console.log(verificationData.verificationCode)

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

  if (userData[0].status.toString() === "INACTIVE") {
    try {
      await verificationEmail(loginInput.email, userData[0].verificationCode);
    } catch (error) {
      console.log(error.message);
    }
    const data = { error: true, message: "Verify you email" };
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
      status: "ACTIVE",
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

export const changePassword = async (
  _id: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  logger.log(level.info, `>> loginUser()`);
  const userData = await userModel.find({
    _id: _id,
  });

  if (userData[0].status.toString() === "INACTIVE") {
    const data = { error: true, message: "User does not exist" };
    return data;
  }

  const decryptPassword = await decrypt(
    currentPassword,
    userData[0].password
  );

  if (!decryptPassword) {
    const data = { error: true, message: "Password not matched" };
    return data;
  }


  if (newPassword !== confirmPassword) {
    return {
      error: true,
      message: "Confirm password does not match with password",
    };
  }
  const encryptPassword = await encrypt(newPassword);
  await userModel.findOneAndUpdate(
    {
      _id: userData[0]._id,
    },
    {
      $set: {
        password: encryptPassword,
      },
    }
  );
  return {
    error: false,
    message: "Password updated successfully",
  };
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
    from: 'Verify@nodexigub.com',
    to: email,
    subject: "Verification Code",
    text: verificationCode,
    html: verificationTemplate,
  });
  logger.log(level.info, `>> email sent successfully()`);
};

export const forgetPasswordEmail = async (
  email: string,
  resetPasswordToken: string
) => {
  let html = fs.readFileSync(
    path.resolve("./src/template/forgetPassword.html"),
    "utf8"
  );
  const resetPasswordEndPoint = `${process.env.USER_END_POINT}/reset-password?reset_password_token=${resetPasswordToken}`;
  let verificationTemplate = html.replace(/APP_USERNAME/g, email);
  verificationTemplate = verificationTemplate.replace(
    /RESET_PASSWORD_LINK/g,
    resetPasswordEndPoint
  );

  await transporter.sendMail({
    from: 'Reset@nodexigub.com',
    to: email,
    subject: "Forget Password",
    text: resetPasswordEndPoint,
    html: verificationTemplate,
  });
  logger.log(level.info, `>> email sent successfully()`);
};

export const checkUsername = async (
  username: string,
) => {
  logger.log(level.info, `>> checkUsername()`);

  //checking username exists
  const existUsername = await user.findOne({ username: username.toLocaleLowerCase() });
  if (existUsername) {
    const data = { error: false, body: { available: false }, message: "Username is not Available" };
    return data;
  } else {
    const data = { error: false, body: { available: true }, message: "Username is Available" };
    return data;
  }
};

export const forgotPassword = async (email: string) => {
  logger.log(level.info, `>> forgotPassword()`);
  const userExist = await userModel.find({
    email,
  });
  let data = { error: false, message: "" };

  if (!userExist || userExist.length <= 0) {
    data = { error: true, message: "User does not exist" };
    return data;
  }

  if (userExist[0].status === 0) {
    const data = { error: true, message: "User does not exist" };
    return data;
  }
  const resetPasswordToken = crypto.randomBytes(32).toString("hex");
  await userModel.findOneAndUpdate(
    { email },
    { $set: { resetPasswordToken, tokenCreatedAt: new Date() } }
  );
  await forgetPasswordEmail(email, resetPasswordToken);
  data = {
    error: false,
    message:
      "We have sent email please check your inbox to reset your password",
  };
  return data;
};

export const resetPassword = async (
  newPassword: string,
  confirmPassword: string,
  resetPasswordToken: string
) => {
  logger.log(level.info, `>> resetPassword()`);
  let data = { error: false, message: "" };
  const userExist = await userModel.find({ resetPasswordToken });
  if (userExist && userExist.length > 0) {
    const tokenCreatedAt = new Date(userExist[0].tokenCreatedAt);
    const add24Hours = new Date(tokenCreatedAt.getTime() + 24 * 60 * 60 * 1000);
    if (add24Hours < new Date()) {
      data = {
        error: true,
        message: "Your Reset password token is expired, Please try again",
      };
      return data;
    }
    if (newPassword !== confirmPassword) {
      data = {
        error: true,
        message: "Confirm password does not match with password",
      };
      return data;
    }
    const encryptPassword = await encrypt(newPassword);
    await userModel.findOneAndUpdate(
      {
        resetPasswordToken,
        _id: userExist[0]._id,
      },
      {
        $set: {
          password: encryptPassword,
          resetPasswordToken: "",
          tokenCreatedAt: "",
        },
      }
    );
    data = {
      error: false,
      message: "Password updated successfully",
    };
    return data;
  }
  data = {
    error: true,
    message: "Reset Password link expired. Please generate new Token.",
  };
  return data;
};


export const sendChangeEmail = async (_id: string, email: string) => {
  logger.log(level.info, `>> sendChangeEmail()`);
  const [userData, myEmail, emailExist] = await Promise.all([
    userModel.find({ _id }),
    userModel.find({ _id, email }),
    userModel.find({ _id: { $ne: _id }, email }),
  ]);
  let data = { error: false, message: "" };
  if (myEmail && myEmail.length > 0) {
    data = { error: true, message: "Enter different email" };
    return data;
  }
  if (emailExist && emailExist.length > 0) {
    data = { error: true, message: "This email is already registered" };
    return data;
  }
  const verificationCode = nanoid();
  await userModel.findOneAndUpdate(
    { _id, email: userData[0].email },
    {
      $set: {
        verificationCode,
        newEmail: email,
        verificationCreatedAt: new Date(),
      },
    }
  );
  changeEmail(userData[0].email, email, verificationCode);
  data = {
    error: false,
    message: "We have sent email please check your inbox to change your email",
  };
  return data;
};

export const changeEmail = async (
  oldEmail: string,
  email: string,
  verificationCode: string
) => {
  let html = fs.readFileSync(
    path.resolve("./src/template/emailChange.html"),
    "utf8"
  );
  let changeEmailTemplate = html.replace(/OLD_EMAIL_ADDRESS/g, oldEmail);
  changeEmailTemplate = changeEmailTemplate.replace(
    /NEW_EMAIL_ADDRESS/g,
    email
  );

  changeEmailTemplate = changeEmailTemplate.replace(
    /VERIFICATION_CODE/g,
    verificationCode
  );

  await transporter.sendMail({
    from: 'Minto@nodexigub.com',
    to: email,
    subject: "Change Email",
    text: verificationCode,
    html: changeEmailTemplate,
  });
  logger.log(level.info, `>> email sent successfully()`);
};

export const verifyChangeEmail = async (
  _id: string,
  newEmail: string,
  verificationCode: string
) => {
  logger.log(level.info, `>> verifyChangeEmail()`);
  const [userData, myEmail, emailExist] = await Promise.all([
    userModel.find({ _id, newEmail, verificationCode }),
    userModel.find({ _id, email: newEmail }),
    userModel.find({ _id: { $ne: _id }, email: newEmail }),
  ]);
  let data = { error: false, message: "" };
  if (myEmail && myEmail.length > 0) {
    data = { error: true, message: "Enter different email" };
    return data;
  }
  if (emailExist && emailExist.length > 0) {
    data = { error: true, message: "This email is already registered" };
    return data;
  }
  if (userData && userData.length > 0) {
    const verificationCodeCreated = new Date(
      userData[0].verificationCreatedAt
    );
    const add3Minutes = new Date(
      verificationCodeCreated.getTime() + 3 * 60 * 1000
    );
    if (add3Minutes < new Date()) {
      data = {
        error: true,
        message: "Your verification code is expired, Please try again",
      };
      return data;
    }
    await userModel.findOneAndUpdate(
      { _id, newEmail, verificationCode },
      {
        $set: {
          email: newEmail,
          newEmail: "",
          verificationCode: "",
          verificationCreatedAt: "",
        },
      }
    );
    data = {
      error: false,
      message: "Email updated successfully",
    };
    return data;
  }
  data = {
    error: true,
    message: "Invalid verification code",
  };
  return data;
};