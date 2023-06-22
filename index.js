const core = require('@actions/core');
const exec = require('@actions/exec');
const sfcc = require('sfcc-ci');
import { zip } from 'zip-a-folder';

async function archiveCartridges(archiveFile) {
    await zip('Cartridges', archiveFile);
}

async function run() {
    try {
        const instance = core.getInput('instance');
        const clientId = core.getInput('client-id');
        const clientSecret = core.getInput('client-secret');
        const codeVersionPrefix = core.getInput('code-version-prefix');

        const src = __dirname;
        const newCodeVersion = `${codeVersionPrefix}_`;
        const archiveFile = `${newCodeVersion}.zip`;

        sfcc.auth.auth(clientId, clientSecret, (err, token) => {
            if (token) {
                console.log('Authentication succeeded. Token is %s', token);
                archiveCartridges(archiveFile);
                sfcc.code.deploy(instance, archiveFile, token, option, (err) => {
                    if (err) {
                        isError = true;
                        console.error('Deploy error: %s', err);
                        return;
                    }

                    sfcc.code.activate(instance, codeVersion, token, (err) => {
                        if (err) {
                            console.error('Activate error: %s', err);
                        }
                    });
                });
            }

            if (err) {
                isError = true;
                console.error('Authentication error: %s', err);
            }
        });
        //
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
