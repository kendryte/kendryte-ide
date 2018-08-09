# Change Log

## 0.2.1

* Update dependencies

## 0.2.0

* Merge https://github.com/maddouri/vscode-cmake-tools-helper/pull/7
* Update the extension's configuration json files
* Require VSCode >= 1.22.0
* Fix README

## 0.1.1

* Add the commands introduced in 0.1.0 to the extension's `activationEvents`
* Minor fixes/updates to the readme

## 0.1.0

* New feature: CMake downloader and version manager

## 0.0.7

* Update for CMake Tools 0.9.7 (use the API's `_backend` instead of `_impl`)

## 0.0.6

* Use CMake Tools 0.9.5 API to be notified by config/target changes
* Minor code fixes/refactoring

## 0.0.5

* Create the .vscode directory if it doesn't exist (should fix some issues on Linux)
* Remove obsolete dependency to the `hooks` package (I've used `proxy-observe` instead and forgot to remove `hooks`)
* Update dependencies:
    ```
    "mocha": "^3.4.2"
    ```
* Unify line endings (LF) in the source files
* Use 5 tags in package.json

## 0.0.4

* Update `devDependencies`
    ```
    "@types/node": "^7.0.22"
    "@types/mocha": "^3.4.2"
    ```

## 0.0.3

* Add `proxy-observe` as a runtime dependency

## 0.0.2

* Fix null/undefined ref usage

## 0.0.1

* Initial release
