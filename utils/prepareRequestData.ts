import { checkJWT } from './helpers';

export const getAppName = (ctx: any) => {
    return ctx?.req?.headers?.appname ?? '';
};

export const getServiceName = (ctx: any) => {
    try {
        return (ctx.path?.split('/') || [])[1] ?? false;
    } catch (error) {
        return false;
    }
};

export const getUser = async (ctx: any) => {
    return (await checkJWT(ctx?.req?.headers?.userauth ?? '')) ?? {};
};

export const initData = async (ctx: any) => {
    const appName = getAppName(ctx);
    const user = await getUser(ctx);
    const serviceName = getServiceName(ctx);

    return {
        ...ctx,
        user,
        appName,
        serviceName,
    };
};
