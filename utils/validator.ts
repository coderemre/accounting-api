import { ZOD } from '../enums';
import { z } from 'zod';

export class Validator {
    datas: any;
    constructor(datas: any) {
        this.datas = datas;

        return this;
    }

    async datasControlWithZod(params: any) {
        z.object(params).parse(this.datas);
    }

    async loadCredit() {
        await this.datasControlWithZod({
            user_id: z.string().min(1),
            balanceValueToUpdate: z.number().positive(ZOD.DATAS.balanceValueToUpdate),
        });
    }

    async getBalance() {
        await this.datasControlWithZod({
            target_date: z
                .string()
                .regex(
                    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
                    ZOD.DATAS.dateFormat
                ),
        });
    }

    async balanceTransfer() {
        await this.datasControlWithZod({
            to_user_id: z.string(),
            process: z.number().min(1),
            transferred_balance: z.number().min(1),
        });
    }

    async register() {
        await this.datasControlWithZod({
            email: z.string().email(),
        });
    }
}
