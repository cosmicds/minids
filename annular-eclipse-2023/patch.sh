#!/bin/bash

filepath=node_modules/@wwtelescope/engine/src/index.js
if ! test -f ${filepath}; then
    filepath="../${filepath}"
fi

reexport_line=$(sed -n "/ ss: () => (\/\* reexport/=" $filepath)
reexport_line=$((${reexport_line} - 1))
if [[ ! -z ${reexport_line} ]]
then
    sed -i.bak "${reexport_line}a\\
        TileCache: () => (_tile_cache_js__WEBPACK_IMPORTED_MODULE_X__.TileCache),
        " ${filepath}
    import_line=$((reexport_line + 5))
    sed -i.bak "${import_line}a\\
        var _tile_cache_js__WEBPACK_IMPORTED_MODULE_X__ = __webpack_require__('./esm/tile_cache.js');
        " ${filepath}
    rm ${filepath}.bak
fi
