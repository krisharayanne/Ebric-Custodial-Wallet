require("dotenv").config();
Web3 = require('web3');
let WEB3_PROVIDER_URL="https://api.avax-test.network/ext/bc/C/rpc";
web3 = new Web3(WEB3_PROVIDER_URL);

async function transferAvax(fromAddressPrivateKey, toAddress, amount) {
    let pk = fromAddressPrivateKey;
    
    let params = {
        to: toAddress,
        value: web3.utils.toHex(web3.utils.toWei(amount.toString(), 'ether')),
        gas: web3.utils.toHex(21000),
    };
    
    let signedTx = await web3.eth.accounts.signTransaction(params, pk);
    let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return receipt.transactionHash;
}

module.exports = {
    transferAvax
}