import { logger, level } from "../config/logger";
import userModel from "../model/user";
import { addUserPredata } from "../service/auth.service";
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

      const addedUser = await addUserPredata(externalUser);

    }
    return true;
  } catch (e) {
    logger.log(level.error, `Error During adding user predata error: ${e}`);
  }
})();
