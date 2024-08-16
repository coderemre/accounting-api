import { Request, Response, RequestHandler } from 'express';
import dotenv from 'dotenv';
import asyncHandler from '../utils/asyncHandler';
import { responseError, checkJWT } from '../utils';
import { ERROR, ROLES } from '../enums';

dotenv.config();
const checkAction = async (req: Request, res: Response, next: Function) => {
    const user = await checkJWT(String(req?.headers?.userauth) ?? '');
    const action = req?.body?.action ?? '';

    if (action === 'login' || action === 'register') {
        return next();
    } else if (!user) {
        return responseError(res, ERROR.NOT_FOUND.AUTH);
    }

    const roles: any = ROLES;

    if (!roles[user.role]) {
        return responseError(res, ERROR.NOT_FOUND.ROLE);
    }

    if (
        !roles[user.role]?.active_actions.includes('*') &&
        !roles[user.role]?.active_actions.includes(String(req.body.action))
    ) {
        return responseError(res, ERROR.AUTH.UNAUTHRIZED_USE);
    }

    return next();
};

const headerControl: RequestHandler = asyncHandler(async (req: Request, res: Response, next) => {
    if (!req.headers.origin || req.headers.origin === undefined) {
        if (req.headers.token === process.env.TOKEN) {
            return await checkAction(req, res, next);
        } else {
            return responseError(res, ERROR.AUTH.UNAUTHRIZED);
        }
    } else {
        return await checkAction(req, res, next);
    }
});

export default headerControl;
