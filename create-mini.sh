#!/bin/bash

# TODO(?): Make a PowerShell version of this

function to_pascal_case {
    echo $1 | sed -r 's/(^|_|-)([a-z])/\U\2/g'
}

if [[ $# -lt 1 ]]; then
    echo "Mini name is missing!"
    exit 2
fi
if [[ $# -gt 1 ]]; then
    echo "Should only specify one parameter!"
    exit 2
fi

name=$1

if [[ -d $name ]] | [[ -h $name ]]; then
    echo "A directory for this mini already exists!"
    exit 2
fi

# Initialize the new directory from the template directory
cp -r template $name

# Add the new story as a workspace in package.json
cat package.json |
    jq --arg name $name '.workspaces[.workspaces | length] |= . + $name' | jq '.workspaces |= if . then sort else empty end' > tmp.json
mv tmp.json package.json

# Do some setup in the new directory
cd $name
yarn add vue vuetify webpack-plugin-vuetify @fortawesome/fontawesome-svg-core @fortawesome/vue-fontawesome @fortawesome/free-solid-svg-icons
yarn add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser @vue/cli-plugin-eslint @vue/cli-plugin-typescript \
     @vue/cli-service @vue/compiler-sfc @vue/eslint-config-typescript eslint eslint-plugin-vue less less-loader typescript webpack
cat package.json | jq --arg name $name '.name = $name'
pascal_case_name=$(to_pascal_case $name)

cd src
sed -i "s/MainComponent/${pascal_case_name}/g" main.ts
sed -i "s/wwt-minids-template/wwt-minids-$name/g" main.ts
mv MainComponent.vue ${pascal_case_name}.vue

cd ../public
sed -i "s/minids-template/$name/g" index.html
