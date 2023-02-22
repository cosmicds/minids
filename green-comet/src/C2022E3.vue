
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
      :class="{ pointer: lastClosePt !== null }"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerdown="onPointerDown"
    ></WorldWideTelescope>
    
    <v-overlay
      :model-value="showSplashScreen"
      absolute
      opacity="0.6"
      id="splash-overlay"
    >
      <img
        id="splash-screen"
        :src="require(`./assets/Green_Comet_Mini_Splashscreen_wVideo.png`)"
        v-click-outside="closeSplashScreen"
        contain
      />
      <a
        id="splash-close"
        @click="closeSplashScreen">
      </a>
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
      <div
        id="video-icon-dummy"
        class="control-icon-wrapper"
      >
        <font-awesome-icon
          id="video-icon"
          class="control-icon"
          icon="video"
          size="lg"
        ></font-awesome-icon>
      </div>
      <div id="center-buttons">
        <v-tooltip
          v-model="showMapTooltip"
          location="bottom"
          :open-on-click="false"
          :open-on-focus="false"
          :open-on-hover="true"
        >
          <template v-slot:activator="{ props }">
            <div
              id="map-icon-wrapper"
              class="control-icon-wrapper"
              @mouseover="showMapTooltip = true"
              @mouseleave="showMapTooltip = false"
              v-bind="props"
              @click="showLocationSelector = true"
              @keyup.enter="showLocationSelector = true"
              tabindex="0"
            >
              <font-awesome-icon
                id="location-icon"
                class="control-icon px-1"
                icon="location-pin"
                size="lg"
              ></font-awesome-icon>
            </div>
          </template>
          <span>Select location</span>
        </v-tooltip>
      </div>
      <div id="right-buttons">
        <v-tooltip
          location="start"
          :open-on-click="false"
          :open-on-focus="false"
          :open-on-hover="true"
          v-model="showTextTooltip"
          :offset="smallSize ? 0 : '45px'"
        >
          <template v-slot:activator="{ props }">
            <div
              id="text-icon-wrapper"
              class="control-icon-wrapper"
              @mouseover="showTextTooltip = true"
              @mouseleave="showTextTooltip = false"
              v-bind="props"
              @click="showTextSheet = true"
              @keyup.enter="showTextSheet = true"
              tabindex="0"
            >
              <font-awesome-icon
                id="text-icon"
                class="control-icon"
                icon="book-open"
                size="lg"
              ></font-awesome-icon>
            </div>
          </template>
          <span>Learn more</span>
        </v-tooltip>
        <v-tooltip
          location="start"
          :open-on-click="false"
          :open-on-focus="false"
          :open-on-hover="true"
          v-model="showVideoTooltip"
          :offset="smallSize ? 0 : '45px'"
        >
          <template v-slot:activator="{ props }">
            <div
              id="video-icon-wrapper"
              class="control-icon-wrapper"
              @mouseover="showVideoTooltip = true"
              @mouseleave="showVideoTooltip = false"
              v-bind="props"
              @click="showVideoSheet = true"
              @keyup.enter="showVideoSheet = true"
              tabindex="0"
            >
              <font-awesome-icon
                id="video-icon"
                class="control-icon"
                icon="video"
                size="lg"
              ></font-awesome-icon>
            </div>
          </template>
          <span>Watch video</span>
        </v-tooltip>
      </div>
    </div>
    
    <div class="left-content">
      <folder-view
        v-if="imagesetFolder !== null"
        class="folder-view"
        sliders
        expandable
        :thumbnails="true"
        :open="mobile ? false : true"
        :root-folder="imagesetFolder"
        :wwt-namespace="wwtNamespace"
        :incomingItemSelect="incomingItemSelect"
        flex-direction="column"
        @select="onItemSelected"
        @opacity="onOpacityChanged"
        @toggle="onToggle"
      ></folder-view>
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
            :color="cometColor"
            :icon="showControls ? `chevron-down` : `gear`"
            @click="showControls = !showControls"
            @keyup.enter="showControls = !showControls"
            tabindex="0"
          />
        </div>
        <transition-expand>
          <div v-if="showControls" class="controls-content">
            <v-checkbox
              :color="cometColor"
              v-model="showAltAzGrid"
              @keyup.enter="showAltAzGrid = !showAltAzGrid"
              label="Grid"
              hide-details
            />
            <v-checkbox
              :color="cometColor"
              v-model="showConstellations"
              @keyup.enter="showConstellations = !showConstellations"
              label="Constellations"
              hide-details
            />
            <v-checkbox
              :color="cometColor"
              v-model="showHorizon"
              @keyup.enter="showHorizon = !showHorizon"
              label="Horizon"
              hide-details
            />
            <div
              style="color:white;"
              class="mt-3"
            >
              Selected location's time:
            </div>
            <date-picker
              dark
              time-picker
              enable-seconds
              :is-24="false"
              v-model="timeOfDay"
              :clearable="false"
              close-on-scroll
              class="mb-4 mt-1"
            >
              <template #input-icon>
                <font-awesome-icon
                  icon="clock"
                  class="mx-2"
                  :color="cometColor"
                ></font-awesome-icon>
              </template>
            </date-picker>
            <v-btn
              block
              :color="cometColor"
              @click="centerOnCurrentDate"
              @keyup.enter="centerOnCurrentDate"
              class="mb-2"
            >
              Center on Now
            </v-btn>
            <v-btn
              block
              :color="cometColor"
              @click="() => {
                playing = false;
                playingCometPath = !playingCometPath;
              }"
            >
              {{ `${playingCometPath ? 'Stop' : 'Play'} comet images` }}
            </v-btn>
            <!--
            <v-btn
              block
              :color="cometColor"
              @click="setToFirstCometImage"
            >
              Best view for comet images
            </v-btn> -->
          </div>
        </transition-expand>
      </div>
      <div id="tools">
        <span class="tool-container">
          <!-- <v-chip
            id="sliderlabel"
            outlined
            label
            >
            Date
          </v-chip> -->
          <v-tooltip
            location="top"
            :open-on-click="false"
            :open-on-focus="false"
            :open-on-hover="true"
            v-model="showPlayPauseTooltip"
          >
            <template v-slot:activator="{ props }">
              <div
                id="play-pause-icon-wrapper"
                class="control-icon-wrapper"
                @mouseover="showPlayPauseTooltip = true"
                @mouseleave="showPlayPauseTooltip = false"
                v-bind="props"
                @click="() => {
                  playing = !(playing || playingCometPath); // set playing to true if both playing & pCP are false. set playing to false if either playing or pCP are true.
                  playingCometPath = false; // don't reverse the order of this line and previous or logic will break.
                }"
                @keyup.enter="() => {
                  playing = !(playing || playingCometPath); // set playing to true if both playing & pCP are false. set playing to false if either playing or pCP are true.
                  playingCometPath = false; // don't reverse the order of this line and previous or logic will break.
                }"
                tabindex="0"
              >
                <font-awesome-icon
                  id="play-pause-icon"
                  class="control-icon"
                  :icon="!(playing || playingCometPath) ? 'play' : 'pause'"
                  size="lg"
                ></font-awesome-icon>
              </div>
            </template>
            <span>Play/Pause</span>
          </v-tooltip>
          <vue-slider
            id="slider"
            adsorb
            included
            :marks="(d: number) => {
              return allDates.includes(d) || cometImageDates.includes(d);
            }"
            :order="false"
            v-model="selectedTime"
            @change="onTimeSliderchange"
            :data="dates"
            tooltip="always"
            :tooltip-formatter="(v: number) => 
              toDateString(new Date(v))
            "
            >
              <template v-slot:mark="{ pos, value }">
                <div
                  :class="[{ 'mark-line': cometImageDates.includes(value) }]"
                  :style="{ left: `${pos}%` }">
                </div>
              </template>
            </vue-slider>
          </span>
      </div>
      <div id="credits" class="ui-text">
        <div id="icons-container">
          <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank"
            ><img alt="CosmicDS Logo" src="../../assets/cosmicds_logo_for_dark_backgrounds.png"
          /></a>
          <a href="https://worldwidetelescope.org/home/" target="_blank"
            ><img alt="WWT Logo" src="../../assets/logo_wwt.png"
          /></a>
          <a href="https://science.nasa.gov/learners" target="_blank" class="pl-1"
            ><img alt="SciAct Logo" src="../../assets/logo_sciact.png"
          /></a>
          <a href="https://nasa.gov/" target="_blank" class="pl-1"
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
          <source src="./assets/video2.mp4" type="video/mp4">
        </video>
      </div>
    </v-dialog>

    <v-dialog
      id="location-dialog"
      v-model="showLocationSelector"
    >
      <v-card id="location-selector">
        <div
          class="text-center"
        >
          Move around the map and double-click to change location
        </div>
        <v-btn
          @click="getLocation"
          @keyup.enter="getLocation"
        >
          Use My Location
        </v-btn>
        <div class="text-center red--text">{{  locationErrorMessage  }}</div>
        <div id="map-container"></div>
      </v-card>
    </v-dialog>

    <v-dialog
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
        :color="cometColor"
        :slider-color="cometColor"
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
                
                Comets are dusty snowballs, large clumps of rock and ice, that originate in the outer solar system. The “Green Comet” (or <a href="https://science.nasa.gov/comet-2022-e3-ztf" target="_blank">C/2022 E3</a>) makes its closest approach to the Sun (and to Earth) in early 2023. The comet images in this interactive view were taken on different dates from December 2022 through January 2023 by astrophotographer <a href="http://www.astrostudio.at/" target="_blank">Gerald Rhemann</a>.
                <br><br>

                <h3>Explore!</h3>
                Adjusting the <span class="ui-element-ref-comet">Date</span> slider along the bottom of the screen shows you the position of the comet since it was discovered in March 2022. 
                <ul class="text-list">
                  <li>Move the date slider forward and backward. Observe how the comet moves in the sky with time. Can you find when the comet is moving fastest in the sky and when it is moving slowest in the sky? Can you find when the comet path “twirls” in the sky? (This is known as “retrograde motion.”)</li>
                  <li>Click the thumbnail images on the left to see photographs of the comet in the virtual sky. Use the sliders under the thumbnails to display the comet images for multiple dates.</li>
                  <li>Look at the comet images in order by date. What do you notice about the direction of the comet’s tails relative to the motion of the comet?</li>
                </ul>
                <br>

                <h3>Why is the Comet Green?</h3>
                Visually, comets have three parts: the bright coma and two tails. The coma is material being vaporized off the comet’s surface by radiation from the Sun. The green color of the comet is due to dicarbon (a molecule made of two carbon atoms, C<sub>2</sub>) in the comet’s coma. When excited by ultraviolet light from the sun, dicarbon fluoresces with a blue-green light. 
                <br><br>

                <h3>A Comet’s Tail</h3>
                The comet has an ionized gas tail and a dust tail. The gas tail is composed of the gas being blown off the comet’s surface and ionized (given an electric charge) by ultraviolet radiation from the Sun. This charged gas is blown in a direction <strong>away</strong> from the Sun by the solar wind. The dust tail is made of dust blown off the surface by jets of vaporizing gas. The dust is electrically neutral and does not get pushed as hard by the solar wind, which is why it is generally distinct from the gas tail. Many people think that the tails trail behind the comet as it moves forward. You can see from the images that the solar wind is blowing the tails ahead of the comet as it moves in space!

                <br><br><br>
                <div class="credits">
                <h3>Credits:</h3>
                <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank">CosmicDS</a> Mini Stories Team:</h4>
                Jon Carifio<br>
                John Lewis<br>
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
                <br>
                The material contained on this website is based upon work supported by NASA under award No. 80NSSC21M0002. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Aeronautics and Space Administration.
                </div>
                <v-spacer class="end-spacer"></v-spacer>
              </v-card-text>
            </v-card>
          </v-window-item>
          <v-window-item>
            <v-card class="no-bottom-border-radius scrollable" style="height: 100%;">
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
                      <div
                        style="min-height: 120px;"
                      >
                        <h4>Tips:</h4>
                        <ul class="text-list">
                          <li>
                            Click <font-awesome-icon
                                  class="control-icon"
                                  icon="location-pin"
                                  size="lg" 
                                ></font-awesome-icon>
                            to adjust your location.
                          </li>
                          <li>
                            Adjust the date slider at the bottom to see the location of the Green Comet on a particular day.
                          </li>
                          <li>
                            Click 
                              <font-awesome-icon
                                id="play-pause-icon"
                                class="control-icon"
                                icon="play"
                                size="lg"
                              ></font-awesome-icon>
                            to auto-advance time.
                          </li>
                          <li>
                            The small pink markers in the sky show the path of the comet on a particular date at 00:00 UT and 12:00 UT. The larger pink marker shows the position of the comet at the time displayed on the clock. Small pink dots overlaid with a larger white'ish dot indicate dates that have comet photographs.
                          </li>
                          <li>
                            Click a thumbnail image in the panel in the upper left to see an image of the comet photographed by Gerald Rhemann overlaid on the virtual sky on that day. The slider under the thumbnail adjusts the image opacity within the sky view.
                          </li>
                          <li>
                            Depending on what you are trying to see, you may want to try different zoom levels. Zooming out will help you see the comet's overall path better. Zooming in will help you see more details in the comet images.
                          </li>                          
                          <li>
                            Adjust your local time using the time controller and choose whether to display the sky grid, constellations, or the horizon. You can also recenter the view on the comet's location today.
                          </li>
                        </ul>
                      <br>
                      This Mini Data Story is powered by WorldWide Telescope (WWT).

                      </div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <div class="credits">
                      <h3>Credits:</h3>
                      <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank">CosmicDS</a> Mini Stories Team:</h4>
                      Jon Carifio<br>
                      John Lewis<br>
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

    <notifications group="startup-location" position="top right" />

  </div>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { csvFormatRows, csvParse } from "d3-dsv";

import { distance } from "@wwtelescope/astro";
import { Color, Constellations, Folder, Grids, Layer, LayerManager, Poly, RenderContext, Settings, SpreadSheetLayer, WWTControl } from "@wwtelescope/engine";
import { ImageSetType, MarkerScales, PlotTypes, PointScaleTypes, Thumbnail } from "@wwtelescope/engine-types";

import L, { LeafletMouseEvent, Map } from "leaflet";
import { getTimezoneOffset } from "date-fns-tz";
import tzlookup from "tz-lookup";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common"

import { ImageSetLayer, Place, Imageset } from "@wwtelescope/engine";
import { applyImageSetLayerSetting } from "@wwtelescope/engine-helpers";

import { drawSkyOverlays, initializeConstellationNames, makeAltAzGridText, drawSpreadSheetLayer, layerManagerDraw } from "./wwt-hacks";

interface MoveOptions {
  instant?: boolean;
  zoomDeg?: number;
  rollRad?: number;
}

import {
  ephemerisFullDatesCsv,
  ephemerisCometImageDatesCsv
} from "./data";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

const SECONDS_PER_DAY = 60 * 60 * 24;
const MILLISECONDS_PER_DAY = 1000 * SECONDS_PER_DAY;

function parseCsvTable(csv: string) {
  return csvParse(csv, (d) => {
    return {
      date: new Date(d.Date!),
      ra: +d.RA!,
      dec: +d.Dec!,
      tMag: +d.Tmag!,
      angspeed: +d.SkyMotion!,
    };
  });
}
const FullDatesTable = parseCsvTable(ephemerisFullDatesCsv);
const CometImageDatesTable = parseCsvTable(ephemerisCometImageDatesCsv);

// NB: The two tables have identical structures.
// We aren't exporting these types anywhere, so
// generic names are fine
type Table = typeof FullDatesTable;
type TableRow = typeof FullDatesTable[number];

function formatCsvTable(table: Table): string {
  return csvFormatRows([[
        "Date", "RA", "Dec", "Tmag" , "Angspeed"
      ]].concat(table.map((d, _i) => {
        return [
          d.date.toISOString(),
          d.ra.toString(),
          d.dec.toString(),
          d.tMag.toString(),
          d.angspeed.toString(),
        ];
    }))).replace(/\n/g, '\r\n');
    // By using a regex, we replace all instances.
    // For WWT implementation reasons (left over from 
    // the Windows client?), we need the line endings 
    // to be CRLF
}

const FullDatesString = formatCsvTable(FullDatesTable);
const CometImageDatesString = formatCsvTable(CometImageDatesTable);

const allDates = FullDatesTable.map(r => r.date.getTime());
const cometImageDates = CometImageDatesTable.map(r => r.date.getTime());
const minDate = Math.min(...allDates, ...cometImageDates);
const maxDate = Math.max(...allDates, ...cometImageDates);
const dates: number[] = [];

const d = new Date(minDate);
let t = d.getTime();
while (t <= maxDate) {
  dates.push(t);
  dates.push(t + 86400000/2);
  d.setUTCDate(d.getUTCDate() + 1);
  t = d.getTime();
}

type LocationRad = {
  longitudeRad: number;
  latitudeRad: number;
}

type EquatorialRad = {
  raRad: number;
  decRad: number;
}

type HorizontalRad = {
  altRad: number;
  azRad: number;
}

type SheetType = "text" | "video" | null;

export default defineComponent({
  extends: MiniDSBase,
  
  props: {
    wtml: {
      type: Object,
      required: true
    },
    wwtNamespace: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      required: true
    },
    bgWtml: {
      type: String,
      required: true
    },
    bgName: {
      type: String,
      required: true
    }
  },
  data() {
    const now = new Date();
    return {
      showSplashScreen: true,
      imagesetLayers: {} as Record<string, ImageSetLayer>,
      layersLoaded: false,
      positionSet: false,
      imagesetFolder: null as Folder | null,
      backgroundImagesets: [] as BackgroundImageset[],

      playing: false,
      playingCometPath: false,
      playingIntervalId: null as ReturnType<typeof setInterval> | null,

      showAltAzGrid: true,
      showConstellations: false,
      showHorizon: false,

      currentCometImageLayer: null as SpreadSheetLayer | null,
      currentAllLayer: null as SpreadSheetLayer | null,
      interpolatedDailyTable: null as Table | null,

      cometImageDates: cometImageDates,
      allDates: allDates,
      dates: dates,
      
      lastClosePt: null as TableRow | null,
      ephemerisColor: "#D60493",
      cometColor: "#04D6B0",
      todayColor: "#D6B004",

      incomingItemSelect: null as Thumbnail | null,
      
      sheet: null as SheetType,
      showMapTooltip: false,
      showTextTooltip: false,
      showVideoTooltip: false,
      showPlayPauseTooltip: false,
      showLocationSelector: false,
      showControls: false,
      tab: 0,

      circle: null as L.Circle | null,
      map: null as Map | null,

      selectionProximity: 4,
      pointerMoveThreshold: 6,
      isPointerMoving: false,
      pointerStartPosition: null as { x: number; y: number } | null,

      // Harvard Observatory
      timeOfDay: { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() },
      selectedTime: now.setUTCHours(0, 0, 0, 0),
      selectedTimezone: "America/New_York",
      location: {
        latitudeRad: D2R * 42.3814,
        longitudeRad: D2R * -71.1281
      } as LocationRad,
      locationErrorMessage: ""
    }
  },

  mounted() {

    this.waitForReady().then(async () => {

      // Unlike the other things we're hacking here,
      // we aren't overwriting a method on a singleton instance (WWTControl)
      // or a static method (Constellations, Grids)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      SpreadSheetLayer.prototype.draw = drawSpreadSheetLayer;

      this.imagesetFolder = await this.loadImageCollection({
        url: this.wtml.c2022e3,
        loadChildFolders: false
      });
      const children = this.imagesetFolder.get_children() ?? [];
      const layerPromises: Promise<Layer>[] = [];
      children.forEach((item) => {
        if (!(item instanceof Place)) { return; }
        const imageset = item.get_backgroundImageset() ?? item.get_studyImageset();
        if (imageset == null) { return; }
        const name = imageset.get_name();
        layerPromises.push(this.addImageSetLayer({
          url: imageset.get_url(),
          mode: "autodetect",
          name: name,
          goto: false
        }).then((layer) => {
          this.imagesetLayers[name] = layer;
          applyImageSetLayerSetting(layer, ["opacity", 0]);
          return layer;
        }));
      });
      

      this.loadImageCollection({
        url: this.bgWtml,
        loadChildFolders: true,
      });
      
      this.backgroundImagesets = [...skyBackgroundImagesets];

      this.getLocation(true);
      this.setClockSync(false);
      // create date with y m d h m s

      layerPromises.push(this.createTableLayer({
        name: "All Dates",
        referenceFrame: "Sky",
        dataCsv: FullDatesString
      }).then((layer) => {
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        layer.set_markerScale(MarkerScales.screen);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 2.5],
            ["plotType", PlotTypes.point],
            ["color", Color.fromHex(this.ephemerisColor)],
            //["sizeColumn", 4],
            //["pointScaleType", PointScaleTypes.log],
            ["opacity", 0.8]
          ]
        });
        return layer;
      }));

      layerPromises.push(this.createTableLayer({
        name: "Comet Image Dates",
        referenceFrame: "Sky",
        dataCsv: CometImageDatesString
      }).then((layer) => {
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        layer.set_markerScale(MarkerScales.screen);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 4],
            ["color", Color.fromHex('#FFFFFF')],
            ["plotType", PlotTypes.point],
            //["sizeColumn", 3],
            ["opacity", 0.4]
          ]
        });
        return layer;
      }));

      this.setTime(this.dateTime);

      this.showControls = !this.mobile;

      Promise.all(layerPromises).then(() => {
        this.layersLoaded = true;
        
        // Set all of the imageset layers to be above the spreadsheet layers
        this.resetImagesetLayerOrder();

        const splashScreenListener = (_event: KeyboardEvent) => {
          this.showSplashScreen = false;
          window.removeEventListener('keyup', splashScreenListener);
        }
        window.addEventListener('keyup', splashScreenListener);

        window.addEventListener('keyup', (event: KeyboardEvent) => {
          if (["Esc", "Escape"].includes(event.key) && this.showVideoSheet) {
            this.showVideoSheet = false;
          }
        });
      });

      this.wwtSettings.set_localHorizonMode(true);
      this.wwtSettings.set_showAltAzGrid(this.showAltAzGrid);
      this.wwtSettings.set_showAltAzGridText(this.showAltAzGrid);
      this.wwtSettings.set_showConstellationLabels(this.showConstellations);
      this.wwtSettings.set_showConstellationFigures(this.showConstellations);

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

      this.updateWWTLocation();

      // wwtZoomDeg is still 0 if we run this here
      // and it was the same in nextTick
      // so give just a bit of a delay
      setTimeout(() => {
        this.centerOnCurrentDate();
        this.positionSet = true;
      }, 100);

    });

  },

  computed: {

    dateTime() {
      const todMs = this.dayFrac * MILLISECONDS_PER_DAY;
      return new Date(this.selectedDate.getTime() + todMs);
    },

    selectedTimezoneOffset() {
      return getTimezoneOffset(this.selectedTimezone);
    },

    isLoading(): boolean {
      return !this.ready;
    },
    ready(): boolean {
      return this.layersLoaded && this.positionSet;
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
      return{
        '--comet-color': this.cometColor,
        '--ephemeris-color': this.ephemerisColor,
        '--app-content-height': this.showTextSheet ? '66%' : '100%',
      };
    },
    wwtControl(): WWTControl {
      return WWTControl.singleton;
    },
    wwtRenderContext(): RenderContext {
      return this.wwtControl.renderContext;
    },
    wwtSettings(): Settings {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return Settings.get_active();
    },
    dayFrac(): number {
      const dateForTOD = new Date();
      const timezoneOffsetHours = this.selectedTimezoneOffset / (60*60*1000);
      dateForTOD.setUTCHours(this.timeOfDay.hours - timezoneOffsetHours, this.timeOfDay.minutes, this.timeOfDay.seconds);
      const todMs = 1000 * (3600 * dateForTOD.getUTCHours() + 60 * dateForTOD.getUTCMinutes() + dateForTOD.getUTCSeconds());
      return todMs / MILLISECONDS_PER_DAY;
    },

    dontSetTime(): boolean {
      return this.selectedTime %MILLISECONDS_PER_DAY !== 0;
    },
    
    showTextSheet: {
      get(): boolean {
        return this.sheet === 'text';
      },
      set(_value: boolean) {
        this.selectSheet('text');
        this.showTextTooltip = false;
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
        this.showVideoTooltip = false;
      }
    },
    // altAz() {
    //   return this.equatorialToHorizontal(this.wwtRARad, this.wwtDecRad, this.location.latitudeRad, this.location.longitudeRad, this.selectedDate || new Date());
    // }
  },

  methods: {

    clearPlayingInterval() {
      if (this.playingIntervalId !== null) {
        clearInterval(this.playingIntervalId);
        this.playingIntervalId = null;
      }
    },

    moveOneDayForward() {
      this.selectedTime += MILLISECONDS_PER_DAY;
    },

    moveOneDayBackward() {
      this.selectedTime -= MILLISECONDS_PER_DAY;
    },

    toDateString(date: Date) {
      // date = new Date(date.getTime() + this.selectedTimezoneOffset) // ignore timezone
      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
    },

    interpolatedTable(table: Table): Table | null {
      const index = table.findIndex(r => r.date.getTime() === this.selectedTime);
      if (index === -1) { return null; }
      const row = table[index];
      const nextRow = table[index + 1] ?? row;
      const delta_t = (nextRow.date.getTime() - row.date.getTime()) / MILLISECONDS_PER_DAY;
      // get how far we are into the day
      const dayFracPassed = (row.date.getTime() / MILLISECONDS_PER_DAY) % 1;
      const f = (this.dayFrac - dayFracPassed) / delta_t;
      const interpolatedRA = (1 - f) * row.ra + f * nextRow.ra;
      const interpolatedDec = (1 - f) * row.dec + f * nextRow.dec;
      
      const interpolatedRow: TableRow = { ...row };
      interpolatedRow.ra = interpolatedRA;
      interpolatedRow.dec = interpolatedDec;
      return Object.assign([interpolatedRow], { columns: table.columns });
    },

    // JC: When the "allow imagesets above spreadsheets" functionality
    // gets added into the engine,
    // remember to add something like this along with it
    setSpreadSheetLayerOrder(id: string, order: number) {
      const layer = LayerManager.get_layerList()[id];
      const layers = LayerManager.get_allMaps()[layer.get_referenceFrame()].layers;
      if (order >= 0) {
        const currentIndex = layers.indexOf(layer);
        if (currentIndex > -1) {
          layers.splice(currentIndex, 1);
        }
        LayerManager.get_allMaps()[layer.get_referenceFrame()].layers.splice(order, 0, layer);
      }
    },

    updateLayersForDate() {

      this.interpolatedDailyTable = this.interpolatedTable(FullDatesTable);
      if (this.currentAllLayer !== null) {
        this.deleteLayer(this.currentAllLayer.id);
        this.currentAllLayer = null;
      }

      if (this.interpolatedDailyTable !== null) {
        this.createTableLayer({
          name: "Daily Date Layer",
          referenceFrame: "Sky",
          dataCsv: formatCsvTable(this.interpolatedDailyTable)
        }).then((layer) => {
          this.currentAllLayer = layer;
          layer.set_lngColumn(1);
          layer.set_latColumn(2);
          layer.set_markerScale(MarkerScales.screen);
          this.setSpreadSheetLayerOrder(layer.id.toString(), 0);
          this.applyTableLayerSettings({
            id: layer.id.toString(),
            settings: [
              ["scaleFactor", 5],
              ["plotType", PlotTypes.point],
              ["color", Color.fromHex('#E562BC')],
              //["sizeColumn", 3],
              ["opacity", 1],
            ]
          });
        });
      }
    },

    closeSplashScreen() {
      this.showSplashScreen = false;
    },
  
    updateWWTLocation() {
      this.wwtSettings.set_locationLat(R2D * this.location.latitudeRad);
      this.wwtSettings.set_locationLng(R2D * this.location.longitudeRad );
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
      if (this.sheet == name) {
        this.sheet = null;
        this.$nextTick(() => {
          this.blurActiveElement();
        });
      } else {
        this.sheet = name;
      }
    },

    getImageSetLayerIndex(layer: ImageSetLayer): number {
      // find layer in this.wwtActiveLayers
      // this.wwtActiveLayers is a dictionary of {0:id1, 1:id2, 2:id3, ...}
      // get the key item with the value of layer.id
      for (const [key, value] of Object.entries(this.wwtActiveLayers)) {
        if (value === layer.id.toString()) {
          return Number(key);
        }
      }
      return -1;
    },

    resetImagesetLayerOrder() {
      // Reset the order of the imageset layers
      Object.keys(this.imagesetLayers).sort((k1, k2) => {
        return new Date(k1).getTime() - new Date(k2).getTime();
      }).forEach((key) => {
        const layer = this.imagesetLayers[key];
        this.setImageSetLayerOrder({
          id: layer.id.toString(),
          order: this.wwtActiveLayers.length
        });
      });
    },

    
    onItemSelected(place: Place) {
      this.logTimes(`onItemSelected: ${place.get_name()}`)
      const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
      if (iset == null) { return; }
      const layer = this.imagesetLayers[iset.get_name()];
      this.resetImagesetLayerOrder();
      this.setImageSetLayerOrder({
        id: layer.id.toString(),
        order: this.wwtActiveLayers.length + 1
      });
      const [month, day, year] = iset.get_name().split("/").map(x => parseInt(x));
      this.selectedTime = Date.UTC(year, month - 1, day); 
      this.showImageForDateTime(this.dateTime)
      // this.updateViewForDate();

      // Give time for the selectedTime changes to propagate
      setTimeout(() => {
        this.$nextTick(() => {
          if (this.image_out_of_view(place) || this.need_to_zoom_in(place)) {
            this.gotoRADecZoom({
              raRad: D2R * iset.get_centerX(),
              decRad: D2R * iset.get_centerY(),
              zoomDeg: place.get_zoomLevel() * 2.5,
              instant: true
            });
          }
        });
      }, 10);
      
    },

    wwtSmallestFov(): number {
      // ignore the possibility of rotation
      const w = this.wwtRenderContext.width
      const h = this.wwtRenderContext.height
      const fov_h = this.wwtRenderContext.get_fovAngle() * D2R
      const fov_w = fov_h * w / h
      return Math.min(fov_w, fov_h)
    },

    radecInFOV(ra: number, dec: number, center_ra: number, center_dec: number, fov: number, fov_view: number, fraction_of_place: number): boolean {
      let dist = distance(ra, dec, center_ra, center_dec);
      dist += (fraction_of_place - 1/2) * fov 
      return dist < fov_view / 2
    },

    moveIfTableRowOfFOV(position: TableRow) {
      // get imageset of date
        const move = this.radecInFOV(
          D2R * position.ra * D2R,
          D2R * position.dec * D2R,
          this.wwtRARad,
          this.wwtDecRad,
          10 * D2R,
          this.wwtRenderContext.get_fovAngle() * D2R,
          1/2
        )

      return move
      
    },
    
    checkIfPlaceIsInTheCurrentFOV(place: Place, fraction_of_place = 1/2): boolean {
      // checks if the center of place is in the current field of view
      // Assume the Zoom level corresponds to the size of the image
      // fraction_of_place is ~fraction of the place that must be in the current FOV
      // by default, allow 1/3 of the place to be visible and still be considered in view
      const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
      if (iset == null) {
        return false;
      }

      const isetRa = iset.get_centerX() * D2R;
      const isetDec = iset.get_centerY() * D2R;
      const isetFov = (place.get_zoomLevel() / 6) * D2R
      
      const curRa = this.wwtRARad;
      const curDec = this.wwtDecRad;
      const curFov = this.wwtSmallestFov();

      const return_val = this.radecInFOV(isetRa, isetDec, curRa, curDec, isetFov, curFov, fraction_of_place) 
      return return_val
    },

    // convenience wrapper for (not checkIfPlaceIsInTheCurrentFOV)
    image_out_of_view(place: Place): boolean { return !this.checkIfPlaceIsInTheCurrentFOV(place) },

    need_to_zoom_in(place: Place, factor = 5): boolean {
      // 1) we are already zoomed all the way out (if FOV > 50)
      if (this.wwtZoomDeg > 300) { return true; }

      // 2) the image is too small (so it's fov < 1/6 of the current fov)
      const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
      if (iset != null) {
        if (place.get_zoomLevel() * factor < this.wwtZoomDeg) { return true; }
      }
      
      return false
    },

    onTimeSliderchange(options?: MoveOptions) {
      this.$nextTick(() => {
        this.showImageForDateTime(this.dateTime);
        this.updateViewForDate(options);
      });
    },

    
    
    onOpacityChanged(place: Place, opacity: number, move: boolean) {
      const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
      if (iset == null) { return; }
      this.updateImageOpacity(place, opacity);
      

      this.$nextTick(() => {
        const zoom = this.need_to_zoom_in(place, 2.5) ? place.get_zoomLevel() * 2.5 : this.wwtZoomDeg;
        if ((this.image_out_of_view(place) && move) || (this.need_to_zoom_in(place, 8) && move) ) {
          const [month, day, year] = iset.get_name().split("/").map(x => parseInt(x));
          this.selectedTime = Date.UTC(year, month - 1, day); 
          this.incomingItemSelect = place;

          this.gotoRADecZoom({
            raRad: D2R * iset.get_centerX(),
            decRad: D2R * iset.get_centerY(),
            zoomDeg: zoom,
            instant: false
          });
        }
      });
    },

    updateImageOpacity(place: Place, opacity: number) {
      const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
      if (iset == null) { return; }
      const layer = this.imagesetLayers[iset.get_name()];
      if (layer == null) { return; }
      // applyImageSetLayerSetting(layer, ["opacity", opacity / 100]);
      // tell setLayerOpacityForImageSet that we are updating from the ui
      this.setLayerOpacityForImageSet(iset.get_name(), opacity / 100, true);
    },
    
    onToggle(place: Place, checked: boolean) {
      // when we toggle the image we want to set it's opacity to zero
      const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
      if (iset == null) { return; } 
      const iname = iset.get_name()
      this.setLayerOpacityForImageSet(iname, checked ? 1 : 0);
    },
    
    setupLocationSelector() {
      const locationDeg: [number, number] = [R2D * this.location.latitudeRad, R2D * this.location.longitudeRad];
      const map = L.map("map-container").setView(locationDeg, 4);
      // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //   maxZoom: 19,
      //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      //   className: 'map-tiles'
      // }).addTo(map);
      L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3'],
        attribution: `&copy <a href="https://www.google.com/maps">Google Maps</a>`,
        className: 'map-tiles'
      }).addTo(map);

      this.circle = this.circleForLocation(...locationDeg).addTo(map);

      map.doubleClickZoom.disable();
      map.on('dblclick', this.onMapSelect);
      this.map = map;
    },

    onMapSelect(e: LeafletMouseEvent) {
      let lngRad = e.latlng.lng * D2R + Math.PI;
      const twoPi = 2 * Math.PI;
      lngRad = ((lngRad % twoPi) + twoPi) % twoPi; // We want modulo, but JS % operator is remainder
      lngRad -= Math.PI;
      this.location = {
        latitudeRad: e.latlng.lat * D2R,
        longitudeRad: lngRad
      };
    },

    circleForLocation(latDeg: number, lonDeg: number): L.Circle<any> {
      return L.circle([latDeg, lonDeg], {
        color: "#FF0000",
        fillColor: "#FF0033",
        fillOpacity: 0.5,
        radius: 200
      });
    },

    getLocation(startup = false) {
      const options = { timeout: 10000, enableHighAccuracy: true };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.location = {
            longitudeRad: D2R * position.coords.longitude,
            latitudeRad: D2R * position.coords.latitude
          }

          if (this.map) {
            this.map.setView([position.coords.latitude, position.coords.longitude], this.map.getZoom());
          }
        },
        (_error) => {
          const msg = "Unable to autodetect location. Location will default to Cambridge, MA, USA, or you can\nuse the location selector to manually input a location.";
          if (startup) {
            this.$notify({
              group: "startup-location",
              type: "error",
              text: msg,
              duration: 4500
            });
          } else {
            this.locationErrorMessage = msg;
          }
          this.updateHorizon();
        },
        options
      );
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

    get_julian(utc: Date): number {
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
      const JD = b + c + d + 1720994.5 + day + (hour + minute / 60.00 + second / 3600.00) / 24.00;
      return JD

    },
    
    mstFromUTC2(utc: Date, longRad: number): number {
      const lng = longRad * R2D;

      const modified_jd = this.get_julian(utc)  - 2451545;

      const julianCenturies = modified_jd / 36525.0;
      // this form wants julianDays - 2451545
      let mst = 280.46061837 + 360.98564736629 * modified_jd + 0.000387933 * julianCenturies * julianCenturies - julianCenturies * julianCenturies * julianCenturies / 38710000 + lng;

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
      const N = 6;
      const delta = 2 * Math.PI / N;
      for (let i = 0; i < N; i++) {
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

    closestPoint(
      point: { x: number; y: number; },
      threshold?: number
    ): TableRow | null {
      const raDecDeg = this.findRADecForScreenPoint(point);
      const target = { ra: D2R * raDecDeg.ra, dec: D2R * raDecDeg.dec };

      let minDist = Infinity;
      let closestPt = null as TableRow | null;

      [CometImageDatesTable, FullDatesTable].forEach((table) => {
        table.forEach(row => {
          const raRad = row.ra * D2R;
          const decRad = row.dec * D2R;

          const dist = distance(target.ra, target.dec, raRad, decRad);
          if (dist < minDist) {
            closestPt = row;
            minDist = dist;
          }

        });
      });

      if (closestPt !== null) {
        const closestScreenPoint = this.findScreenPointForRADec(closestPt);
        const pixelDist = Math.sqrt((point.x - closestScreenPoint.x) ** 2 + (point.y - closestScreenPoint.y) ** 2);
        if (!threshold || pixelDist < threshold) {
          return closestPt;
        }
      }
      return null;
    },

    removeHorizon() {
      this.clearAnnotations();
    },

    updateLastClosePoint(event: PointerEvent) {
      const pt = { x: event.offsetX, y: event.offsetY };
      const closestPt = this.closestPoint(pt, this.selectionProximity);
      if (closestPt == null && this.lastClosePt == null) {
        return;
      }
      const needsUpdate =
        closestPt == null ||
        this.lastClosePt == null ||
        this.lastClosePt.ra != closestPt.ra ||
        this.lastClosePt.dec != closestPt.dec;
      if (needsUpdate) {
        this.lastClosePt = closestPt;
      }
    },

    onPointerMove(event: PointerEvent) {
      if (!this.isPointerMoving && this.pointerStartPosition !== null) {
        const dist = Math.sqrt((event.pageX - this.pointerStartPosition.x) ** 2 + (event.pageY - this.pointerStartPosition.y) ** 2);
        if (dist > this.pointerMoveThreshold) {
          this.isPointerMoving = true;
        }
      }

      this.updateLastClosePoint(event);
    },

    onPointerDown(event: PointerEvent) {
      this.isPointerMoving = false;
      this.pointerStartPosition = { x: event.pageX, y: event.pageY };
    },

    onPointerUp(event: PointerEvent) {
      if (!this.isPointerMoving) {
        this.updateLastClosePoint(event);
        if (this.lastClosePt !== null) {
          this.selectedTime = this.lastClosePt.date.getTime();
          this.$nextTick(() => {
            this.onTimeSliderchange();
            this.updateViewForDate();
          });
        }
      }
      this.pointerStartPosition = null;
      this.isPointerMoving = false;
    },

    updateViewForDate(options?: MoveOptions) {
      this.logTimes("updateViewForDate", new Date(this.selectedTime));
      let position = null as TableRow | null;

      const cometImageIndex = cometImageDates.findIndex(d => d === this.selectedTime);
      
      if (cometImageIndex > -1) {
        if (this.interpolatedDailyTable !== null) {
          position = this.interpolatedDailyTable[0]
        } else {
          position = CometImageDatesTable[cometImageIndex];
        }
      } else {
        const allIndex = allDates.findIndex(d => d === this.selectedTime);
        if (allIndex > -1) {
          position = FullDatesTable[allIndex];
        }
      }

      if (position !== null) {
        this.gotoRADecZoom({
          raRad: D2R * position.ra,
          decRad: D2R * position.dec,
          zoomDeg: options?.zoomDeg ?? this.wwtZoomDeg,
          rollRad: options?.rollRad ?? this.wwtRollRad,
          instant: options?.instant ?? true
        });
      }

    },
    
    namefromDate(date: Date): string {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      return `${month}/${day}/${year}`;
    },

    matchImageSetName(date: Date): string {
      // imageset names are keys in this.imagesetLayers
      const imageset_names = Object.keys(this.imagesetLayers)
      // loop over image set names. find the name (which is a MM/DD/YYYY date string) 
      // that is or comes after the date we are looking for
      
      for (const name of imageset_names) {
        // convert the name to a date
        // if the name is after the date we are looking for, return it
        const wwt_date_string = this.namefromDate(date)
        if (name == wwt_date_string) {
          return name;
        }
      }
      return '';
    },

    setLayerOpacityForImageSet(name: string, opacity: number, setting_opacity_from_ui=false) {
      const layer = this.imagesetLayers[name]
      if (layer != null) {
        // update the image opacity in the WWT control
        applyImageSetLayerSetting(layer, ['opacity', opacity])

        // update the value for the slider only if we are not setting the opacity from the UI
        if (!setting_opacity_from_ui) {
          const selector = `#items div.item[title='${name}'] input.opacity-range[type='range']`
          const el = (document.querySelector(selector) as HTMLInputElement)
          if (el != null) {
            el.value = `${opacity * 100}`
          }
        }

        const toggle_selector = `#items input[type='checkbox'][title='${name}']`
        const el2 = (document.querySelector(toggle_selector) as HTMLInputElement)
        // truth table: opacity == 0 and el.checked == false => do nothing
        // truth table: opacity == 0 and el.checked == true => set el.checked = false
        // truth table: opacity > 0 and el.checked == false => set el.checked = true
        // truth table: opacity > 0 and el.checked == true => do nothing
        if (el2 != null) {
          if (opacity == 0 && el2.checked) {
            el2.checked = false
          } else if (opacity > 0 && !el2.checked) {
            el2.checked = true
          }
        }
        
      }
    },
    
    showImageForDateTime(date: Date) {
      const name = this.matchImageSetName(date)
      if (name == null) {
        this.incomingItemSelect = null
        return;
      }
      const imageset_names = Object.keys(this.imagesetLayers)
      imageset_names.forEach((iname: string) => {
        if (iname != name) {
          this.setLayerOpacityForImageSet(iname, 0)
        } else {
          this.setLayerOpacityForImageSet(iname, 1)
          // need to get the Place object for the image set and use it to set the view
          if (this.imagesetFolder != null) {
            const places = this.imagesetFolder.get_children()
            if (places != null) {
              const place = places.filter((place) => place.get_name() == iname)
              this.incomingItemSelect = place[0]
            }
          }
          // const iset = this.wwtControl.getImagesetByName(iname)
          // if (iset == null) { return; }
          // this.gotoRADecZoom({
          //   raRad: D2R * iset.get_centerX(),
          //   decRad: D2R * iset.get_centerY(),
          //   zoomDeg: this.wwtZoomDeg,
          //   instant: true
          // });
        }
      })
      
    },

    centerOnCurrentDate(options?: MoveOptions) {
      const now = new Date();
      const localOffset = now.getTimezoneOffset() * 60 * 1000;
      const hours = now.getHours() + (this.selectedTimezoneOffset + localOffset) / (1000 * 60 * 60);
      this.timeOfDay = { hours: hours, minutes: now.getMinutes(), seconds: now.getSeconds() };
      this.selectedTime = now.setUTCHours(0, 0, 0, 0);
      this.$nextTick(() => {
        this.updateViewForDate(options);
      });
    },

    updateForDateTime() {
      this.logTimes('updateForDateTime')
      if (!this.dontSetTime) { this.setTime(this.dateTime) }
      this.updateHorizon(this.dateTime); 
      // this.showImageForDateTime(this.dateTime);
      // this.updateViewForDate(options);
      this.updateLayersForDate();
    },

    updateHorizon(when: Date | null = null) {
      this.logTimes('updateHorizon',when)
      if (this.showHorizon) {
        this.createHorizon(when);
      } else {
        this.removeHorizon();
      }
    },

    setToFirstCometImage() {
      this.selectedTime = Date.UTC(2022, 11, 18);
      const children = this.imagesetFolder?.get_children();
      if (children == null) { return; }
      const place = children[0] as Place;
      this.onItemSelected(place);
    },

    logTimes(pre: string, date = null as Date | null) { 
      // console.log('running',pre)
      // console.log("::: selectedTime:", new Date(this.selectedTime))
      // console.log('::: selectedDate:', this.selectedDate)
      // console.log('::: wwtCurrentTime:', this.wwtCurrentTime)
      // date = null // disable block w/o deleting (i.e. stop typescript from complaining)
      // if (date != null) {
      //   console.log('::: manual date:', date)
      // }
    }
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
    showHorizon(_show: boolean) {
      this.updateHorizon();
    },
    timeOfDay(_time: { hours: number; minutes: number; seconds: number }) {
      this.updateForDateTime();
    },
    location(loc: LocationRad, oldLoc: LocationRad) {
      const locationDeg: [number, number] = [R2D * loc.latitudeRad, R2D * loc.longitudeRad];
      if (this.map) {
        this.circle?.remove();
        this.circle = this.circleForLocation(...locationDeg).addTo(this.map as Map); // Not sure, why, but TS is cranky w/o casting
      }

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

    selectedDate() {
      this.logTimes('selectedDate')
      this.updateForDateTime();
    },

    selectedTime() {
      this.logTimes('selectedTime')
    },
    
    showLocationSelector(show: boolean) {
      if (show) {
        this.locationErrorMessage = "";
        this.$nextTick(() => {
          this.setupLocationSelector();
        });
      } else {
        this.map?.remove();
        this.circle = null;
      }
    },
    selectedTimezone(newTz: string, oldTz: string) {
      const newOffset = getTimezoneOffset(newTz);
      const oldOffset = getTimezoneOffset(oldTz);
      let newHours = this.timeOfDay.hours + ((newOffset - oldOffset) / (1000*60*60));
      if (newHours >= 24) {
        newHours -= 24;
        this.moveOneDayForward();
      } else if (newHours < 0) {
        newHours += 24;
        this.moveOneDayBackward();
      }
      this.timeOfDay.hours = newHours;
    },
    
    playing(play: boolean) {
      this.clearPlayingInterval();
      if (play) {
        this.playingIntervalId = setInterval(() => {
          if (this.selectedTime < maxDate) {
            this.moveOneDayForward();
          } else {
            this.selectedTime = minDate;
          }
          this.$nextTick(() => {
            this.showImageForDateTime(this.dateTime);
            this.updateViewForDate();
          })
        }, 350);
      }
    },

    playingCometPath(play: boolean) {
      this.clearPlayingInterval();
      if (!play) {
        return;
      }
      const minTime = Math.min(...cometImageDates) - MILLISECONDS_PER_DAY;
      const maxTime = Math.max(...cometImageDates) + MILLISECONDS_PER_DAY;

      if(this.selectedTime < minTime || this.selectedTime >= maxTime){
        this.selectedTime = minTime;
      }

      this.updateViewForDate({ zoomDeg: 60 });

      this.playingIntervalId = setInterval(() => {
        if (this.selectedTime < maxTime) {
          this.moveOneDayForward();
          this.$nextTick(() => {
            this.showImageForDateTime(this.dateTime);
            this.updateViewForDate();
          });
        } else {
          this.playingCometPath = false;
        }
      }, 500);
    }
  }
});

</script>

<style lang="less">
html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;
  overflow: hidden;

  ::-webkit-scrollbar {
    // display: none;
  }
  
  -ms-overflow-style: none;
  // scrollbar-width: none;
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

.pointer {
  cursor: pointer;
}

.control-icon {
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: white;
  }
}

.control-icon-wrapper {
  color: var(--comet-color);
  background: #040404;
  padding: 8px 16px;
  border: 1px solid var(--comet-color);
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: white;
    border-color: white;
  }
}

#play-pause-icon-wrapper {
  color: var(--ephemeris-color);
  border-color: var(--ephemeris-color);
  margin-left: 2rem;

  &:focus {
    color: white;
  }
}

#video-icon-dummy {
  pointer-events: none;
  visibility: hidden;
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

.folder-view {
  max-height: calc(100% - 150px);
  width: ~"min(160px, 35vw)";
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

.dp__select {
  color: #04D6B0 !important;
}

#show-controls {
  color: var(--comet-color);
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

.v-selection-control--focus-visible .v-selection-control__input::before {
  opacity: 0.25;
}

.ui-text {
  color: var(--comet-color);
  background: black;
  padding: 5px 5px;
  border: 2px solid black;
  border-radius: 10px;
  font-size: calc(0.8em + 0.25vw);

  &:focus {
    color: white;
  }
}

.ui-button {
  text-align: center;
  color: var(--comet-color);
  background: black;
  padding: 5px 5px;
  border: 2px solid var(--comet-color);
  border-radius: 10px;
  font-size: calc(0.7em + 0.2vw);
  user-select: none;
}

.clickable {
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }
}

#buttons-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-self: flex-end;
}

#center-view-button {
  margin-bottom: 25px;
}

#right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

#location-dialog {
  .v-overlay__content {
    width: fit-content !important;
  }
}

#location-selector {
  align-items: center;
  margin: auto;
  width: 70vw;
  height: fit-content;
}

#map-container {
  width: 60vw;
  height: 70vh;
  margin: auto;
  padding: 5px 0px;
  border-radius: 5px;
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
  background-color: rgba(214, 4, 147,0.7);
  overflow: visible;
}

#slider {
  width: 100% !important;
  margin: 5px 30px;
}

.vue-slider-process {
  background-color: white !important;
}

.vue-slider-dot-tooltip-inner {
  cursor: grab;
  padding: 4px 10px !important;
  color: white !important;
  background-color: #9A2976 !important;
  border: 1px solid #9A2976 !important;

  &:active {
    cursor: grabbing;
  }
}

.vue-slider-dot-handle {
  cursor: grab;
  background-color: #9A2976 !important;
  border: 1px solid black !important;

  &:active {
    cursor: grabbing;
  }
}

.mark-line {
  position: absolute;
  height: 20px;
  width: 2px;
  margin: 0;
  background-color: var(--comet-color);
  transform: translateX(-50%) translateY(calc(-50% + 2px));

}

.left-content {
  position: absolute;
  left: 1rem;
  top: 1rem;
  pointer-events: none;
  height: calc(100% - 2rem);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

@media(max-width: 600px) {
  .mark-line {
    display: none;
  }

  #location-selector {
    width: 80vw;
    height: 85vh;
  }

  #video-container {
    display: inherit;
  }

  #map-container {
    width: 70vw;
  }
}


#splash-overlay {
  position: fixed;
  //  vue components are flex, so we can easy center
  align-items: center;
  justify-content: center;
}


#splash-screen {
  // for some reason the view props don't work
  // for max-width and max-height
  // splash image size 1908 × 2040 px
  max-width: calc(min(90vw,1908px)); 
  max-height: calc(min(90vh,2040px)); 
  /* prevent the image from being stretched */
  object-fit: contain;
}

#splash-close {
  // outline: 1px solid rgba(255, 255, 255, 0.094);
  position: absolute;
  width: 7%;
  height: 8%;
  top: 4%;
  left: 84%;

  &:hover {
    cursor: pointer;
  }
}

#overlays {
  margin: 5px;
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
}

ul.text-list {
  margin-left:1em;
  margin-top: 0.5em;
}

div.credits {
  font-size: 0.8em;
}

// For styling the time picker
// See more info here:
// https://vue3datepicker.com/customization/theming/
.dp__theme_dark {
  --dp-background-color: black !important;
}

.dp__main {
  width: 175px;
}

* {
  --v-input-control-height: 40px;
}

// :root {
//   --map-tiles-filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
// }

// @media (prefers-color-scheme: dark) {
//   .map-tiles {
//     filter:var(--map-tiles-filter, none);
//   }
// }

span.ui-element-ref-comet {
  background-color: #9A2976; /* #04D6B0; */
  padding: 0em 0.1em;
  border-radius: 0.2em;
}

/* from https://www.smashingmagazine.com/2021/12/create-custom-range-input-consistent-browsers/ */
input[type="range"] {
    -webkit-appearance: inherit;
    -moz-appearance: inherit;
    appearance: inherit;
    margin: 2px;
    --track-height: 1em;
    --thumb-radius: 0.8em;
    --thumb-color: rgba(205, 54, 157  , 0.7);
    // --thumb-color: #444;
    --track-color: rgba(4, 147, 214, .1);
    // --thumb-border: 1px solid #899499;
    --thumb-border-width: 1px;
    --thumb-border: var(--thumb-border-width) solid rgb(255, 255, 255);
    --track-border-width: 1px;
    --track-border: var(--track-border-width) solid rgba(4, 147, 214, 1);
    --thumb-margin-top: calc((var(--track-height) - 2*var(--track-border-width)) / 2 - (var(--thumb-radius)) / 2);
    
    &:hover {
      opacity: 1;
      --track-color: rgba(217, 234, 242,0.2);
      --thumb-color: rgba(205, 54, 157  , 1);
    }

    &:focus {
      border-radius: calc(var(--track-height) / 2);
    }
  }
  
  
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: inherit;
    -moz-appearance: inherit;
    appearance: inherit;
    width: var(--thumb-radius);
    height: var(--thumb-radius);
    margin-top: var(--thumb-margin-top);
    border-radius: 50%;
    background: var(--thumb-color);
    border: var(--thumb-border);
  }
  
  input[type="range"]::-moz-range-thumb {
    -webkit-appearance: inherit;
    -moz-appearance: inherit;
    appearance: inherit;
    width: var(--thumb-radius);
    height: var(--thumb-radius);
    margin-top: var(--thumb-margin-top);
    border-radius: 50%;
    background: var(--thumb-color);
    cursor: pointer;
    border: var(--thumb-border)
  }
  
  input[type="range"]::-webkit-slider-runnable-track {
    background: var(--track-color);
    /* outline: 1px solid white; */
    border-radius: calc(var(--track-height) / 2);
    border: var(--track-border);
    height: var(--track-height);
    margin-top: 0;
    padding: 0 calc((var(--track-height) - var(--thumb-radius))/2);
  }
  
  
input[type="range"]::-moz-range-track {
    background: var(--track-color);
    /* outline: 1px solid white; */
    border-radius: calc(var(--track-height) / 2);
    border: var(--track-border);
    height:var(--track-height);
    margin-top: 0;
    padding: 0 calc((var(--track-height) - var(--thumb-radius))/2);
  }
</style>
