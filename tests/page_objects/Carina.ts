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
  splashScreen: {
    selector: "#splash-screen"
  },
  splashClose: {
    selector: "#splash-close"
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
    closeTextIcon: {
      selector: "#close-text-icon"
    },
    textWindow: {
      selector: ".v-window"
    },
    infoText: {
      selector: ".v-window-item:nth-of-type(1) .v-card-text"
    },
    wwtText: {
      selector: ".v-card-text:nth-of-type(2) .v-card-text"
    }
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

const carinaProps = {};

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
