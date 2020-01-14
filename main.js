const NodeRSA = require('node-rsa');
const fs = require('fs');
const _ = require('lodash');
const md5 = require('md5');
const errors = require('./errors');

class Protocol {
    constructor(role, keyFilePath) {
        // core use private key to sign request data, and pool use pubkey to verify the request
        // pool use md5 to sign request data, and use core's pubkey as salt, and core use the same way to verify
        const keyStr = fs.readFileSync(keyFilePath).toString();
        this.key = new NodeRSA();
        this.key.importKey(keyStr);
        this.role = role;
        if (role === 'pool') {
            this.salt = keyStr;
        } else if (role === 'core') {
            this.salt = this.key.exportKey('pkcs8-public-pem');
        } else {
            throw new Error('Invalid role, should be pool or core, not ' + this.role);
        }
        this.salt = this.salt.trim();
        this.errors = errors();
    }

    signAndAddTime(params = {}) {
        const signParams = _.cloneDeep(params);
        if (!signParams.timestamp) {
            signParams.timestamp = Math.floor(Date.now() / 1000);
        }
        delete signParams['sign'];
        const keys = Object.keys(signParams);
        keys.sort();
        const query = [];
        keys.forEach(key => {
            query.push(`${key}=${signParams[key]}`);
        });
        const signStr = query.join('&');
        let sign = '';
        switch (this.role) {
            case 'pool': {
                sign = md5(signStr + this.salt);
                break;
            }
            case 'core': {
                sign = this.key.sign(Buffer.from(signStr)).toString('hex');
                break;
            }
        }
        signParams.sign = sign;
        return signParams;
    }

    verify(data = {}) {
        const signParams = _.cloneDeep(data);
        const timestamp = signParams.timestamp || 0;
        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(timestamp - now) > 10) {
            throw this.errors.COMMON_TIME_ERROR;
        }
        const sign = signParams.sign;
        delete signParams['sign'];
        const keys = Object.keys(signParams);
        keys.sort();
        const query = [];
        keys.forEach(key => {
            query.push(`${key}=${signParams[key]}`);
        });
        const signStr = query.join('&');
        let res = false;
        switch (this.role) {
            case 'core': {
                res = md5(signStr + this.salt) === sign;
                break;
            }
            case 'pool': {
                res = this.key.verify(Buffer.from(signStr), sign, '', 'hex');
                break;
            }
        }
        if (!res) {
            throw this.errors.COMMON_SIGN_ERROR;
        }
    }
}

module.exports = Protocol;