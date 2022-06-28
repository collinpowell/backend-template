import { ethers } from "ethers";
import { environments, NODE_ENV } from "../../constant/environments"

const polygonRPC = process.env.POLYGON_RPC;
export const polygonContract = environments.PROD == NODE_ENV ? process.env.CONTRACT_ADDRESS_MAINNET :
    process.env.CONTRACT_ADDRESS_TESTNET;
export const polygon1155Contract = process.env.RPC_1155_POLYGON;

export const polygonProvider = new ethers.providers.JsonRpcProvider(polygonRPC);
