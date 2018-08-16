# EtherScanner

 Module for parse ethereum transactions or block and get from them all Eth transfers (normal and "internal")

## Warning
To work the module need this correction - https://github.com/ethereum/go-ethereum/pull/15297.
So you must use geth version 1.7.3 or higher


## Installation

```bash
npm install @kev_nz/etherscanner
```

## Usage

```js
const EtherScanner = require('@kev_nz/etherscanner');

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
type - "" || CALL || CREATION || SELFDESTRUCT

##### Get all transfers by block number
```js
etherScanner.scanBlock(1822433, (err, result) => {
	console.log(result);
});
```
