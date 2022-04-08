import { model, Schema } from "mongoose";
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
  updatedAt: string;
  resetPasswordToken?: string;
  tokenCreatedAt?: string;
  verificationCreatedAt?: string;
  connectedWallet: any;
  avatar: string;
  coverImage: string;
  bio: string;
  kycStatus: string;
}

export type KycStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

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
  fullName: { type: String,
    required: true, },
  username: { type: String, required: true },
  mobileNumber: { type: String },
  bio: { type: String },
  password: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    default: "null",
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
  },
  authProvider: { 
    type: String,
    enum: ["GOOGLE", "EMAIL"],
    default: "EMAIL"
  },

  // Status 0 = Not verified, 1 = active, 2 = inactive
  status: { type: String, enum: ["ACTIVE","INACTIVE","DELETED","BLOCKED"], default: "INACTIVE" },
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
  connectedWallet: [Object],
  avatar: String,
  coverImage: String,
  kycStatus: { 
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED"],
    default: "PENDING"
  },
  totalCreations: {
    type: Number,
    //required: true,
  },
  totalNftOwned: {
    type: Number,
    //required: true,
  },
  totalInSale: {
    type: Number,
    //required: true,
  },
  totalInAuction: {
    type: Number,
    //required: true,
  },
  totalCollections: {
    type: Number,
    //required: true,
  },
};

const userSchema = new Schema(schema, {
  toObject: { getters: true },
  toJSON: { getters: true },
  timestamps: true ,
});

export default model<UserData>("user", userSchema);
