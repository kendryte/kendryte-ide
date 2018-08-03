#!/usr/bin/env bash

npm run -s precommit 2>&1 | grep 'File not formatted:' | sed 's/File not formatted://g' | xargs -n1 tsfmt -r
