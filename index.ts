import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import headerControl from './middleware/headerControl';
import { initData, initService, response } from './utils';

const app: Express = express();
const port = process.env.PORT;

dotenv.config();

app.use(cors({ methods: ['POST'], origin: '*' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(headerControl, async (req: Request, res: Response, next: Function) => {
    let ctx = {
        errorMesage: '',
        path: req.path,
        req: req,
        res: res,
        next: next,
        datas: req.body,
        serviceName: '',
        appName: null,
        user: {},
    };

    let responseData: any = { error: true, message: ctx.errorMesage };

    const database = require('./database/init');

    if (!ctx.errorMesage) ctx = await initData(ctx);

    if (!ctx.errorMesage) ctx = await database.getInstance(ctx);

    if (!ctx.errorMesage) responseData = await initService(ctx);

    await response(ctx, responseData);

    next();
});

app.listen(port, async () => {
    console.log(`⚡️[basic-api]: 𑁍  Server is running at http://localhost:${port}`);
});
