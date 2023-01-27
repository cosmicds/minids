<template>
  <v-app
    id="app"
  >
  <WorldWideTelescope
      :wwt-namespace="wwtNamespace"
    ></WorldWideTelescope>

    <div id="bottom-content">
      <div id="tools">
        <span class="tool-container">
          <vue-slider
            style="width: 500px;"
            :data="dates"
            :marks="dates"
            :tooltip-formatter="(v: number) => {
              return (new Date(v)).toISOString().split('T')[0]
            }"
            @change="(value: number, _index: number) => {
              selectedDate = new Date(value);
            }"
            >
            <template v-slot:mark="{ pos }">
              <span
                class="custom-mark" :style="{ left: `${pos}%` }">
                <span class="mark-line"></span>
              </span>
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
import { csvFormatRows, csvParse, DSVParsedArray } from "d3-dsv";

import { Color, Poly, SpreadSheetLayer } from "@wwtelescope/engine";
import { PlotTypes } from "@wwtelescope/engine-types";

import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common"

import {
  ephemerisFullWeekly,
  ephemeris2023Daily,
  ephemerisFullWeeklyCsv,
  ephemeris2023DailyCsv
} from "./data";

const D2R = Math.PI / 180;
const H2R = Math.PI / 12;
const R2D = 180 / Math.PI;
const H2D = 180 / 12;

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

function formatCsvTable(table: typeof fullWeeklyTable): string {
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
const dates = [...weeklyDates, ...dailyDates].sort();

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
      selectedDate: new Date(2023, 0, 28),
      dailyDates: dailyDates,
      weeklyDates: weeklyDates,
      dates: dates,
      greenColor: "#00FF00",

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
      window.wwt = this; window.applySettings = this.applyTableLayerSettings;
      

      this.backgroundImagesets = [...skyBackgroundImagesets];

      this.getLocation();
      this.setClockSync(false);

      this.createTableLayer({
        name: "Full Weekly",
        referenceFrame: "Sky",
        dataCsv: fullWeeklyString
      }).then((layer) => {
        this.weeklyLayer = layer;
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 50],
            ["color", Color.fromArgb(128, 255, 255, 255)],
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
            ["scaleFactor", 25],
            ["color", Color.fromArgb(128, 128, 128, 128)],
            ["sizeColumn", 3],
            ["opacity", 0.7]
          ]
        })
      });

      this.updateDateLayers();

    });

  },

  // computed: {
  //   altAz() {
  //     return this.equatorialToHorizontal(this.wwtRARad, this.wwtDecRad, this.location.latitudeRad, this.location.longitudeRad, new Date());
  //   }
  // },

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

    async updateDateLayers() {

      // If any date layers already exist,
      // delete them first
      this.dateLayers.forEach(layer => {
        this.deleteLayer(layer.id);
      });
      this.dateLayers = [];

      const time = this.selectedDate.getTime()
      const weekly = this.weeklyDates.includes(time);
      const daily = this.dailyDates.includes(time);

      const proms = []
      if (weekly) {
        proms.push(this.createTableLayer({
          name: "Weekly Date Layer",
          referenceFrame: "Sky",
          dataCsv: fullWeeklyString
        }).then((layer) => {
          this.dateLayers.push(layer);
          layer.set_lngColumn(1);
          layer.set_latColumn(2);
          this.applyTableLayerSettings({
            id: layer.id.toString(),
            settings: [
              ["scaleFactor", 50],
              ["color", Color.fromArgb(255, 0, 255, 0)],
              ["plotType", PlotTypes.circle],
              ["sizeColumn", 3],
              ["startDateColumn", 0],
              ["endDateColumn", 0],
              ["timeSeries", true],
              ["opacity", 1],
              ["decay", 1]
            ]
          });
        }));
      }

      if (daily) {
        proms.push(this.createTableLayer({
          name: "Daily Date Layer",
          referenceFrame: "Sky",
          dataCsv: daily2023String
        }).then((layer) => {
          this.dateLayers.push(layer);
          layer.set_lngColumn(1);
          layer.set_latColumn(2);
          this.applyTableLayerSettings({
            id: layer.id.toString(),
            settings: [
              ["scaleFactor", 25],
              ["color", Color.fromArgb(255, 0, 255, 0)],
              ["sizeColumn", 3],
              ["startDateColumn", 0],
              ["endDateColumn", 0],
              ["timeSeries", true],
              ["opacity", 1],
              ["decay", 1]
            ]
          });
        }));
      }

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
        console.log(points);
        const poly = new Poly();
        points.forEach(point => poly.addPoint(...point));
        poly.set_lineColor(color);
        poly.set_fill(true);
        poly.set_fillColor(color);
        this.addAnnotation(poly);
      }
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
      console.log(raDec);
      this.createHorizon(now);
      this.gotoRADecZoom({
        raRad: raDec.raRad,
        decRad: raDec.decRad,
        zoomDeg: this.wwtZoomDeg,
        instant: true
      });
    },
    selectedDate(date: Date) {
      this.updateDateLayers();
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
.vue-slider-process,
.vue-slider-dot-tooltip-inner
{
  background-color: #00FF00 !important;
}

.mark-line {
  height: 10px;
  width: 2px;
  margin: 0;
  background-color: '#FFFFFF';
}
</style>
