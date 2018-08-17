const EthereumRpc = require('./ethereum-rpc');
const logger = require('debug')('etherscanner');
const loggerError = require('debug')('etherscanner:error');

const pMap = require('p-map');
const BigNumber = require('bignumber.js');

class Parity {

	constructor(EthUrl) {
		this.requestId = 1;
    logger('Prepare to connect to parity', EthUrl);
    this.eth = new EthereumRpc(EthUrl);
    logger('Connected');
	}

  async scanBlock(number) {
    const block = await this.eth.eth_getBlockByNumber('0x' + number.toString(16), false);
    if (!block) return [];
      let result = [];

      const procTx = async txHash => {
        const result = await this.scanTransaction(txHash);
        const tx = await this.eth.eth_getTransactionByHash(txHash);
        tx.blockNumber = number;
        const receipt = await this.eth.eth_getTransactionReceipt(txHash);
        logger('process result', result);
        const isInternal = result.filter(t => t.isInternal);
        const output = {
          hash: txHash,
          transaction: tx,
          scan: result,
          receipt: receipt,
          isInternal: isInternal.length > 0
        };

        return output;
      };
      const results = await pMap(block.transactions, procTx, { concurrency: 5 });
      block.number = number;
      return { block, transactions: results };
	}

	async scanTransaction(hash) {
    const receipt = await this.eth.eth_getTransactionReceipt(hash);
    const trace = await this._replayTransaction(hash);
    // logger('trace', trace);
    const has = trace.trace.some((row) => row.error);
    const txs = [];

    trace.trace.forEach((callObject) => {
      if (parseInt(callObject.action.value, 16) > 0) {
        logger('call', callObject);
        txs.push({
          blockNumber: this._getNumberFromHex(receipt.blockNumber),
          blockHash: receipt.blockHash,
          to: this._getAddress(callObject.action.to),
          from: this._getAddress(callObject.action.from),
          value: new BigNumber(callObject.action.value).toString(),
          hash: hash,
          type: callObject.type,
          isSuicide: callObject.type == 'SELFDESTRUCT',
          isInternal: (callObject.traceAddress.length > 0)
        });
      }
    });
    return txs;
	}

	async _replayTransaction(hash) {
    this.requestId++;
    const result = await this.eth.call('trace_replayTransaction', hash, ["trace"]);
    return result;
  }

  _toHex(value) {
    return '0x'+ value.toLowerCase().replace(/^0x/i,'');
  }

  _getAddress(value) {
    if (!value) return value;
    if (value.match(/^0x[a-zA-Z0-9]{40}/)) return value;

    if (typeof(value) == typeof(true)) return value ? '0x01' : '0x00';

    let address = this._toHex(value);
    while (address.length < 42) address = address.replace(/^0x/, '0x0');
    return address;
  }

  _getNumberFromHex(value) {
    if (!value) return value;
    if (value.match(/^0x[a-zA-Z0-9]{40}/)) return value;

    let num = value.replace(/^0x/, '0x0');
    return parseInt(num, 16);
  }
}

module.exports = Parity;

/**
 * @typedef {object} etherscannerObj
 * @property {String} hash
 * @property {String} from
 * @property {String} to
 * @property {Number} value
 * @property {Number} blockNumber
 * @property {String} blockHash
 * @property {Boolean} isInternal
 * @property {String} type
 */
