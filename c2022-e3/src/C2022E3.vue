<template>
  <v-app
    id="app"
  >
  <WorldWideTelescope
      :wwt-namespace="wwtNamespace"
      :class="{ pointer: lastClosePt !== null }"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerdown="onPointerDown"
    ></WorldWideTelescope>

    <div id="bottom-content">
      <div id="tools">
        <span class="tool-container">
          <vue-slider
            absorb
            id="slider"
            v-model="selectedTime"
            tooltip="always"
            :data="dates"
            :included="true"
            :marks="true"
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

  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { csvFormatRows, csvParse } from "d3-dsv";

import { distance } from "@wwtelescope/astro";
import { Color, Poly, SpreadSheetLayer } from "@wwtelescope/engine";
import { PlotTypes } from "@wwtelescope/engine-types";

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
      prevDate: new Date(d.PrevDate!),
      nextDate: new Date(d.NextDate!)
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
      ]].concat(table.map((d, i) => {
        return [
          d.date.toISOString(),
          d.ra.toString(),
          d.dec.toString(),
          d.tMag.toString(),
          d.prevDate.toISOString(),
          d.nextDate.toISOString()
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
const dates = [...new Set([...weeklyDates, ...dailyDates])].sort();

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

      selectionProximity: 4,
      pointerMoveThreshold: 6,
      isPointerMoving: false,
      pointerStartPosition: null as { x: number; y: number } | null,

      // Harvard Observatory
      location: {
        latitudeRad: D2R * 42.3814,
        longitudeRad: D2R * 71.1281
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
    }
  //   altAz() {
  //     return this.equatorialToHorizontal(this.wwtRARad, this.wwtDecRad, this.location.latitudeRad, this.location.longitudeRad, new Date());
  //   }
  },

  methods: {
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
          console.log(error)
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

    }
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

// Styling the slider
#slider {
  width: 100% !important;
  margin: 5px 50px;
}

.vue-slider-process,
.vue-slider-dot-tooltip-inner
{
  background-color: #04D6B0 !important;
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
</style>
