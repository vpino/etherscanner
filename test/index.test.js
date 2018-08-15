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

const EtherScanner = require('../index');

// ropsten testnet
let etherScanner;

beforeEach(() => {
  etherScanner = EtherScanner(process.env.ETH);
});

describe('ScanTransaction with preinstalled txs', async () => {

  //0x51044fe6a3ca9c5ad4bc95fcea67351d265ad48156c2aa8ea15f8df3c3272d2b
  const test =
    '0x44a4a202171441fabfa3b77eb8f42187a73263fe84e9963ee730e5cf9dad8758';
  it('should find 0 transactions (tx to contract). tx - 0x44a4a202171441fabfa3b77eb8f42187a73263fe84e9963ee730e5cf9dad8758', async () => {
    const result = await etherScanner.scanTransaction(
      test
    );
    testLog('the result', result);
    let txs = [];
    assert.deepEqual(txs, result);
  });

  it('should find 1 transactions (1 normal. tx to account). tx - 0x23fbd224651fa46aec3b69c923b5f472a8dc9f6b5dc4319c112a2daf4aa13043', async () => {

    const test =
      '0x23fbd224651fa46aec3b69c923b5f472a8dc9f6b5dc4319c112a2daf4aa13043';
    const result = await etherScanner.scanTransaction(test);

    let txs = [
      {
        hash:
          '0x23fbd224651fa46aec3b69c923b5f472a8dc9f6b5dc4319c112a2daf4aa13043',
        from: '0x81b7e08f65bdf5648606c89998a9cc8164397647',
        to: '0x65513ecd11fd3a5b1fefdcc6a500b025008405a2',
        value: 1000000000000000000,
        blockNumber: 3061850,
        blockHash:
          '0x5c61f5f4603eadfff4f50e318fbced72ad8d58b2b7c047eca99085a684b4bb27',
        isSuicide: false,
        type: 'CALL',
        isInternal: false
      }
    ];
    assert.deepEqual(txs, result);
  });

  it('Tx to contract, tx to account from contract. should find 3 transactions. (1 normal, 2 internal). tx - 0x89253c4c641988083e19592c7befb1f0ec5811e4de4f19dff92925f5c6bd6dd7', async () => {
    const result = await etherScanner.scanTransaction('0x89253c4c641988083e19592c7befb1f0ec5811e4de4f19dff92925f5c6bd6dd7');
    let txs = [
      {
        blockNumber: 3061839,
        blockHash:
          '0x1ec39150d6d4c54dd85b65478089f2fe75b311a25cd0052ab0324ea61a036524',
        to: '0x36496509ceaff13e16940f2980bb342c4c29f934',
        from: '0xb546499a35c70c2b5707806181c732d6b34b8dc7',
        value: 10000000000000000,
        hash:
          '0x89253c4c641988083e19592c7befb1f0ec5811e4de4f19dff92925f5c6bd6dd7',
        type: 'CALL',
        isSuicide: false,
        isInternal: false
      },
      {
        blockNumber: 3061839,
        blockHash:
          '0x1ec39150d6d4c54dd85b65478089f2fe75b311a25cd0052ab0324ea61a036524',
        to: '0x14f6cea293e9f6e3f6da0d5146779c2ebd5e1b23',
        from: '0x36496509ceaff13e16940f2980bb342c4c29f934',
        value: 1,
        hash:
          '0x89253c4c641988083e19592c7befb1f0ec5811e4de4f19dff92925f5c6bd6dd7',
        type: 'CALL',
        isSuicide: false,
        isInternal: true
      },
      {
        blockNumber: 3061839,
        blockHash:
          '0x1ec39150d6d4c54dd85b65478089f2fe75b311a25cd0052ab0324ea61a036524',
        to: '0x36496509ceaff13e16940f2980bb342c4c29f934',
        from: '0x14f6cea293e9f6e3f6da0d5146779c2ebd5e1b23',
        value: 1,
        hash:
          '0x89253c4c641988083e19592c7befb1f0ec5811e4de4f19dff92925f5c6bd6dd7',
        type: 'CALL',
        isSuicide: false,
        isInternal: true
      }
    ];
    assert.deepEqual(txs, result);

  });
});

describe('ScanBlock with preinstalled blocks', async () => {
  it('should find 13 transactions and 2 internal transactions for block # 3061839', async () => {
    const result = await etherScanner.scanBlock(3061839);

    const internals = result.transactions.filter(tx => tx.isInternal);

    const allInternalTransfers = internals.reduce((txs, tx) => {
      return txs.concat(tx.scan)
    }, []).filter(t => t.isInternal);

    assert.equal(13, result.transactions.length);
    assert.equal(2, allInternalTransfers.length);
  });
});
