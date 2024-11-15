import { ERROR } from '../enums';

const mysqlx = require('@mysql/xdevapi');

require('dotenv').config();

const config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    port: process.env.MYSQL_PORT,
    connectTimeout: 10000,
};

const connection: any = {};
const client = mysqlx.getClient(config, {
    pooling: {
        enabled: true,
        maxSize: 25,
    },
});

connection.getInstance = async (ctx: any) => {
    try {
        const session = await client.getSession();

        const schema = ctx.appName ? await session.getSchema(ctx.appName) : '';

        ctx = {
            ...ctx,
            session,
            schema,
        };

        return ctx;
    } catch (error) {
        return { ...ctx, error: true, errorMessage: ERROR.DATABASE.CONNECTION };
    }
};

connection.close = async () => {
    try {
        return await client.close();
    } catch (error) {
        return error;
    }
};

module.exports = connection;
