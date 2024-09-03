import { Request, Response, RequestHandler } from 'express';
import dotenv from 'dotenv';
import asyncHandler from '../utils/asyncHandler';
import { Validator } from '../utils/validator';
import { responseError, checkJWT, isFunction, errorCheckWithZod } from '../utils';
import { ERROR, ROLES } from '../enums';

dotenv.config();
const checkAction = async (req: Request, res: Response, next: Function) => {
    try {
        const user = await checkJWT(String(req?.headers?.userauth) ?? '');
        const datas = req?.body ?? {};
        const action = datas?.action ?? '';
        const validator: any = new Validator(datas);

        if (action === 'login' || action === 'register') {
            return next();
        } else if (!user) {
            return responseError(res, ERROR.NOT_FOUND.AUTH);
        }

        const roles: any = ROLES;

        if (!roles[user.role]) {
            return responseError(res, ERROR.NOT_FOUND.ROLE);
        }

        if (isFunction(validator[action])) {
            await validator[action]();
        }

        if (
            !roles[user.role]?.active_actions.includes('*') &&
            !roles[user.role]?.active_actions.includes(String(req.body.action))
        ) {
            return responseError(res, ERROR.AUTH.UNAUTHRIZED_USE);
        }

        return next();
    } catch (error) {
        const zodResponse: any = errorCheckWithZod(error);

        if (zodResponse?.error && zodResponse?.message) {
            return responseError(res, zodResponse?.message);
        }

        return responseError(res, ERROR.INVALID.REQUEST);
    }
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
