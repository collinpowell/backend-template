import { Response } from "express";
import HTTPStatus from "http-status";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { constants as ERROR_CONST } from "../constant/error";
import qs from "qs";

const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
const iv = Buffer.from(process.env.IV_KEY, "hex");

interface errorObject {
  message: string;
}

interface errorResponseJson {
  error: errorObject;
}

export const createErrorResponseJSON = (error: errorObject) => {
  const errorResponse = { error: error };
  return errorResponse;
};

export const sendJSONResponse = (
  res: Response,
  statusCode: number,
  data: errorResponseJson
) => {
  res.status(statusCode).json(data);
};

export const standardStructureStringToJson = (queryString: any) => {
  return qs.parse(queryString);
};

export const getOptionsPipelineJson = (extraParams: any) => {
  const json = { limit: 0, skip: 0 };

  if (extraParams.limit) {
    json.limit = Number(extraParams.limit);
  }
  if (extraParams.page || extraParams.limit) {
    let page = Number(extraParams.page);
    let limit = Number(extraParams.limit);
    json.skip = page > 0 ? (page - 1) * limit : 0;
    json.limit = limit;
  }

  return json;
};

export const getOptionsJson = (extraParams: any) => {
  const json = { limit: 0, skip: 0, page: 0, sort: "" };
  if (extraParams.limit) {
    json.limit = Number(extraParams.limit);
  }
  if (extraParams.page) {
    json.page = Number(extraParams.page);
  }
  if (extraParams.sort) {
    json.sort = extraParams.sort;
  } else {
    json.sort = "-created_at";
  }
  return json;
};

export const serverError = (res: Response) => {
  let code: number, response: errorResponseJson;
  const data: errorObject = {
    message: ERROR_CONST.ERROR_500_MESSAGE,
  };
  code = HTTPStatus.INTERNAL_SERVER_ERROR;
  response = createErrorResponseJSON(data);
  return sendJSONResponse(res, code, response);
};

export const badRequestError = (res: Response, errors: string) => {
  let code: number, response: errorResponseJson;
  const data = { message: errors };
  code = HTTPStatus.BAD_REQUEST;
  response = createErrorResponseJSON(data);
  return sendJSONResponse(res, code, response);
};

export const encrypt = async (data: string) => {
  const salt = await bcrypt.genSalt(10);
  let mystr = await bcrypt.hash(data, salt);
  return mystr;
};

export const decrypt = async (data: string, hashData: string) => {
  const match = await bcrypt.compare(data, hashData);
  return match;
};

export const encryptText = (text: string) => {
  let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  let encryptedData = encrypted.toString("hex");
  return encryptedData;
};

export const decryptText = (text: string) => {
  if (text === null || typeof text === "undefined") return text;
  let encryptedText = Buffer.from(text, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const authError = (res: Response) => {
  let code: number, response: errorResponseJson;
  const data = { message: ERROR_CONST.ERROR_401_MESSAGE };
  code = HTTPStatus.UNAUTHORIZED;
  response = createErrorResponseJSON(data);
  return sendJSONResponse(res, code, response);
};

export const regexSpecialChar = (search: string) => {
  if (search.includes("(")) {
    search = search.replace("(", "\\(");
  }
  if (search.includes(")")) {
    search = search.replace(")", "\\)");
  }
  if (search.includes("{")) {
    search = search.replace("{", "\\{");
  }
  if (search.includes("}")) {
    search = search.replace("}", "\\}");
  }
  if (search.includes("[")) {
    search = search.replace("[", "\\[");
  }
  if (search.includes("]")) {
    search = search.replace("]", "\\]");
  }
  if (search.includes(".")) {
    search = search.replace(".", "\\.");
  }
  if (search.includes("|")) {
    search = search.replace("|", "\\|");
  }
  if (search.includes("*")) {
    search = search.replace("*", "\\*");
  }
  if (search.includes("+")) {
    search = search.replace("+", "\\+");
  }
  if (search.includes('"')) {
    search = search.replace('"', '\\"');
  }
  if (search.includes("@")) {
    search = search.replace("@", "\\@");
  }
  return search;
};
