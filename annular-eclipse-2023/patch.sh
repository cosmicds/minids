#!/bin/bash

filepath=node_modules/@wwtelescope/engine/src/index.js
if ! test -f ${filepath}; then
    filepath="../${filepath}"
fi

line_number=$(sed -n "/TileCache: /=" ${filepath})
if [[ ! -z ${line_number} ]]
then
    line=$(head -n ${line_number} ${filepath} | tail -1 | xargs)
    insert_number=$(sed -n "/ScaleTypes: ScaleTypes/=" ${filepath})
    if [[ $(($line_number < $insert_number)) ]]
    then
        sed -i.bak "${insert_number}a      TileCache: [ TileCache, TileCache$, null ]," ${filepath}
        sed -i.bak "${line_number}d" ${filepath}
        rm ${filepath}.bak
    fi
fi
