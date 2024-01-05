#!/bin/bash

filepath=node_modules/@wwtelescope/engine/src/index.js
if ! test -f ${filepath}; then
    filepath="../${filepath}"
fi

# Check whether the patch has already been run
# If so, no need to continue
altered_line=$(sed -n "/this.renderContext.targetCamera.zoom < this.get_zoomMin()/=" ${filepath} | head -n 1)
if [[ ! -z ${altered_line} ]]
then
    echo "Zoom patch already applied!"
    exit 0
fi

# zoom: function (factor)
teststring="> this.get_zoomMax()" # string must be unique
zoom_function_line=$(sed -n "/${teststring}/=" ${filepath})

insert_line=$((${zoom_function_line} + 2))

if [[ ! -z ${insert_line} ]]
then
    sed -i.bak "${insert_line}a\\
        if (this.renderContext.targetCamera.zoom < this.get_zoomMin()) {\\
            this.renderContext.targetCamera.zoom = this.get_zoomMin();\\
        }\\

    " ${filepath}
    rm ${filepath}.bak
fi