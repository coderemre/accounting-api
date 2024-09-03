import { getFetchOne, getFetchAll, handleError, isFunction } from '../utils';
import { ERROR, SUCCESS, PROCESS } from '../enums';
import { int64 } from '@mysql/xdevapi/types/lib/Protocol/ScalarValues';

export class Accounting {
    ctx: any;
    userBalancesTable: any;
    transactionsListTable: any;
    userProcessTable: any;
    constructor(ctx: any) {
        this.ctx = ctx;
        this.userBalancesTable = null;
        this.transactionsListTable = null;
        this.userProcessTable = null;

        return this;
    }

    async getBalance() {
        const { schema, user, datas } = this.ctx;

        try {
            this.userBalancesTable = await schema.getTable('user_balances');

            const { target_date } = datas;

            if (target_date) {
                this.userProcessTable = await schema.getTable('user_process');
                const userBalance = await this.userProcessTable
                    .select(['balance'])
                    .where(`user_id = "${user.user_id}" AND create_date <= "${target_date}"`)
                    .orderBy('create_date DESC')
                    .limit(1)
                    .execute()
                    .then(async (res: any) => {
                        return await getFetchOne(res);
                    });
                
                    return { userBalance };
            }

            const userBalance = await this.userBalancesTable
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

    async userBalanceUpdate(user_id: string, updateBalence: int64) {
        await this.userBalancesTable.update().set('balance', updateBalence).where(`user_id = '${user_id}'`).execute();
    }

    async transactionsListInsert(user_id: string, to_user_id: string, transferred_balance: int64) {
        await this.transactionsListTable
            .insert(['user_id', 'to_user_id', 'transaction'])
            .values(user_id, to_user_id, transferred_balance)
            .execute();
    }

    async userProcessInsert(user_id: string, process: int64, change: int64, balance: int64) {
        await this.userProcessTable
            .insert(['user_id', 'process', 'change', 'balance'])
            .values(user_id, process, change, balance)
            .execute();
    }

    async balanceTransfer() {
        const { schema, datas, user } = this.ctx;

        try {
            const { to_user_id, transferred_balance, process } = datas;

            this.userBalancesTable = await schema.getTable('user_balances');
            this.transactionsListTable = await schema.getTable('transactions_list');
            this.userProcessTable = await schema.getTable('user_process');

            const processOwnerUser = await this.userBalancesTable
                .select(['user_id', 'balance'])
                .where(`user_id = "${user.user_id}"`)
                .execute()
                .then(async (res: any) => {
                    return await getFetchOne(res);
                });

            if (processOwnerUser.balance < transferred_balance) {
                return { error: true, message: ERROR.ACCOUNTING.FUNDS };
            }

            if (process === PROCESS.TRANSFER) {
                const transmittedUser = await this.userBalancesTable
                    .select(['user_id', 'balance'])
                    .where(`user_id = "${to_user_id}"`)
                    .execute()
                    .then(async (res: any) => {
                        return await getFetchOne(res);
                    });

                processOwnerUser.balance -= transferred_balance;
                transmittedUser.balance += transferred_balance;

                await this.userBalanceUpdate(processOwnerUser.user_id, processOwnerUser.balance);
                await this.userBalanceUpdate(transmittedUser.user_id, transmittedUser.balance);
                await this.transactionsListInsert(user.user_id, to_user_id, transferred_balance);
                await this.userProcessInsert(
                    processOwnerUser.user_id,
                    process,
                    -transferred_balance,
                    processOwnerUser.balance
                );
                await this.userProcessInsert(
                    transmittedUser.user_id,
                    process,
                    transferred_balance,
                    transmittedUser.balance
                );
            } else if (process === PROCESS.PULL) {
                processOwnerUser.balance -= transferred_balance;

                await this.transactionsListInsert(user.user_id, user.user_id, transferred_balance);
                await this.userBalanceUpdate(processOwnerUser.user_id, processOwnerUser.balance);
                await this.userProcessInsert(
                    processOwnerUser.user_id,
                    process,
                    -transferred_balance,
                    processOwnerUser.balance
                );
            } else if (process === PROCESS.PUT) {
                processOwnerUser.balance += transferred_balance;

                await this.transactionsListInsert(user.user_id, user.user_id, transferred_balance);
                await this.userBalanceUpdate(processOwnerUser.user_id, processOwnerUser.balance);
                await this.userProcessInsert(
                    processOwnerUser.user_id,
                    process,
                    transferred_balance,
                    processOwnerUser.balance
                );
            }

            return { 0: SUCCESS.PROCESS };
        } catch (error: any) {
            return handleError(error, ERROR.FUNCTION.BALANCE_TRANSFER);
        }
    }

    async loadCredit() {
        const { schema, datas } = this.ctx;

        try {
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
        const { req, datas } = this.ctx;

        let response = { error: true, message: ERROR.INVALID.ACTION };

        try {
            const anyThis: any = this;
        
            if (req.method === 'POST' && isFunction(anyThis[datas.action])) {
                response = await anyThis[datas.action]();
            }

            return response;
        } catch (error) {
            return { error: true, message: ERROR.INVALID.REQUEST };
        }
    }
}
