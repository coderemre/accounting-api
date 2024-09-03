const SUCCESS = {
    PROCESS: 'Process Successful!',
};

const ZOD = {
    DATAS: {
        balanceValueToUpdate: 'The balance to be loaded must be positive!',
        dateFormat: "Date format is 'YYYY-MM-DD HH:MM:SS'",
    },
};

const ERROR = {
    NOT_FOUND: {
        USER: 'User not found!',
        EMAIL: 'Email not found!',
        PASSWORD: 'Password not found!',
        SERVICE: 'Service not found!',
        PARAMETER: 'Parameter not found!',
        ROLE: 'Role not found!',
        AUTH: 'User Auth not found!',
    },
    INVALID: {
        REQUEST: 'Invalid Request!',
        ACTION: 'Invalid Action!',
        TOKEN: 'Invalid Token!',
        EMAIL: 'Invalid Email!',
    },
    EXISTS: {
        EMAIL: 'Email already exists',
    },
    NOT_MATCH: {
        PASSWORD: 'Passwords not match!',
    },
    AUTH: {
        UNAUTHRIZED: 'Unauthorized!',
        UNAUTHRIZED_USE: 'Unauthorized Use!',
    },
    WRONG: {
        PASSWORD: 'Wrong Password!',
    },
    FUNCTION: {
        REGISTER: 'register Function Error!',
        LOGIN: 'login Function Error!',
        GET_BALANCE: 'getBalance Function Error!',
        GET_ALL_BALANCE: 'getAllBalance Function Error!',
        BALANCE_TRANSFER: 'balanceTransfer Function Error!',
        LOAD_CREDIT: 'loadCredit Function Error!',
    },
    ACCOUNTING: {
        FUNDS: 'Insufficient funds!',
    },
    DATABASE: {
        CONNECTION: 'DataBase Connection Error!',
    },
};

export { SUCCESS, ERROR, ZOD };
