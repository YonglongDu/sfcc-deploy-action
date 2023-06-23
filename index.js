const core = require('@actions/core');
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
        const newCodeVersion = `${codeVersion}_${context.runNumber}`;
        const archiveFile = `${src}/${newCodeVersion}.zip`;
        const option = {};
        console.log(`workspace:${process.env['GITHUB_WORKSPACE']}`);
        console.log(`archiveFile:${archiveFile}`);

        //Authorization Server
        sfcc.auth.auth(clientId, clientSecret, async (err, token) => {
            if (token) {
                console.log('Authentication succeeded. Token is %s', token);
                const srcDir = `${src}/cartridges`;

                //Zip cartridges files
                await exec.exec(`cp -r ${srcDir} ${newCodeVersion}`);
                await exec.exec(`zip ${archiveFile} -r ${newCodeVersion}`);

                sfcc.code.deploy(instance, archiveFile, token, option, async (deployerr) => {
                    if (deployerr) {
                        console.error('Deploy error: %s', deployerr);
                        core.setFailed(deployerr.message);
                        return;
                    }

                    sfcc.code.activate(instance, newCodeVersion, token, (activateerr) => {
                        if (activateerr) {
                            console.error('Activate error: %s', activateerr);
                            core.setFailed(activateerr.message);
                        }
                    });

                    //Remove the temporary source directory and archive file for deployment
                    await exec.exec(`rm -r ${newCodeVersion}`);
                    await exec.exec(`rm ${archiveFile}`);
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
