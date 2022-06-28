import { logger, level } from "../config/logger";
import { addExternalUserData } from "../service/category_coin.service";
import userModel from "../model/user";

(async () => {
  try {
    logger.log(level.info, `Pre External User`);
    const externalUser = {
      email: "externaluser@mintomarket.com",
      fullName: "External User",
      username: "externaluser",
      password: "externaluser",
      role: "EXTERNAL",
      authProvider: "EMAIL",
      status: "ACTIVE",
    }

    const userExist = await userModel.find({username:'externaluser'});
    if (!userExist || userExist.length <= 0) {

      const addedUser = await addExternalUserData(externalUser);

    }
    return true;
  } catch (e) {
    logger.log(level.error, `Error During adding user predata error: ${e}`);
  }
})();
