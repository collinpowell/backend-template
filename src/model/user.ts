import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { decryptText, encryptText } from "../utils/utility";

export interface UserInput {
  email: string;
  fullName: string;
  username: string;
  confirmPassword: string;
  password: string;
}

export interface VerificationInput {
  email: string;
  verificationCode: string;
} 

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoolgeLoginInput {
  username: string;
  googleId: string;
  idToken: string;
}

export interface UserPWResetInput {
  email: string;
  resetPasswordToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserPWChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserData {
  _id: string;
  email: string;
  fullName: string;
  username: string;
  mobileNumber: string;
  password: string;
  status: number;
  googleId?: string;
  authProvider?: string;
  verificationCode?: string;
  role: string;
  createdAt: string;
  tokenCreatedAt: string;
  verificationCreatedAt: string;
  connectedwallet: any;
  avatar: string;
  coverImage: string;
  metamaskId: string;
  bio: string;
  kycStatus: string;
}

export type KycStatus = 'PENDING' | 'VERIFIED' | 'UNVERIFIED';

const schema = {
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    set: encryptText,
    get: decryptText,
  },
  fullName: { type: String },
  username: { type: String },
  mobileNumber: { type: String },
  bio: { type: String },
  password: {
    type: String,
  },
  googleId: {
    type: String,
    default: "null",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  // Status 0 = Not verified, 1 = active, 2 = inactive
  status: { type: Number, enum: ["Active","Inactive","Deleted","Blocked","Not verified"], default: 0 },
  verificationCode: String,
  resetPasswordToken: String,
  tokenCreatedAt: { type: Date, default: null },
  verificationCreatedAt: { type: Date, default: null },
  newEmail: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    set: encryptText,
    get: decryptText,
  },
  connectedwallet: [Object],
  avatar: String,
  coverImage: String,
  kycStatus: { 
    type: String,
    enum: ["PENDIND", "VERIFIED", "UNVERIFIED"],
    default: "PENDIND"
  }
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const userSchema = new Schema(schema, {
  toObject: { getters: true },
  toJSON: { getters: true },
  timestamps,
});

export default model<UserData>("user", userSchema);
