import { ERROR } from '../enums';
import { z } from 'zod';

export const handleError = async (error: any, msg: string) => {
    let message = error.info ? error.info.msg : msg;
    return { error: true, message };
};

export const checkEmail = async (usersTable: any, email: string, onlyRegex = false) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!email || !emailRegex.test(email)) {
        return { error: true, message: ERROR.INVALID.EMAIL };
    }

    if (onlyRegex) {
        return true;
    }

    const isEmail = await usersTable
        .select()
        .where(`email = "${email}"`)
        .execute()
        .then(async (response: any) => {
            return (await response.fetchOne()?.length) ?? false;
        });

    if (isEmail) return { error: true, message: ERROR.EXISTS.EMAIL };

    return true;
};

export const generateJWT = async (data: any) => {
    try {
        const jwt = require('jsonwebtoken');

        return await jwt.sign(data, process.env.SALT);
    } catch (error) {
        return false;
    }
};

export const checkJWT = async (token: string) => {
    try {
        const jwt = require('jsonwebtoken');

        return (await jwt.verify(token, process.env.SALT)) ?? null;
    } catch (error) {
        return false;
    }
};

export const setPassword = async (datas: any) => {
    if (!datas.password || !datas.passwordConfirm) {
        return { error: true, message: ERROR.NOT_FOUND.PASSWORD };
    }

    const password = datas.password;
    const passwordConfirm = datas.passwordConfirm;

    delete datas.password;
    delete datas.passwordConfirm;

    if (password !== passwordConfirm) {
        return { error: true, message: ERROR.NOT_MATCH.PASSWORD };
    }

    const bcrypt = require('bcrypt');

    const salt = bcrypt.genSaltSync(11);
    const hash = bcrypt.hashSync(password, salt);

    datas.password = hash;

    return password;
};

export const objectKeyDelete = (object: any, key: string) => {
    if (object[key]) {
        delete object[key];
    }

    return object;
};

export const isFunction = (functionName: Function) => {
    return typeof functionName === 'function' ?? false;
};

export const isFillObject = (array: any) => {
    return Object.entries(array).length ?? false;
};

export const checkParams = (datas: any, params: any) => {
    if (isFillObject(datas)) {
        const parameters = Object.keys(datas).filter((key: string) => {
            return params.includes(key);
        });

        return parameters.length === params.length;
    }
};

export const errorCheckWithZod = (error: any) => {
    if (error instanceof z.ZodError) {
        return { error: true, message: error.errors };
    }
};
