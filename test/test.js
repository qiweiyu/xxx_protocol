const Protocol = require('../main');

const pool = new Protocol('pool', __dirname + '/pub.pem');
const poolSend = pool.signAndAddTime({foo: 1, bar:2});
console.log('pool send: ',  poolSend);

const core = new Protocol('core', __dirname + '/priv.pem');
const coreSend = core.signAndAddTime({foo: 1, bar:2});
console.log('core send: ', coreSend);

console.log('pool verify: ', pool.verify(coreSend));
console.log('core verify: ', core.verify(poolSend));