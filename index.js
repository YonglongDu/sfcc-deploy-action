const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');
const sfcc = require('sfcc-ci');

import { zip } from 'zip-a-folder';

async function archiveCartridges(srcDirectory, archiveFile) {
    await zip(srcDirectory, archiveFile);
}

async function run() {
    try {
        const instance = core.getInput('instance');
        const clientId = core.getInput('client-id');
        const clientSecret = core.getInput('client-secret');
        const codeVersion = core.getInput('code-version');

        const context = github.context;
        const src = process.env['GITHUB_WORKSPACE'];
        const archiveFile = `${src}/${codeVersion}.zip`;
        const option = {};
        console.log(`runNumber:${context.runNumber}`);
        console.log(`runId:${context.runId}`);
        console.log(`workspace:${process.env['GITHUB_WORKSPACE']}`);

        console.log(archiveFile);

        sfcc.auth.auth(clientId, clientSecret, (err, token) => {
            if (token) {
                console.log('Authentication succeeded. Token is %s', token);
                const srcDirectory = `${src}/cartridges`;
                archiveCartridges(srcDirectory, archiveFile);
                sfcc.code.deploy(instance, archiveFile, token, option, (deployerr) => {
                    if (err) {
                        console.error('Deploy error: %s', deployerr);
                        return;
                    }

                    sfcc.code.activate(instance, codeVersion, token, (activateerr) => {
                        if (err) {
                            console.error('Activate error: %s', activateerr);
                        }
                    });
                });
            }

            if (err) {
                console.error('Authentication error: %s', err);
            }
        });
        //
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
