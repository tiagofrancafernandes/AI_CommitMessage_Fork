#!/bin/bash

__DIR__=$(dirname "$(readlink -f "$0")")

cd "${__DIR__}"

pwd -P

npm install

npm run build && npm run package
