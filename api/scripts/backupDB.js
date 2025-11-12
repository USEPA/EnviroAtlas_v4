const appRoot = require('app-root-path');
const config = require(appRoot + '/config/env');
const externalCommandRunnerFactory = require(appRoot + '/shared/externalCommandRunner');
const utilities = require(appRoot + '/shared/utilities');

let runner = externalCommandRunnerFactory();

let parseArgs = require('minimist');
//first 2 args are node location and script location
let args = parseArgs(process.argv.slice(2));
let batName = args._[0] || '';
if (batName) batName = '_' + batName;

let path = utilities.objectChain.find(config,'postgres.backup.path');

let secondaryPath = utilities.objectChain.find(config,'postgres.backup.secondaryPath');
let password = utilities.objectChain.find(config,'postgres.passwords.postgres');
let installPath = utilities.objectChain.find(config,'postgres.installPath') || '';
if (installPath) installPath = installPath.replace(/\\+$/,'') + '\\bin\\';

(async function () {
    try {
        let cmd;
//        let cmd = `set PGPASSWORD=${password}`;
//        await runner.run({cmd});

//        cmd = `set PGPASSWORD=${password}&& ${installPath}pg_dump -U postgres -p 5433 -f blt.sql blt`;
//        cmd = `set PGPASSWORD=${password}&& "${installPath}pg_dump" -U postgres -p 5433 --schema bltadmin -f bltadmin.sql blt`;
//        cmd = `set PGPASSWORD=${password}&& "${installPath}pg_dump" -U postgres -p 5433 -t bltadmin.pula -f pula.sql blt`;
        cmd = `"${appRoot}\\scripts\\sql\\backupDB${batName}.bat" "${password.replace(/"/,'""')}" "${installPath.replace(/"/,'""')}"`;

        await runner.run({cmd,dir:path});
        if (secondaryPath) await runner.run({cmd,dir:secondaryPath});
    } catch (ex) {
        console.error('exception: ');
        console.error(ex);
    }
    console.log('end');
    process.exit();
})();
