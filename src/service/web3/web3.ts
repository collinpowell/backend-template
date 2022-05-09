import { ethers } from "ethers";

const polygonRPC = process.env.POLYGON_RPC;
export const polygonContract = process.env.CONTRACT_ADDRESS;
export const polygon1155Contract = process.env.RPC_1155_POLYGON;

export const polygonProvider = new ethers.providers.JsonRpcProvider(polygonRPC);
