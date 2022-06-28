import { logger, level } from "../config/logger";
import { addCategoryData, addCoinData } from "../service/category_coin.service";
import categoryModel from "../model/category";
import coinModel from "../model/coin";

(async () => {
  try {
    logger.log(level.info, `Pre Category and coin`);
    const preCategory = [
      { id: 0, categoryName: "Picture" },
      { id: 1, categoryName: "Video" },
      { id: 2, categoryName: "Art" },
      { id: 3, categoryName: "Music" },
      { id: 4, categoryName: "EBOOK" },
      { id: 5, categoryName: "Webtoon" },


    ];
    const preCoin = [
      { id: 0, coinName: "ETH" },
      { id: 1, coinName: "MATIC" },

    ];

    const categoryExist = await categoryModel.find({});
    const coinExist = await coinModel.find({});
    if (!categoryExist || categoryExist.length <= 0) {
      const data = { category: preCategory };

      await addCategoryData(data);
    }
    if (!coinExist || coinExist.length <= 0) {
      const data = { coins: preCoin };

      await addCoinData(data);
    }
    return true;
  } catch (e) {
    logger.log(level.error, `Error During adding predata error: ${e}`);
  }
})();
