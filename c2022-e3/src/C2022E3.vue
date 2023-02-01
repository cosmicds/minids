
<template>
  <v-app
    id="app"
    :style="cssVars"
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
          :src="require(`./assets/Green_Comet_Mini_Splashscreen.png`)"
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

    <div class="left-content">
      <folder-view
        v-if="imagesetFolder !== null"
        sliders
        expandable
        :thumbnails="false"
        :root-folder="imagesetFolder"
        :wwt-namespace="wwtNamespace"
        flex-direction="column"
        @select="onItemSelected"
        @opacity="updateImageOpacity"
      ></folder-view>
    </div>
    
    <div id="overlays">
      <p>{{ coordText }}</p>
    </div>

    <div class="top-content">
      <v-tooltip
        v-model="showVideoTooltip"
        :open-on-click="false"
        :open-on-focus="false"
        :open-on-hover="true"
        close-on-content-click
        :location="smallSize ? 'bottom' : 'end'"
      >
        <template v-slot:activator="{ props }">
          <div
            @mouseover="showVideoTooltip = true"
            @mouseleave="showVideoTooltip = false"
            id="video-icon-wrapper"
            class="control-icon-wrapper"
            v-bind="props"
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
      <v-tooltip
        v-model="showMapTooltip"
        location="bottom"
        :open-on-click="false"
        :open-on-focus="false"
        :open-on-hover="true"
      >
        <template v-slot:activator="{ props }">
          <div
            id="text-icon-wrapper"
            class="control-icon-wrapper"
            @mouseover="showMapTooltip = true"
            @mouseleave="showMapTooltip = false"
            v-bind="props"
            @click="showLocationSelector = true"
          >
            <font-awesome-icon
              id="location-icon"
              class="control-icon"
              icon="location-pin"
              size="lg"
            ></font-awesome-icon>
          </div>
        </template>
        <span>Select location</span>
      </v-tooltip>
      <v-tooltip
        :location="smallSize ? 'bottom' : 'start'"
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
    </div>

    <div class="bottom-content">
      <div
        id="buttons-container"
      >
        <div
          id="toggle-altaz-button"
          class="ui-button clickable"
          @click="showAltAzGrid = !showAltAzGrid"
        >
          {{ (showAltAzGrid ? 'Hide' : 'Show') + ' Grid' }} 
        </div>
        <div
          id="center-view-button"
          class="ui-button clickable"
          @click="updateViewForDate"
        >
          Center View on Date
        </div>
      </div>
      <div id="tools">
        <span class="tool-container">
          <vue-slider
            id="slider"
            adsorb
            included
            :marks="(d: number) => {
              return weeklyDates.includes(d) || dailyDates.includes(d);
            }"
            :order="false"
            v-model="selectedTime"
            :data="dates"
            tooltip="always"
            :tooltip-formatter="(v: number) => 
              (new Date(v)).toLocaleDateString('en-us')
            "
            >
              <template v-slot:mark="{ pos, value }">
                <div
                  :class="['mark-line', { tall: weeklyDates.includes(value) }]"
                  :style="{ left: `${pos}%` }">
                </div>
              </template>
            </vue-slider>
          </span>
      </div>
      <div id="credits" class="ui-text">
        <div>
          Powered by
          <a href="https://worldwidetelescope.org/home/" target="_blank"
            >WorldWide Telescope</a
          >
        </div>
        <div id="icons-container">
          <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank"
            ><img alt="CosmicDS Logo" src="../../assets/cosmicds_logo_for_dark_backgrounds.png"
          /></a>
          <a href="https://worldwidetelescope.org/home/" target="_blank"
            ><img alt="WWT Logo" src="../../assets/logo_wwt.png"
          /></a>
          <a href="https://science.nasa.gov/learners" target="_blank"
            ><img alt="SciAct Logo" src="../../assets/logo_sciact.png"
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
      absolute
      width="100%"
      :scrim="false"
      location="bottom"
      v-model="showTextSheet"
      transition="dialog-bottom-transition"
    >
      <v-card height="100%">
      <!-- <v-container height="11px">
        <font-awesome-icon
          class="close-icon"
          icon="times"
          @click="showTextSheet = false"
        ></font-awesome-icon>
      </v-container> -->
      <v-tabs
        v-model="tab"
        height="32px"
        :color="cometColor"
        :slider-color="cometColor"
        id="tabs"
        dense
        grow
      >
        <v-tab><h3>Information</h3></v-tab>
        <v-tab><h3>Using WWT</h3></v-tab>
      </v-tabs>
      <font-awesome-icon
        id="close-text-icon"
        class="control-icon"
        icon="times"
        size="lg"
        @click="showTextSheet = false"
      ></font-awesome-icon>
        <v-window v-model="tab" id="tab-items" class="pb-2 no-bottom-border-radius">
          <v-window-item>
            <v-card class="no-bottom-border-radius scrollable">
              <v-card-text class="info-text no-bottom-border-radius">
                
                Comets are dusty snowballs, large clumps of rock and ice, that originate in the outer solar system. The “Green Comet” (or <a href="https://science.nasa.gov/comet-2022-e3-ztf" target="_blank">C/2022 E3</a>) makes its closest approach to the Sun (and to Earth) in early 2023. The comet images in this interactive view were taken on different dates from December 2022 through January 2023 by astrophotographer <a href="http://www.astrostudio.at/" target="_blank">Gerald Rhemann</a>.
                <br><br>

                <h3>Explore!</h3>
                <ul class="text-list">
                  <li>Move the date slider forward and backward. Observe how the comet moves in the sky with time. Can you find when the comet is moving fastest in the sky and when it is moving slowest in the sky? Can you find when the comet path “twirls” in the sky? (This is known as “retrograde motion.”)</li>
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
                    <v-col cols="8" class="pt-2">
                      <strong>{{ touchscreen ? "press + drag" : "click + drag" }}</strong><br>
                
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
                    <v-col cols="8" class="pt-2">
                      <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong><br>
                      
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <div
                        style="min-height: 120px;"
                      >
                        <p>
                          The frame above provides an <b>interactive view </b>of the night sky, powered by WorldWide Telescope (WWT).
                        </p>
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

  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { csvFormatRows, csvParse } from "d3-dsv";

import { distance, fmtDegLat, fmtDegLon, fmtHours } from "@wwtelescope/astro";
import { Color, Folder, Grids, Poly, RenderContext, Settings, WWTControl } from "@wwtelescope/engine";
import { ImageSetType, PlotTypes } from "@wwtelescope/engine-types";

import L, { LeafletMouseEvent, Map } from "leaflet";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common"

import { ImageSetLayer, Place } from "@wwtelescope/engine";
import { applyImageSetLayerSetting } from "@wwtelescope/engine-helpers";


import {
  ephemerisFullWeeklyCsv,
  ephemeris2023DailyCsv
} from "./data";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function parseCsvTable(csv: string) {
  return csvParse(csv, (d) => {
    return {
      date: new Date(d.Date!),
      ra: +d.RA!,
      dec: +d.Dec!,
      tMag: +d.Tmag!,
    };
  });
}
const fullWeeklyTable = parseCsvTable(ephemerisFullWeeklyCsv);
const daily2023Table = parseCsvTable(ephemeris2023DailyCsv);

// NB: The two tables have identical structures.
// We aren't exporting these types anywhere, so
// generic names are fine
type Table = typeof fullWeeklyTable;
type TableRow = typeof fullWeeklyTable[number];

function formatCsvTable(table: Table): string {
  return csvFormatRows([[
        "Date", "RA", "Dec", "Tmag"
      ]].concat(table.map((d, _i) => {
        return [
          d.date.toISOString(),
          d.ra.toString(),
          d.dec.toString(),
          d.tMag.toString(),
        ];
    }))).replace(/\n/g, '\r\n');
    // By using a regex, we replace all instances.
    // For WWT implementation reasons (left over from 
    // the Windows client?), we need the line endings 
    // to be CRLF
}

const fullWeeklyString = formatCsvTable(fullWeeklyTable);
const daily2023String = formatCsvTable(daily2023Table);

const weeklyDates = fullWeeklyTable.map(r => r.date.getTime());
const dailyDates = daily2023Table.map(r => r.date.getTime());
const minDate = Math.min(...weeklyDates, ...dailyDates);
const maxDate = Math.max(...weeklyDates, ...dailyDates);
const dates: number[] = [];

const d = new Date(minDate);
let t = d.getTime();
while (t <= maxDate) {
  dates.push(t);
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
    return {
      showSplashScreen: true,
      imagesetLayers: {} as Record<string, ImageSetLayer>,
      layersLoaded: false,
      imagesetFolder: null as Folder | null,
      backgroundImagesets: [] as BackgroundImageset[],
      decRadLowerBound: 0.2,

      showAltAzGrid: true,

      dailyDates: dailyDates,
      weeklyDates: weeklyDates,
      dates: dates,
      
      lastClosePt: null as TableRow | null,
      ephemerisColor: "#FFFFFF",
      cometColor: "#04D6B0",

      sheet: null as SheetType,
      showMapTooltip: false,
      showTextTooltip: false,
      showVideoTooltip: false,
      showLocationSelector: false,
      tab: 0,

      circle: null as L.Circle | null,
      map: null as Map | null,

      selectionProximity: 4,
      pointerMoveThreshold: 6,
      isPointerMoving: false,
      pointerStartPosition: null as { x: number; y: number } | null,

      // Harvard Observatory
      selectedTime: (new Date(2023, 0, 28)).getTime(),
      location: {
        latitudeRad: D2R * 42.3814,
        longitudeRad: D2R * -71.1281
      } as LocationRad,
      locationErrorMessage: ""
    }
  },

  created() {

    this.waitForReady().then(() => {

      // This is just nice for hacking while developing
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.wwt = this; window.settings = this.wwtSettings;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.applyISLSetting = applyImageSetLayerSetting;

      const layerPromises = Object.entries(this.wtml).map(([key, value]) =>
        this.loadImageCollection({
          url: value as string,
          loadChildFolders: false
        }).then((folder) => {
          this.imagesetFolder = folder;
          const children = folder.get_children();
          if (children == null) { return; }
          children.forEach((item) => {
            if (!(item instanceof Place)) { return; }
            const imageset = item.get_backgroundImageset() ?? item.get_studyImageset();
            if (imageset === null) { return; }
            const name = imageset.get_name();
            this.addImageSetLayer({
              url: imageset.get_url(),
              mode: "autodetect",
              name: name,
              goto: false
            }).then((layer) => {
              this.imagesetLayers[name] = layer;
              applyImageSetLayerSetting(layer, ["opacity", 1]);
            });
        });
      }));
      

      this.loadImageCollection({
        url: this.bgWtml,
        loadChildFolders: true,
      }).then((_folder) => {
        console.log('IMAGES LOADED')

      });
      
      this.backgroundImagesets = [...skyBackgroundImagesets];

      this.getLocation(true);
      this.setClockSync(false);

      layerPromises.push(this.createTableLayer({
        name: "Full Weekly",
        referenceFrame: "Sky",
        dataCsv: fullWeeklyString
      }).then((layer) => {
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 50],
            ["color", Color.fromHex(this.ephemerisColor)],
            ["plotType", PlotTypes.circle],
            //["sizecolumn", 3],
            ["opacity", 0.7]
          ]
        })
      }));

      layerPromises.push(this.createTableLayer({
        name: "2023 Daily",
        referenceFrame: "Sky",
        dataCsv: daily2023String
      }).then((layer) => {
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 50],
            ["color", Color.fromHex(this.ephemerisColor)],
            //["sizecolumn", 3],
            ["opacity", 1]
          ]
        })
      }));

      layerPromises.push(this.createTableLayer({
        name: "Weekly Date Layer",
        referenceFrame: "Sky",
        dataCsv: fullWeeklyString
      }).then((layer) => {
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 50],
            ["color", Color.fromHex(this.cometColor)],
            ["plotType", PlotTypes.circle],
            //["sizecolumn", 3],
            ["startDateColumn", 0],
            ["endDateColumn", 0],
            ["timeSeries", true],
            ["opacity", 1],
            ["decay", 1]
          ]
        });
      }));

      layerPromises.push(this.createTableLayer({
        name: "Daily Date Layer",
        referenceFrame: "Sky",
        dataCsv: daily2023String
      }).then((layer) => {
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 75],
            ["color", Color.fromHex(this.cometColor)],
            //["sizecolumn", 3],
            ["startDateColumn", 0],
            ["endDateColumn", 0],
            ["timeSeries", true],
            ["opacity", 1],
            ["decay", 1]
          ]
        });
      }));

      this.setTime(this.selectedDate);

      Promise.all(layerPromises).then(() => {
        this.layersLoaded = true;
      });

      this.wwtSettings.set_localHorizonMode(true);
      this.wwtSettings.set_showAltAzGrid(true);

      // This is kinda horrible, but it works!

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl._drawSkyOverlays = function() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (Settings.get_active().get_showAltAzGrid()) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          Grids.drawAltAzGrid(this.renderContext, 1, Color.fromArgb(1, 126, 42, 99));
        }
      }

      this.updateWWTLocation();
      

    });

  },

  computed: {

    coordText() {
      if (this.wwtRenderType == ImageSetType.sky) {
        return `${fmtHours(this.wwtRARad)} ${fmtDegLat(this.wwtDecRad)}`;
      }
      return `${fmtDegLon(this.wwtRARad)} ${fmtDegLat(this.wwtDecRad)}`;
    },

    isLoading(): boolean {
      return !this.ready;
    },
    ready(): boolean {
      return this.layersLoaded;
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
        '--comet-color': this.cometColor
      }
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
    showTextSheet: {
      get(): boolean {
        return this.sheet === 'text';
      },
      set(_value: boolean) {
        this.selectSheet('text');
        this.showTextTooltip = false;
      }
    },
    // altAz() {
    //   return this.equatorialToHorizontal(this.wwtRARad, this.wwtDecRad, this.location.latitudeRad, this.location.longitudeRad, this.selectedDate || new Date());
    // }
  },

  methods: {
    closeSplashScreen() {
      this.showSplashScreen = false;
    },
  
    updateWWTLocation() {
      this.wwtSettings.set_locationLat(R2D * this.location.latitudeRad);
      this.wwtSettings.set_locationLng(R2D * this.location.longitudeRad + 90);
    },

    logLocation() {
      console.log(this.location.latitudeRad * R2D, this.location.longitudeRad * R2D);
    },

    logPosition() {
      console.log(this.wwtRARad * R2D, this.wwtDecRad * R2D);
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

    onItemSelected(place: Place) {
      this.gotoTarget({
        place: place,
        noZoom: false,
        instant: true,
        trackObject: false
      });
    },

    updateImageOpacity(place: Place, opacity: number) {
      const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
      if (iset == null) { return; }
      const layer = this.imagesetLayers[iset.get_name()];
      if (layer == null) { return; }
      applyImageSetLayerSetting(layer, ["opacity", opacity / 100]);
    },

    setupLocationSelector() {
      const locationDeg: [number, number] = [R2D * this.location.latitudeRad, R2D * this.location.longitudeRad];
      const map = L.map("map-container").setView(locationDeg, 4);
      // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //   maxZoom: 19,
      //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      //   className: 'map-tiles'
      // }).addTo(map);
      L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
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
      this.location = {
        latitudeRad: e.latlng.lat * D2R,
        longitudeRad: e.latlng.lng * D2R
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
          let msg = "Unable to detect location. Please check your browser and/or OS settings.";
          if (startup) {
            msg += "\nUse our location selector to manually input your location";
            this.$notify({
              group: "startup-location",
              type: "error",
              text: msg,
              duration: 3000
            });
          } else {
            this.locationErrorMessage = msg;
          }
          //this.createHorizon();
        },
        options
      );
    },

    // WWT does have all of this functionality built in
    // but it doesn't seem to be exposed
    // We should do that, but for now we just copy the web engine code
    // https://github.com/Carifio24/wwt-webgl-engine/blob/master/engine/wwtlib/Coordinates.cs
    altAzToRADec(altRad: number, azRad: number, latRad: number): { ra: number; dec: number; } {
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

    get_julian(date: Date): number {
        return (date.valueOf() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
      },
  
    mstFromUTC2(utc: Date, longRad: number): number {

      const lng = longRad * R2D;

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

      const a = year / 100;
      const b = 2 - a + Math.floor(a / 4.0);
      const c = Math.floor(365.25 * year);
      const d = Math.floor(30.6001 * (month + 1));

      const bad_julianDays = b + c + d - 730550.5 + day + (hour + minute / 60.00 + second / 3600.00) / 24.00;
      // const julianDays = this.get_julian(utc) - 2451545.0; // still offset by a small amount
      const julianDays = bad_julianDays - 42.27 / (60 * 24) //2 * 0.01166666663812066;

      const julianCenturies = julianDays / 36525.0;
      // this form wants julianDays - 2451545
      let mst = 280.46061837 + 360.98564736629 * julianDays + 0.000387933 * julianCenturies * julianCenturies - julianCenturies * julianCenturies * julianCenturies / 38710000 + lng;

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
      let hourAngle = this.mstFromUTC2(utc, longRad);
  
      const raDec = this.altAzToRADec(altRad, azRad, latRad);
      const ha = raDec.ra * R2D;

      hourAngle += ha;
      if (hourAngle < 0) {
        hourAngle += 360;
      }
      if (hourAngle > 360) {
        hourAngle -= 360;
      }
      hourAngle -= 180;

      return { raRad: D2R * hourAngle, decRad: raDec.dec };
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
      this.clearAnnotations();
  
      const color = '#5C4033';
      const date = when || this.selectedDate || new Date();

      // The initial coordinates are given in Alt/Az, then converted to RA/Dec
      // Use N annotations to cover below the horizon
      const N = 6;
      const delta = 2 * Math.PI / N;
      for (let i = 0; i < N; i++) {
        let points: [number, number][] = [
          [0, i * delta],
          [-Math.PI/2, i * delta],
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

      [daily2023Table, fullWeeklyTable].forEach((table) => {
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
        }
      }
      this.pointerStartPosition = null;
      this.isPointerMoving = false;
    },

    updateViewForDate() {

      let position = null as TableRow | null;

      const dailyIndex = dailyDates.findIndex(d => d === this.selectedTime);
      
      if (dailyIndex > -1) {
        position = daily2023Table[dailyIndex]
      } else {
        const weeklyIndex = weeklyDates.findIndex(d => d === this.selectedTime);
        if (weeklyIndex > -1) {
          position = fullWeeklyTable[weeklyIndex];
        }
      }

      if (position !== null) {
        this.gotoRADecZoom({
          raRad: D2R * position.ra,
          decRad: D2R * position.dec,
          zoomDeg: this.wwtZoomDeg,
          rollRad: this.wwtRollRad,
          instant: false
        });
      }

    },
  },

  watch: {
    // altAz(coords: { altRad: number; azRad: number }) {
    //   console.log(coords);
    //   if (coords.altRad < 0) {
    //     const pos = this.horizontalToEquatorial(coords.altRad, coords.azRad, this.location.latitudeRad, this.location.longitudeRad, new Date());
    //     this.gotoRADecZoom({
    //       raRad: pos.raRad,
    //       decRad: pos.decRad,
    //       zoomDeg: this.wwtZoomDeg,
    //       instant: true
    //     });
    //   }
    // },
    showAltAzGrid(show: boolean) {
      this.wwtSettings.set_showAltAzGrid(show);
    },
    location(loc: LocationRad) {
      const now = this.selectedDate;
      const raDec = this.horizontalToEquatorial(Math.PI/2, 0, loc.latitudeRad, loc.longitudeRad, now);

      if (this.map) {
        this.circle?.remove();

        const locationDeg: [number, number] = [R2D * loc.latitudeRad, R2D * loc.longitudeRad];
        this.circle = this.circleForLocation(...locationDeg).addTo(this.map as Map); // Not sure, why, but TS is cranky w/o casting
      }

      //this.createHorizon(now);
      this.updateWWTLocation();
      this.gotoRADecZoom({
        raRad: raDec.raRad,
        decRad: raDec.decRad,
        zoomDeg: this.wwtZoomDeg,
        instant: true
      });
    },
    selectedDate(date: Date) {
      this.setTime(date);
      this.createHorizon(date);
      this.updateViewForDate();
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
    }
  }
})

</script>

<style lang="less">
html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;
  overflow: hidden;
}

body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;

  font-family: Verdana, Arial, Helvetica, sans-serif;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;

  .wwtelescope-component {
    position: relative;
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
}

.control-icon-wrapper {
  color: var(--comet-color);
  background: #040404;
  padding: 6px;
  border: 1px solid var(--comet-color);
  border-radius: 20px;
  display: flex;
  align-items: center;
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }
}

#video-icon-wrapper {
  pointer-events: none;
  visibility: hidden;
}

.top-content {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: calc(100% - 1rem);
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bottom-content {
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 0.5rem;
  right: 0.5rem;
  width: calc(100% - 1rem);
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
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  pointer-events: auto;
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
    height: 24px;
    vertical-align: middle;
    margin: 2px;
  }

  svg {
    vertical-align: middle;
    height: 24px;
  }
}

.ui-text {
  color: var(--comet-color);
  background: black;
  padding: 5px 5px;
  border: 2px solid black;
  border-radius: 10px;
  font-size: calc(0.7em + 0.2vw);
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

.bottom-sheet {
  .v-overlay__content {
    align-self: flex-end;
    padding: 0;
    margin: 0;
    max-width: 100%;
  }
}

#tabs {
  width: calc(100% - 3em);
  align-self: left;
}

.info-text {
  height: 35vh;
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
}

.scrollable {
  overflow-y: auto;
}

#tab-items {
  // padding-bottom: 2px !important;

  .v-card-text {
    font-size: ~"max(14px, calc(0.8em + 0.3vw))";
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
#slider {
  width: 100% !important;
  margin: 5px 50px;
}

.vue-slider-process
{
  background-color: white !important;
}

.vue-slider-dot-tooltip-inner
{
  background-color: var(--comet-color) !important;
}

.mark-line {
  position: absolute;
  height: 18px;
  width: 2px;
  margin: 0;
  background-color: #FFFFFF;
  transform: translateX(-50%) translateY(calc(-50% + 1px));

  &.tall {
    height: 25px;
    background-color: #000000;
    border: solid 1px white;
  }
}

.left-content {
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
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
  outline: 1px solid rgba(255, 255, 255, 0.094);
  position: absolute;
  width: 7%;
  height:8%;
  top: 4%;
  left: 80.5%;

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
}

div.credits {
  font-size: 0.8em;
}
// :root {
//   --map-tiles-filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
// }

// @media (prefers-color-scheme: dark) {
//   .map-tiles {
//     filter:var(--map-tiles-filter, none);
//   }
// }
</style>
