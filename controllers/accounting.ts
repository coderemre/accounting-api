import { getFetchOne, getFetchAll, handleError, isFunction } from '../utils';
import { ERROR, SUCCESS } from '../enums';

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

    async balanceTransfer() {
        const { schema, datas, user } = this.ctx;

        try {
            const userBalancesTable = await schema.getTable('user_balances');

            const userBalances = await userBalancesTable
                .select(['user_id', 'balance'])
                .where(`user_id = "${user.user_id}" OR user_id = "${datas.to_user_id}"`)
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

            if (transactionOwner.balance < datas.transferred_balance) {
                return { error: true, message: ERROR.ACCOUNTING.FUNDS };
            }

            transactionOwner.balance -= datas.transferred_balance;
            transmittedUser.balance += datas.transferred_balance;

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

            return { 0: SUCCESS.PROCESS };
        } catch (error: any) {
            return handleError(error, ERROR.FUNCTION.BALANCE_TRANSFER);
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
