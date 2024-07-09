import { Request, Response, RequestHandler } from 'express';
import dotenv from 'dotenv';
import asyncHandler from '../utils/asyncHandler';
import { responseError } from '../utils';
import { ERROR } from '../enums';

dotenv.config();

const headerControl: RequestHandler = asyncHandler(async (req: Request, res: Response, next) => {
    if (!req.headers.origin || req.headers.origin === undefined) {
        if (req.headers.token === process.env.TOKEN) {
            return next();
        } else {
            return responseError(res, ERROR.AUTH.UNAUTHRIZED);
        }
    } else {
        return next();
    }
});

export default headerControl;
