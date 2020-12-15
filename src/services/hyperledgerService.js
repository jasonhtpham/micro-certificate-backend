'use strict';

const {Gateway, Wallets} = require('fabric-network');
const path = require('path');
const fs = require('fs');
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
        }
    }

    GetAllCerts = async () => {

        try {
            let result = await contract.evaluateTransaction('GetAllCerts');
            return prettyJSONString(result.toString());
        } catch (err) {
            fabricLogger.info(`Error when get all certificates: ${err}`);
        }
    }

    CreateCert = async (id, unitCode, mark, name, studentID, credit, period) => {
        fabricLogger.info('Submit Transaction: CreateCert() Create a new certificate');
        try {
            const identity = await wallet.get(registerUser.ApplicationUserId);

            const provider = identity.mspId;
            // fabricLogger.info(`Provider ${provider.mspId}`);


            // Return the successful payload if the transaction is committed without errors
            const result = await contract.submitTransaction('CreateCert', id, unitCode, mark, name, studentID, credit, period, provider);
            return prettyJSONString(result.toString());
        } catch (err) {
            fabricLogger.info(`Error when create certificate: ${err}`);
        }
    }

    GetCertsByOwner = async (name, studentID) => {
        // Query certs by name and studentID
        fabricLogger.info('Evaluate Transaction: QueryCertsByOwner()');
        try {
            const result = await contract.evaluateTransaction('QueryCertsByOwner', name, studentID);
            return prettyJSONString(result.toString());
        } catch (err) {
            fabricLogger.info(`Error when get certificates by name and studentID: ${err}`);
        }
    }

    GetCertHistory = async (certId) => {
        fabricLogger.info('Evaluate Transaction: GetCertHistory()');
        try {
            const result = await contract.evaluateTransaction('GetCertHistory', certId);
            return prettyJSONString(result.toString());
        } catch (err) {
            fabricLogger.info(`Error when get certificate's history': ${err}`);
        }
    }

    UpdateCert = async (id, unitCode, mark, name, studentID, credit, period) => {
        fabricLogger.info('Submit Transaction: UpdateCert() Update certificate');
        try {
            // Return the successful payload if the transaction is committed without errors
            const result = await contract.submitTransaction('UpdateCert', id, unitCode, mark, name, studentID, credit, period);
            return prettyJSONString(result.toString());
        } catch (err) {
            fabricLogger.info(`Error when create certificate: ${err}`);

            // Return errors if any
            return err;
        }
    }
}
