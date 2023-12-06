<template>
<v-app
  id="app"
  :style="cssVars"
>
  <div
    id="main-content"
  >
    <WorldWideTelescope
      :wwt-namespace="wwtNamespace"
    ></WorldWideTelescope>


    <!-- This contains the splash screen content -->

    <v-overlay
      :model-value="showSplashScreen"
      absolute
      opacity="0.6"
      :style="cssVars"
      id="splash-overlay"
    >
      <div
        id="splash-screen"
        v-click-outside="closeSplashScreen"
        :style="cssVars"
      >
        Splash Screen
      </div>
    </v-overlay>

    <transition name="fade">
      <div
        class="modal"
        id="modal-loading"
        v-show="isLoading"
      >
        <div class="container">
          <div class="spinner"></div>
          <p>Loading …</p>
        </div>
      </div>
    </transition>


    <!-- This block contains the elements (e.g. icon buttons displayed at/near the top of the screen -->

    <div class="top-content">
      <div id="left-buttons">
        <icon-button
          v-model="showTextSheet"
          fa-icon="book-open"
          :color="accentColor"
          :tooltip-text="showTextSheet ? 'Hide Info' : 'Learn More'"
          tooltip-location="start"
        >
        </icon-button>
        <icon-button
          v-model="showVideoSheet"
          fa-icon="video"
          :color="accentColor"
          tooltip-text="Watch video"
          tooltip-location="start"
        >
        </icon-button>
      </div>
      <div id="center-buttons">
      </div>
      <div id="right-buttons">
      </div>
    </div>


    <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->

    <div class="bottom-content">
      <div id="time-controls">
        <icon-button
          v-model="playing"
          :fa-icon="playing ? 'pause' : 'play'"
          :color="accentColor"
          tooltip-text="Play/Pause"
          tooltip-location="top"
          tooltip-offset="5px"
        ></icon-button>
        <input
          type="range"
          id="time-slider"
          min="0"
          max="720"
          :oninput="onInputChange"
        />
      </div>
      <div id="project-credits">
        <div id="icons-container">
          <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer"
          ><img alt="CosmicDS Logo" src="../../assets/cosmicds_logo_for_dark_backgrounds.png"
          /></a>
          <a href="https://worldwidetelescope.org/home/" target="_blank" rel="noopener noreferrer"
            ><img alt="WWT Logo" src="../../assets/logo_wwt.png"
          /></a>
          <a href="https://science.nasa.gov/learners" target="_blank" rel="noopener noreferrer" class="pl-1"
            ><img alt="SciAct Logo" src="../../assets/logo_sciact.png"
          /></a>
          <a href="https://nasa.gov/" target="_blank" rel="noopener noreferrer" class="pl-1"
            ><img alt="SciAct Logo" src="../../assets/NASA_Partner_color_300_no_outline.png"
          /></a>
        </div>
      </div>
    </div>


    <!-- This dialog contains the video that is displayed when the video icon is clicked -->

    <v-dialog
      id="video-container"
      v-model="showVideoSheet"
      transition="slide-y-transition"
      fullscreen
    >
      <div class="video-wrapper">
        <font-awesome-icon
          id="video-close-icon"
          class="close-icon"
          icon="times"
          size="lg"
          @click="showVideoSheet = false"
          @keyup.enter="showVideoSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <video
          controls
          id="info-video"
        >
          <source src="" type="video/mp4">
        </video>
      </div>
    </v-dialog>


    <!-- This dialog contains the informational content that is displayed when the book icon is clicked -->

    <v-dialog
      :style="cssVars"
      class="bottom-sheet"
      id="text-bottom-sheet"
      hide-overlay
      persistent
      no-click-animation
      absolute
      width="100%"
      :scrim="false"
      location="bottom"
      v-model="showTextSheet"
      transition="dialog-bottom-transition"
    >
      <v-card height="100%">
        <v-tabs
          v-model="tab"
          height="32px"
          :color="accentColor"
          :slider-color="accentColor"
          id="tabs"
          dense
          grow
        >
          <v-tab tabindex="0"><h3>Information</h3></v-tab>
          <v-tab tabindex="0"><h3>Using WWT</h3></v-tab>
        </v-tabs>
        <font-awesome-icon
          id="close-text-icon"
          class="control-icon"
          icon="times"
          size="lg"
          @click="showTextSheet = false"
          @keyup.enter="showTextSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <v-window v-model="tab" id="tab-items" class="pb-2 no-bottom-border-radius">
          <v-window-item>
            <v-card class="no-bottom-border-radius scrollable">
              <v-card-text class="info-text no-bottom-border-radius">
                Information goes here
              </v-card-text>
            </v-card>
          </v-window-item>
          <v-window-item>
            <v-card class="no-bottom-border-radius scrollable">
              <v-card-text class="info-text no-bottom-border-radius">
                <v-container>
                  <v-row align="center">
                  <v-col cols="4">
                      <v-chip
                        label
                        outlined
                      >
                        Pan
                      </v-chip>
                    </v-col>
                    <v-col cols="8" class="pt-1">
                      <strong>{{ touchscreen ? "press + drag" : "click + drag" }}</strong>  {{ touchscreen ? ":" : "or" }}  <strong>{{ touchscreen ? ":" : "W-A-S-D" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                    </v-col>
                  </v-row>
                  <v-row align="center">
                    <v-col cols="4">
                      <v-chip
                        label
                        outlined
                      >
                        Zoom
                      </v-chip>
                    </v-col>
                    <v-col cols="8" class="pt-1">
                      <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong> {{ touchscreen ? ":" : "or" }} <strong>{{ touchscreen ? ":" : "I-O" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <div class="credits">
                      <h3>Credits:</h3>
                      <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">CosmicDS</a> Mini Stories Team:</h4>
                      John Lewis<br>
                      Jon Carifio<br>
                      Pat Udomprasert<br>
                      Alyssa Goodman<br>
                      Mary Dussault<br>
                      Harry Houghton<br>
                      Anna Nolin<br>
                      Evaluator: Sue Sunbury<br>
                      <br>
                      <h4>WorldWide Telescope Team:</h4>
                      Peter Williams<br>
                      A. David Weigel<br>
                      Jon Carifio<br>
                      </div>
                      <v-spacer class="end-spacer"></v-spacer>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <funding-acknowledgement/>
                    </v-col>
                  </v-row>
                </v-container>              
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-card>
    </v-dialog>

  </div>
</v-app>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets, D2R } from "@minids/common";
import { Annotation, Color, PolyLine, SpaceTimeController, SpreadSheetLayer } from "@wwtelescope/engine";

// Coordinates isn't exposed to TypeScript, but it IS exported at the JS module level,
// so it's enough to do this. We just won't get any LSP help from an editor.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Coordinates } from "@wwtelescope/engine";
import { GotoRADecZoomParams } from "@wwtelescope/engine-pinia";
import { AltTypes, AltUnits, MarkerScales, RAUnits } from "@wwtelescope/engine-types";

import sunCsv from "./assets/Sun_radec.csv";
import bestFitCsv from "./assets/RW_best_fit_oscillation_phase_radec_downsampled.csv";

type SheetType = "text" | "video" | null;

// A hack, but we don't need anything more than this
type Row = Record<string, number>;

const SECONDS_PER_DAY = 86400;

export default defineComponent({
  extends: MiniDSBase,
  
  props: {
    wwtNamespace: {
      type: String,
      required: true
    },
    initialCameraParams: {
      type: Object as PropType<Omit<GotoRADecZoomParams, 'instant'>>,
      default() {
        return {
          raRad: 271.87846654 * D2R,
          decRad: -48.42 * D2R,
          zoomDeg: 289555092.0 * 6
        };
      }
    }
  },
  data() {
    const phaseOpacitySlope = -1 / 80;
    const phaseOpacityIntercept = 1 - phaseOpacitySlope * 100;
    return {
      showSplashScreen: true,
      backgroundImagesets: [] as BackgroundImageset[],
      sheet: null as SheetType,
      layersLoaded: false,
      positionSet: false,
      
      accentColor: "#ffffff",

      tab: 0,
      playing: false,
      timeRate: 120 * SECONDS_PER_DAY,

      phase: 0,
      altFactor: 1,
      phaseCol: 3,

      bestFitLayer: new SpreadSheetLayer(),
      bestFitAnnotation: null as PolyLine | null,
      bestFitColor: "#83befb",

      phaseOpacitySlope,
      phaseOpacityIntercept,
      clusterColor: "#1f3cf1",
      clusterLayers: [] as SpreadSheetLayer[],

      sunColor: "#ffff0a",
      sunLayer: null as SpreadSheetLayer | null,

      startTime: new Date("2023-10-18 11:55:55Z"),
      endTime: new Date("2025-10-06 11:55:55Z")
    };
  },

  mounted() {
    this.waitForReady().then(async () => {
      
      this.backgroundImagesets = [...skyBackgroundImagesets];

      this.setBackgroundImageByName("Solar System");
      this.setForegroundImageByName("Solar System");

      this.gotoRADecZoom({
        ...this.initialCameraParams,
        instant: true
      }).then(() => this.positionSet = true);

      this.applySetting(["showConstellationBoundries", false]);  // Note that the typo here is intentional
      this.applySetting(["solarSystemStars", false]);
      this.applySetting(["actualPlanetScale", true]);
      this.applySetting(["showConstellationFigures", false]);
      this.applySetting(["showCrosshairs", false]);

      this.setupBestFitLayer();
      const sunPromise = this.setupSunLayer();
      const clustersPromise = this.setupClusterLayers();

      Promise.all([sunPromise, clustersPromise]).then(([sunLayer, clusterLayers]) => {
        this.sunLayer = sunLayer;
        this.clusterLayers = clusterLayers;
        this.setTime(this.startTime);
        this.updateSlider(this.phase);
        window.requestAnimationFrame(this.onAnimationFrame);

        this.layersLoaded = true;
      });

    });
  },

  computed: {

    /**
    These properties relate to the state of the mini.
    `isLoading` is a bit redundant here, but it could potentially have
    independent logic.
    */
    ready(): boolean {
      return this.layersLoaded && this.positionSet;
    },
    isLoading(): boolean {
      return !this.ready;
    },

    /**
    Properties related to device/screen characteristics
    */
    smallSize(): boolean {
      return this.$vuetify.display.smAndDown;
    },
    mobile(): boolean {
      return this.smallSize && this.touchscreen;
    },

    /**
    This lets us inject component data into element CSS
    */
    cssVars() {
      return {
        '--accent-color': this.accentColor,
        '--app-content-height': this.showTextSheet ? '66%' : '100%',
      };
    },

    /**
    Computed flags that control whether the relevant dialogs display.
    The `sheet` data member stores which sheet is open, so these are just
    computed wrappers around modifying/querying that which can be used as
    dialog v-model values
    */
    showTextSheet: {
      get(): boolean {
        return this.sheet === 'text';
      },
      set(_value: boolean) {
        this.selectSheet('text');
      }
    },
    showVideoSheet: {
      get(): boolean {
        return this.sheet === "video";
      },
      set(value: boolean) {
        this.selectSheet('video');
        if (!value) {
          const video = document.querySelector("#info-video") as HTMLVideoElement;
          video.pause();
        }
      }
    }
  },

  methods: {
    closeSplashScreen() {
      this.showSplashScreen = false; 
    },

    selectSheet(name: SheetType) {
      if (this.sheet === name) {
        this.sheet = null;
        this.$nextTick(() => {
          this.blurActiveElement();
        });
      } else {
        this.sheet = name;
      }
    },

    // WWT isn't actually using the phase -
    // it's using the start/end times that were constructed from it.
    // This means that to get the current phase, we need to extract it
    // from the WWT clock.
    getCurrentPhaseInfo(): [number, number] {
      const start = this.startTime.getTime();
      // Call this rather than using wwtCurrentTime since the changes there take time to propagate
      const now = SpaceTimeController.get_now().getTime();
      const interval = 8.64e7;  // 1 day in ms
      const intervals = Math.floor((now - start) / interval);
      return [Math.floor(intervals / 360), intervals % 360];
    },

    onAnimationFrame(_timestamp: DOMHighResTimeStamp) {
      if (this.playing) {
        if (this.wwtCurrentTime >= this.endTime) {
          this.setTime(this.startTime);
        }
        const [period, phase] = this.getCurrentPhaseInfo();
        this.updateBestFitAnnotation(phase);
        this.phase = period * 360 + phase;
      } else {
        this.updateBestFitAnnotation(this.phase % 360);
      }
      window.requestAnimationFrame(this.onAnimationFrame);
    },

    basicLayerSetup(layer: SpreadSheetLayer, timeSeries=false) {
      layer.set_lngColumn(0);
      layer.set_latColumn(1);
      layer.set_altColumn(2);
      layer.set_raUnits(RAUnits.degrees);
      layer.set_altUnit(AltUnits.parsecs);
      layer.set_altType(AltTypes.distance);
      layer.set_showFarSide(true);
      layer.set_markerScale(MarkerScales.screen);
    
      if (timeSeries) {
        layer.set_startDateColumn(4);
        layer.set_endDateColumn(5);
        layer.set_timeSeries(true);
        layer.set_decay(15);
      }
    },

    async setupSunLayer(): Promise<SpreadSheetLayer> {
      return this.createTableLayer({
        referenceFrame: "Sky",
        name: "Radcliffe Wave Sun",
        dataCsv: sunCsv
      }).then(layer => {
        this.basicLayerSetup(layer);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["color", Color.load(this.sunColor)],
            ["scaleFactor", 100]
          ]
        });
        return layer;
      });
    },

    // Note that we are NOT going to show this layer
    // (we aren't even going to put it in the layer manager)
    // But by doing this we can both hijack WWT's CSV-parsing functionality
    // as well as get the scale factor that we need for scaling the annotation points
    setupBestFitLayer() {
      const text = bestFitCsv.replace(/\n/g, "\r\n");
      // This isn't exposed to TS
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.bestFitLayer.loadFromString(text, false, false, false, true);
      this.basicLayerSetup(this.bestFitLayer, true);

      // Another method that's not exposed to TS
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.altFactor = this.bestFitLayer.getScaleFactor(this.bestFitLayer.get_altUnit(), 1);
      this.altFactor = this.altFactor / (1000 * 149598000);
    },

    addLayerPointsToAnnotation(layer: SpreadSheetLayer, annotation: Annotation, rowFilter: (row: Row) => boolean) {
      const lngCol = layer.get_lngColumn();
      const latCol = layer.get_latColumn();
      const dCol = layer.get_altColumn();
      const ecliptic = Coordinates.meanObliquityOfEcliptic(SpaceTimeController.get_jNow()) / 180 * Math.PI;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const rows: Row[] = layer.get__table().rows;
      for (const row of rows) {
        if (!rowFilter(row)) {
          continue;
        }
    
        // The API for annotations seem to assume that we're in 2D sky mode - there's no option for distance
        // so we have to calculate our positions in 3D and just directly insert them into the array of points.
        // This of course necessitates some TypeScript hackery.
        // These calculations are stolen from around here: https://github.com/Carifio24/wwt-webgl-engine/blob/master/engine/esm/layers/spreadsheet_layer.js#L706
        let alt = row[dCol];
        alt = (this.altFactor * alt);
        const pos = Coordinates.geoTo3dRad(row[latCol], row[lngCol], alt);
        pos.rotateX(ecliptic);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        annotation._points$1.push(pos);
      }
    },

    updateBestFitAnnotation(phase: number): void {
      if (this.bestFitAnnotation !== null) {
        this.removeAnnotation(this.bestFitAnnotation);
      }
      this.bestFitAnnotation = new PolyLine();
      this.bestFitAnnotation.set_lineColor(this.bestFitColor);
      this.addLayerPointsToAnnotation(this.bestFitLayer, this.bestFitAnnotation, (row: Row) => row[this.phaseCol] == phase);
      this.addAnnotation(this.bestFitAnnotation);
    },

    opacityForPhase(phase: number): number {
      const adjustedPhase = 180 - Math.abs(180 - phase);
      if (adjustedPhase <= 100) {
        return 1;
      }
      return Math.min(Math.max(this.phaseOpacitySlope * adjustedPhase + this.phaseOpacityIntercept, 0), 1);
    },

    async setupClusterLayers(): Promise<SpreadSheetLayer[]> {
      const color = Color.load(this.clusterColor);
      const promises: Promise<SpreadSheetLayer>[] = [];
      for (let phase = 0; phase < 360; phase++) {
        let text = (await import(`./assets/RW_cluster_oscillation_${phase}_updated_radec.csv`)).default;
        text = text.replace(/\n/g, "\r\n");
        const prom = this.createTableLayer({
          referenceFrame: "Sky",
          name: `Radcliffe Wave Clusters Phase ${phase}`,
          dataCsv: text
        }).then(layer => {
          this.basicLayerSetup(layer, true);
          layer.set_opacity(this.opacityForPhase(phase));
          layer.set_color(color);
          layer.set_scaleFactor(70);
          return layer;
        });
        promises.push(prom); 
      }
      return Promise.all(promises);
    },

    onInputChange(event: InputEvent) {
      this.playing = false;
      const target = event.target as HTMLInputElement;
      const value = Number(target.value);
      if (!isNaN(value)) {
        this.phase = Math.max(0, Math.min(value, 720)); 
      }
    },

    updateSlider(value: number) {
      const input = document.querySelector("#time-slider");
      if (input) {
        const slider = input as HTMLInputElement;
        slider.value = String(value);
      }
    },

  },

  watch: {
    phase(value: number) {
      const start = this.startTime.getTime();
      const end = this.endTime.getTime();
      const time = start + (value / 720) * (end - start);
      this.setTime(new Date(time));
      this.updateSlider(value);
    },

    playing(play: boolean) {
      this.setClockSync(play);
      this.setClockRate(play ? this.timeRate : 0);
    }
  }
});
</script>

<style lang="less">
@font-face {
  font-family: "Highway Gothic Narrow";
  src: url("../../assets/HighwayGothicNarrow.ttf");
}


/* Overall page styling */
html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;

  overflow: hidden;
  -ms-overflow-style: none;

  // We don't want a scrollbar for the overall canvas
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
}

body {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;

  font-family: Verdana, Arial, Helvetica, sans-serif;
}


/*
  The main content of the mini.
  The --app-content-height allows the app to shrink when the text is open
 */
#main-content {
  position: fixed;
  width: 100%;
  height: var(--app-content-height);
  overflow: hidden;

  transition: height 0.1s ease-in-out;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  font-size: 11pt;

  .wwtelescope-component {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    border-style: none;
    border-width: 0;
    margin: 0;
    padding: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}


/* The modal loading window */
.modal {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 100;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

#modal-loading {
  background-color: #000;
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    .spinner {
      background-image: url("../../assets/lunar_loader.gif");
      background-repeat: no-repeat;
      background-size: contain;
      width: 3rem;
      height: 3rem;
    }
    p {
      margin: 0 0 0 1rem;
      padding: 0;
      font-size: 150%;
    }
  }
}

#modal-readytostart {
  cursor: pointer;
  color: #999;

  &:hover {
    color: #2aa5f7;
  }

  div {
    margin: 0;
    padding: 0;
    background-image: url("../../assets/wwt_globe_bg.png");
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    width: 20rem;
    height: 20rem;
    max-width: 70%;
    max-height: 70%;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      width: 60%;
      height: 60%;
      margin-left: 14%;
      margin-top: 3%;
    }
  }
}


/* Top and bottom content */
.top-content {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.bottom-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  align-items: center;
  gap: 5px;
}

#left-buttons, #right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Splash screen */
#splash-overlay {
  position: fixed;
  align-items: center;
  justify-content: center;
  font-size: min(8vw, 7vh);
}

#splash-screen {
  max-height: calc(min(90vh, 2040px));
  max-width: 90vw;
  background-color: black;
  backdrop-filter: blur(5px);
  justify-content: space-around;
  align-content: center;

  border-radius: 10%;
  border: min(1.2vw, 0.9vh) solid var(--accent-color);
  overflow: auto;
  font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
}

#project-credits {
  color: #ddd;
  font-size: calc(0.7em + 0.2vw);
  justify-self: flex-end;
  align-self: flex-end;
  display: flex;
  justify-content: center;
  align-items: center;

  p {
    margin: 0;
    padding: 0;
    line-height: 1;
  }

  a {
    text-decoration: none;
    color: #fff;
    pointer-events: auto;

    &:hover {
      text-decoration: underline;
    }

    &[class^="share-network"]:hover {
      text-decoration: none;
      filter: brightness(75%);
    }
  }

  img {
    height: 35px;
    vertical-align: middle;
    margin: 2px;
  }

  @media only screen and (max-width: 600px) {
  img {
    height: 24px;
  }
}

  svg {
    vertical-align: middle;
    height: 24px;
  }
}

/* Video and text dialogs */
.video-wrapper {
  height: 100%;
  background: black;
  text-align: center;
  z-index: 1000;
}

video {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

#video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0px;
  z-index: 1000;
}

.bottom-sheet {
  .v-overlay__content {
    align-self: flex-end;
    padding: 0;
    margin: 0;
    max-width: 100%;
    height: 34%;
  }
}

#tabs {
  width: calc(100% - 3em);
  align-self: left;
}

.info-text {
  height: 33vh;
  padding-bottom: 25px;

  & a {
    text-decoration: none;
  }
}


/* Miscellaneous class styling */
.close-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 15;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: white;
    border: 2px solid white;
  }
}

.pointer {
  cursor: pointer;
}

.control-icon {
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

}

.scrollable {
  overflow-y: auto;
}

.no-bottom-border-radius {
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}


/*
  These last few blocks contain some hackery related to the text tabs.
  The close icon isn't part of the standard v-tabs setup, so we need to
  create some space for that ourselves.
 */
#tab-items {
  // padding-bottom: 2px !important;

  .v-card-text {
    font-size: ~"max(14px, calc(0.7em + 0.3vw))";
    padding-top: ~"max(2vw, 16px)";
    padding-left: ~"max(4vw, 16px)";
    padding-right: ~"max(4vw, 16px)";

    .end-spacer {
      height: 25px;
    }
  }

}

#close-text-icon {
  position: absolute;
  top: 0.25em;
  right: calc((3em - 0.6875em) / 3); // font-awesome-icons have width 0.6875em
  color: white;
}

// This prevents the tabs from having some extra space to the left when the screen is small
// (around 400px or less)
.v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next, .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
  display: none;
}

#time-controls {
  width: 100%;
  display: flex;
}

#time-slider {
  width: 100%;
  pointer-events: auto;
}
</style>