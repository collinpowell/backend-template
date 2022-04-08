import { Request } from "express";
import multer, { StorageEngine } from "multer";
import { resolve } from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export interface MulterRequest extends Request {
  file: any;
}
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb): void => {
    if (!file) {
      cb(new Error("Upload file error"), null);
    } else {
      const path = `src/public/uploads`;
      fs.mkdirSync(path, { recursive: true });
      cb(null, resolve(process.cwd(), path));
    }
  },

  filename: (req: Request, file: Express.Multer.File, cb): void => {
    const extension = MIME_TYPES[file.mimetype];
    cb(null, `${Date.now()}-${uuidv4()}.${extension}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (arg0: Error, arg1: boolean) => void
): void => {
  if (
    file.mimetype === "image/webp" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Image uploaded is not of type webp,jpeg, png, mp3"), false);
    // throw new Error("Image uploaded is not of type webp,jpeg, png");
  }
};
let obj = {
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: fileFilter,
};

export const upload = multer(obj);
