#!/bin/bash

filepath=node_modules/@wwtelescope/engine/src/index.js
if ! test -f ${filepath}; then
    filepath="../${filepath}"
fi

# Check whether the patch has already been run
# If so, no need to continue
altered_line=$(sed -n "/__WEBPACK_IMPORTED_MODULE_X/=" ${filepath} | head -n 1)
if [[ ! -z ${altered_line} ]]
then
    echo "Altered line found!"
    exit 0
fi

reexport_line=$(sed -n "/ ss: () => (\/\* reexport/=" ${filepath})
reexport_line=$((${reexport_line} - 1))
if [[ ! -z ${reexport_line} ]]
then
    sed -i.bak "${reexport_line}a\\
        tilePrepDevice: () => (_render_globals_js__WEBPACK_IMPORTED_MODULE_X__.tilePrepDevice),
    " ${filepath}
    import_line=$((reexport_line + 5))
    sed -i.bak "${import_line}a\\
        var _render_globals_js__WEBPACK_IMPORTED_MODULE_X__ = __webpack_require__('./esm/render_globals.js'); 
    " ${filepath}
    rm ${filepath}.bak
fi
