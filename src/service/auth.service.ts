import { OAuth2Client } from "google-auth-library";

import userModel from "../model/user";
interface AddUserInput {
    email: string;
    confirmPassword: string;
    password: string;
    verificationCode: string;
  }

  interface AddGoogleUserInput {
    username: string;
    email: string;
    googleId: string;
    status: string;
    authProvider: string;
  }

export const addUser = async (user: AddUserInput) => {
    return new Promise((resolve, reject) => {
      try {
        const userCreate = new userModel(user);
        const addedUser = Promise.resolve(userCreate.save());
        resolve(addedUser);
      } catch (err) {
        reject(err);
      }
    });
  };

  export const addGoogleUser = async (user: AddGoogleUserInput) => {
    return new Promise((resolve, reject) => {
      try {
        const userCreate = new userModel(user);
        const addedUser = Promise.resolve(userCreate.save());
        resolve(addedUser);
      } catch (err) {
        reject(err);
      }
    });
  };
  
  export const googleUserVerify = async (token: string) => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    return userid;
  };