const EthereumRpc = require('./ethereum-rpc');
const logger = require('debug')('etherscanner');
const loggerError = require('debug')('etherscanner:error');

const pMap = require('p-map');

class Geth {
  /**
   *
   * @param EthUrl
   */
  constructor(EthUrl) {
    logger('Prepare to connect to geth node', EthUrl);
    this.eth = new EthereumRpc(EthUrl);
    logger('Connected to geth node');
  }

  async scanBlock(number) {
    const block = await this.eth.eth_getBlockByNumber('0x' + number.toString(16), false);
    if (!block) return [];

    const procTx = async txHash => {
      const result = await this.scanTransaction(txHash);
      const tx = await this.eth.eth_getTransactionByHash(txHash);
      tx.blockNumber = number;
      const receipt = await this.eth.eth_getTransactionReceipt(txHash);
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
  async scanBlockForFullData(number) {

    const block = await this.eth.eth_getBlockByNumber('0x' + number.toString(16), false);
    if (!block) return [];

    const procTx = async txHash => {
      const result = await this.scanTransaction(txHash);
      const tx = await this.eth.eth_getTransactionByHash(txHash);
      tx.blockNumber = number;
      const receipt = await this.eth.eth_getTransactionReceipt(txHash);
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

    return results;
  }
  async scanBlockForInternalTransactions(number) {

    const block = await this.eth.eth_getBlockByNumber('0x' + number.toString(16), false);
    if (!block) return [];

    const procTx = async txHash => {
      const result = await this.scanTransaction(txHash);
      const receipt = await this.eth.eth_getTransactionReceipt(txHash);
      const isInternal = result.filter(t => t.isInternal);
      const output = {
        hash: txHash,
        scan: result,
        txreceipt: receipt,
        isInternal: isInternal.length > 0
      };
      return output;
    };
    const results = await pMap(block.transactions, procTx, { concurrency: 5 });
    const internals = results.filter(tx => tx.isInternal);
    const transactions = internals.reduce((txs, tx) => {
      return txs.concat(tx.scan);
    }, []);
    const internalOnly = transactions.filter(t => t.isInternal);
    return internalOnly;
  }
  async scanTransaction(hash) {

    const tx = await this.eth.eth_getTransactionByHash(hash);

    const calls = await this._getTransactionCalls(tx);
    return calls;
  }

  async _getTransactionCalls(tx) {
    const result = await this._getTransactionsFromTrace(tx.hash, tx.blockNumber);
    return this._getTransactionsFromCall(tx, result);
  }

  _getTransactionsFromCall(tx, callObject, isInternal = false) {
    let txs = [];
    if (parseInt(callObject.value, 16) > 0) {
      txs.push({
        blockNumber: this._getNumberFromHex(tx.blockNumber),
        blockHash: tx.blockHash,
        to: this._getAddress(callObject.to),
        from: this._getAddress(callObject.from),
        value: parseInt(callObject.value, 16),
        hash: tx.hash,
        type: callObject.type,
        isSuicide: callObject.type == 'SELFDESTRUCT',
        isInternal
      });
    }
    if (!callObject.calls) {
      return txs;
    }
    callObject.calls.forEach(_callObject => {
      txs = txs.concat(this._getTransactionsFromCall(tx, _callObject, true));
    });
    return txs;
  }

  async _getTransactionsFromTrace(txHash, txBlockNumber) {
    //logger('trace', txHash);

    try {
      const blockNumber = await this.eth.eth_blockNumber();

      const result = await this.eth.call('debug_traceTransaction', txHash, {
        tracer: 'callTracer',
        timeout: '10s',
        reexec: blockNumber - txBlockNumber + 20
      });
      //logger('result', result);
      return result;
    } catch (err) {
      loggerError('error doing trace', err);
      return [];
    }
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

module.exports = Geth;

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
