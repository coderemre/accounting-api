import { getFetchOne, getFetchAll, handleError, isFunction, checkParams } from '../utils';
import { ERROR, SUCCESS } from '../enums';
const mysqlx = require('@mysql/xdevapi');

export class Accounting {
    ctx: any;
    constructor(ctx: any) {
        this.ctx = ctx;

        return this;
    }

    async getBalance() {
        const { schema, user } = this.ctx;

        try {
            const userBalancesTable = await schema.getTable('user_balances');

            const userBalance = await userBalancesTable
                .select(['balance'])
                .where(`user_id = "${user.user_id}"`)
                .execute()
                .then(async (res: any) => {
                    return await getFetchOne(res);
                });

            return { userBalance };
        } catch (error: any) {
            return handleError(error, ERROR.FUNCTION.GET_BALANCE);
        }
    }

    async getAllBalance() {
        const { schema } = this.ctx;

        try {
            const userBalancesTable = await schema.getTable('user_balances');

            const userBalance = await userBalancesTable
                .select(['user_id', 'balance'])
                .execute()
                .then(async (res: any) => {
                    return await getFetchAll(res);
                });

            return { userBalance };
        } catch (error: any) {
            return handleError(error, ERROR.FUNCTION.GET_ALL_BALANCE);
        }
    }

    async balanceTransfer() {
        const { schema, datas, user } = this.ctx;

        try {
            if (!checkParams(datas, ['to_user_id', 'transferred_balance'])) {
                return { 0: ERROR.NOT_FOUND.PARAMETER };
            }

            const { to_user_id, transferred_balance } = datas;

            const userBalancesTable = await schema.getTable('user_balances');
            const transactionsListTable = await schema.getTable('transactions_list');

            const userBalances = await userBalancesTable
                .select(['user_id', 'balance'])
                .where(`user_id = "${user.user_id}" OR user_id = "${to_user_id}"`)
                .execute()
                .then(async (res: any) => {
                    return await getFetchAll(res);
                });

            let transactionOwner: any = {};
            let transmittedUser: any = {};

            userBalances.forEach((userBalance: any) => {
                if (userBalance.user_id === user.user_id) {
                    transactionOwner = userBalance;
                } else {
                    transmittedUser = userBalance;
                }
            });

            if (transactionOwner.balance < transferred_balance) {
                return { error: true, message: ERROR.ACCOUNTING.FUNDS };
            }

            transactionOwner.balance -= transferred_balance;
            transmittedUser.balance += transferred_balance;

            await userBalancesTable
                .update()
                .set('balance', transactionOwner.balance)
                .where(`user_id = '${transactionOwner.user_id}'`)
                .execute();

            await userBalancesTable
                .update()
                .set('balance', transmittedUser.balance)
                .where(`user_id = '${transmittedUser.user_id}'`)
                .execute();

            await transactionsListTable
                .insert(['user_id', 'to_user_id', 'transaction'])
                .values(user.user_id, to_user_id, transferred_balance)
                .execute();

            return { 0: SUCCESS.PROCESS };
        } catch (error: any) {
            return handleError(error, ERROR.FUNCTION.BALANCE_TRANSFER);
        }
    }

    async loadCredit() {
        const { schema, datas } = this.ctx;

        try {
            if (!checkParams(datas, ['balanceValueToUpdate', 'user_id'])) {
                return { 0: ERROR.NOT_FOUND.PARAMETER };
            }

            const { balanceValueToUpdate, user_id } = datas;

            const userBalancesTable = await schema.getTable('user_balances');

            const userBalance = await userBalancesTable
                .select(['balance'])
                .where(`user_id = "${user_id}"`)
                .execute()
                .then(async (res: any) => {
                    return await getFetchOne(res);
                });

            if (userBalance?.balance || userBalance?.balance === 0) {
                await userBalancesTable
                    .update()
                    .where(`user_id = "${user_id}"`)
                    .set('balance', userBalance.balance + balanceValueToUpdate)
                    .execute();
            } else {
                return { 0: ERROR.NOT_FOUND.USER };
            }

            return { 0: SUCCESS.PROCESS };
        } catch (error: any) {
            return handleError(error, ERROR.FUNCTION.LOAD_CREDIT);
        }
    }

    async init() {
        const { req, datas, user } = this.ctx;

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
