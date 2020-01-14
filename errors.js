module.exports = () => {
    return {
        // common
        COMMON_SIGN_ERROR: {
            code: 1001,
            message: '签名错误',
        },
        COMMON_TIME_ERROR: {
            code: 1002,
            message: '请求时间错误',
        },
        // user
        USER_ACCOUNT_NOT_EXISTS: {
            code: 2001,
            message: '用户不存在',
        },
        USER_ACCOUNT_TOO_LONG: {
            code: 2002,
            message: '账户名太长',
        },
        USER_ADDRESS_INVALID: {
            code: 2003,
            message: '地址格式错误',
        },
    };
};