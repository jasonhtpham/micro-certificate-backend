'use strict';

const {Gateway, Wallets} = require('fabric-network');
const path = require('path');
const fs = require('fs');

const { KJUR, KEYUTIL } = require('jsrsasign');
const CryptoJS = require('crypto-js');

const registerUser = require('./registerUser');
const enrollAdmin = require('./enrollAdmin');

const myChannel = 'mychannel';
const myChaincodeName = 'cert';

let wallet;
let contract;

const prettyJSONString = (inputString) => {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}

export default class HyperledgerService {
    constructor() {
        this.InitLedger();
    }

    InitLedger = async () => {
        try {
            if (!wallet) {
                // load the network configuration
                const ccpPath = path.resolve(__dirname, '..', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json'); //Need change!!!!!!
                const fileExists = fs.existsSync(ccpPath);
                if (!fileExists) {
                    throw new Error(`no such file or directory: ${ccpPath}`);
                }
                const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(__dirname, '..', 'wallet');
                wallet = await Wallets.newFileSystemWallet(walletPath);
                fabricLogger.info(`Wallet path: ${walletPath}`);
        
        
                // 1. register & enroll admin user with CA, stores admin identity in local wallet
                await enrollAdmin.EnrollAdminUser();
        
                // 2. register & enroll application user with CA, which is used as client identify to make chaincode calls, stores app user identity in local wallet
                await registerUser.RegisterAppUser();
        
                // Check to see if app user exist in wallet.
                const identity = await wallet.get(registerUser.ApplicationUserId);

                if (!identity) {
                    fabricLogger.info(`An identity for the user does not exist in the wallet: ${registerUser.ApplicationUserId}`);
                    return;
                }
        
                //3. Prepare to call chaincode using fabric javascript node sdk
                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, {
                    wallet,
                    identity: registerUser.ApplicationUserId,
                    discovery: {enabled: true, asLocalhost: true}
                });
                try {
                    // Get the network (channel) our contract is deployed to.
                    const network = await gateway.getNetwork(myChannel);
        
                    // Get the contract from the network.
                    contract = network.getContract(myChaincodeName);

                    // Initialize the chaincode by calling its InitLedger function
                    // fabricLogger.info('Submit Transaction: InitLedger to create the very first cert');
                    // await contract.submitTransaction('InitLedger');
                } catch (err) {
                    fabricLogger.info(err);
                }
            }

            if (wallet && contract) {
                fabricLogger.info('Chaincode is ready to be invoked');
            } else {
                throw new Error("Cannot connect with Fabric")
            }
        } catch (err) {
            fabricLogger.info(err);
            return err;
        }
    }

    GetAllCerts = async () => {

        try {
            let result = await contract.evaluateTransaction('GetAllCerts');
            // return prettyJSONString(result.toString());
            return JSON.parse(result);
        } catch (err) {
            fabricLogger.info(`Error when get all certificates: ${err}`);
            return err;
        }
    }

    // CreateCert = async (id, unitCode, mark, name, studentID, credit, period) => {
    //     fabricLogger.info('Submit Transaction: CreateCert() Create a new certificate');
    //     try {
    //         const identity = await wallet.get(registerUser.ApplicationUserId);

    //         const provider = identity.mspId;
    //         // fabricLogger.info(`Provider ${provider.mspId}`);


    //         // Return the successful payload if the transaction is committed without errors
    //         const result = await contract.submitTransaction('CreateCert', id, unitCode, mark, name, studentID, credit, period, provider);
    //         // return prettyJSONString(result.toString());
    //         return JSON.parse(result);

    //     } catch (err) {
    //         fabricLogger.info(`Error when create certificate: ${err}`);
    //         return err;
    //     }
    // }

    CreateCert = async (docToHash) => {
        fabricLogger.info('Submit Transaction: CreateCert() Create a new certificate');
        try {
            // calculate Hash from the specified file
            // const fileLoaded = fs.readFileSync(filename, 'utf8');
            const hashedDoc = CryptoJS.SHA256(docToHash).toString();
            // console.log("Hash of the file: " + hashedDoc);

            // get signature to sign
            const identity = await wallet.get(registerUser.ApplicationUserId);
            const userPk = identity.credentials.privateKey;

            // console.log({userPk})

            // sign file
            const sig = new KJUR.crypto.Signature({"alg": "SHA256withECDSA"});
            sig.init(userPk, "");
            sig.updateHex(hashedDoc);
            const sigValueHex = sig.sign();
            const sigValueBase64 = Buffer.from(sigValueHex, 'hex').toString('base64');
            // console.log("Signature: " + sigValueBase64);

            const timestamp = Date.now();

            // Return the successful payload if the transaction is committed without errors
            const result = await contract.submitTransaction('CreateCert', hashedDoc, sigValueBase64, timestamp);
            
            return JSON.parse(result);

        } catch (err) {
            fabricLogger.info(`Error when create certificate: ${err}`);
            return err;
        }
    }

    VerifyCert = async (docToVerify) => {
        // get user certificate to verify doc
        const user = registerUser.ApplicationUserId;
        const identity = await wallet.get(user);
        const userCert = identity.credentials.certificate;

        const hashedDoc = CryptoJS.SHA256(docToVerify).toString();

        const result = await contract.evaluateTransaction('ReadCert', hashedDoc);
        console.log("Transaction has been evaluated");
        const resultJSON = JSON.parse(result);
        console.log("Doc record found, created by " + resultJSON.timestamp);

        const userPublicKey = KEYUTIL.getKey(userCert);
        const recover = new KJUR.crypto.Signature({"alg": "SHA256withECDSA"});
        recover.init(userPublicKey);
        recover.updateHex(hashedDoc);
        const getBackSigValueHex = Buffer.from(resultJSON.signature, 'base64').toString('hex');
        // console.log("Signature verified with certificate provided: " + recover.verify(getBackSigValueHex));
        return recover.verify(getBackSigValueHex);

    }

    GetCertsByOwner = async (name, studentID) => {
        // Query certs by name and studentID
        fabricLogger.info('Evaluate Transaction: QueryCertsByOwner()');
        try {
            const result = await contract.evaluateTransaction('QueryCertsByOwner', name, studentID);
            return JSON.parse(result);
        } catch (err) {
            fabricLogger.info(`Error when get certificates by name and studentID: ${err}`);
        }
    }

    GetCertHistory = async (certId) => {
        fabricLogger.info('Evaluate Transaction: GetCertHistory()');
        try {
            const result = await contract.evaluateTransaction('GetCertHistory', certId);
            return JSON.parse(result);
        } catch (err) {
            fabricLogger.info(`Error when get certificate's history': ${err}`);
        }
    }

    RevokeCert = async (certId) => {
        fabricLogger.info('Submit Transaction: RevokeCert() Revoke certificate');
        try {
            // Return the successful payload if the transaction is committed without errors
            const result = await contract.submitTransaction('RevokeCert', certId);
            return prettyJSONString(result.toString());
        } catch (err) {
            fabricLogger.info(`Error when create certificate: ${err}`);

            // Return errors if any
            return err;
        }
    }
}
