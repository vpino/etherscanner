const _ = require('lodash');
const request = require('request-promise-native');

class EthereumRpc {
  constructor(url) {
    this.url = url;
    this.id = 1;
  }

  async call() {
    let method = arguments[0];
    let params = [...arguments].splice(1);

    let response = await request({
      method: 'POST',
      url: this.url,
      jsonrpc: "2.0",
      json: true,
      body: {
        jsonrpc: "2.0",
        id: this.id++,
        method: method,
        params: params
      }
    });

    if (response.error) {
      console.log('error from hitting it', response.error)
      throw new Error(response.error.message)
    }

    return response.result;
  }
}

const methods = [
  'debug_traceTransaction',
  'eth_getTransactionByHash'
];

for (let method of methods) {
  EthereumRpc.prototype[method] = _.partial(EthereumRpc.prototype.call, method);
}

module.exports = EthereumRpc;
