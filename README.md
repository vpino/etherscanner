# EtherScanner

 Module for parse ethereum transactions or block and get from them all Eth transfers (normal and "internal")

## Installation

If you must.

```bash
npm install @vpino/etherscanner
```

## Usage


```js
const EtherScanner = require('@vpino/etherscanner');

const etherScanner = await EtherScanner(`http://localhost:6082`);

```

##### Get all transfers by transaction hash

```js
const result = await etherScanner.scanTransaction('0xc475f8bf9d2721b17f7c09944c2aa32ea943f452cb54ee0aefcb98ead0735274');
console.log(result);
```

result:
```json
[{
	"hash": "0xc475f8bf9d2721b17f7c09944c2aa32ea943f452cb54ee0aefcb98ead0735274",
	"from": "0x1617d6e2dca84fec5c17f37d4141d2c4ec5c6d05",
	"to": "0xd1a2511bc222f38f463c62c9254faf7b710835e4",
	"value": 10000000000000000,
	"blockNumber": 1818075,
	"blockHash": "0x402a1df2fe61dcc83bec29c1202938e2fd739d97e614dbab351561dc04b01cd3",
	"isInternal": false,
	"type": ""
}, {
	"hash": "0xc475f8bf9d2721b17f7c09944c2aa32ea943f452cb54ee0aefcb98ead0735274",
	"from": "0xd1a2511bc222f38f463c62c9254faf7b710835e4",
	"to": "0x1617d6e2dca84fec5c17f37d4141d2c4ec5c6d05",
	"value": 12468329110548072,
	"blockNumber": 1818075,
	"blockHash": "0x402a1df2fe61dcc83bec29c1202938e2fd739d97e614dbab351561dc04b01cd3",
	"isInternal": true,
	"type": "CALL"
}]

```

in case of internal tx calling SC in BlockChain:

```json
{
    "blockNumber": "",
    "blockHash": "",
    "to": "0xf53d56bf81d4ad997b9e70935270baba8efaefe7",
    "from": "0x3acf9c404fda9a69c559d1e816b9613145e89948",
    "value": 0.1,
    "hash": "0x21fbb3a548637bec8fdb7ebbe5fa2feaa6302e1872aef76a04de71e3ddb85e96",
    "type": "Token",
    "isSuicide": "none",
    "isInternal": true,
    "traceAddress": 1,
    "input": "0x23b872dd0000000000000000000000003acf9c404fda9a69c559d1e816b9613145e89948000000000000000000000000f53d56bf81d4ad997b9e70935270baba8efaefe700000000000000000000000000000000000000000000000000000000000186a0"
},
{
    "blockNumber": "",
    "blockHash": "",
    "to": "0xe0d0c4c35d30baa00a2c93004555db66b8ac7068",
    "from": "0x3acf9c404fda9a69c559d1e816b9613145e89948",
    "value": 1,
    "hash": "0x21fbb3a548637bec8fdb7ebbe5fa2feaa6302e1872aef76a04de71e3ddb85e96",
    "type": "Token",
    "isSuicide": "none",
    "isInternal": true,
    "traceAddress": 2,
    "input": "0x23b872dd0000000000000000000000003acf9c404fda9a69c559d1e816b9613145e89948000000000000000000000000e0d0c4c35d30baa00a2c93004555db66b8ac706800000000000000000000000000000000000000000000000000000000000f4240"
},..

