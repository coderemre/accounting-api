import {
    getFetchOne,
    checkEmail,
    setInsert,
    checkJWT,
    setPassword,
    generateJWT,
    handleError,
    objectKeyDelete,
    isFunction,
} from '../utils';
import { v4 as uuidv4 } from 'uuid';
import { ERROR } from '../enums';

export class User {
    ctx: any;
    constructor(ctx: any) {
        this.ctx = ctx;

        return this;
    }

    async register() {
        const { schema, datas } = this.ctx;

        try {
            const usersTable = await schema.getTable('users');
            const userBalancesTable = await schema.getTable('user_balances');

            objectKeyDelete(datas, 'from');
            objectKeyDelete(datas, 'action');

            datas.user_id = uuidv4();

            const isValidMail: any = await checkEmail(usersTable, datas.email);

            if (isValidMail.error) {
                return isValidMail;
            }

            const password = await setPassword(datas);

            if (password.error) {
                return password;
            }

            await setInsert(usersTable, datas);
            await setInsert(userBalancesTable, {
                user_id: datas.user_id,
                balance: 0,
            });

            datas.password = password;

            return await this.login();
        } catch (error: any) {
            return handleError(error, ERROR.FUNCTION.REGISTER);
        }
    }

    async login() {
        const { schema, datas, req } = this.ctx;

        try {
            const usersTable = await schema.getTable('users');

            if (req?.headers?.userauth) {
                const decodedUser = await checkJWT(req.headers.userauth);

                if (decodedUser) {
                    if (decodedUser.iat) {
                        delete decodedUser.iat;
                    }

                    let user = await usersTable
                        .select(['id', 'user_id', 'role', 'email', 'name', 'lastname'])
                        .where('id =' + decodedUser.id)
                        .execute()
                        .then(async (response: any) => {
                            return await getFetchOne(response);
                        });

                    if (!user.id) {
                        return { error: true, message: ERROR.NOT_FOUND.USER };
                    }

                    if (JSON.stringify(user) === JSON.stringify(decodedUser)) {
                        return user;
                    } else {
                        const userAuth = await generateJWT(user);

                        return { ...user, userAuth };
                    }
                } else {
                    return { error: true, message: ERROR.INVALID.TOKEN };
                }
            }

            objectKeyDelete(datas, 'from');
            objectKeyDelete(datas, 'action');

            if (!datas.email) {
                return { error: true, message: ERROR.NOT_FOUND.EMAIL };
            }

            if (!datas.password) {
                return { error: true, message: ERROR.NOT_FOUND.PASSWORD };
            }

            const isValidMail: any = await checkEmail(usersTable, datas.email, true);

            if (isValidMail.error) {
                return isValidMail;
            }

            const user = await usersTable
                .select(['id', 'user_id', 'role', 'email', 'password', 'name', 'lastname'])
                .where(`email = "${datas.email}"`)
                .execute()
                .then(async (res: any) => {
                    return await getFetchOne(res);
                });

            if (!user.id) {
                return { error: true, message: ERROR.NOT_FOUND.USER };
            }

            const bcrypt = require('bcrypt');

            const result = await bcrypt.compare(datas?.password ?? '', user?.password ?? '');

            if (!result) {
                return { error: true, message: ERROR.WRONG.PASSWORD };
            }

            const responseUser = {
                id: user.id,
                user_id: user.user_id,
                role: user.role,
                email: user.email,
                name: user.name,
                lastname: user.lastname,
            };

            const userAuth = await generateJWT(responseUser);

            return { ...responseUser, userAuth };
        } catch (error: any) {
            console.log(error);
            return handleError(error, ERROR.FUNCTION.LOGIN);
        }
    }

    async init() {
        const { req, datas } = this.ctx;

        let response = { error: true, message: ERROR.INVALID.ACTION };

        try {
            const anyThis: any = this;

            if (req.method === 'POST' && datas.action && isFunction(anyThis[datas.action])) {
                response = await anyThis[datas.action]();
            }

            return response;
        } catch (error) {
            return { error: true, message: ERROR.INVALID.REQUEST };
        }
    }
}
