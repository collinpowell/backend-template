import { Request, Response } from "express";
import { level, logger } from "../../config/logger";
import {
    successfulRequest,
    serverError,
} from "../../utils/utility";
import * as miscRepo from "../../repository/misc/misc.repo";

export const getCategory = async (req: Request, res: Response) => {
    logger.log(level.debug, `>> getCategory()`);
    try {
        const result = await miscRepo.getCategory();
        // return res.status(201).json({ data: result });
        return successfulRequest(res, Object(result))

    } catch (error) {
        logger.log(level.error, `<< getCategory() error=${error}`);
        serverError(res,error);
    }
};

export const getCoin = async (req: Request, res: Response) => {
    logger.log(level.debug, `>> getCoin()`);
    try {
        const result = await miscRepo.getCoin();
        //return res.status(201).json({ data: result });
        return successfulRequest(res, Object(result))

    } catch (error) {
        logger.log(level.error, `<< getCoin() error=${error}`);
        serverError(res,error);
    }
};

export const saveContactUsDetails = async (
    req: Request,
    res: Response
) => {
    logger.log(level.debug, `>> saveContactUsDetails()`);
    try {
        const result = await miscRepo.saveContactUsDetails(req.body);
        //return res.status(201).json({ data: result });
        return successfulRequest(res, Object(result))

    } catch (error) {
        logger.log(level.error, `<< saveContactUsDetails() error=${error}`);
        serverError(res,error);
    }
};