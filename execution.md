# EtherScanner

## Geth Scan

### scanBlock - Geth

- rpc call -> eth_getBlockByNumber
- process transactions
- - rpc call -> eth_getTransactionByHash
- - -  _getTransactionCalls  (recursive)
- - - - _getTransactionsFromTrace
- - - - - rpc call -> eth_blockNumber for current block
- - - - - rpc call - debug_traceTransaction
- - rpc call - eth_getTransactionReceipt
- - rpc call - eth_getBalance for To
- - rpc call - eth_getBalance for From
- - if tranasction to is null rpc eth_getCode

## Parity Scan

### scanBlock - Parity

- rpc call -> eth_getBlockByNumber
- process transactions
- - rpc call - eth_getTransactionReceipt
- - rpc call trace_replayTransaction
- - rpc call eth_getTransactionByHash
- - rpc call - eth_getBalance for To
- - rpc call - eth_getBalance for From
- - if tranasction to is null rpc eth_getCode