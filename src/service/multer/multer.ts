import { Request } from "express";
import multer, { StorageEngine } from "multer";
import { resolve } from "path";
import fs from "fs";

export interface MulterRequest extends Request {
  file: any;
}

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
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (arg0: Error, arg1: boolean) => void
): void => {
  if (
        file.mimetype !== "image/webp" &&
        file.mimetype !== "image/jpeg" &&
        file.mimetype !== "image/gif" &&
        file.mimetype !== "image/png" &&
        file.mimetype !== "image/jpg" &&
        file.mimetype !== "video/mp4" &&
        file.mimetype !== "audio/mp3" &&
        file.mimetype !== "application/pdf" &&
        file.mimetype !== "audio/mpeg"
  ) {
    cb(null, true);
  } else {
    // cb(
    //   new Error("Image uploaded is not of type webp, gif, png, mp3, mp4"),
    //   false
    // );
    cb(null, true);
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
