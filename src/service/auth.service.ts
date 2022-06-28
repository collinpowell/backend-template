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
  fullName?: string;
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
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET);
  const ticket = await client.getTokenInfo(token);

  console.log(ticket)
  const payload = ticket;
  const userid = payload["sub"];
  const email = payload["email"];
  const name = payload["name"];

  return { email, userid, name };
};