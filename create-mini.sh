#!/bin/bash

# TODO(?): Make a PowerShell version of this

if [[ $# -lt 1 ]]; then
    echo "Mini name is missing!"
    exit 2
fi
if [[ $# -ge 1 ]]; then
    echo "Should only specify one parameter!"
    exit 2
fi

name=$1
mkdir -p $1

# Add the new story as a workspace in package.json
cat package.json |
    jq --arg name $name '.workspaces[.workspaces | length] |= . + $name' | jq '.workspaces |= if . then sort else empty end' > tmp.json
mv tmp.json package.json
