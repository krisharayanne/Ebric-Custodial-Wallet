require("dotenv").config();
const CircularJSON = require('circular-json')
const fs = require('fs')
const envfile = require('envfile')
const sourcePath = '.env'
const encryptionService = require("./encryptPrivateKey.js")
const decryptionService = require("./decryptPrivateKey.js")
const walletService = require("./generateWallet.js")
const balanceService = require("./getAvaxBalance.js")
const tokenService = require("./transferToken.js")
const gasService = require("./estimateGasFee.js")
const avaxService = require("./transferAvax.js")

// Main function (Script entry point)
async function main() {

    // Generate wallet and encrypt private key function
    let {walletAddress, walletEncryptedPrivateKey} = await generateWalletAndEncryptPrivateKey();
    walletEncryptedPrivateKey = walletEncryptedPrivateKey.toString('base64');
    console.log("\n Wallet Address (Main): " + walletAddress);
    console.log("\n Wallet Encrypted Private Key (Main): " + walletEncryptedPrivateKey);

    // Need to encrypt company wallet's private key using new private key.pem file everytime new rsa key pair is generated
//     let WALLET_PRIVATE_KEY = "0x9b70e0555e0925c45bf393f0181c4103083eb8d7980b018916e5e8006477b1a4";
// // console.log("\n Private Key: " + WALLET_PRIVATE_KEY);

// // encrypt Ebric user's private key using cryptographic public key
// let encryptedPrivateKeytest = encryptionService.encryptPrivateKey(WALLET_PRIVATE_KEY) 
// // encryptedText will be returned as Buffer
// // in order to see it in more readble form, convert it to base64
// // console.log('\n Encrypted Private Key: ', encryptedPrivateKey.toString('base64'))
// let parsedFile = envfile.parse(sourcePath);
//     parsedFile.COMPANY_WALLET_ADDRESS = "0xa361bB4047a21De67D1E60E015b5B0Ccf2B6a5dc";
//     parsedFile.TOKEN_ID = "25";
//     parsedFile.TOKEN_QUANTITY = "3";
//     parsedFile.COMPANY_ENCRYPTED_PRIVATE_KEY = encryptedPrivateKeytest.toString('base64');

//     fs.writeFileSync('./.env', envfile.stringify(parsedFile))

    // Decrypt private key function
    let encryptedPrivateKey = Buffer.from(walletEncryptedPrivateKey, 'base64');
    let decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey);
    decryptedPrivateKey = decryptedPrivateKey.toString();
    console.log('\n Decrypted Private Key (Main): ', decryptedPrivateKey)

    // Get AVAX Balance function
    let userWalletAddress = process.env.COMPANY_WALLET_ADDRESS;
    let userAvaxBalance = await getAvaxBalance(userWalletAddress);
    console.log("\n User's AVAX Balance (Main): " + userAvaxBalance + " AVAX");

    // Transfer EbricNFT Token Function
    let sellerWalletAddress = process.env.COMPANY_WALLET_ADDRESS;
    let buyerWalletAddress = walletAddress;
    let sellerEncryptedPrivateKey = process.env.COMPANY_ENCRYPTED_PRIVATE_KEY;
    let tokenId = parseInt(process.env.TOKEN_ID);
    let tokenQuantity = parseInt(process.env.TOKEN_QUANTITY);
    let {transactionHash, returnedTokenId} = await transferToken(sellerWalletAddress, buyerWalletAddress, sellerEncryptedPrivateKey, tokenId, tokenQuantity);
    console.log("\n Transaction Hash: " + transactionHash);
    console.log("\n Token ID: " + returnedTokenId);

    // Estimate Gas Fee Function
    let gasFeeInAvax = await estimateGasFee(sellerWalletAddress, buyerWalletAddress, sellerEncryptedPrivateKey, tokenId, tokenQuantity);
    console.log("\n Gas Fee: " + gasFeeInAvax + " AVAX");

    // Transfer AVAX Function 
    let receiverWalletAddress = walletAddress;
    let avaxQuantity = 0.0001;
    let avaxTransactionHash = await transferAvax(receiverWalletAddress, avaxQuantity);
    console.log(" \n AVAX Transaction Hash: " + avaxTransactionHash);

}

async function transferAvax(receiverWalletAddress, avaxQuantity) {
    // decrypt Ebric user's (seller) encrypted private key using cryptographic private key
    let decryptedPrivateKey = decryptionService.decryptPrivateKey(Buffer.from(process.env.COMPANY_ENCRYPTED_PRIVATE_KEY, 'base64'))
    let transactionHash = avaxService.transferAvax(decryptedPrivateKey.toString(), receiverWalletAddress, avaxQuantity);
    return transactionHash;
}

async function estimateGasFee(sellerWalletAddress, buyerWalletAddress, sellerEncryptedPrivateKey, specifiedTokenId, tokenQuantity) {
    // decrypt Ebric user's (seller) encrypted private key using cryptographic private key
    let decryptedPrivateKey = decryptionService.decryptPrivateKey(Buffer.from(sellerEncryptedPrivateKey, 'base64'))
    let gasFeeInAvax = await gasService.estimateGasFee(sellerWalletAddress, buyerWalletAddress, decryptedPrivateKey.toString(), specifiedTokenId, tokenQuantity)
    return gasFeeInAvax;
}

async function transferToken(sellerWalletAddress, buyerWalletAddress, sellerEncryptedPrivateKey, specifiedTokenId, tokenQuantity) {
    // decrypt Ebric user's (seller) encrypted private key using cryptographic private key
    let decryptedPrivateKey = decryptionService.decryptPrivateKey(Buffer.from(sellerEncryptedPrivateKey, 'base64'))
    let {transactionHash, tokenId} = await tokenService.transferToken(sellerWalletAddress, buyerWalletAddress, decryptedPrivateKey.toString(), specifiedTokenId, tokenQuantity)
    return {
        "transactionHash": transactionHash,
        "returnedTokenId": tokenId
    }
}

async function getAvaxBalance(walletAddress) {
    let userAvaxBalance = balanceService.getAvaxBalance(walletAddress);
    return userAvaxBalance;
}

async function decryptPrivateKey(encryptedPrivateKey){
    // decrypt Ebric user's encrypted private key using cryptographic private key
    let decryptedPrivateKey = decryptionService.decryptPrivateKey(encryptedPrivateKey)
    return decryptedPrivateKey;
}

async function generateWalletAndEncryptPrivateKey(){
    let cryptoWalletAddress, cryptoWalletEncryptedPrivateKey;
    let walletObject = await walletService.generateWallet();

    let walletString = CircularJSON.stringify(walletObject);
    // console.log("\n Wallet: " + walletString)
    let wallet = JSON.parse(walletString);
    // console.log("\n Wallet Address: " + wallet[0].address)
    // console.log("\n Wallet Private Key: " + wallet[0].privateKey)
    cryptoWalletAddress = wallet[0].address; 
   
    // // save wallet address and private key in .env file
    // console.log(envfile.parse(sourcePath))
    // let parsedFile = envfile.parse(sourcePath);
    // parsedFile.WALLET_ADDRESS = wallet[0].address
    // parsedFile.WALLET_PRIVATE_KEY = wallet[0].privateKey

    // fs.writeFileSync('./.env', envfile.stringify(parsedFile))
    // console.log(envfile.stringify(parsedFile))

// let WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
// obtain Ebric user's private key via .env 
let WALLET_PRIVATE_KEY = wallet[0].privateKey
// console.log("\n Private Key: " + WALLET_PRIVATE_KEY);

// encrypt Ebric user's private key using cryptographic public key
let encryptedPrivateKey = encryptionService.encryptPrivateKey(WALLET_PRIVATE_KEY) 
// encryptedText will be returned as Buffer
// in order to see it in more readble form, convert it to base64
// console.log('\n Encrypted Private Key: ', encryptedPrivateKey.toString('base64'))
cryptoWalletEncryptedPrivateKey = encryptedPrivateKey;
        
return {
    "walletAddress": cryptoWalletAddress, 
    "walletEncryptedPrivateKey": cryptoWalletEncryptedPrivateKey
}

}




main()
.then(() => {
    // process.exit(0);
})
.catch((error) => {
    console.error(error);
    process.exit(1);
})
