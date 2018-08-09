'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as helper from './helper';
import * as console from './log';

export class browse {
    path                         : string[] = [];
    limitSymbolsToIncludedHeaders: boolean  = true;
    databaseFilename             : string   = '';
}

export class configuration {
    name       : string   = '';
    includePath: string[] = [];
    defines    : string[] = [];
    browse     : browse   = new browse();

    constructor(project, target, buildTypeName) {
        this.parse(project, target, buildTypeName);
    }

    parse(project, target, buildTypeName) {  // CodeModelProject, CodeModelTarget, string
        // collect includes
        const includeDirs = (target => {  // target: CodeModelTarget
            let incDirs: string[] = [];
            if (target != null && target.fileGroups != null) {
                target.fileGroups.forEach(fg => {
                    if (fg.hasOwnProperty('includePath')) {
                        Array.prototype.push.apply(  // concat incDirs and fg's (mapped) array of paths
                            incDirs,
                            fg.includePath.map(ipObj => ipObj.path)
                        );
                    }
                })
            }
            return incDirs.sort();
        })(target);

        // collect defines
        const macroDefines = (target => {  // target: CodeModelTarget
            let mDefs: string[] = [];
            if (target != null && target.fileGroups != null) {
                target.fileGroups.forEach(fg => {
                    if (fg.hasOwnProperty('defines')) {
                        Array.prototype.push.apply(mDefs, fg.defines);
                    }
                })
            }
            return mDefs.sort();
        })(target);

        //
        this.name        = helper.makeConfigName(project != null ? project.name : null, target != null ? target.name : null, buildTypeName);
        this.defines     = macroDefines;
        this.includePath = includeDirs;
        this.browse.path = this.includePath;
    }
}

export class c_cpp_properties {
    // the first element should be the active config
    // @see CMakeToolsHelper.update_cpptools()
    configurations: configuration[] = [];

    constructor(configs) {
        this.parse(configs);
    }

    parse(configs) {  // CodeModelConfiguration
        const excludedTargets: string[] = ['ALL_BUILD', 'ZERO_CHECK'];

        // init with the null/invalid/default config
        this.configurations = [ new configuration(null, null, null) ];

        // add the other/useful configs
        if (configs != null) {
            configs.forEach(cfg => {
                cfg.projects.forEach(prj => {
                    prj.targets.forEach(tgt => {
                        if (tgt.name && !excludedTargets.includes(tgt.name)) {
                            this.configurations.push(new configuration(prj, tgt, cfg.name));
                        }
                    });
                });
            });
        }
    }

    writeFile(callback = null) {
        mkdirp(helper.vscodeFolderPath(), err => {
            if (err) {
                const msg = "Fail: Creation of the .vscode directory";
                console.error(msg);
                vscode.window.showErrorMessage(msg);
            } else {
                this.writeFile_actual(callback);
            }
        });
    }

    writeFile_actual(callback) {
        // TODO FIXME update the following comments
        // 1. open the file. write the active config alone. close the file.
        // 2. (disabled for now) open the file. write all the configs. close the file.
        // 3. this should
        //    1. trigger ConfigurationProperties.handleConfigurationChange
        //    2. set cmake's active config as cpptools' active config
        // @see <extensions dir>/ms-vscode.cpptools-0.11.2/out/src/LanguageServer/C_Cpp_ConfigurationProperties.js
        // the following is extracted from that file
        // function handleConfigurationChange() {
        //     if (the properties file exists) {
        //         parse the properties file
        //         if (nb parsed configs <= current config index) {
        //             current config index = 0  // <-- I'm trying to force that
        //         }
        //     }
        //     else {
        //         load default config
        //     }
        //     update the status bar and other stuff
        // }

        const filePath = path.join(helper.vscodeFolderPath(), 'c_cpp_properties.json');

        function checkError(err, what) {
            if (err) {
                const msg = `Fail: ${what} [${filePath}]`;
                console.error(msg);
                vscode.window.showErrorMessage(msg);
            } else {
                console.log(`Pass: ${what}`);
            }
        }

        // depending on the value of the "auto_set_cpptools_target" config option
        // 'this' will contain either one (i.e. active) or all the configs
        // if there is only one config, cpptools should use it as the active config
        // if there are more, then the user should select the one that they want to use manually
        fs.writeFile(filePath, JSON.stringify(this, null, 4), err => {
            checkError(err, 'Writing the active config');

            // write all the configs
            // cpptools should keep the active config (which is still at index 0)
            // and parse the others as well
            //setTimeout(() => {
            //    fs.writeFile(filePath, JSON.stringify(this, null, 4), err => {
            //        checkError(err, 'Writing all configs');
            //    });
            //}, vscode.workspace.getConfiguration('cmake-helper').fs_delay_ms);
        });


    }
}
