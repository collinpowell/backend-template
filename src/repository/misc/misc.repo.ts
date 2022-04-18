import { level, logger } from "../../config/logger";
import categoryModel from "../../model/category";
import coinModel from "../../model/coin";
import * as contactUsService from "../../service/misc.service";

export const getCategory = async () => {
    logger.log(level.info, `>> getCategory()`);
    const categoryList = await categoryModel.find({});
    if (!categoryList || categoryList.length <= 0) {
      const categoryData = [
        { id: 0, categoryName: "Art" },
        { id: 1, categoryName: "Card" },
        { id: 2, categoryName: "Music" },
        { id: 3, categoryName: "Video" },
      ];
      const data = { error: false, data: categoryData };
      return data;
    }
    const data = { error: false, data: categoryList[0].category };
    return data;
  };
  
  export const getCoin = async () => {
    logger.log(level.info, `>> getCoin()`);
    const coinList = await coinModel.find({});
    if (!coinList || coinList.length <= 0) {
      const coinData = [
        { id: 0, coinName: "ETH" },
        { id: 1, coinName: "MATIC" },
      ];
      const data = { error: false, data: coinData };
      return data;
    }
    const data = { error: false, data: coinList[0].coins };
    return data;
  };

  export const saveContactUsDetails = async ( body: any) => {
    logger.log(level.info, `>> saveContactUsDetails()`);
    await contactUsService.saveContactUsDetails({
      email: body.email,
      name: body.name,
      subject: body.subject,
      message: body.message,
    });
  
    let data = {
      error: false,
      message: "Contact us request saved successfully",
    };
    return data;
  };