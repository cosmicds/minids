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
    
    
    <wwt-hud
      v-if="false"
      :wwt-namespace="wwtNamespace"
      :location="{top: '5rem', right: '1rem'}"
      :offset-center="{x: 0, y: 0}"
      :other-variables="{position3D: position3D, position2D: position2D, mode: modeReactive}"
      text-shadow="none"
      font-size="0.8em"
    ></wwt-hud>

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
        <div
          id="close-splash-button"
          @click="closeSplashScreen"
          >&times;
        </div>
        <div id="splash-screen-text">
          <p>
            Want to surf a <span 
            :style="{'color': accentColor}"
            >giant wave</span> in the Milky Way Galaxy? 
            <!-- see the <span style="color: red;">Radcliffe Wave</span> <span class="color-span">oscillating</span> through our Galaxy? -->
          </p>
        </div>
        <div id="splash-screen-acknowledgements">
          This Mini Data Story is brought to you by <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">Cosmic Data Stories</a> and <a href="https://www.worldwidetelescope.org/home/" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a>.
          
          <div id="splash-screen-logos">
            <credit-logos/>
          </div>
        </div>
      </div>
    </v-overlay>

    <transition>
      <div
        v-if="false"
        class="no-background">
      </div>
      <div
        v-else
        :class="['modal', showSplashScreen ? 'no-background' : '']"
        id="modal-loading"
        v-show="isLoading || userNotReady"
      >
        <div v-if="isLoading" class="container">
          <div  class="spinner"></div>
          <p>Loading …</p>
        </div>
        <div v-else>
          <v-btn
            v-if="!showSplashScreen"
            id="loading-button"
            color="white"
            :disabled="isLoading"
            variant="outlined"
            @click="userNotReady = false"
            @keyup.enter="userNotReady = false"
            elevation="10"
            :size="smallSize ? 'large' : 'x-large'"
            rounded="lg"
            prepend-icon="mdi-check-circle-outline"
          >
            <strong>Start</strong>
          </v-btn>
        </div>  
      </div>
    </transition>

    <!-- This block contains the elements (e.g. icon buttons displayed at/near the top of the screen -->

    <div class="top-content">
      <div v-if="modeReactive != null" id="left-buttons">
        <icon-button
          v-model="showTextSheet"
          fa-icon="book-open"
          :color="buttonColor"
          :tooltip-text="showTextSheet ? 'Hide Info' : 'Learn More'"
          tooltip-location="start"
        >
        </icon-button>
        <icon-button
          v-model="showVideoSheet"
          fa-icon="video"
          :color="buttonColor"
          tooltip-text="Watch video"
          tooltip-location="start"
        >
        </icon-button>
        
      </div>
      <div id="center-buttons">
<!-- <p class="pointer-events"> {{ wwtPosition }} </p> -->
        <icon-button
          v-if="false"
          md-icon="mdi-sine-wave"
          @activate="toggleFullwaveMode()"
          :color="buttonColor"
          tooltip-text="Full Wave Mode"
          tooltip-location="bottom"
        >
        <template v-slot:button>
          <span v-if="modeReactive != 'full'" class="no-select">View the Full Radcliffe Wave</span>
          <v-icon v-if="modeReactive == 'full'">mdi-arrow-left</v-icon>
        </template>
        </icon-button>
        
        <icon-button
          v-if="(playCount > 0) ?? (modeReactive == 'full')"
          @activate="modeReactive = modeReactive == '3D' ? '2D' : '3D'"
          :color="buttonColor"
          tooltip-text="Switch modes"
          tooltip-location="start"
        >
        <template v-slot:button>
          <span class="no-select">See this {{ modeReactive == '3D' ? ' on the Sky (2D)' : 'in the Galaxy (3D)' }}</span>
        </template>
        </icon-button>
        <icon-button
          md-icon="mdi-refresh"
          @activate="positionReset"
          :color="buttonColor"
          tooltip-text="Reset this view"
          tooltip-location="start"
        ></icon-button>
        
        
        
      </div>
      <div id="right-buttons">
                <!-- add a menu selector for background2DImageset -->
      </div>
    </div>


    <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->

    <div class="bottom-content">
      <div v-if="modeReactive != '2D'" id="time-controls">
        <icon-button
          v-model="playing"
          :fa-icon="playing ? 'pause' : 'play'"
          :color="buttonColor"
          tooltip-text="Play/Pause"
          tooltip-location="top"
          tooltip-offset="5px"
        >
        <template v-slot:button>
          <span class="no-select">{{ playing ? 'Pause' : 'Replay' }} the Wave!</span>
        </template>
      </icon-button>
        <input
          type="range"
          id="time-slider"
          min="0"
          max="720"
          :oninput="onInputChange"
        />
      </div>
      <div v-else id="time-controls" style="width:50%">
        <v-select
          v-if="modeReactive == '2D'"
          v-model="background2DImageset"
          :items="allSkyImagesets"
          label="Background"
          outlined
          hide-details
          :color="accentColor"
          class="pointer-events"
          />
      </div>
      <div id="body-logos" v-if= "!smallSize">
        <credit-logos/>
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
        >
          <v-tab class="info-tabs" tabindex="0"><h3>Information</h3></v-tab>
          <v-tab class="info-tabs" tabindex="0"><h3>Using WWT</h3></v-tab>
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
import { Annotation, Color, PolyLine, SpaceTimeController, SpreadSheetLayer, WWTControl } from "@wwtelescope/engine";

// Coordinates isn't exposed to TypeScript, but it IS exported at the JS module level,
// so it's enough to do this. We just won't get any LSP help from an editor.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Coordinates } from "@wwtelescope/engine";
import { GotoRADecZoomParams } from "@wwtelescope/engine-pinia";
import { AltTypes, AltUnits, MarkerScales, RAUnits } from "@wwtelescope/engine-types";

import { zoom } from "./wwt-hacks";

import sunCsv from "./assets/Sun_radec.csv";
import bestFitCsv from "./assets/radwave/RW_best_fit_oscillation_phase_radec_downsampled.csv";

function asyncSetTimeout<R>(func: () => R , ms: number): Promise<R> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(func()), ms);
  });
}

function asyncWaitForCondition(func: () => boolean, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (func()) {
        clearInterval(interval);
        resolve();
      }
    }, ms);
  });
}

type SheetType = "text" | "video" | null;

// A hack, but we don't need anything more than this
type Row = Record<string, number>;

const SECONDS_PER_DAY = 86400;

let bestFitAnnotations: PolyLine[] = [];
const bestFitOffsets3D = [-2, -1, 0, 1, 2];
const bestFitOffsets2D = [0];
let bestFitOffsets = bestFitOffsets3D ;
const bestFitLayer = new SpreadSheetLayer();
const startDate = new Date("2023-10-18 11:55:55Z");
const endDate = new Date("2025-10-06 11:55:55Z");
const startTime = startDate.getTime();
const endTime = endDate.getTime();

let phase = 0;
let altFactor = 1;
let mode = "3D" as "2D" | "3D" | "full" | null;

const phaseRowCount = 300;

function getCurrentPhaseInfo(): [number, number] {
  const now = SpaceTimeController.get_now().getTime();
  const interval = 8.64e7;  // 1 day in ms
  const intervals = Math.floor((now - startTime) / interval);
  return [Math.floor(intervals / 360), intervals % 360];
}

function updateBestFitAnnotations(phase: number): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  bestFitAnnotations.forEach(ann => WWTControl.scriptInterface.removeAnnotation(ann));
  bestFitAnnotations = [];
  bestFitOffsets.forEach(offset => {
    const offsetPhase = (phase + offset) % 360;
    const ann = new PolyLine();
    ann.set_lineColor("#83befb");
    addPhasePointsToAnnotation(bestFitLayer, ann, offsetPhase);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    WWTControl.scriptInterface.addAnnotation(ann);
    bestFitAnnotations.push(ann);
  });
}


function addPhasePointsToAnnotation(layer: SpreadSheetLayer, annotation: Annotation, phase: number) {
  const lngCol = layer.get_lngColumn();
  const latCol = layer.get_latColumn();
  const dCol = layer.get_altColumn();
  const ecliptic = Coordinates.meanObliquityOfEcliptic(SpaceTimeController.get_jNow()) / 180 * Math.PI;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const rows: Row[] = layer.get__table().rows.slice(phase * phaseRowCount, (phase + 1) * phaseRowCount);
  for (const row of rows) {
    // The API for annotations seem to assume that we're in 2D sky mode - there's no option for distance
    // so we have to calculate our positions in 3D and just directly insert them into the array of points.
    // This of course necessitates some TypeScript hackery.
    // These calculations are stolen from around here: https://github.com/Carifio24/wwt-webgl-engine/blob/master/engine/esm/layers/spreadsheet_layer.js#L706
    let alt = row[dCol];
    alt = (altFactor * alt);
    const pos = Coordinates.geoTo3dRad(row[latCol], row[lngCol], alt);
    if (mode == "3D") {
      pos.rotateX(ecliptic);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    annotation._points$1.push(pos);
  }
}



function updateSlider(value: number) {
  const input = document.querySelector("#time-slider");
  if (input) {
    const slider = input as HTMLInputElement;
    slider.value = String(value);
  }
}

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
    const initialOpacity = 0.5;
    const fadeStartPhase = 100;
    const fadeEndPhase = 180;
    const phaseOpacitySlope = -initialOpacity / (fadeEndPhase - fadeStartPhase);
    const phaseOpacityIntercept = initialOpacity * fadeEndPhase / (fadeEndPhase - fadeStartPhase);
    const initial2DPosition = {
      raRad: 6,
      decRad: 1,
      zoomDeg: 360
    } as Omit<GotoRADecZoomParams,'instant'>;
    
    const fullwavePosition = {
      raRad: 0.6984155220905679, 
      decRad: 0.7132099678793872, 
      rollRad: 0.183,
      zoomDeg: 360,
      instant: true
    }  as GotoRADecZoomParams;
    
    return {
      showSplashScreen: true,
      backgroundImagesets: [] as BackgroundImageset[],
      sheet: null as SheetType,
      layersLoaded: false,
      positionSet: false,
      
      userNotReady: true,

      
      accentColor: "#427cff",
      accentColor2: "#FF0000",
      buttonColor: "#ffffff",

      tab: 0,
      playing: false,
      timeRate: 120 * SECONDS_PER_DAY,
      playCount: 0,

      phaseCol: 3,
      clusterLayers: [] as SpreadSheetLayer[],

      initialOpacity,
      fadeStartPhase,
      fadeEndPhase,
      phaseOpacitySlope,
      phaseOpacityIntercept,
      clusterColor: "#1f3cf1",
      defaultClusterDecay: 5,

      sunColor: "#ffff0a",
      sunLayer: null as SpreadSheetLayer | null,
      
      modeReactive: mode as "2D" | "3D" | "full" | null,
      resizeObserver: null as ResizeObserver | null,
      background2DImageset: "Deep Star Maps 2020",
      position3D: this.initialCameraParams as Omit<GotoRADecZoomParams,'instant'>,
      position2D: initial2DPosition as Omit<GotoRADecZoomParams,'instant'>,
      initial2DPosition,
      allSkyImagesets: [
        'Deep Star Maps 2020', 
        'Mellinger color optical survey',  // HIPS
        "Gaia DR2",
        'Digitized Sky Survey (Color)',
        'unWISE color, from W2 and W1 bands', // HIPS
        'WISE All Sky (Infrared)',
        'Planck Thermal Dust',
        'Hydrogen Alpha Full Sky Map',
        "PLANCK R2 HFI color composition 353-545-857 GHz", // HIPS
      ],
      previousMode: mode as "2D" | "3D" | "full" | null,
      fullwavePosition: fullwavePosition,


      minZoom: 160763995.5927744,
      maxZoom: 22328103718.39476
    };
  },

  mounted() {
    this.waitForReady().then(async () => {
      
      this.backgroundImagesets = [...skyBackgroundImagesets];
      
      // initialize the view to black so that we don't flicker DSS
      this.applySetting(["galacticMode", true]);
      this.loadHipsWTML().then(() => {
        console.log('init set3DMode');
        return this.set3DMode();
      }).then(() => this.positionSet = true);

      this.applySetting(["showConstellationBoundries", false]);  // Note that the typo here is intentional
      this.applySetting(["solarSystemStars", false]);
      this.applySetting(["actualPlanetScale", true]);
      this.applySetting(["showConstellationFigures", false]);
      this.applySetting(["showCrosshairs", false]);
      this.applySetting(["solarSystemCosmos", false]);
      // this.applySetting(["solarSystemPlanets", false]);
      this.setClockSync(false);

      this.setupBestFitLayer();
      const sunPromise = this.setupSunLayer();
      const clusterPromise = this.setupClusterLayers();

      Promise.all([sunPromise, clusterPromise]).then(([sunLayer, clusterLayers]) => {
        this.sunLayer = sunLayer;
        this.clusterLayers = clusterLayers;
        this.setTime(startDate);
        updateSlider(phase);
        window.requestAnimationFrame(this.onAnimationFrame);
        this.layersLoaded = true;
      });
      
    });
    this.resizeObserver = new ResizeObserver((_entries) => {
      this.shinkWWT();
    });

    // Pin the min and max zoom in 3D mode
    WWTControl.singleton.setSolarSystemMinZoom(this.minZoom);
    WWTControl.singleton.setSolarSystemMaxZoom(this.maxZoom);

    // Patch the zoom function to account for min zoom as well
    // See upstream fix at https://github.com/WorldWideTelescope/wwt-webgl-engine/pull/292
    WWTControl.singleton.zoom = zoom.bind(WWTControl.singleton);
    
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
    },
    
    wwtPosition(): Omit<GotoRADecZoomParams,'instant'> {
      return {
        raRad: this.wwtRARad,
        decRad: this.wwtDecRad,
        rollRad: this.wwtRollRad,
        zoomDeg: this.wwtZoomDeg,
      };
    }
  },

  methods: {
    closeSplashScreen() {
      this.showSplashScreen = false; 
      // Promise based wait for isLoading to be false
      asyncWaitForCondition(() => (!this.isLoading && !this.userNotReady), 100).then(() => {
        setTimeout(() => {
          this.playing = true;
        }, 500);
      });
      
    },
    
    async loadHipsWTML () {
      return this.loadImageCollection({
        url: "https://raw.githubusercontent.com/cosmicds/cds-website/main/public/wwt-content/radwave-wtml/hips.wtml",
        loadChildFolders: true,
      });
    },

    set2DMode() {
      
      bestFitOffsets = bestFitOffsets2D;
      this.clusterLayers.forEach(layer => {
        layer.set_decay(1);
      });
      
      this.setBackgroundImageByName(this.background2DImageset);
      this.applySetting(["showSolarSystem", false]);
      this.sunLayer?.set_opacity(0);
      this.playing = false;
      phase = 0;
      updateSlider(phase);
      updateBestFitAnnotations(phase);    
      this.setTime(startDate);

      return asyncSetTimeout(() => {
        
        this.gotoRADecZoom({
          ...this.position2D,
          instant: true
        }).catch((err) => {
          console.log(err);
        
        }); 
      }, 100);

    },
    
    set3DMode() {

      
      bestFitOffsets = bestFitOffsets3D;
      this.clusterLayers.forEach(layer => {
        layer.set_decay(this.defaultClusterDecay);
      });
      

      this.setBackgroundImageByName("Solar System");
      this.setForegroundImageByName("Solar System");
      this.sunLayer?.set_opacity(1);
      updateBestFitAnnotations(phase);


      return this.gotoRADecZoom({
        ...this.position3D,
        instant: true,
      }).catch((err) => {
        console.log(err);
      });

      
    },
    
    async toggleFullwaveMode() {
      // to view in the full wave you need to adjust the height
      // of the window/canvas to have an W:H ration of 5.7
      let old3D = null as unknown as Omit<GotoRADecZoomParams,'instant'>;
      if (this.modeReactive == 'full') {
        this.modeReactive = this.previousMode;
        this.positionReset();
        return;
      } else if (this.modeReactive == '3D') {
        old3D = this.wwtPosition;
      }
      
      return this.set2DMode().then(() => {
        this.previousMode = this.modeReactive;
        this.modeReactive = "full";
        phase=0;
        
        this.shinkWWT();
        this.resizeObserver?.observe(document.body);
        
        return this.gotoRADecZoom({
          ...this.fullwavePosition, 
          instant: false}).catch((err) => {
          console.log(err);
        }).then(() => {
          if (old3D) {this.position3D = old3D;}
        });
      });
      
    }, 
    
    toggleUI() {
      // toggle visibility of class .bottom-content using opacity
      const bottomContent = document.querySelector(".bottom-content") as HTMLElement;
      const op = bottomContent.style.opacity;
      if (op == "0") {
        bottomContent.style.opacity = "1";
      } else {
        bottomContent.style.opacity = "0";
      }
      
      // now for top-content
      const topContent = document.querySelector(".top-content") as HTMLElement;
      const op2 = topContent.style.opacity;
      if (op2 == "0") {
        topContent.style.opacity = "1";
      } else {
        topContent.style.opacity = "0";
      }
    },
    
    positionReset() {
      // since we aren't changing modes, 
      // we don't need to use set2DMode or set3DMode
      // also those are locked to only work if the mode is chaning
      // so we let's do this manually. 
      
      // only reset the current mode
      let pos = null as unknown as Omit<GotoRADecZoomParams, "instant">;
      if (this.modeReactive == "2D") {
        this.position2D = this.initial2DPosition;
        pos = this.position2D;
        
      } else if (this.modeReactive == "3D") {
        this.position3D = this.initialCameraParams;
        pos = this.position3D;
      } else if (this.modeReactive == 'full') {
        pos = this.fullwavePosition;
      }
      
      // we will move nicely. 
      this.gotoRADecZoom({
        ...pos,
        instant: false
      }).catch((err) => {
        console.log(err);
      });
      
      
    },
    
    shinkWWT(aspect: number = null as unknown as number) {
      // default aspect = 5.7
      if (aspect == null) {
        aspect = 5.7;
      }
      console.log('shinkWWT');
      
      const mainContent = document.querySelector(".wwtelescope-component") as HTMLElement;
      const width = mainContent.clientWidth;
      const height = width / aspect;
      mainContent.style.height = `${height}px`;
    },
    
    growWWT() {
      const mainContent = document.querySelector(".wwtelescope-component") as HTMLElement;
      mainContent.style.height = `100%`;
      this.resizeObserver?.unobserve(document.body as HTMLElement);
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
        layer.set_decay(this.defaultClusterDecay);
      }
    },

    async setupSunLayer(): Promise<SpreadSheetLayer> {
      const text = sunCsv.replace(/\n/g, "\r\n");
      return this.createTableLayer({
        referenceFrame: "Sky",
        name: "Radcliffe Wave Sun",
        dataCsv: text
      }).then(layer => {
        this.basicLayerSetup(layer, true);
        layer.set_decay(1);
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
      bestFitLayer.loadFromString(text, false, false, false, true);
      this.basicLayerSetup(bestFitLayer, true);

      // Another method that's not exposed to TS
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore

      altFactor = bestFitLayer.getScaleFactor(bestFitLayer.get_altUnit(), 1);
      altFactor = altFactor / (1000 * 149598000);
    },

    opacityForPhase(phase: number): number {
      const adjustedPhase = 180 - Math.abs(180 - phase);
      return Math.min(Math.max(this.phaseOpacitySlope * adjustedPhase + this.phaseOpacityIntercept, 0), this.initialOpacity);
    },

    setupClusterLayers(): Promise<SpreadSheetLayer[]> {
      const color = Color.load(this.clusterColor);
      const promises: Promise<SpreadSheetLayer>[] = [];
      for (let phase = -15; phase < 180; phase++) {
        const prom = import(`./assets/radwave/RW_cluster_oscillation_${phase}_updated_radec.csv`).then(res => {
          let text = res.default;
          text = text.replace(/\n/g, "\r\n");
          return this.createTableLayer({
            referenceFrame: "Sky",
            name: `Radcliffe Wave Clusters Phase ${phase}`,
            dataCsv: text
          }).then(layer => {
            this.basicLayerSetup(layer, true);
            layer.set_opacity(this.opacityForPhase(phase));
            layer.set_color(color);
            layer.set_scaleFactor(70);
            //console.log(layer);
            return layer;
          });
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
        phase = Math.max(0, Math.min(value, 720)); 
        const time = startTime + (value / 720) * (endTime - startTime);
        updateBestFitAnnotations(phase);
        this.setTime(new Date(time)); 
      }
    },
    
    onAnimationFrame(_timestamp: DOMHighResTimeStamp) {
      let newPhase = phase;
      if (SpaceTimeController.get_syncToClock()) {
        if (SpaceTimeController.get_now() >= endDate) {
          SpaceTimeController.set_now(startDate);
          this.playing = false;
          this.playCount += 1;
        } 
        const [currPeriod, currPhase] = getCurrentPhaseInfo();
        newPhase = currPeriod * 360 + currPhase;
      }
      if (newPhase !== phase) {
        phase = newPhase;
        updateBestFitAnnotations(phase);
        updateSlider(phase);
      }
      window.requestAnimationFrame(this.onAnimationFrame);
    }

  },

  watch: {
    playing(play: boolean) {
      if (!play) {
        this.playCount += 1;
      }
      this.setClockSync(play);
      this.setClockRate(play ? this.timeRate : 0);
    },
    
    background2DImageset(name: string) {
      
      if (this.modeReactive == "2D") {
        this.setBackgroundImageByName(name);
        return;
      }
      
    },
    
    // // positin3d deep
    // position3D: {
    //   handler(newVal) {        
    //     if (this.mode == "3D") {
    //       console.log('moving');
    //       this.gotoRADecZoom({
    //         ...newVal,
    //         instant: true
    //       }).catch((err) => {
    //         console.log(err);
    //       });
    //     }
    //   },
    //   deep: true
    // },
    
    // // positin2d deep
    // position2D: {
    //   handler(newVal) {
    //     if (this.mode == "2D") {
    //       this.gotoRADecZoom({
    //         ...newVal,
    //         instant: true
    //       }).catch((err) => {
    //         console.log(err);
    //       });
    //     }
    //   },
    //   deep: true
    // },
    
    modeReactive(newVal, oldVal) {
      mode = newVal;
      if (oldVal == newVal) {
        if (newVal == "2D") {
          this.set2DMode();
        }
        if (newVal == "3D") {
          this.set3DMode();
        }
        if (newVal == "full") {
          this.toggleFullwaveMode();
        }
      } else {
      
        if (oldVal == "2D") {
          this.position2D = this.wwtPosition;
        } else if (oldVal == "3D") {
          this.position3D = this.wwtPosition;
        } else if (oldVal == "full") {
          this.resizeObserver?.disconnect();
          this.growWWT();
          this.toggleUI();
        }
      }
      
      
      
      if (newVal == "2D") {
        this.set2DMode();
      } else if (newVal == "3D") {
        this.set3DMode();
      } else {
        // don't do anything if mode is null
        return;
      }
      
    }
    
  }
});
</script>

<style lang="less">

.no-background {
  background-image: none!important;
}

#modal-loading {


  @media (max-width: 699px) {
    background-image: url("./assets/radwave_landing_mobile.png");
  }

  @media (min-width: 700px) {
    background-image: url("./assets/radwave_landing_desktop.png");
  }

  background-position: center;
  background-size: 100%;
  background-repeat: no-repeat;
  
  
  > div {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
  }
  
  .container {
    background-color: rgba(0, 0, 0, 0.5);
    padding-inline: 2rem;
    padding-block: 1rem;
    border-radius: 1rem;
    .spinner {
      background-image: none !important;
      display: none;
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

#center-buttons {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

#splash-screen {
  color: #ffffff;
}

#loading-button {
  background-color: black;
}

.color-span {
  color:var(--accent-color);
}

#time-controls {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .icon-wrapper {
    white-space: nowrap;
  }
  
  // style input slider
  #time-slider[type=range] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    margin: 0;
    padding: 0;
    height: 1rem;
    border-radius: .5rem;
    background: rgba(255, 255, 255, 50%);
    pointer-events: auto;
  }
  
  
  
  .thumb-style {
    -webkit-appearance: none;
    appearance: none;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    pointer-events: auto;
  }
  
  // LESS allows mixins https://lesscss.org/features/#mixins-feature
  // this will put the content of .thumb-style into the following selectors
  #time-slider[type=range]::-webkit-slider-thumb {
    .thumb-style();
  }
  #time-slider[type=range]::-moz-range-thumb {
    .thumb-style();
  }
  
  
}

#time-slider {
  width: 100%;
  pointer-events: auto;
}

.disabled {
  pointer-events: none;
}

.v-leave-active {
  transition: opacity 1s ease;
}

.v-leave-to {
  opacity: 0;
}
</style>
