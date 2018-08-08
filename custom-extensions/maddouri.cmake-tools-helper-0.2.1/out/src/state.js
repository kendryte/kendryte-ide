'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const helper = require("./helper");
const c_cpp_properties_1 = require("./c_cpp_properties");
class CMakeToolsHelper {
    constructor() {
        this.cmakeTools = vscode.extensions.getExtension("vector-of-bool.cmake-tools");
        this.validateEnvironment();
        helper.initCMakeDownloadDir();
        const onChange = () => this.update_cpptools();
        // update on build config change
        this.cmakeTools.exports.reconfigured(() => {
            onChange();
        });
        // update on default target change
        this.cmakeTools.exports.targetChangedEvent(() => {
            onChange();
        });
        // first update
        onChange();
    }
    validateEnvironment() {
        if (!this.cmakeTools.isActive) {
            const msg = 'CMake Tools is not active';
            console.error(msg);
            vscode.window.showErrorMessage(msg);
        }
        if (!vscode.workspace.getConfiguration('cmake').get('useCMakeServer')) {
            const msg = 'Please set \'cmake.useCMakeServer\' to \'true\'';
            console.error(msg);
            vscode.window.showErrorMessage(msg);
        }
    }
    activeCMakeConfigName() {
        return this.cmakeTools.exports._backend.then(cmakeToolsWrapper => {
            // cmakeTools.exports         : CMakeToolsWrapper
            // cmakeToolsWrapper          : CMakeToolsWrapper
            // cmakeToolsWrapper.codeModel: CodeModelContent
            if (cmakeToolsWrapper == null) {
                return new Promise(resolve => resolve(helper.makeConfigName(null, null, null)));
            }
            const codeModel = cmakeToolsWrapper.codeModel;
            const configs = (codeModel != null)
                ? codeModel.configurations // CodeModelConfiguration
                : null;
            //const activeGenerator     = cmakeToolsWrapper.activeGenerator;
            const activeTargetName = cmakeToolsWrapper.defaultBuildTarget;
            const activeBuiltTypeName = cmakeToolsWrapper.selectedBuildType;
            const activeConfig = (configs != null)
                ? configs.find(c => (c.name == activeBuiltTypeName))
                : null;
            const activeProject = (activeConfig != null)
                ? activeConfig.projects.find(p => (typeof p.targets.find(t => (t.name == activeTargetName)) !== 'undefined')) // CodeModelProject
                : null;
            //const activeTarget        = activeProject != null
            //                          ? activeProject.targets.find(t => (t.name == activeTargetName)) // CodeModelTarget
            //                          : null;
            const activeProjectName = (activeProject != null)
                ? activeProject.name
                : null;
            return new Promise(resolve => resolve(helper.makeConfigName(activeProjectName, activeTargetName, activeBuiltTypeName)));
        });
    }
    updateCppTools() {
        this.activeCMakeConfigName().then(activeConfigName => {
            this.cmakeTools.exports._backend.then(cmakeToolsWrapper => {
                // get all the configs
                const codeModel = cmakeToolsWrapper.codeModel;
                const cmakeConfigs = ((typeof codeModel === 'undefined') || (codeModel == null))
                    ? null
                    : codeModel.configurations; // CodeModelConfiguration
                let props = new c_cpp_properties_1.c_cpp_properties(cmakeConfigs);
                const writeCurrentConfigOnly = vscode.workspace.getConfiguration('cmake-tools-helper').get('auto_set_cpptools_target');
                if (writeCurrentConfigOnly) {
                    // place the active config at the beginning of the array
                    let vscConfigs = props.configurations;
                    const activeConfigIdx = vscConfigs.findIndex(cfg => cfg.name == activeConfigName);
                    let activeConfig = vscConfigs.splice(activeConfigIdx, 1)[0];
                    vscConfigs.splice(0, 0, activeConfig);
                    // keep the first (i.e. active) one only
                    vscConfigs.splice(1);
                }
                else {
                    // remove the null config
                    let vscConfigs = props.configurations;
                    const nullConfigIdx = vscConfigs.findIndex(cfg => cfg.name == "null");
                    vscConfigs.splice(nullConfigIdx, 1);
                }
                // @see this method's code and comments
                props.writeFile();
            });
        });
    }
    // commands
    show_active_cmake_config_name() {
        try {
            this.activeCMakeConfigName().then(cfgName => vscode.window.showInformationMessage(`Active CMake Configuration [${cfgName}]`));
        }
        catch (e) {
            console.log(e);
        }
    }
    update_cpptools() {
        try {
            this.updateCppTools();
        }
        catch (e) {
            console.log(e);
        }
    }
    install_cmake() {
        try {
            helper.installCMake();
        }
        catch (e) {
            console.log(e);
        }
    }
    change_cmake_version() {
        try {
            helper.changeCMakeVersion();
        }
        catch (e) {
            console.log(e);
        }
    }
}
exports.CMakeToolsHelper = CMakeToolsHelper;
//# sourceMappingURL=state.js.map