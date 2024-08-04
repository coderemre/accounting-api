const ROLES = {
    admin: {
        active_actions: ['*'],
    },
    manager: {
        active_actions: ['login,', 'register', 'loadCredit', 'getAllBalance', 'getBalance', 'balanceTransfer'],
    },
    customer: {
        active_actions: ['login,', 'register', 'getBalance', 'balanceTransfer'],
    },
};

export { ROLES };
