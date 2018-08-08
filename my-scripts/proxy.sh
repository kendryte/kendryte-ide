#!/usr/bin/env bash

export http_proxy="$1" https_proxy="$1"

"$@"