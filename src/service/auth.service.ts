import userModel from "../model/user";
interface AddUserInput {
    email: string;
    confirmPassword: string;
    password: string;
    verificationCode: string;
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