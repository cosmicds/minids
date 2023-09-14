#!/bin/bash

filepath=../node_modules/@wwtelescope/engine/src/index.js
line=$(head -n 48377 ${filepath} | tail -1 | xargs)
if [[ $line = TileCache* ]]
then
    sed -i.bak '48389a      TileCache: [ TileCache, TileCache$, null ],' ${filepath}
    sed -i.bak '48377d' ${filepath}
    rm ${filepath}.bak
fi
