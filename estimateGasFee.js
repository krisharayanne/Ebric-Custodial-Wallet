Web3 = require('web3');
let WEB3_PROVIDER_URL="https://api.avax-test.network/ext/bc/C/rpc";
web3 = new Web3(WEB3_PROVIDER_URL);

let abiERC1155File = require('./ERC1155_Property_NFT_ABI.json');
let contractAddress = "0x50691F55a9C7c1b7d5F663c5f482dB887E0D2865";

async function estimateGasFee(sellerWalletAddress, buyerWalletAddress, sellerPrivateKey, tokenId, tokenQuantity) {
    let networkId = await web3.eth.net.getId();
    let nonce = await web3.eth.getTransactionCount(sellerWalletAddress, 'pending');
    let gasPrice = await web3.eth.getGasPrice();
    let gasLimit = 6000000;
    
    let nftContract = new web3.eth.Contract(abiERC1155File, contractAddress);
    let balanceOf = await nftContract.methods.balanceOf(sellerWalletAddress, tokenId).call();
    
    if (parseInt(balanceOf) < tokenQuantity) {
        // console.log(`Seller's wallet doesn't own enough balance of the requested NFT with token id ${tokenId} to transfer...`);
    }
    else {
        // console.log(`Seller wallet's current balance of token id ${tokenId} is ${JSON.stringify(balanceOf)}`);
    }
    
    const tx = nftContract.methods.safeTransferFrom(sellerWalletAddress, buyerWalletAddress, tokenId, tokenQuantity, 0x0);
    const gas = await tx.estimateGas({from: sellerWalletAddress});
    const data = tx.encodeABI();
    
    let rawTx = {
        nonce: nonce,
        gas: gas,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        to: contractAddress, 
        from: sellerWalletAddress,
        data: data,
        chainId: networkId
    };
    
    let gasFeeInWei = gas*gasPrice;
    let gasFeeInAvax = await web3.utils.fromWei(gasFeeInWei.toString(), "ether");
    // console.log("Gas fee: " + gasFeeInAvax + " AVAX");
   return gasFeeInAvax;

    }

    module.exports = {
        estimateGasFee
    }
    