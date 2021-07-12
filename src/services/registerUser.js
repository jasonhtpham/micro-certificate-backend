/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

import 'dotenv/config';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
const enrollAdmin = require('./enrollAdmin');
const caChaincodeUserRole = 'client';
const walletPath = path.join(__dirname, '..', 'wallet');

const CA_ADDRESS = process.env.CA_ADDRESS;
const MSP_ID = process.env.MSP_ID;

const ADMIN_ID = process.env.CA_ADMIN_ID;


// const applicationUserId = 'appUser';
let applicationUserId;

async function registerAppUser(userId) {
    try {
        applicationUserId = userId;

        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
            throw new Error(`no such file or directory: ${ccpPath}`);
        }
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities[CA_ADDRESS].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.        ;
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(applicationUserId);
        if (userIdentity) {
            fabricLogger.info(`An identity for the user ${applicationUserId} already exists in the wallet`);
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get(ADMIN_ID);
        if (!adminIdentity) {
            fabricLogger.info('An identity for the admin user does not exist in the wallet');
            fabricLogger.info('Run the enrollAdmin.js application before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, ADMIN_ID);

        // Register the user, enroll the user, and import the new identity into the wallet.
        // if affiliation is specified by client, the affiliation value must be configured in CA
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: applicationUserId,
            role: caChaincodeUserRole
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: applicationUserId,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: MSP_ID,
            type: 'X.509',
        };
        await wallet.put(applicationUserId, x509Identity);
        fabricLogger.info(`Successfully registered and enrolled user ${applicationUserId} and imported it into the wallet`);

    } catch (error) {
        console.error(`Failed to register user : ${error}`);
        process.exit(1);
    }
}

exports.ApplicationUserId = applicationUserId;
export default registerAppUser;
