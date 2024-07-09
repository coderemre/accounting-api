import { User, Accounting } from '../controllers';
import { ERROR } from '../enums';

export const setInsert = async (table: any, datas: any) => {
    const tableFields: any = [];
    const tableValues: any = [];

    if (typeof datas === 'object' && Object.keys(datas).length !== 0) {
        for (const [key, value] of Object.entries(datas)) {
            tableFields.push(key);
            tableValues.push(value);
        }
    }

    if (tableFields?.length) {
        table = await table.insert(tableFields);
    }

    if (tableValues?.length) {
        table = await table.values(tableValues);
    }

    return await table.execute();
};

export const setWhere = (datas: any) => {
    let where = '';

    if (datas.where) {
        where = datas.where + ' AND ';
        delete datas.where;
    }

    if (typeof datas === 'object' && Object.keys(datas).length !== 0) {
        for (const [key, value] of Object.entries(datas)) {
            let _value = typeof value == 'string' ? "'" + value + "'" : value;
            where += key + ' = ' + _value + ' AND ';
        }
    }

    return where;
};

export const getFetchOne = (response: any) => {
    const columns = response.getColumns();
    const row = response.fetchOne();

    const data =
        row?.reduce(
            (response: any, value: any, index: number) => ({
                ...response,
                [columns[index].getColumnLabel()]: value,
            }),
            {}
        ) ?? {};

    return data;
};

export const getFetchAll = (res: any) => {
    const columns = res.getColumns();
    const rows = res.fetchAll();

    const data =
        rows?.map((row: any) =>
            row.reduce(
                (response: any, value: any, index: number) => ({
                    ...response,
                    [columns[index].getColumnLabel()]: value,
                }),
                {}
            )
        ) ?? [];

    return data;
};

export const initService = async (ctx: any) => {
    const { serviceName } = ctx;
    let service: any;

    if (serviceName === 'user') {
        service = new User(ctx);
    } else if (serviceName === 'accounting') {
        service = new Accounting(ctx);
    } else {
        return { error: true, message: ERROR.NOT_FOUND.SERVICE };
    }

    return await service?.init();
};
