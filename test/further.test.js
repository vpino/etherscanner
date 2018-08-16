const path = require('path');
require('dotenv').config({
  path: path.join(process.cwd(), './.env_test')
});
const util = require('util');
const testLog = require('debug')('etherscanner:tests');
process.on('unhandledRejection', err => {
  if (!(err instanceof Error)) {
    err = new Error(`Promise rejected with value: ${util.inspect(err)}`);
  }

  console.error(err.stack);
  //process.exit(1); // eslint-disable-line unicorn/no-process-exit
});

const assert = require('assert');
const singleHash = '0xe5e087d9a1355ea2017516bb7f8e7489844bac6370c4cbef9cd809d783d19637';
const EtherScanner = require('../index');

// ropsten testnet
let etherScanner;

beforeEach(async () => {
  etherScanner = await EtherScanner(process.env.ETH);
});

describe('Scrap a ScanTransaction with preinstalled txs', async function() {
  this.timeout(30000);

  //0x51044fe6a3ca9c5ad4bc95fcea67351d265ad48156c2aa8ea15f8df3c3272d2b

  it('should find 0 transactions (tx to contract). tx - 0xe5e087d9a1355ea2017516bb7f8e7489844bac6370c4cbef9cd809d783d19637', async () => {
    const result = await etherScanner.scanTransaction(
      singleHash
    );
    testLog('the result', result);
    let txs = [];
    assert.deepEqual(txs, result);
  });

  it('should find 1 transactions (1 normal. tx to account). tx - 0xcb6a7c93ce691e7759724bd2d288e2583a6fefb419f28c39cad418ec26799598', async () => {
    const main =
      '0x5bb351f43428b75263f416714bd5035f292d4e47ef3c80591975d56adc518179';
    const test =
      '0x23fbd224651fa46aec3b69c923b5f472a8dc9f6b5dc4319c112a2daf4aa13043';
    const hash = '0xcb6a7c93ce691e7759724bd2d288e2583a6fefb419f28c39cad418ec26799598';
    const result = await etherScanner.scanTransaction(hash);

    let txs = [
      {
        hash:
          '0xcb6a7c93ce691e7759724bd2d288e2583a6fefb419f28c39cad418ec26799598',
        from: '0x81b7e08f65bdf5648606c89998a9cc8164397647',
        to: '0x6627a3b139e339aa6414601fd4395e45d8863d3e',
        value: 1000000000000000000,
        blockNumber: 2853296,
        blockHash:
          '0x46450babf7ddf892bb382b62d288eddc077f03e880bfad73970b56c2c5fcbdf1',
        isSuicide: false,
        type: 'CALL',
        isInternal: false
      }
    ];
    assert.deepEqual(txs, result);
  });

  it('Tx to contract, tx to account from contract. should find 3 transactions. (1 normal, 2 internal). tx - 0x6b6e76ea621e1e4ed44254f485279526b93d181d681a82869171ed41d3ec57a6', async () => {

    const result = await etherScanner.scanTransaction('0x6b6e76ea621e1e4ed44254f485279526b93d181d681a82869171ed41d3ec57a6');
    let txs = [
      {
        blockNumber: 2853289,
        blockHash:
          '0x97b2b9819b1d9a3aff9d90880576822431441a528925dc008f3d0288980ad73b',
        to: '0xecd258ea6b3f81e56241294e0ab2ad785e73a8b1',
        from: '0xd7b2b98caa2acbdc0c4779e32e2b6c6af1ff09c3',
        value: 477650000000000000,
        hash:
          '0x6b6e76ea621e1e4ed44254f485279526b93d181d681a82869171ed41d3ec57a6',
        type: 'CALL',
        isSuicide: false,
        isInternal: false
      },
      {
        blockNumber: 2853289,
        blockHash:
          '0x97b2b9819b1d9a3aff9d90880576822431441a528925dc008f3d0288980ad73b',
        to: '0x5430c858e6976bd016a42db2cb1a88dcb8de8648',
        from: '0xecd258ea6b3f81e56241294e0ab2ad785e73a8b1',
        value: 458538424873352060,
        hash:
          '0x6b6e76ea621e1e4ed44254f485279526b93d181d681a82869171ed41d3ec57a6',
        type: 'CALL',
        isSuicide: false,
        isInternal: true
      },
      {
        blockNumber: 2853289,
        blockHash:
          '0x97b2b9819b1d9a3aff9d90880576822431441a528925dc008f3d0288980ad73b',
        to: '0xd7b2b98caa2acbdc0c4779e32e2b6c6af1ff09c3',
        from: '0xecd258ea6b3f81e56241294e0ab2ad785e73a8b1',
        value: 5807423591615,
        hash:
          '0x6b6e76ea621e1e4ed44254f485279526b93d181d681a82869171ed41d3ec57a6',
        type: 'CALL',
        isSuicide: false,
        isInternal: true
      }
    ];
        assert.deepEqual(txs, result);
    });
});
