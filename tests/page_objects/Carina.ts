import { EnhancedPageObject, EnhancedSectionInstance, PageObjectModel } from "nightwatch";

const carinaCommands = {
  waitForReady(this: EnhancedPageObject): EnhancedPageObject {
    return this
      .waitForElementVisible("@app")
      .waitForElementVisible("@wwtComponent");
  }
};

const carinaElements = {
  app: {
    selector: "#app"
  },
  wwtComponent: {
    selector: ".wwtelescope-component"
  },
  mainContent: {
    selector: "#main-content"
  },
  splashScreen: {
    selector: "#splash-screen"
  },
  splashClose: {
    selector: "#splash-close"
  },
  topContent: {
    selector: "#top-content"
  },
  bottomContent: {
    selector: "#bottom-content"
  },
  videoDialog: {
    selector: "#video-container",
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
    showHideButton: {
      selector: "#show-layers-button"
    },
    resetIconWrapper: {
      selector: "#reset-icon-wrapper"
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

const bottomContent = {
  commands: {},
  sections: {},
  elements: {
    tools: {
      selector: "#tools"
    },
    hubbleButton: {
      selector: ".slider-label:nth-of-type(1)"
    },
    jwstButton: {
      selector: ".slider-label:nth-of-type(2)"
    },
    slider: {
      selector: "input"
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

const carinaSections = {
  topContent: {
    selector: "#top-content",
    ...topContent
  },
  bottomContent: {
    selector: "#bottom-content",
    ...bottomContent
  },
  videoDialog: {
    selector: "#video-container",
    ...videoDialog
  },
  infoSheet: {
    selector: "#text-bottom-sheet",
    ...infoSheet
  }
};

const carinaProps = {
  title: "Compare JWST and Hubble images of Carina!"
};

const carinaPage: PageObjectModel = {
  url: "http://localhost:8080",
  commands: [carinaCommands],
  props: carinaProps,
  elements: carinaElements,
  sections: carinaSections
} as const;

export default carinaPage;

export type CarinaPage =
  EnhancedPageObject<typeof carinaCommands,
                     typeof carinaElements,
                     typeof carinaSections> &
                     { props: typeof carinaProps };

type Section = keyof typeof carinaSections;
type SectionInfo<S extends Section> = typeof carinaSections[S];
export type CarinaSections = {
  [key in Section]: EnhancedSectionInstance<SectionInfo<key>>
};
