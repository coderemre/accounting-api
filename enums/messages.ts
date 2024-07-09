const SUCCESS = {
    PROCESS: 'Process Successful!',
};

const ERROR = {
    NOT_FOUND: {
        USER: 'User not found!',
        EMAIL: 'Email not found!',
        PASSWORD: 'Password not found!',
        SERVICE: 'Service not found!',
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
    },
    WRONG: {
        PASSWORD: 'Wrong Password!',
    },
    FUNCTION: {
        REGISTER: 'register Function Error!',
        LOGIN: 'login Function Error!',
        GET_BALANCE: 'getBalance Function Error!',
        BALANCE_TRANSFER: 'balanceTransfer Function Error!',
    },
    ACCOUNTING: {
        FUNDS: 'Insufficient funds!',
    },
    DATABASE: {
        CONNECTION: 'DataBase Connection Error!',
    },
};

export { SUCCESS, ERROR };