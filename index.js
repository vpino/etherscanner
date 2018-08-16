const logger = require('debug')('etherscanner');
const loggerError = require('debug')('etherscanner:error');
const EthereumRpc = require('ethereum-rpc-promise');
const Geth = require('./geth');
const Parity = require('./parity');

class EtherScanner {

	/**
	 *
	 * @param EthereumUrl
	 * @param loggerLevel
	 */
	constructor(EthereumUrl) {

		this.requestId = 1;
    this.eth = new EthereumRpc(EthereumUrl);
    logger('Ethereum connected');
    this.EthereumUrl = EthereumUrl;
		//this.node = this.web3.version.node.match(/Parity/) ? new Parity(this.web3) : new Geth(this.web3);
  }
  async setNode() {
    logger('In Set Node');
    const blockNumber = await this.eth.eth_blockNumber();
    logger('Block');
    const result = await this.eth.web3_clientVersion();
    logger('the version', result);
    const isParity = result.match(/Parity/);
    this.node = isParity ? new Parity(this.EthereumUrl) : new Geth(this.EthereumUrl);
    return true;
  }
}

module.exports = async (EthereumUrl) => {
  let scanner = new EtherScanner(EthereumUrl);
  logger('Set Node');

  await scanner.setNode();

	return {
		scanBlock: scanner.node.scanBlock.bind(scanner.node),
		scanTransaction: scanner.node.scanTransaction.bind(scanner.node),
	}
};

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
