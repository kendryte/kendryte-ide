#!/usr/bin/env bash

set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
source fn.sh
set_path_when_developing
source common.sh
cd ..

### start
reset_asar
