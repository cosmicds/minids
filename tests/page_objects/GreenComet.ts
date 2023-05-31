import {
  EnhancedPageObject,
  EnhancedSectionInstance,
  PageObjectModel
} from "nightwatch";

import { whitespacePaddedRegex } from "../utils";

const greenCometCommands = {
  waitForReady(this: EnhancedPageObject): EnhancedPageObject {
    return this
      .waitForElementVisible("@app")
      .waitForElementVisible("@wwtComponent");
  }
};

const greenCometElements = {
  app: {
    selector: "#app"
  },
  wwtComponent: {
    selector: ".wwtelescope-component",
  },
  mainContent: {
    selector: "#main-content",
  },
  splashScreen: {
    selector: "#splash-screen"
  },
  splashClose: {
    selector: "#splash-close"
  },
  topContent: {
    selector: ".top-content"
  },
  folderView: {
    selector: "#left-content .folder-view"
  },
  bottomContent: {
    selector: ".bottom-content"
  },
  videoDialog: {
    selector: "#video-container"
  },
  locationDialog: {
    selector: "#location-dialog"
  },
  infoSheet: {
    selector: "#text-bottom-sheet"
  }
};

const topContent = {
  commands: {},
  sections: {},
  elements: {
    videoIconWrapper: {
      selector: "#video-icon-wrapper"
    },
    mapIconWrapper: {
      selector: "#map-icon-wrapper"
    },
    textIconWrapper: {
      selector: "#text-icon-wrapper"
    }
  }
};

const videoDialog = {
  commands: {},
  sections: {},
  elements: {
    closeIcon: {
      selector: ".close-icon"
    },
    video: {
      selector: "#info-video"
    }
  }
};

const locationDialog = {
  commands: {},
  sections: {},
  elements: {
    actionText: {
      selector: ".text-center"
    },
    useMyLocationButton: {
      selector: ".v-btn"
    },
    useMyLocationButtonContent: {
      selector: ".v-btn__content"
    },
    mapContainer: {
      selector: "#map-container"
    }
  },
  props: {
    actionText: whitespacePaddedRegex("Move around the map and double-click to change location"),
    useMyLocationText: whitespacePaddedRegex("Use My Location")
  }
};

const folderView = {
  commands: {},
  sections: {},
  elements: {
    expandRow: {
      selector: "#expand-row"
    },
    expandHeader: {
      selector: ".thumbnail-header"
    },
    expandChevron: {
      selector: ".svg-inline--fa"
    },
    folderItems: {
      selector: "#items"
    },
    folderItem: {
      selector: ".item"
    }
  },
  props: {
    expandedHeaderText: whitespacePaddedRegex("Click thumbnail to see image in sky"),
    contractedHeaderText: whitespacePaddedRegex("Image Controls"),
    folderImageCount: 16
  }
};

const controls = {
  commands: {},
  sections: {},
  elements: {
    topRow: {
      selector: "#controls-top-row"
    },
    openCloseButton: {
      selector: ".svg-inline--fa"
    },
    optionCheckbox: {
      selector: ".v-checkbox"
    },
    gridCheckbox: {
      selector: ".v-checkbox:nth-of-type(1)"
    },
    constellationsCheckbox: {
      selector: ".v-checkbox:nth-of-type(2)"
    },
    horizonCheckbox: {
      selector: ".v-checkbox:nth-of-type(3)"
    },
    optionLabel: {
      selector: ".v-checkbox .v-label"
    },
    optionInput: {
      selector: ".v-checkbox input"
    },
    gridInput: {
      selector: ".v-checkbox:nth-of-type(1) input"
    },
    constellationsInput: {
      selector: ".v-checkbox:nth-of-type(2) input"
    },
    horizonInput: {
      selector: ".v-checkbox:nth-of-type(3) input"
    },
    selectedLocationTimeLabel: {
      selector: "div.mt-3"
    },
    selectedLocationTimeInput: {
      selector: ".dp__main .dp__input_readonly"
    },
    timeIcon: {
      selector: ".dp__main .dp__input_icon"
    },
    centerOnNowButton: {
      selector: ".v-btn:nth-of-type(1)"
    },
    centerOnNowButtonContent: {
      selector: ".v-btn:nth-of-type(1) .v-btn__content"
    },
    playCometImagesButton: {
      selector: ".v-btn:nth-of-type(2)"
    },
    playCometImagesContent: {
      selector: ".v-btn:nth-of-type(2) .v-btn__content"
    }
  },
  props: {
    selectedLocationTimeText: whitespacePaddedRegex("Selected location's time:"),
    centerOnNowText: /Center on Now/i,
    playCometImagesText: /Play comet images/i 
  }
};

const bottomContent = {
  commands: {},
  sections: {},
  elements: {
    playPauseIconWrapper: {
      selector: "#play-pause-icon-wrapper"
    },
    slider: {
      selector: "#slider"
    },
    sliderRail: {
      selector: ".vue-slider-rail"
    },
    sliderMarks: {
      selector: ".vue-slider-marks"
    },
    sliderDot: {
      selector: ".vue-slider-dot"
    },
    sliderTooltip: {
      selector: ".vue-slider-dot-tooltip"
    },
    sliderTooltipText: {
      selector: ".vue-slider-dot-tooltip-text"
    },
    credits: {
      selector: "#credits"
    },
    creditIcon: {
      selector: "#credits a"
    }
  },
  props: {
    creditIconCount: 4
  }
};

const infoSheet = {
  commands: {},
  sections: {},
  elements: {
    tabHeader: {
      selector: ".v-tab"
    },
    infoTabHeader: {
      selector: ".v-tab:nth-of-type(1)"
    },
    wwtTabHeader: {
      selector: ".v-tab:nth-of-type(2)"
    },
    closeIcon: {
      selector: "#close-text-icon"
    },
    textWindow: {
      selector: ".v-window"
    },
    textItem: {
      selector: ".v-window-item .v-card-text"
    },
    infoText: {
      selector: ".v-window-item:nth-of-type(1) .v-card-text"
    },
    wwtText: {
      selector: ".v-window-item:nth-of-type(2) .v-card-text"
    }
  },

  props: {
    tabCount: 2
  }
};

const greenCometSections = {
  topContent: {
    selector: ".top-content",
    ...topContent
  },
  bottomContent: {
    selector: ".bottom-content",
    ...bottomContent
  },
  // Technically this should be a subsection of bottomContent
  // But getting the typing to work there seems like it'd be
  // more effort than it's worth - we already have to add in
  // the top level section types manually
  controls: {
    selector: "#controls",
    ...controls
  },
  videoDialog: {
    selector: "#video-container",
    ...videoDialog
  },
  infoSheet: {
    selector: "#text-bottom-sheet",
    ...infoSheet
  },
  locationDialog: {
    selector: "#location-dialog",
    ...locationDialog
  },
  folderView: {
    selector: ".folder-view",
    ...folderView
  }
};

const greenCometProps = {
  title: "See the Green Comet's path across your virtual sky"
};

const greenCometPage: PageObjectModel = {
  url: "http://localhost:8080",
  commands: [greenCometCommands],
  props: greenCometProps,
  elements: greenCometElements,
  sections: greenCometSections
} as const;

export default greenCometPage;

export type GreenCometPage =
  EnhancedPageObject<typeof greenCometCommands,
                     typeof greenCometElements,
                     typeof greenCometSections> &
                    { props: typeof greenCometProps };

type Section = keyof typeof greenCometSections;
type SectionInfo<S extends Section> = typeof greenCometSections[S];
export type GreenCometSections = {
  [key in Section]: EnhancedSectionInstance<SectionInfo<key>>
};
