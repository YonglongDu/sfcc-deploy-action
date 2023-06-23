const core = require('@actions/core');
const command = require('@actions/command');
const exec = require('@actions/exec');
const github = require('@actions/github');
const sfcc = require('sfcc-ci');

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

        //Authorization Server
        sfcc.auth.auth(clientId, clientSecret, (err, token) => {
            if (token) {
                console.log('Authentication succeeded. Token is %s', token);
                const srcDir = `${src}/cartridges`;
                //Zip cartridges files
                command.issueCommand(`zip ${archiveFile} -r ${srcDir}`);
                sfcc.code.deploy(instance, archiveFile, token, option, (deployerr) => {
                    if (deployerr) {
                        console.error('Deploy error: %s', deployerr);
                        core.setFailed(deployerr.message);
                        return;
                    }

                    sfcc.code.activate(instance, codeVersion, token, (activateerr) => {
                        if (activateerr) {
                            console.error('Activate error: %s', activateerr);
                            core.setFailed(activateerr.message);
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
