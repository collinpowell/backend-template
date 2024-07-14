import * as fs from "fs";
import { level, logger } from "../../config/logger";
import userModel from "../../model/user";
import cloudinary from "../../config/bucket";

export const userAccount = async (_id: any) => {
  logger.log(level.info, `>> userAccount()`);
  const userData = await userModel.find({
    _id,
    status: "ACTIVE",
  });

  if (userData && userData.length > 0) {
   

    const userJson = {
      userId: userData[0]._id,
      email: userData[0].email,
      fullName: userData[0].fullName,
      username: userData[0].username,
      role: userData[0].role,
      kycStatus: userData[0].kycStatus,
      createdAt: userData[0].createdAt,
      updatedAt: userData[0].updatedAt,
      status: userData[0].status,
      authProvider: userData[0].authProvider,
      mobileNumber: userData[0].mobileNumber,
      avatar: userData[0].avatar,
      bio: userData[0].bio,
      coverImage: userData[0].coverImage,
    };
    const data = {
      error: false,
      message: "User Data fetched successfully",
      data: userJson,
    };
    return data;
  }
  const data = {
    error: true,
    message: "User not found",
  };
  return data;
};

export const checkUsername = async (
  username: string,
) => {
  logger.log(level.info, `>> checkUsername()`);

  //checking username exists
  const existUsername = await userModel.findOne({ username: username.toLocaleLowerCase() });
  if (existUsername) {
    const data = { error: false, body: { available: false }, message: "Username is not Available" };
    return data;
  } else {
    const data = { error: false, body: { available: true }, message: "Username is Available" };
    return data;
  }
};

export const editProfile = async (_id: string, body: any) => {
  logger.log(level.info, `>> editProfile()`);

  const userExist = await userModel.find({
    _id,
    status: "ACTIVE",
  });
  if (!userExist || userExist.length <= 0) {
    const data = {
      error: true,
      message: "User not found",
    };
    return data;
  }

  let updateData = {};

  if (body.username) {
    if (body.username.indexOf(' ') >= 0) {
      const data = {
        error: true,
        message: "Username cannot have spaces",
      };
      return data;
    }
    const usernameAvailable = await checkUsername(body.username)
    if (!usernameAvailable.body.available) {
      const data = {
        error: true,
        message: "Username is taken"
      };
      return data;
    }

    updateData = { ...updateData, username: body.username };
  }

  if (body.bio && body.bio.length > 500) {
    const data = {
      error: true,
      message: "Bio length must be less than 500 characters",
    };
    return data;
  }


  if (body.bio && body.bio.length > 0) {
    updateData = {
      ...updateData,
      bio: body.bio,
    };
  }

  if (body.fullName && body.fullName.length > 0) {
    updateData = {
      ...updateData,
      fullName: body.fullName,
    };
  }

  if (body.mobileNumber && body.mobileNumber.length > 0) {
    const regex = new RegExp('^[+\\(\\)\\[\\]]*([0-9][ +-pw\\(\\)\\[\\]]*){6,45}$', '')

    if (!body.mobileNumber.match(regex)) {
      const data = {
        error: true,
        message: "Invalid Mobile Number (Unsupported Character)",
      };
      return data;
    }
    if (body.mobileNumber.length < 10) {
      const data = {
        error: true,
        message: "Invalid Mobile Number (Must be greater than 10 characters)",
      };
      return data;
    }
    updateData = {
      ...updateData,
      mobileNumber: body.mobileNumber,
    };
  }

  await userModel.findOneAndUpdate({ _id }, { $set: updateData });

  const data = {
    error: false,
    message: "Profile Updated Successfully",
  };
  return data;
};


export const getUserProfile = async (_id: any) => {
  logger.log(level.info, `>> userAccount()`);
  const userData = await userModel.find({
    _id,
  });

  if (userData && userData.length > 0) {

    const userJson = {
      userId: userData[0]._id,
      email: userData[0].email,
      fullName: userData[0].fullName,
      username: userData[0].username,
      role: userData[0].role,
      kycStatus: userData[0].kycStatus,
      createdAt: userData[0].createdAt,
      updatedAt: userData[0].updatedAt,
      status: userData[0].status,
      avatar: userData[0].avatar,
      bio: userData[0].bio,
      coverImage: userData[0].coverImage,
    };
    const data = {
      error: false,
      message: "User Data fetched successfully",
      data: userJson,
    };
    return data;
  }
  const data = {
    error: true,
    message: "User not found",
  };
  return data;
};

export const uploadProfile = async (_id: string, file: any, body: any) => {
  logger.log(level.info, `>> uploadProfile()`);
  const userExist = await userModel.find({
    _id,
    status: "ACTIVE",
  });

  console.log(_id)

  if (!userExist || userExist.length <= 0) {
    const data = {
      error: true,
      message: "User not found",
    };
    return data;
  }
  let uploadData = {};

  uploadData = await uploadProfilePromise(_id, file);


  const data = {
    error: false,
    message: "Profile Image Updated Successfully",
    data: uploadData,
  };
  return data;
};

export const uploadProfilePromise = async (_id, file) => {
  let updateData = {};

  return new Promise((resolve, reject) => {
    const res = cloudinary.uploader.upload(file.path);
    res
      .then(async (data) => {
        console.log(data.secure_url);
        updateData = {
          ...updateData,
          avatar: data.secure_url,
        };
        await userModel.findOneAndUpdate({ _id }, { $set: updateData });
        fs.unlink(file.path, () => {
          console.log("Success successfully Deleted");
        });
        resolve(updateData);
      })
      .catch((err) => {
        console.log(err);
        fs.unlink(file.path, () => {
          console.log("end successfully Deleted");
        });
        reject(err);
      });
  });
};

export const uploadCoverImage = async (_id: string, file: any) => {
  logger.log(level.info, `>> uploadCoverImage()`);
  const userExist = await userModel.find({
    _id,
    status: "ACTIVE",
  });
  if (!userExist || userExist.length <= 0) {
    const data = {
      error: true,
      message: "User not found",
    };
    return data;
  }

  const uploadData = await uploadCoverPromise(_id, file);

  const data = {
    error: false,
    message: "Cover Image Updated Successfully",
    data: uploadData,
  };
  return data;
};


export const uploadCoverPromise = async (_id, file) => {
  let updateData = {};
  return new Promise((resolve, reject) => {
    const res = cloudinary.uploader.upload(file.path);
    res
      .then(async (data) => {
        console.log(data.secure_url);
        updateData = {
          ...updateData,
          coverImage: data.secure_url,
        };
        await userModel.findOneAndUpdate({ _id }, { $set: updateData });
        fs.unlink(file.path, () => {
          console.log("Success successfully Deleted");
        });
        resolve(updateData);
      })
      .catch((err) => {
        console.log(err);
        fs.unlink(file.path, () => {
          console.log("end successfully Deleted");
        });
        reject(err);
      });
  });
};
