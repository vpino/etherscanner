const logger = require('debug')('etherscanner');
const EthereumRpc = require('./ethereum-rpc');
const Geth = require('./geth');

class EtherScanner {

	/**
	 *
	 * @param EthereumUrl
	 * @param loggerLevel
	 */
	constructor(EthereumUrl) {
    this.eth = new EthereumRpc(EthereumUrl);
    logger('Ethereum connected');
    this.EthereumUrl = EthereumUrl;
  }
  async setNode() {
    this.node = new Geth(this.EthereumUrl);
    return true;
  }
}

module.exports = async (EthereumUrl) => {
  let scanner = new EtherScanner(EthereumUrl);
  logger('Set Node');
  await scanner.setNode();

	return {
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
