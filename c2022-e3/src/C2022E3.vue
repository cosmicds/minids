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

    <div id="top-content">
      <div></div>
      <div>
        <v-popper
          arrow
          interactive
          placement="bottom"
        >
          <v-tooltip
          :location="smallSize ? 'bottom' : 'start'"
          :open-on-click="false"
          :open-on-focus="false"
          :open-on-hover="true"
          v-model="showMapTooltip"
          :offset="smallSize ? 0 : '45px'"
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
        <template #content>
          <!-- <div id="location-selector">
            <div>Move around using the map<br>Double-click to select your location</div>
            <div id="map-container"></div>
          </div> -->
        </template>
      </v-popper>
      </div>
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

    <div id="bottom-content">
      <div id="tools">
        <span class="tool-container">
          <vue-slider
            id="slider"
            adsorb
            included
            :marks="(d: number) => {
              return weeklyDates.includes(d) || dailyDates.includes(d)
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
          <a href="https://worldwidetelescope.org/home/"
            >WorldWide Telescope</a
          >
        </div>
        <div id="icons-container">
          <a href="https://www.cosmicds.cfa.harvard.edu/"
            ><img alt="CosmicDS Logo" src="../../assets/cosmicds_logo_for_dark_backgrounds.png"
          /></a>
          <a href="https://worldwidetelescope.org/home/"
            ><img alt="WWT Logo" src="../../assets/logo_wwt.png"
          /></a>
          <a href="https://science.nasa.gov/learners"
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
      v-model="showLocationSelector"
    >
      <v-card id="location-selector">
        <div>Move around using the map. Double-click to select your location</div>
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
        slider-color="white"
        id="tabs"
        dense
        grow
      >
        <!-- <v-tabs-slider color="white"></v-tabs-slider> -->

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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                <br><br><br>
                <h3>Credits:</h3>
                <h4><a href="https://www.cosmicds.cfa.harvard.edu/">CosmicDS</a> Mini Stories Team:</h4>
                Jon Carifio<br>
                John Lewis<br>
                Pat Udomprasert<br>
                Alyssa Goodman<br>
                Mary Dussault<br>
                Evaluator: Sue Sunbury<br>
                <br>
                <h4>WorldWide Telescope Team:</h4>
                Peter Williams<br>
                A. David Weigel<br>
                Jon Carifio<br>
                <br>
                The material contained on this website is based upon work supported by NASA under award No. 80NSSC21M0002. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the National Aeronautics and Space Administration.
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
                      <h3>Credits:</h3>
                      <h4><a href="https://www.cosmicds.cfa.harvard.edu/">CosmicDS</a> Mini Stories Team:</h4>
                      Jon Carifio<br>
                      John Lewis<br>
                      Pat Udomprasert<br>
                      Alyssa Goodman<br>
                      Mary Dussault<br>
                      Evaluator: Sue Sunbury<br>
                      <br>
                      <h4>WorldWide Telescope Team:</h4>
                      Peter Williams<br>
                      A. David Weigel<br>
                      Jon Carifio<br>
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

  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { csvFormatRows, csvParse } from "d3-dsv";

import { distance } from "@wwtelescope/astro";
import { Color, Poly, SpreadSheetLayer } from "@wwtelescope/engine";
import { PlotTypes } from "@wwtelescope/engine-types";

import L, { LeafletMouseEvent } from "leaflet";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common"

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
        "Date", "RA", "Dec", "Tmag", "PrevDate", "NextDate"
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
const minDate = Math.min(Math.min(...weeklyDates), Math.min(...dailyDates));
const maxDate = Math.max(Math.max(...weeklyDates), Math.max(...dailyDates));
const dates: number[] = [];

const d = new Date(minDate);
let t = d.getTime();
while (t <= maxDate) {
  dates.push(t);
  d.setDate(d.getDate() + 1);
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

  data() {
    return {
      backgroundImagesets: [] as BackgroundImageset[],
      decRadLowerBound: 0.2,
      dateLayers: [] as SpreadSheetLayer[],
      weeklyLayer: null as SpreadSheetLayer | null,
      selectedTime: (new Date(2023, 0, 28)).getTime(),
      dailyDates: dailyDates,
      weeklyDates: weeklyDates,
      dates: dates,
      lastClosePt: null as TableRow | null,
      ephemerisColor: "#FFFFFF",
      cometColor: "#04D6B0",

      sheet: null as SheetType,
      showTextTooltip: false,
      showMapTooltip: false,
      showLocationSelector: false,
      tab: 0,
      map: null as L.Map | null,

      selectionProximity: 4,
      pointerMoveThreshold: 6,
      isPointerMoving: false,
      pointerStartPosition: null as { x: number; y: number } | null,

      // Harvard Observatory
      location: {
        latitudeRad: D2R * 42.3814,
        longitudeRad: D2R * -71.1281
      } as LocationRad
    }
  },

  created() {
    this.waitForReady().then(() => {

      console.log(this);

      // This is just nice for hacking while developing
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.wwt = this;
      
      this.backgroundImagesets = [...skyBackgroundImagesets];

      this.getLocation();
      this.setClockSync(false);

      this.createTableLayer({
        name: "Full Weekly",
        referenceFrame: "Sky",
        dataCsv: fullWeeklyString
      }).then((layer) => {
        console.log(layer);
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 50],
            ["color", Color.fromHex(this.ephemerisColor)],
            ["plotType", PlotTypes.circle],
            ["sizeColumn", 3],
            ["opacity", 0.7]
          ]
        })
      });

      this.createTableLayer({
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
            ["sizeColumn", 3],
            ["opacity", 1]
          ]
        })
      });

      this.createTableLayer({
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
            ["sizeColumn", 3],
            ["startDateColumn", 0],
            ["endDateColumn", 0],
            ["timeSeries", true],
            ["opacity", 1],
            ["decay", 1]
          ]
        });
      });

      this.createTableLayer({
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
            ["sizeColumn", 3],
            ["startDateColumn", 0],
            ["endDateColumn", 0],
            ["timeSeries", true],
            ["opacity", 1],
            ["decay", 1]
          ]
        });
      });


      this.setTime(this.selectedDate);

    });

  },

  computed: {
    selectedDate() {
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
    showTextSheet: {
      get(): boolean {
        return this.sheet === 'text';
      },
      set(_value: boolean) {
        this.selectSheet('text');
        this.showTextTooltip = false;
      }
    },
  //   altAz() {
  //     return this.equatorialToHorizontal(this.wwtRARad, this.wwtDecRad, this.location.latitudeRad, this.location.longitudeRad, new Date());
  //   }
  },

  methods: {
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

    setupLocationSelector() {
      const map = L.map("map-container").setView([R2D * this.location.latitudeRad, R2D * this.location.longitudeRad], 5);
      /* L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        className: 'map-tiles'
      }).addTo(map); */
      L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3'],
        className: 'map-tiles'
    }).addTo(map);

      map.doubleClickZoom.disable();
      map.on('dblclick', this.onMapSelect);
      this.map = map;
    },

    onMapSelect(e: LeafletMouseEvent) {
      this.location = {
        latitudeRad: e.latlng.lat * D2R,
        longitudeRad: e.latlng.lng * D2R
      }
      this.showLocationSelector = false;
    },

    getLocation() {
      const options = { timeout: 10000, enableHighAccuracy: true };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Got position!");
          console.log(position);
          this.location = {
            longitudeRad: D2R * position.coords.longitude,
            latitudeRad: D2R * position.coords.latitude
          }
        },
        (error) => {
          console.log(error);
          this.createHorizon();
        },
        options
      );
    },

    // WWT does have all of this functionality built in
    // but it doesn't seem to be exposed
    // We should do that, but for now we just copy the web engine code
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

        const julianDays = b + c + d - 730550.5 + day + (hour + minute / 60.00 + second / 3600.00) / 24.00;

        const julianCenturies = julianDays / 36525.0;
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
      let hourAngle = this.mstFromUTC2(utc, R2D * longRad) - R2D * raRad;
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

      if (Math.sin(ha) > 0) {
        azimuth = Math.PI - azimuth;
      }
      return { altRad: altitude, azRad: azimuth };

    },

    createHorizon(when: Date | null = null) {
      this.clearAnnotations();

      const color = '#5C4033';
      const date = when || new Date();

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

    closestDailyPoint(
      point: { x: number; y: number; },
      threshold?: number
    ): TableRow | null {
      const raDecDeg = this.findRADecForScreenPoint(point);
      const target = { ra: D2R * raDecDeg.ra, dec: D2R * raDecDeg.dec };

      let minDist = Infinity;
      let closestPt = null as TableRow | null;

      daily2023Table.forEach(row => {
        const raRad = row.ra * D2R;
        const decRad = row.dec * D2R;

        const dist = distance(target.ra, target.dec, raRad, decRad);
        if (dist < minDist) {
          closestPt = row;
          minDist = dist;
        }

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
      const closestPt = this.closestDailyPoint(pt, this.selectionProximity);
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
      }
      this.pointerStartPosition = null;
      this.isPointerMoving = false;
    },

    updateViewForDate() {
      const weekly = weeklyDates.includes(this.selectedTime);
      const daily = !weekly && dailyDates.includes(this.selectedTime);

    },
  },

  watch: {
    // altAz(coords: { altitude: number; azimuth: number }) {
    //   if (coords.altitude < 0) {
    //     const pos = this.horizontalToEquatorial(coords.altitude, coords.azimuth, D2R * this.location.latitudeDeg, D2R * this.location.longitudeDeg, new Date());
    //     this.gotoRADecZoom({
    //       raRad: D2R * pos.raDeg,
    //       decRad: D2R * pos.decDeg,
    //       zoomDeg: this.wwtZoomDeg,
    //       instant: true
    //     });
    //   }
    // },
    location(loc: LocationRad) {
      const now = new Date();
      const raDec = this.horizontalToEquatorial(Math.PI/2, 0, loc.latitudeRad, loc.longitudeRad, now);
      this.createHorizon(now);
      this.gotoRADecZoom({
        raRad: raDec.raRad,
        decRad: raDec.decRad,
        zoomDeg: this.wwtZoomDeg,
        instant: true
      });
    },
    selectedDate(date: Date) {
      this.setTime(date);
    },
    showLocationSelector(show: boolean) {
      if (show) {
        this.$nextTick(() => {
          this.setupLocationSelector();
        });
      } else {
        this.map?.remove();
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

#top-content {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: calc(100% - 1rem);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

#bottom-content {
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

#tools {
  z-index: 10;
  color: #fff;

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
  color: #F0AB52;
  background: black;
  padding: 5px 5px;
  border: 2px solid black;
  border-radius: 10px;
  font-size: calc(0.7em + 0.2vw);
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

#location-selector {
  align-items: center;
}

#map-container {
  width: 700px;
  height: 500px;
  max-width: 90%;
  max-height: 90%;
  margin: auto;
  padding: 5px 0px;
}

.leaflet-pane {
  width: 500px;
  height: 100px;
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

.vue-slider-process,
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

@media(max-width: 600px) {
  .mark-line {
    display: none;
  }
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
