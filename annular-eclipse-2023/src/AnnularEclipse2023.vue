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
        <location-selector
          :activator-color="accentColor"
        >
        </location-selector>    
        <icon-button
          fa-icon="sun"
          :color="accentColor"
          tooltip-text="Center view on Sun"
          tooltip-location='top'
          @activate="() => trackSun()"
        >
        </icon-button>
      </div>
      <div id="right-buttons">
      </div>
    </div>


    <div class="bottom-content">
      <div
        id="controls"
        class="control-icon-wrapper"
      >
        <div id="controls-top-row">
          <font-awesome-icon
            size="lg"
            class="ma-1"
            :color="accentColor"
            :icon="showControls ? `chevron-down` : `gear`"
            @click="showControls = !showControls"
            @keyup.enter="showControls = !showControls"
            tabindex="0"
          /> 
        </div>
        <transition-expand>
          <div v-if="showControls" class="controls-content">
            <v-checkbox
              :color="accentColor"
              v-model="showEcliptic"
              @keyup.enter="showEcliptic = !showEcliptic"
              label="Ecliptic"
              hide-details
            />
            <v-checkbox
              :color="accentColor"
              v-model="showAltAzGrid"
              @keyup.enter="showAltAzGrid = !showAltAzGrid"
              label="Grid"
              hide-details
            />
            <v-checkbox
              :color="accentColor"
              v-model="showConstellations"
              @keyup.enter="showConstellations = !showConstellations"
              label="Constellations"
              hide-details
            />
            <v-checkbox
              :color="accentColor"
              v-model="showHorizon"
              @keyup.enter="showHorizon = !showHorizon"
              label="Horizon"
              hide-details
            />
            <!-- <v-btn
              block
              :color="accentColor"
              @click="() => {
                playing = false;
                playingCometPath = !playingCometPath;
              }"
            >
              {{ `${playingCometPath ? 'Stop' : 'Play'} comet images` }}
            </v-btn> -->
            <!--
            <v-btn
              block
              :color="accentColor"
              @click="setToFirstCometImage"
            >
              Best view for comet images
            </v-btn> -->
          </div>
        </transition-expand>
      </div>
      <div id="tools">
        <span class="tool-container">
          <icon-button
            id="play-pause-icon"
            :fa-icon="!(playing) ? 'play' : 'pause'"
            @activate="() => {
              playing = !(playing);
              playing = false;
            }"
            :color="accentColor"
            tooltip-text="Play/Pause"
            tooltip-location="top"
            tooltip-offset="5px"
          ></icon-button>
          <vue-slider
            id="slider"
            adsorb
            included
            :order="false"
            v-model="selectedTime"
            @change="onTimeSliderChange"
            :data="times"
            tooltip="always"
            :tooltip-formatter="(v: number) => 
              toTimeString(new Date(v))
            "
            >
          </vue-slider>
        </span>      
      </div>
      <div id="credits" class="ui-text">
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
          <!-- <ShareNetwork
            v-for="network in networks"
            :key="network.name"
            :network="network.name"
            :class="`${network.name}-button`"
            :style="{ backgroundColor: network.color, width: 'fit-content' }"
            :description="description"
            :url="url"
            :title="title"
            :hashtags="hashtagString"
            :quote="description"
            twitter-user="WWTelescope"
          >
            <font-awesome-icon
              :class="`${network.name}-icon`"
              :icon="['fab', network.name]"
              size="lg"
            ></font-awesome-icon>
          </ShareNetwork> -->
        </div>
      </div>
    </div>

    <!-- This contains the video that is displayed when the video icon is clicked. -->

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

    <!-- This contains the informational content that is displayed when the book icon is clicked. -->

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
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common";
import { GotoRADecZoomParams } from "@wwtelescope/engine-pinia";
import { Classification, SolarSystemObjects } from "@wwtelescope/engine-types";
import { Constellations, Folder, Grids, LayerManager, Poly,Settings, WWTControl, Place  } from "@wwtelescope/engine";

import { getTimezoneOffset } from "date-fns-tz";
// import tzlookup from "tz-lookup";

import { drawSkyOverlays, initializeConstellationNames, makeAltAzGridText, layerManagerDraw, updateViewParameters } from "./wwt-hacks";

// interface MoveOptions {
//   instant?: boolean;
//   zoomDeg?: number;
//   rollRad?: number;
// }

type SheetType = "text" | "video" | null;

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

// const startTime = new Date("2023-10-14T10:10"); 
// const finishTime = new Date("2023-10-14T11:10");

// number of milliseconds since January 1, 1970, 00:00:00 UTC
// month is indexed from 0..?!
const minTime = Date.UTC(2023, 9, 14, 15, 0); // eclipse starts at 9:13am MT in Albuquerque
const maxTime = Date.UTC(2023, 9, 14, 18, 30); // eclipse ends at 12:09pm MT in Albuquerque

const SECONDS_PER_DAY = 60 * 60 * 24;
const MILLISECONDS_PER_DAY = 1000 * SECONDS_PER_DAY;

const secondsInterval = 10;
const MILLISECONDS_PER_INTERVAL = 1000 * secondsInterval;

const times: number[] = [];

let t = minTime;
while (t <= maxTime) {
  times.push(t);
  times.push(t + MILLISECONDS_PER_INTERVAL);
  t += MILLISECONDS_PER_INTERVAL;
}

// const options = { timeout: 10000, enableHighAccuracy: true };

type LocationRad = {
  longitudeRad: number;
  latitudeRad: number;
};

type EquatorialRad = {
  raRad: number;
  decRad: number;
};

type HorizontalRad = {
  altRad: number;
  azRad: number;
};

export default defineComponent({
  extends: MiniDSBase,
  
  props: {
    // wtml: {
    //   type: Object,
    //   required: true
    // },
    wwtNamespace: {
      type: String,
      required: true
    },
    
    initialCameraParams: {
      type: Object as PropType<Omit<GotoRADecZoomParams, 'instant'>>,
      default() {
        return {
          // RA/Dec of Sun in Albuquerque close to max annularity
          raRad: 3.481,
          decRad: -0.145,
          zoomDeg: 1
        };
      },
    },
  },
  data() {
    const annularEclipseTimeNMTZ = new Date("2023-10-14T10:48");
    const _annularEclipseTimeUTC = new Date("2023-10-14T16:48:00Z");
    console.log("min/max time UTC", minTime, maxTime);
    const minutc = new Date(minTime);
    const maxutc = new Date(maxTime);
    console.log("Date(min/maxTime):", minutc, maxutc);
    console.log("min max date", minutc.toUTCString(), maxutc.toUTCString());
    console.log("date:", annularEclipseTimeNMTZ);

    const sunPlace = new Place();
    sunPlace.set_names(["Sun"]);
    sunPlace.set_classification(Classification.solarSystem);   
    sunPlace.set_target(SolarSystemObjects.sun);
    sunPlace.set_zoomLevel(20);

    return {
      showSplashScreen: true,
      backgroundImagesets: [] as BackgroundImageset[],
      sheet: null as SheetType,
      layersLoaded: false,
      positionSet: false,
      imagesetFolder: null as Folder | null,

      showMapTooltip: false,
      showTextTooltip: false,
      showVideoTooltip: false,
      showControls: true,   

      selectionProximity: 4,
      pointerMoveThreshold: 6,
      isPointerMoving: false,
      pointerStartPosition: null as { x: number; y: number } | null,      

      // Albuquerque, NM
      timeOfDay: { hours: annularEclipseTimeNMTZ.getHours(), minutes: annularEclipseTimeNMTZ.getMinutes(), seconds: annularEclipseTimeNMTZ.getSeconds() },
      selectedTime: _annularEclipseTimeUTC.getTime(), //1697302060000,
      selectedTimezone: "America/Denver",
      location: {
        latitudeRad: D2R * 35.106766,
        longitudeRad: D2R * -106.629181
      } as LocationRad,
      locationErrorMessage: "",
      
      syncDateTimeWithWWTCurrentTime: true,
      syncDateTimewithSelectedTime: true,

      playing: false,
      playingIntervalId: null as ReturnType<typeof setInterval> | null,
      playingWaitCount: 0,

      showAltAzGrid: true,
      showConstellations: false,
      showHorizon: true,
      showEcliptic: true,    
      
      times: times, 
      
      accentColor: "#ef7e3d",

      tab: 0,

      sunPlace
    };
  },

  mounted() {
    this.waitForReady().then(async () => {

      this.backgroundImagesets = [...skyBackgroundImagesets];

      console.log("initial camera params RA, Dec:", R2D * this.initialCameraParams.raRad/15, R2D * this.initialCameraParams.decRad);

      console.log(this.dateTime);
      this.setTime(this.dateTime);

      this.wwtSettings.set_localHorizonMode(true);
      this.wwtSettings.set_showAltAzGrid(this.showAltAzGrid);
      this.wwtSettings.set_showAltAzGridText(this.showAltAzGrid);
      this.wwtSettings.set_showConstellationLabels(this.showConstellations);
      this.wwtSettings.set_showConstellationFigures(this.showConstellations);
      this.wwtSettings.set_showEcliptic(this.showEcliptic);
      this.wwtSettings.set_showEclipticOverviewText(this.showEcliptic);

      // This is kinda horrible, but it works!

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl._drawSkyOverlays = drawSkyOverlays;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Constellations.initializeConstellationNames = initializeConstellationNames;
      Grids._makeAltAzGridText = makeAltAzGridText;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      LayerManager._draw = layerManagerDraw;      

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl._updateViewParameters = updateViewParameters.bind(this.wwtControl);

      this.updateWWTLocation();
      this.setClockSync(false); // set to false to pause
      this.setClockRate(1); //

      setTimeout(() => {
        this.trackSun().then(() => this.positionSet = true);
      }, 100);

      // If there are layers to set up, do that here!
      this.layersLoaded = true;

      console.log("selected time", this.selectedTime);

    });
  },

  computed: {

    dateTime() {
      return new Date(this.selectedTime);
    },    

    selectedTimezoneOffset() {
      return getTimezoneOffset(this.selectedTimezone);
    },

    ready(): boolean {
      return this.layersLoaded && this.positionSet;
    },
    isLoading(): boolean {
      return !this.ready;
    },
    selectedDate(): Date {
      return new Date(this.selectedTime);
    },
    smallSize(): boolean {
      return this.$vuetify.display.smAndDown;
    },
    mobile(): boolean {
      return this.smallSize && this.touchscreen;
    },
    cssVars() {
      return {
        '--accent-color': this.accentColor,
        '--app-content-height': this.showTextSheet ? '66%' : '100%',
      };
    },
    wwtControl(): WWTControl {
      return WWTControl.singleton;
    },

    wwtSettings(): Settings {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return Settings.get_active();
    },
    // dontSetTime(): boolean {
    //   return this.selectedTime %MILLISECONDS_PER_DAY !== 0;
    // },
    dayFrac(): number {
      const dateForTOD = new Date();
      const timezoneOffsetHours = this.selectedTimezoneOffset / (60*60*1000);
      dateForTOD.setUTCHours(this.timeOfDay.hours - timezoneOffsetHours, this.timeOfDay.minutes, this.timeOfDay.seconds);
      const todMs = 1000 * (3600 * dateForTOD.getUTCHours() + 60 * dateForTOD.getUTCMinutes() + dateForTOD.getUTCSeconds());
      return todMs / MILLISECONDS_PER_DAY;
    },
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

    async trackSun(): Promise<void> {
      return this.gotoTarget({
        place: this.sunPlace,
        instant: true,
        noZoom: false,
        trackObject: true
      });
    },

    clearPlayingInterval() {
      if (this.playingIntervalId !== null) {
        clearInterval(this.playingIntervalId);
        this.playingIntervalId = null;
      }
    },

    moveOneIntervalForward() {
      console.log("selected time", this.selectedTime);
      this.selectedTime += MILLISECONDS_PER_INTERVAL;
    },

    moveOneIntervalBackward() {
      this.selectedTime -= MILLISECONDS_PER_INTERVAL;
    },

    toUTCDateString(date: Date) {
      // date = new Date(date.getTime() + this.selectedTimezoneOffset) // ignore timezone
      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
    },

    toUTCTimeString(date: Date) {
      const minutes = date.getUTCMinutes();
      const minuteString = minutes < 10 ? `0${minutes}` : `${minutes}`;
      // get am pm
      const ampm = date.getUTCHours() < 12 ? "AM" : "PM";
      return `${date.getUTCHours()}:${minuteString} ${ampm}`;
    },

    toLocaleTimeString(date: Date) {
      date = new Date(date.getTime() + this.selectedTimezoneOffset);
      const minutes = date.getUTCMinutes();
      const minuteString = minutes < 10 ? `0${minutes}` : `${minutes}`;
      // get am pm
      const ampm = date.getUTCHours() < 12 ? "AM" : "PM";
      return `${date.getUTCHours()}:${minuteString} ${ampm}`;
    },

    toTimeString(date: Date) {
      return this.toLocaleTimeString(date);
    },

    closeSplashScreen() {
      this.showSplashScreen = false; 
    },

    updateWWTLocation() {
      this.wwtSettings.set_locationLat(R2D * this.location.latitudeRad);
      this.wwtSettings.set_locationLng(R2D * this.location.longitudeRad );
      if(this.showHorizon) {
        this.updateHorizon();
      }
    },

    onTimeSliderChange() {
      this.$nextTick(() => {
        this.updateHorizon(this.dateTime);
      });
    },

    logLocation() {
      console.log(this.location.latitudeRad * R2D, this.location.longitudeRad * R2D);
    },
    
    logPosition() {
      console.log(this.wwtRARad * R2D, this.wwtDecRad * R2D);
    },

    printUTCDate(date: Date) {
      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
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

    // WWT does have all of this functionality built in
    // but it doesn't seem to be exposed
    // We should do that, but for now we just copy the web engine code
    // https://github.com/Carifio24/wwt-webgl-engine/blob/master/engine/wwtlib/Coordinates.cs
    altAzToHADec(altRad: number, azRad: number, latRad: number): { ra: number; dec: number; } {
      azRad = Math.PI - azRad;
      if (azRad < 0) {
        azRad += 2 * Math.PI;
      }
      let ra = Math.atan2(Math.sin(azRad), Math.cos(azRad) * Math.sin(latRad) + Math.tan(altRad) * Math.cos(latRad));
      if (ra < 0) {
        ra += 2 * Math.PI;
      }
      const dec = Math.asin(Math.sin(latRad) * Math.sin(altRad) - Math.cos(latRad) * Math.cos(altRad) * Math.cos(azRad));
      return { ra, dec };
    },

    getJulian(utc: Date): number {
      let year = utc.getUTCFullYear();
      let month = utc.getUTCMonth()+1;
      const day = utc.getUTCDate();
      const hour = utc.getUTCHours();
      const minute = utc.getUTCMinutes();
      const second = utc.getUTCSeconds() + utc.getUTCMilliseconds() / 1000.0;

      if (month == 1 || month == 2)
      {
        year -= 1;
        month += 12;
      }

      const a = Math.floor(year / 100);
      const b = 2 - a + Math.floor(a / 4.0);
      const c = Math.floor(365.25 * year);
      const d = Math.floor(30.6001 * (month + 1));

      // gives julian date: number of days since Jan 1, 4713 BC
      const jd = b + c + d + 1720994.5 + day + (hour + minute / 60.00 + second / 3600.00) / 24.00;
      return jd;

    },
    
    mstFromUTC2(utc: Date, longRad: number): number {
      const lng = longRad * R2D;

      const modifiedJD = this.getJulian(utc)  - 2451545;

      const julianCenturies = modifiedJD / 36525.0;
      // this form wants julianDays - 2451545
      let mst = 280.46061837 + 360.98564736629 * modifiedJD + 0.000387933 * julianCenturies * julianCenturies - julianCenturies * julianCenturies * julianCenturies / 38710000 + lng;

      if (mst > 0.0) {
        while (mst > 360.0) {
          mst = mst - 360.0;
        }
      } else {
        while (mst < 0.0) {
          mst = mst + 360.0;
        }
      }

      return mst;
    },

    horizontalToEquatorial(altRad: number, azRad: number, latRad: number, longRad: number, utc: Date): EquatorialRad {
      const st = this.mstFromUTC2(utc, longRad); // siderial time 
  
      const haDec = this.altAzToHADec(altRad, azRad, latRad); // get Hour Angle and Declination
      
      const ha = haDec.ra * R2D;

      let ra = st + ha;
      if (ra < 0) {
        ra += 360;
      }
      if (ra > 360) {
        ra -= 360;
      }
      // ra -= 180;
      // console.log(`Alt: ${(altRad*R2D).toFixed(2)} Az: ${(azRad*R2D).toFixed(2)} Ra: ${ra.toFixed(2)} Dec: ${(haDec.dec*R2D).toFixed(2)}`)

      return { raRad: D2R * ra, decRad: haDec.dec };
    },

    equatorialToHorizontal(raRad: number, decRad: number, latRad: number, longRad: number, utc: Date): HorizontalRad {
      let hourAngle = this.mstFromUTC2(utc, longRad) - R2D * raRad;
      if (hourAngle < 0) {
        hourAngle += 360;
      }

      const ha = D2R * hourAngle;
      const dec = decRad;
      const lat = latRad;
      
      const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
      const altitude = Math.asin(sinAlt);
      const cosAz = (Math.sin(dec) - Math.sin(altitude) * Math.sin(lat)) / (Math.cos(altitude) * Math.cos(lat));
      let azimuth = Math.acos(cosAz);

      azimuth = azimuth + (Math.PI * 80) % (Math.PI * 2);

      if (Math.sin(ha) > 0) {
        azimuth = 2 * Math.PI - azimuth;
      }
      return { altRad: altitude, azRad: azimuth };

    },

    createHorizon(when: Date | null = null) {
      this.removeHorizon();

      const color = '#01362C';
      const date = when || this.dateTime || new Date();

      // The initial coordinates are given in Alt/Az, then converted to RA/Dec
      // Use N annotations to cover below the horizon
      const n = 6;
      const delta = 2 * Math.PI / n;
      for (let i = 0; i < n; i++) {
        let points: [number, number][] = [
          [0, i * delta],
          [-Math.PI / 2, i * delta],
          [0, (i + 1) * delta]
        ];
        points = points.map((point) => {
          const raDec = this.horizontalToEquatorial(...point, this.location.latitudeRad, this.location.longitudeRad, date);
          return [R2D * raDec.raRad, R2D * raDec.decRad];
        });
        const poly = new Poly();
        points.forEach(point => poly.addPoint(...point));
        poly.set_lineColor(color);
        poly.set_fill(true);
        poly.set_fillColor(color);
        this.addAnnotation(poly);
      }
    },

    createSky(when: Date | null = null) {
      // this removes all annotations, so it erases horizon if you create that first.
      // this.removeHorizon(); 

      const color = '#87CEEB';
      // const opacity = 0.5;
      const date = when || this.dateTime || new Date();

      // The initial coordinates are given in Alt/Az, then converted to RA/Dec
      // Use N annotations to cover below the horizon
      const n = 6;
      const delta = 2 * Math.PI / n;
      // const delta = 360/n;
      for (let i = 0; i < n; i++) {
        let points: [number, number][] = [
          [0, i * delta],
          [0, (i + 1) * delta],
          [Math.PI / 2, i * delta] // In addition to using +pi/2 instead of -pi/2, I had to switch the order of the 2nd & 3rd points relative to the horizon set. I don't know why, but before I switched them, the polygons didn't render.
        ];
        points = points.map((point) => {
          const raDec = this.horizontalToEquatorial(...point, this.location.latitudeRad, this.location.longitudeRad, date);
          return [R2D * raDec.raRad, R2D * raDec.decRad];
        });
        const poly = new Poly();
        points.forEach(point => poly.addPoint(...point));
        poly.set_fill(true);
        poly.set_fillColor(color);
        poly.set_opacity(0.6);
        poly.set_lineWidth(0); // This removes the seam that appears between the polygons when opacity < 1
        this.addAnnotation(poly);
      }

    },

    removeHorizon() {
      this.clearAnnotations();
    },    

    onPointerMove(event: PointerEvent) {
      if (!this.isPointerMoving && this.pointerStartPosition !== null) {
        const dist = Math.sqrt((event.pageX - this.pointerStartPosition.x) ** 2 + (event.pageY - this.pointerStartPosition.y) ** 2);
        if (dist > this.pointerMoveThreshold) {
          this.isPointerMoving = true;
        }
      }
    },

    onPointerDown(event: PointerEvent) {
      this.isPointerMoving = false;
      this.pointerStartPosition = { x: event.pageX, y: event.pageY };
    },

    onPointerUp() {
      this.pointerStartPosition = null;
      this.isPointerMoving = false;
    },


    updateForDateTime() {
      this.syncDateTimeWithWWTCurrentTime ? this.setTime(this.dateTime) : null;
      this.updateHorizon(this.dateTime); 
      // this.showImageForDateTime(this.dateTime);
      // this.updateViewForDate(options);
      // this.updateLayersForDate();
    },

    updateHorizon(when: Date | null = null) {
      if (this.showHorizon) {
        this.createHorizon(when);
        // uncomment next line when we sort out opacity of sky annotation
        this.createSky(when);
      } else {
        this.removeHorizon();
      }
    },

  },

  watch: {
    showAltAzGrid(show: boolean) {
      this.wwtSettings.set_showAltAzGrid(show);
      this.wwtSettings.set_showAltAzGridText(show);
    },
    showConstellations(show: boolean) {
      this.wwtSettings.set_showConstellationLabels(show);
      this.wwtSettings.set_showConstellationFigures(show);
    },
    showEcliptic(show: boolean) {
      this.wwtSettings.set_showEcliptic(show);
      this.wwtSettings.set_showEclipticOverviewText(show);
    },
    showHorizon(_show: boolean) {
      this.updateHorizon();
    },

    
    dateTime(_date: Date) {
      console.log('watch dateTime');
      this.updateForDateTime();
    },

    selectedTime(_time: number) {
      return;
    },

    wwtCurrentTime(_time: Date) {
      // this.selectedTime = _time.getTime();
      this.updateHorizon(_time);
    },

    selectedTimezone(newTz: string, oldTz: string) {
      const newOffset = getTimezoneOffset(newTz);
      const oldOffset = getTimezoneOffset(oldTz);
      let newHours = this.timeOfDay.hours + ((newOffset - oldOffset) / (1000*60*60));
      if (newHours >= 24) {
        newHours -= 24;
        this.moveOneIntervalForward();
      } else if (newHours < 0) {
        newHours += 24;
        this.moveOneIntervalBackward();
      }
      this.timeOfDay.hours = newHours;
    },

    playing(play: boolean) {
      this.clearPlayingInterval();
      if (play) {
        this.playingIntervalId = setInterval(() => {
          if (this.selectedTime < maxTime) {
            this.moveOneIntervalForward();
          } else {
            this.selectedTime = minTime;
          }
          this.$nextTick(() => {
            // this.updateViewForDate();
          });
        }, 350);
      }
    },

  },
});
</script>

<style lang="less">
@font-face {
  font-family: "Highway Gothic Narrow";
  src: url("../../assets/HighwayGothicNarrow.ttf");
}

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

.pointer {
  cursor: pointer;
}

.control-icon {
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

}

.icon-wrapper {
  padding: 8px 16px;
}

.top-content {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  #center-buttons {
    display: flex;
    flex-direction: row;
  }
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
#tools {
  z-index: 10;
  color: #fff;
  width: 100%;

  .opacity-range {
    width: 50vw;
  }

  .clickable {
    cursor: pointer;
  }

  select {
    background: white;
    color: black;
    border-radius: 3px;
  }
}

.tool-container {
  display: flex;
  width: 99%;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  pointer-events: auto;
}

#controls {
  background: black;
  padding: 10px;
  border-radius: 10px;
  border: solid 1px var(--comet-color);
  display: flex;
  flex-direction: column;
  align-self: flex-end;
  margin-right: 1rem;
  margin-bottom: 1rem;
  pointer-events: auto;

  .v-label {
    color: var(--comet-color);
    opacity: 1;
  }

  .controls-content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .v-btn {
      align-self: center;
      padding-left: 5px;
      padding-right: 5px;
      border: solid 1px #899499;

      &:focus {
        border: 2px solid white;
      }
    }

    .v-btn__content {
      color: black;
      font-weight: 900;
      font-size: 0.75em;
      white-space: break-spaces;
      width: 150px;
    }
  }
  #controls-top-row {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
  }
}

#show-controls {
  color: var(--accent-color);
}

#credits {
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
}

#left-buttons, #right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

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

.scrollable {
  overflow-y: auto;
}

.no-bottom-border-radius {
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

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

// Styling the slider

#sliderlabel {
  padding: 5px 10px;
  margin:0 5px;
  color:#fff !important;
  background-color: var(--accent-color);
  overflow: visible;
}

#slider {
  width: 100% !important;
  margin: 5px 30px;
}

.vue-slider-process {
  background-color: pink !important;
}

.vue-slider-dot-tooltip-inner {
  cursor: grab;
  padding: 4px 10px !important;
  color: pink !important;
  background-color: var(--accent-color) !important;
  border: 1px solid var(--accent-color) !important;

  &:active {
    cursor: grabbing;
  }
}

.vue-slider-dot-handle {
  cursor: grab;
  background-color: var(--accent-color) !important;
  border: 1px solid black !important;

  &:active {
    cursor: grabbing;
  }
}


table.show-time tr>td:first-child {
  font-weight: bold;
  padding-right: 1em;
}


</style>
