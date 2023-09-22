<template>
<v-app
  id="app"
  :style="cssVars"
>
  
    <div id="guided-content-container">
      
      <div id="top-guided-content" class="guided-content">
        <icon-button
          v-model="showGuidedContent"
          :fa-icon="showGuidedContent ? 'chevron-up' : 'chevron-down'"
          :color="accentColor"
          background-color="transparent"
          :box-shadow="false"
          tooltip-location="start"
          @activate="() => { onResize() }"
        ></icon-button>
        <icon-button
          fa-icon="question"
          :color="accentColor"
          tooltip-location="start"
          @activate="() => { inIntro=true; introSlide = 2 }"
        ></icon-button>
        <icon-button
          :model-value="learnerPath == 'Discover'"
          fa-icon="rocket"
          :color="accentColor"
          @activate="() => { learnerPath = 'Discover'}"
        ></icon-button>
        <icon-button
          :model-value="learnerPath == 'Answer'"
          fa-icon="puzzle-piece"
          :color="accentColor"
          @activate="() => { learnerPath = 'Answer'}"
        ></icon-button>
        <icon-button
          :model-value="learnerPath == 'Explore'"
          fa-icon="location-dot"
          :color="accentColor"
          @activate="() => { learnerPath = 'Explore'}"
        ></icon-button>
        <icon-button
          v-model="showTextSheet"
          fa-icon="book-open"
          :color="accentColor"
          :tooltip-text="showTextSheet ? 'Hide Info' : 'Learn More'"
          tooltip-location="start"
        ></icon-button>
        
        <icon-button
          v-model="showVideoSheet"
          fa-icon="video"
          :color="accentColor"
          tooltip-text="Watch video"
          tooltip-location="start"
        >
        </icon-button>
        <icon-button
          fa-icon="sun"
          :color="accentColor"
          tooltip-text="Center view on Sun"
          tooltip-location='top'
          @activate="() => trackSun()"
        >
        </icon-button>
      </div>
        
      <div v-if="showGuidedContent" id="bottom-guided-content">
        <div id="map-holder">
          <span id="title">What will the eclipse look like here?</span>
          <div id="map-container-map">
            <location-selector
              v-if="learnerPath == 'Discover'"
              ref="citySelector"
              :model-value="locationDeg"
              @place="(place: typeof places[number]) => updateLocation(place.name)"
              :detect-location="false"
              :map-options="mapOptions"
              :places="places"
              :initial-place="places.find(p => p.name === selectedLocation)"
              :place-circle-options="placeCircleOptions"
              :selected-circle-options="selectedCircleOptions"
              :selectable="false"
            ></location-selector>
            <span v-if="learnerPath=='Answer'">
              Show a map with a possible eclipse paths
            </span>
            <location-selector
              v-if="learnerPath == 'Explore'"
              :model-value="locationDeg"
              @update:modelValue="updateLocationFromMap"
              :detect-location="false"
              :selected-circle-options="selectedCircleOptions"
            ></location-selector>
          </div>
        </div>
        
        <div id="bottom-center-content">
          
          <!-- Learn Path -->
          <div class="bottom-center-content-text" v-if="learnerPath=='Discover'">
            <span id="description">
              <p>Click a highlighted city to view the eclipse from that location.</p>
              <p>Explore until you can identify which locations will see an annular eclipse</p>
            </span>
          </div>
          
          <div class="bottom-center-content-text" v-if="learnerPath=='Answer'">
            <span id="description">
              <p>Once you've looked at enough locations, click the path that will expereience an annular eclipse</p>
              <p>If you are not sure, click <font-awesome-icon icon="rocket"></font-awesome-icon> to keep exploring</p>
            </span>
          </div>
          
          <!-- Explore Path -->
          <div class="bottom-center-content-text" v-if="learnerPath=='Explore'">
            <span id="description">Click a location on the map to select any place you like.</span>
          </div>
          
          <div id="location-time-display">
            <div id="location-display" class="ltd-container">
              <p class="ltd-label">View for:</p>
              <p class="ltd-value">{{ selectedLocationText }}</p>
            </div>
            <div id="time-display" class="ltd-container">
              <p class="ltd-label">Time:</p>
              <p class="ltd-value">{{selectedLocaledTimeDateString }}</p>
            </div>
          </div>
          
        </div>
        <!-- <div id="main-guided-contols" class="controls"></div> -->
      </div>
        
    </div>

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

    <v-dialog
      v-model="inIntro"
      :style="cssVars"
      :scrim="false"
      :persistent="false"
      >
    <div v-if="inIntro" id="introduction-overlay" class="elevation-10">
      <v-window v-model="introSlide">
        <v-window-item :value="1">
          <div class="intro-text">
            <p>
            On October 14, 2023, the U.S. will experience
            a partial solar eclipse, where the Moon 
            will appear to travel across the Sun and 
            block a portion of it.
            </p>
          <br />
            <p>
            A lucky segment of the U.S. will 
            experience what is known as an <b>annular eclipse</b>.
            </p>
          </div>
        </v-window-item>
        
        <v-window-item :value="2">
          <div class="intro-text">
            <p>
              In this interactive page you can
            </p>
            
            <ul
            >
              <v-list-item>
                <template v-slot:prepend>
                  <font-awesome-icon icon="rocket" size="xl"></font-awesome-icon>
                </template>
                  Explore what the eclipse will look like from different parts of the country
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <font-awesome-icon icon="puzzle-piece" size="xl"></font-awesome-icon>
                </template>
                  Use some detective work to identify the Path of Visibility for the annular eclipse
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <font-awesome-icon icon="location-dot" size="xl"></font-awesome-icon>
                </template>
                  Choose any location around the world and see how the eclipse would look from there
              </v-list-item>
            </ul>
          </div>
        </v-window-item>
        <v-window-item :value="3">
          <p>
            Press <font-awesome-icon icon="question"></font-awesome-icon> to see this introduction again
          </p>
        </v-window-item>
      </v-window>

      <div id="intro-bottom-controls">
        <v-btn
          id="intro-next-button"
          :color="accentColor"
          @click="introSlide--"
          @keyup.enter="introSlide--"
          elevation="0"
          >
          Previous
        </v-btn>
        
        <v-btn
          id="intro-next-button"
          :color="accentColor"
          @click="introSlide++"
          @keyup.enter="introSlide++"
          elevation="0"
          >
          Next
        </v-btn>
      </div>
    </div>
    </v-dialog>
    

    <div class="top-content" >
      <div id="left-buttons">
        <v-switch
          inset
          :ripple="false"
          v-model="viewerMode"
          :color="accentColor"
          false-value="SunScope"
          false-icon="mdi-telescope"
          true-value="Horizon"
          true-icon="mdi-image-filter-hdr"
        >
        </v-switch>
        
      </div>
      <div id="center-buttons">
      </div>
      <div id="right-buttons">
        <v-dialog
          v-model="showLocationSelector"
          >
          <template v-slot:activator>
            <icon-button
              v-model="showLocationSelector"
              fa-icon="map-location-dot"
              :color="accentColor"
              tooltip-text="Select location"
              tooltip-location="end"
              ></icon-button>
          </template>
            <div id="eclipse-location-selector">
              <v-select
                :model-value="selectedLocation"
                :items="Object.keys(eclipsePathLocations)"
                label="Select eclipse viewing location"
                :color="accentColor"
                @update:model-value="updateLocation"
              >
              </v-select>
            </div>
        </v-dialog>
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
          <!-- <icon-button
            id="set-time-now-button"
            @activate="() => {
              selectedTime = times.reduce((a, b) => {
                return Math.abs(b - Date.now()) < Math.abs(a - Date.now()) ? b : a;
              });
              playing = !(playing);
            }"
            :color="accentColor"
            tooltip-text="Go to current time"
            tooltip-location="top"
            tooltip-offset="5px"
          >
            <template v-slot:button>
              Now
            </template>
          </icon-button> -->
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
import { Constellations, Folder, Grids, LayerManager, Poly, Settings, WWTControl, Place } from "@wwtelescope/engine";
import { Annotation2, Poly2 } from "./Annotation2";

import { getTimezoneOffset, formatInTimeZone } from "date-fns-tz";
import tzlookup from "tz-lookup";

import { drawSkyOverlays, initializeConstellationNames, makeAltAzGridText, layerManagerDraw, updateViewParameters, renderOneFrame } from "./wwt-hacks";

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
// https://www.timeanddate.com/eclipse/solar/2023-october-14#eclipse-table
const eclipseStartTime = Date.UTC(2023, 9, 14, 15, 3); // partial eclipse starts at 15:03 UTC
const eclipseFinishTime = Date.UTC(2023, 9, 14, 20, 55); // partial eclipse ends at  20:55 UTC
const extraTime = 1000 * 60 * 60 * 5; // add 2 hours to the end time to make sure we get the full eclipse
// const minTime = Date.UTC(2023, 9, 14, 8, 0); // eclipse starts at 9:13am MT in Albuquerque
// const maxTime = Date.UTC(2023, 9, 14, 25, 30); // eclipse ends at 12:09pm MT in Albuquerque
const minTime = eclipseStartTime - extraTime;
const maxTime = eclipseFinishTime + extraTime;

const SECONDS_PER_DAY = 60 * 60 * 24;
const MILLISECONDS_PER_DAY = 1000 * SECONDS_PER_DAY;

const secondsInterval = 40;
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

interface EclipseLocation extends LocationRad {
  name: string;
  eclipseFracion: number | null;
}

type LocationDeg = {
  longitudeDeg: number;
  latitudeDeg: number;
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
      showMapSelector: false,
      showLocationSelector: false,

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
      selectedLocation: "Albuquerque, NM",
      locationErrorMessage: "",
      
      syncDateTimeWithWWTCurrentTime: true,
      syncDateTimewithSelectedTime: true,

      mapOptions: {
        templateUrl: "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}",
        minZoom: 1,
        maxZoom: 16,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'jpg'
      },

      eclipsePathLocations: {
        "Albuquerque, NM": {
          name: "Albuquerque, NM",
          latitudeRad: D2R * 35.106766,
          longitudeRad: D2R * -106.629181,
          eclipseFracion: 0.97
        },
        "Eugene, OR": {
          name: "Eugene, OR",
          latitudeRad: D2R * 44.052069,
          longitudeRad: D2R * -123.086754,
          eclipseFracion: .95
        },
        "Las Vegas, NV": {
          name: "Las Vegas, NV",
          latitudeRad: D2R * 36.169941,
          longitudeRad: D2R * -115.139830,
          eclipseFracion: .87
        },
        "Denver, CO": {
          name: "Denver, CO",
          latitudeRad: D2R * 39.739235,
          longitudeRad: D2R * -104.990250,
          eclipseFracion: .85
        },
        "Los Angeles, CA": {
          name: "Los Angeles, CA",
          latitudeRad: D2R * 34.05,
          longitudeRad: D2R * -118.24,
          eclipseFracion: .78
        },
        "Omaha, NE": {
          name: "Omaha, NE",
          latitudeRad: D2R * 41.256538,
          longitudeRad: D2R * -95.934502,
          eclipseFracion: .68
        },
        "Chicago, IL": {
          name: "Chicago, IL",
          latitudeRad: D2R * 41.878113,
          longitudeRad: D2R * -87.629799,
          eclipseFracion: .54
        },
        "New York, NY": {
          name: "New York, NY",
          latitudeRad: D2R * 40.712776,
          longitudeRad: D2R * -74.005974,
          eclipseFracion: .35
        },
        "Boston, MA": {
          name: "Boston, MA",
          latitudeRad: D2R * 42.360081,
          longitudeRad: D2R * -71.058884,
          eclipseFracion: .29
        },
        "User Selected": { // by default, user selected is Albaquerque
          name: "User Selected",
          latitudeRad: D2R * 35.106766,
          longitudeRad: D2R * -106.629181,
          eclipseFracion: 0.97
        }
      } as Record<string, EclipseLocation>,

      places: [] as (LocationRad & { name: string })[],
        
      placeCircleOptions: {
        color: "#0000FF",
        fillColor: "#0000FF",
        fillOpacity: 0.7,
        radius: 50000
      },

      selectedCircleOptions: {
        color: "#FF0000",
        fillColor: "#FF0000",
        fillOpacity: 0.7,
        radius: 50000
      },

      learnerPath: "Explore", // Explore or Learn
      
      playing: false,
      playingIntervalId: null as ReturnType<typeof setInterval> | null,
      playingWaitCount: 0,

      showAltAzGrid: true,
      showConstellations: false,
      showHorizon: true,
      showEcliptic: true,    
      
      times: times, 
      
      accentColor: "#ef7e3d",
      guidedContentHeight: "300px",
      showGuidedContent: false,
      inIntro: false,

      tab: 0,
      introSlide: 1,

      viewerMode: 'Horizon' as  'Horizon' | 'SunScope',

      showSky: true,
      skyColorNight: "#1F1F1F",
      skyColorLight: "#87CEEB",
      skyColor: "#87CEEB",
      skyOpacity: 0.6,
      horizonOpacity: 1,

      realTimeRate: 1,

      sunPlace
    };
  },

  created() {
    this.places = Object.entries(this.eclipsePathLocations).filter(([key, _]) => key !== "User Selected").map(([_, pl]) => {
      return {
        ...pl,
        latitudeDeg: R2D * pl.latitudeRad,
        longitudeDeg: R2D * pl.longitudeRad
      };
    });
  },

  mounted() {
    this.waitForReady().then(async () => {

      this.backgroundImagesets = [...skyBackgroundImagesets];

      console.log("initial camera params RA, Dec:", R2D * this.initialCameraParams.raRad/15, R2D * this.initialCameraParams.decRad);

      console.log(this);
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

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl.renderOneFrame = renderOneFrame.bind(this.wwtControl);

      this.updateWWTLocation();
      this.setClockSync(false); // set to false to pause
      this.setClockRate(1); //

      setTimeout(() => {
        this.trackSun().then(() => this.positionSet = true);
        this.setForegroundImageByName("Digitized Sky Survey (Color)");
        this.setBackgroundImageByName("Black Sky Background");
        this.setForegroundOpacity(100);
        
      }, 100);

      this.realTimeRate = this.setRealTimeRate('8 minutes per second'); // 500;
      
      // If there are layers to set up, do that here!
      this.layersLoaded = true;

      if (this.viewerMode == 'SunScope') {
        this.startSolarScopeMode();
      } else {
        this.startHorizonMode();
      }

      this.setTimeforSunAlt(10); // 10 degrees above horizon
      
      console.log("selected time", this.selectedTime);

    });

    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
      this.onResize();
    });
  },

  computed: {

    dateTime() {
      return new Date(this.selectedTime);
    },

    selectedTimezoneOffset() {
      return getTimezoneOffset(this.selectedTimezone);
    },

    selectedLocaledTimeDateString() {
      return formatInTimeZone(this.dateTime, this.selectedTimezone, 'MM/dd/yyyy HH:mm (zzz)');
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
        '--top-content-height': this.inIntro ? '0px' : (this.showGuidedContent? this.guidedContentHeight : this.guidedContentHeight),
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
      const timezoneOffsetHours = this.selectedTimezoneOffset / (60 * 60 * 1000);
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
    },

    locationDeg: {
      get(): LocationDeg {
        return {
          latitudeDeg: R2D * this.location.latitudeRad,
          longitudeDeg: R2D * this.location.longitudeRad
        };
      },
      set(value: LocationDeg) {
        this.location = {
          latitudeRad: D2R * value.latitudeDeg,
          longitudeRad: D2R * value.longitudeDeg
        };
      }
    },

    tickDurationMS(): number {
      return MILLISECONDS_PER_INTERVAL / (this.realTimeRate);
    },
    
    sunPosition() {
      const sunAltAz = this.equatorialToHorizontal(this.sunPlace.get_RA() * 15 * D2R,
        this.sunPlace.get_dec() * D2R,
        this.location.latitudeRad,
        this.location.longitudeRad,
        this.dateTime);

      return {
        'raRad': this.sunPlace.get_RA() * 15 * D2R,
        'decRad': this.sunPlace.get_dec() * D2R,
        'altRad': sunAltAz.altRad,
        'azRad': sunAltAz.azRad
      };
    },

    sunAboveHorizon(): boolean {
      return this.sunPosition.altRad > 0;
    },


    selectedLocationText(): string {
      if (this.selectedLocation !== 'User Selected') {
        return this.selectedLocation;
      } else {
        const ns = this.locationDeg.latitudeDeg >= 0 ? 'N' : 'S';
        const ew = this.locationDeg.longitudeDeg >= 0 ? 'E' : 'W';
        const lat = Math.abs(this.locationDeg.latitudeDeg).toFixed(3);
        const lon = Math.abs(this.locationDeg.longitudeDeg).toFixed(3);
        return `${lat}° ${ns}, ${lon}° ${ew}`;
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

    toLocaleDateString(date: Date) {
      date = new Date(date.getTime() + this.selectedTimezoneOffset);
      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
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

    updateLocation(location: string) {
      if (location == null) {
        return;
      }
      console.log("updateLocation", location);
      this.selectedLocation = location;
      this.location = {
        latitudeRad: this.eclipsePathLocations[location].latitudeRad,
        longitudeRad: this.eclipsePathLocations[location].longitudeRad
      };

    },

    updateLocationFromMap(location: LocationDeg) {
      if (location == null) {
        return;
      }
      console.log("updateLocationFromMap", location);
      this.selectedLocation = 'User Selected';
      this.locationDeg = location;

      this.eclipsePathLocations['User Selected'] = {
        name: `User Selected: ${location.latitudeDeg.toFixed(2)}, ${location.longitudeDeg.toFixed(2)}`,
        latitudeRad: D2R * location.latitudeDeg,
        longitudeRad: D2R * location.longitudeDeg,
        eclipseFracion: null
      };

      const citySelector = this.$refs.citySelector;
      // There's got to be a way to export the component data/method definitions
      // but that's a problem for another day
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      citySelector?.onMapSelect({
        latlng: {
          lat: location.latitudeDeg,
          lng: location.latitudeDeg
        }
      });

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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const poly = new Poly2();
        points.forEach(point => poly.addPoint(...point));
        poly.set_lineColor(color);
        poly.set_fill(true);
        poly.set_fillColor(color);
        poly.set_opacity(this.horizonOpacity);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        Annotation2.addAnnotation(poly);
      }
    },

    createSky(when: Date | null = null) {
      const color = this.skyColor || '#87CEEB';
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
        poly.set_opacity(this.skyOpacity);
        poly.set_lineWidth(0); // This removes the seam that appears between the polygons when opacity < 1
        this.addAnnotation(poly);
      }

    },

    removeAnnotations() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Annotation2.clearAll();
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
    },

    updateHorizon(when: Date | null = null) {
      this.removeAnnotations();
      if (this.showHorizon) {
        this.createHorizon(when);
        if (this.showSky) {
          this.createSky(when);
        }
      }
    },

    updateGuidedContentHeight() {
      const guidedContentContainer = document.getElementById('guided-content-container') as HTMLElement;
      if (guidedContentContainer) {
        const height = guidedContentContainer.clientHeight;
        console.log("height", height);
        this.guidedContentHeight = `${height}px`;
        
      }
    },
    
    onResize() {
      // get height of #guided-content-container
      this.$nextTick(() => {
        this.updateGuidedContentHeight();
      });
    },


    startHorizonMode() {
      // turn on local horizon mode
      this.wwtSettings.set_localHorizonMode(true);
      this.showAltAzGrid = true;
      this.skyColor = this.skyColorLight;
      this.showHorizon = true; // automatically calls it's watcher and updates horizon
      this.horizonOpacity = 1;
      // this.setForegroundImageByName("Digitized Sky Survey (Color)");
      this.sunPlace.set_zoomLevel(60 * 6);
      this.gotoTarget({
        place: this.sunPlace,
        instant: true,
        noZoom: false,
        trackObject: false
      });
      console.log('=== startHorizonMode ===');
      return;
    },

    startSolarScopeMode() {
      this.wwtSettings.set_localHorizonMode(false);
      this.showAltAzGrid = false;
      this.skyColor = this.skyColorNight;
      this.horizonOpacity = 0.6;
      this.updateHorizon(); // manually update horizon
      // this.setForegroundImageByName("Black Sky Background");
      // this.setForegroundOpacity(100);
      this.sunPlace.set_zoomLevel(20); // the original default value
      // track sun
      this.trackSun();
      console.log('=== startSolarScopeMode ===');
      return;
    },
  
    getSunAltitudeAtTime(time: Date): { altRad: number; azRad: number; } {
      const sunAltAz = this.equatorialToHorizontal(this.sunPosition.raRad, this.sunPosition.decRad, this.location.latitudeRad, this.location.longitudeRad, time);
      return sunAltAz;
    },

    // function that finds at what time the sun will reach a given altitude during the current day to within 15 minutes
    getTimeforSunAlt(altDeg: number): { rising: number | null; setting: number | null; } {
      // takes about 45ms to run
      // search for time when sun is at given altitude
      // start at 12:00am and search every MINUTES_PER_INTERVAL
      const minTime = this.selectedTime - (this.selectedTime % MILLISECONDS_PER_DAY) - this.selectedTimezoneOffset;
      const maxTime = minTime + MILLISECONDS_PER_DAY;
      // const ehr = this.eclipticHorizonAngle(this.location.latitudeRad, this.dateTime);
      let time = minTime;
      let sunAlt = this.getSunAltitudeAtTime(new Date(time)).altRad; // negative
      // find the two times it crosses the given altitude
      while ((sunAlt < altDeg * D2R) && (time < maxTime)) {
        time += MILLISECONDS_PER_INTERVAL;
        sunAlt = this.getSunAltitudeAtTime(new Date(time)).altRad;
      }
      const rising = time == maxTime ? null : time;
      while ((sunAlt > altDeg * D2R) && (time < maxTime)) {
        time += MILLISECONDS_PER_INTERVAL;
        sunAlt = this.getSunAltitudeAtTime(new Date(time)).altRad;
      }
      const setting = time == maxTime ? null : time;
      
      return {
        'rising': (rising !== null && setting !== null) ? Math.min(rising, setting) : (rising !== null ? rising : null),
        'setting': (rising !== null && setting !== null) ? Math.max(rising, setting) : (setting !== null ? setting : null)
      };
    },
    
    
    setTimeforSunAlt(altDeg: number) {
      const out = this.getTimeforSunAlt(altDeg);
      console.log("rise", this.toLocaleDateString(new Date(out.rising as number)) + " " + this.toLocaleTimeString(new Date(out.rising as number)));
      console.log("set", this.toLocaleDateString(new Date(out.setting as number)) + " " + this.toLocaleTimeString(new Date(out.setting as number)));
      if (out.rising == null && out.setting == null) {
        return;
      }

      function matchTime(time: number | null, times: number[]) {
        if (time === null) {
          return -1;
        }
        const dt = time - times[0];
        return times[0] + dt - (dt % MILLISECONDS_PER_INTERVAL);
      }

      if (this.times.includes(matchTime(out.rising, this.times))) {
        this.selectedTime = matchTime(out.rising, this.times);
      } else if (this.times.includes(matchTime(out.setting, this.times))) {
        this.selectedTime = matchTime(out.setting, this.times);
      } else {
        console.log("time not in times array");
        // best to leave it alone so it doesn't jump around
        // this.selectedTime = Math.max(minTime, Math.min(newTime, maxTime));
      }
      

    },

    setRealTimeRate(rate: string) {
      console.log('setRealTimeRate', rate);
      // parse a string that looks like "x [time] per y [time]"
      // e.g. "1 second per 1 minute"
      // returns a number that is the ratio of the two times converted to seconds/seconds
      // e.g. 1/60
      // if the string is not parseable, returns 1
      function unitToSec(unitString: string): number {
        if (unitString[0] == 'h') {
          return 3600;
        } else if (unitString[0] == 'm') {
          return 60;
        } else if (unitString[0] == 's') {
          return 1;
        } else {
          return 0;
        }
      }
      
      // parse string
      const parsedString = rate.match(/(\d+(\.(\d+)?)?)\s(\w+)\sper\s(\d+(\.(\d+)?)?)?\s?(\w+)/);
      console.log(parsedString);
      if (parsedString === null) {
        return 1;
      }
      const num1 = parseInt(parsedString[1]) * unitToSec(parsedString[4]);
      const num2 = (parseInt(parsedString[5]?? 1) ) * unitToSec(parsedString[8]);
      console.log(num1, num2);
      return num1 / num2;
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
    showSky(_show: boolean) {
      this.updateHorizon();
    },
    
    dateTime(_date: Date) {
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

    location(loc: LocationRad, oldLoc: LocationRad) {
      const locationDeg: [number, number] = [R2D * loc.latitudeRad, R2D * loc.longitudeRad];
      
      if (oldLoc.latitudeRad * loc.latitudeRad < 0) {
        Grids._altAzTextBatch = null;
      }

      this.selectedTimezone = tzlookup(...locationDeg);
      this.updateWWTLocation();

      // We need to let the location update before we redraw the horizon
      this.$nextTick(() => {
        this.updateHorizon();
      });
    },

    selectedLocation(locname: string) {
      if (!(locname in this.eclipsePathLocations)) {
        console.log(`location ${locname} not found in eclipsePathLocations`);
        return;
      }
      console.log("selected location", locname);
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
        }, this.tickDurationMS);
      }
    },

    showSplashScreen(_val) {
      if (!_val) {
        this.inIntro = true;
      }
    },
    
    introSlide(_val) {
      this.inIntro = _val < 4;
      return;
    },

    viewerMode(mode) {
      if (mode === 'Horizon') {
        this.startHorizonMode();
      } else if (mode === 'SunScope') {
        this.horizonOpacity = 0.6;
        this.startSolarScopeMode();
      }
    },

    skyColor(_color) {
      this.updateHorizon();
    },

    sunAboveHorizon(isAbove) {
      console.log(`The sun is ${isAbove ? 'above' : 'below'} the horizon`);
      // this.showSky = isAbove; // just turn it off
      this.horizonOpacity = isAbove ? 1 : 0.85;
    },

    sunPosition(pos) {

      const _civilTwilight = -6 * D2R;
      const _nauticalTwilight = 2 * _civilTwilight;
      const astronomicalTwilight = 3 * _civilTwilight;
      
      const sunAlt = pos.altRad;
      this.skyOpacity = (1 + Math.atan(Math.PI * sunAlt / (-astronomicalTwilight))) / 2;

      function dssOpacity(alt: number) {
        if (alt > 0) {
          return 0;
        } else {
          return 1 - (1 + Math.atan(Math.PI * alt / (-astronomicalTwilight))) / 2;
        }
      }
      
      this.setForegroundOpacity((dssOpacity(sunAlt)) * 100);
      return;
    }
    
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
  position: relative;
  // top: var(--top-content-height);
  width: 100%;
  height: calc(var(--app-content-height) - var(--top-content-height));
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
    position: relative;
    // top: 0;
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
  pointer-events: auto;
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

#eclipse-location-selector {
  position: fixed;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 400px;
  max-width: 90%;
  background-color: rgba(0, 0, 0, 0.7);
}

#guided-content-container {
  --margin: 0px;
  position: relative;
  top: 0; 
  left: 0;
  width: calc(100% - 2*var(--margin));
  height: fit-content; 
  margin: var(--margin);
  padding-block: 0.5rem;
  // pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
  // border-bottom: 1px solid var(--accent-color);
  background-color: #272727;
  user-select: none;
  
  
  transition: height 0.5s ease-in-out;
  
  @media (max-width: 600px) {
    font-size: 0.75rem;
  }
  
  #top-guided-content {
    // buttons
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 90%;
    
    
    div.icon-wrapper {
      background-color: rgba(209, 209, 209, .2);
      // box-shadow: 0px 0px 5px rgba(27, 27, 27, 0.7);
      border: none;
      border-radius: 5px;
      padding-inline: 10px;
      padding-block: 3px;
      width: 100%;
      margin-inline: 10px;
      justify-content: center;
    }
    
  }
  
  #bottom-guided-content {
    // map stuff
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    
  
    #map-holder {
      // width: 90%;
      height: fit-content;
      pointer-events: auto;
      margin-inline: auto;
      
      #title {
        color: var(--accent-color);
        font-weight: bold;
        font-size: 0.8rem;
        margin-bottom: 1rem;
      }
      
      #map-container-map {
        height: 300px;
        width: 450px;
        aspect-ratio: 2 / 1;
        background-color: cornsilk;
        
        span {
          font-weight: bold;
          color: black;
          // wrap text
          white-space: break-spaces;
        }
        
      }
      
    }
    
    #bottom-center-content {
      // text guidelines

      .bottom-center-content-text {
        color: white;
        font-size: 1em;
        text-align: center;
        margin: 1em;
        padding: 0;
        
      }
      
      #location-time-display {
        margin: 1em;
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        gap: 0.5rem;
        
      
        .ltd-container {
          // display: block;
          padding-inline: 0.5em;
          margin-bottom: 0.5em;
          text-align: left;
          background-color: aliceblue;
          color: blue;
          border-radius: 0.5em;
          flex-grow: 1;
        }
        
        .ltd-label {
          font-weight: bold;
        }
      }
    }
  }
}



#introduction-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 75%;
  height: fit-content;
  // outline: 5px solid var(--accent-color);
  border-radius: 2em;
  padding: 2em;
  font-size: 1em;
  // rotated translucent background gradient
  background: linear-gradient(45deg,
                            rgb(15, 32, 39), 
                            rgb(32, 58, 67), 
                            rgba(44, 83, 100));

  .v-list-item__prepend {
    margin-right: 0.75em;
  }
  
  .intro-text {
    color: var(--accent-color);
  }
  
  div#intro-bottom-controls {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1em;
    margin-top:1em;
  
    #intro-reminder {
      outline: 1px solid red;
    }
    
    #intro-next-button {
      background-color: rgba(18, 18, 18,.5);
    }
  }
}



</style>
