import categoryModel from "../model/category";
import coinModel from "../model/coin";

export interface CategoryInput {
  id: number;
  categoryName: String;
}

export interface CategoryData {
  category: CategoryInput[];
}

export interface CoinInput {
  id: number;
  coinName: String;
}

export interface CoinData {
  coins: CoinInput[];
}

export const addCategoryData = async (category: CategoryData) => {
  return new Promise((resolve, reject) => {
    try {
      const categoryAdded = new categoryModel(category);
      const addedCat = Promise.resolve(categoryAdded.save());
      resolve(addedCat);
    } catch (err) {
      reject(err);
    }
  });
};

export const addCoinData = async (coin: CoinData) => {
  return new Promise((resolve, reject) => {
    try {
      const coinAdded = new coinModel(coin);
      const addedCoin = Promise.resolve(coinAdded.save());
      resolve(addedCoin);
    } catch (err) {
      reject(err);
    }
  });
};
