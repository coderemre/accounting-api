export const responseJson = async (response: any, result: any) => {
    if (result) {
        response.status(201).send({ result: { ...result } ?? {} });
    } else {
        response.status(404).send({ result: { error: true, message: '404 Not Found!' } });
    }
};

export const responseError = async (response: any, result: any) => {
    response.status(404).send({ result: { error: true, message: result } });
};

export const response = async (ctx: any, responseData: any) => {
    const { res, session } = ctx;

    if (!res?.headersSent) {
        if (responseData) {
            if (responseData.error) {
                responseError(res, responseData.message);
            } else {
                responseJson(res, responseData);
            }
        }

        session.close();

        return true;
    }
};
