/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

import 'dotenv/config';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const adminUserId = process.env.CA_ADMIN_ID;
const adminUserPasswd = process.env.CA_ADMIN_PWD;

const CA_ADDRESS = process.env.CA_ADDRESS;
const MSP_ID = process.env.MSP_ID;

const walletPath = path.join(__dirname, '..', 'wallet');

async function enrollAdminUser() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
            throw new Error(`no such file or directory: ${ccpPath}`);
        }
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities[CA_ADDRESS];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new  wallet : Note that wallet can be resfor managing identities.
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get(adminUserId);
        if (identity) {
            fabricLogger.info('An identity for the admin user already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: adminUserId, enrollmentSecret: adminUserPasswd });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: MSP_ID,
            type: 'X.509',
        };
        await wallet.put(adminUserId, x509Identity);
        fabricLogger.info('Successfully enrolled admin user and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll admin user : ${error}`);
        process.exit(1);
    }
}

// exports.AdminUserId = adminUserId;
export default enrollAdminUser;
