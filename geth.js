const EthereumRpc = require('./ethereum-rpc');
const loggerError = require('debug')('etherscanner:error');
const BigNumber = require('bignumber.js');

class Geth {
  /**
   *
   * @param EthUrl
   */

  constructor(EthUrl) {
    this.eth = new EthereumRpc(EthUrl);
  }

  async scanTransaction(hash, lastBlockNumber) {
    const tx = await this.eth.eth_getTransactionByHash(hash);
    const calls = await this._getTransactionCalls(tx, lastBlockNumber);

    return calls;
  }

  async _getTransactionCalls(tx, lastBlockNumber) {
    const result = await this._getTransactionsFromTrace(tx.hash, tx.blockNumber, lastBlockNumber);
    return this._getTransactionsFromCall(tx, result);
  }

  async _getTransactionsFromTrace(txHash, txBlockNumber, lastBlockNumber) {
    try {
      const result = await this.eth.call('debug_traceTransaction', txHash, {
        tracer: 'callTracer',
        timeout: '30s',
        reexec: lastBlockNumber - txBlockNumber + 20
      });

      return result;
    } catch (err) {
      loggerError('error doing trace', err);
      return [];
    }
  }

  _getTransactionsFromCall(tx, callObject, dex = -1, isInternal = false) {
    let txs = [];
    if (parseInt(callObject.value, 16) > 0) {
      txs.push({
        blockNumber: this._getNumberFromHex(tx.blockNumber),
        blockHash: tx.blockHash,
        to: this._getAddress(callObject.to),
        from: this._getAddress(callObject.from),
        value: new BigNumber(callObject.value).toString(),
        hash: tx.hash,
        type: callObject.type,
        isSuicide: callObject.type == 'SELFDESTRUCT',
        isInternal,
        traceAddress: dex
      });

    }
    else {
      if (callObject.calls != undefined) {
        console.log(tx.hash, 'has sub TXs');
        callObject.calls.forEach(_callObject => {
          if (_callObject.input.length > 139) {
            try {
              var to, from, value, name, decodedData= "";

              txs.push({
                blockNumber: '',
                blockHash: '',
                to: to,
                from: callObject.to,
                value: value,
                hash: tx.hash,
                type: 'Token',
                contract: _callObject.to,
                method: name,
                isSuicide: 'none',
                'isInternal': true,
                traceAddress: Math.abs(dex),
                input: _callObject.input,
                inputDecoded: decodedData
              });

            } catch (error) {
              console.error(error)
            }
          }
          dex++;
        });
      }
      else {
        if (callObject.type == "STATICCALL") {
          return;
        }
        try {
          console.log(tx.hash, 'is single');
          if (callObject == undefined || callObject.length == 0) {
            callObject = tx;
          }

          var to, from, value, name, decodedData = "";

          txs.push({
            blockNumber: this._getNumberFromHex(tx.blockNumber),
            blockHash: tx.blockHash,
            to: to,
            from: callObject.from,
            value: value,
            hash: tx.hash,
            type: 'Token',
            contract: callObject.to,
            method: name,
            isSuicide: 'none',
            'isInternal': true,
            traceAddress: Math.abs(dex),
            input: callObject.input,
            inputDecoded: decodedData
          });
        } catch (error) {
          console.error(error)
        }
      }
    }
    if (!callObject.calls) {
      return txs;
    }
    callObject.calls.forEach(_callObject => {
      dex++;
      txs = txs.concat(this._getTransactionsFromCall(tx, _callObject, dex, true));
    });
    return txs;
  }

  _toHex(value) {
    return '0x' + value.toLowerCase().replace(/^0x/i, '');
  }

  _getAddress(value) {
    if (!value) return value;
    if (value.match(/^0x[a-zA-Z0-9]{40}/)) return value;

    if (typeof (value) == typeof (true)) return value ? '0x01' : '0x00';

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
