<template>
  <v-app
    id="app"
  >
  <WorldWideTelescope
      :wwt-namespace="wwtNamespace"
    ></WorldWideTelescope>

    <div id="bottom-content">
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
import { Circle, Color, ImageSetLayer, Poly, PolyLine, Place } from "@wwtelescope/engine";
import { applyImageSetLayerSetting, applySpreadSheetLayerSetting } from "@wwtelescope/engine-helpers";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common";
import { defineComponent } from 'vue';
import { PlotTypes, RAUnits } from "@wwtelescope/engine-types";

const D2R = Math.PI / 180;
const H2R = Math.PI / 12;
const R2D = 180 / Math.PI;
const H2D = 180 / 12;

type LocationDeg = {
  longitudeDeg: number;
  latitudeDeg: number;
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

export default defineComponent({
  extends: MiniDSBase,

  data() {
    return {
      backgroundImagesets: [] as BackgroundImageset[],
      decRadLowerBound: 0.2,

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

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.wwt = this;

      this.backgroundImagesets = [...skyBackgroundImagesets];

      this.getLocation();

      const ephemerisFullWeekly = `RGF0ZSxSQSxEZWMsVG1hZw0KMjAyMi1KYW4tMDEgMDA6MDAsMjkwLjk5Mzk2LC0zLjc1NzU3LDE3LjMwMA0KMjAyMi1KYW4tMDggMDA6MDAsMjkxLjk5NTkwLC0zLjM1NjE2LDE3LjI1Mw0KMjAyMi1KYW4tMTUgMDA6MDAsMjkzLjAyNDY0LC0yLjg5NjUzLDE3LjIwMQ0KMjAyMi1KYW4tMjIgMDA6MDAsMjk0LjA2OTgyLC0yLjM3NjY0LDE3LjE0Mw0KMjAyMi1KYW4tMjkgMDA6MDAsMjk1LjEyMTU5LC0xLjc5MzkyLDE3LjA3OA0KMjAyMi1GZWItMDUgMDA6MDAsMjk2LjE2ODg0LC0xLjE0NTQ2LDE3LjAwOA0KMjAyMi1GZWItMTIgMDA6MDAsMjk3LjE5OTQ1LC0wLjQyODc1LDE2LjkzMg0KMjAyMi1GZWItMTkgMDA6MDAsMjk4LjIwMjE2LDAuMzU4ODQsMTYuODUwDQoyMDIyLUZlYi0yNiAwMDowMCwyOTkuMTY1NzUsMS4yMjA4MCwxNi43NjENCjIwMjItTWFyLTA1IDAwOjAwLDMwMC4wNzY5OCwyLjE2MTE5LDE2LjY2Ng0KMjAyMi1NYXItMTIgMDA6MDAsMzAwLjkyMDk1LDMuMTgzNjgsMTYuNTY0DQoyMDIyLU1hci0xOSAwMDowMCwzMDEuNjgyOTMsNC4yOTIzMywxNi40NTYNCjIwMjItTWFyLTI2IDAwOjAwLDMwMi4zNDcxNiw1LjQ5MjM1LDE2LjM0MQ0KMjAyMi1BcHItMDIgMDA6MDAsMzAyLjg5NDM4LDYuNzg5NTIsMTYuMjIwDQoyMDIyLUFwci0wOSAwMDowMCwzMDMuMzAyMzAsOC4xODg5MywxNi4wOTINCjIwMjItQXByLTE2IDAwOjAwLDMwMy41NDcyNiw5LjY5NTcxLDE1Ljk1OA0KMjAyMi1BcHItMjMgMDA6MDAsMzAzLjYwMjY2LDExLjMxNTYyLDE1LjgxOA0KMjAyMi1BcHItMzAgMDA6MDAsMzAzLjQzNTY3LDEzLjA1MzU2LDE1LjY3Mw0KMjAyMi1NYXktMDcgMDA6MDAsMzAzLjAwODI5LDE0LjkxMTEzLDE1LjUyMw0KMjAyMi1NYXktMTQgMDA6MDAsMzAyLjI3OTMyLDE2Ljg4NjQ1LDE1LjM2OA0KMjAyMi1NYXktMjEgMDA6MDAsMzAxLjIwMjgyLDE4Ljk3MzQxLDE1LjIxMg0KMjAyMi1NYXktMjggMDA6MDAsMjk5LjcyNTY5LDIxLjE1NzU2LDE1LjA1Mw0KMjAyMi1KdW4tMDQgMDA6MDAsMjk3Ljc5MjYxLDIzLjQxMDY2LDE0Ljg5Ng0KMjAyMi1KdW4tMTEgMDA6MDAsMjk1LjM1MzQwLDI1LjY4OTMzLDE0Ljc0MQ0KMjAyMi1KdW4tMTggMDA6MDAsMjkyLjM2ODI2LDI3LjkzMzk0LDE0LjU5Mg0KMjAyMi1KdW4tMjUgMDA6MDAsMjg4LjgxNTY2LDMwLjA2NTc4LDE0LjQ1Mg0KMjAyMi1KdWwtMDIgMDA6MDAsMjg0LjcxMjU0LDMxLjk4ODc2LDE0LjMyMg0KMjAyMi1KdWwtMDkgMDA6MDAsMjgwLjEzMTMzLDMzLjYwMzYxLDE0LjIwNg0KMjAyMi1KdWwtMTYgMDA6MDAsMjc1LjIwMjMwLDM0LjgyNTM0LDE0LjEwNQ0KMjAyMi1KdWwtMjMgMDA6MDAsMjcwLjEwMzMzLDM1LjU5NjQ5LDE0LjAxOA0KMjAyMi1KdWwtMzAgMDA6MDAsMjY1LjA0MzYzLDM1Ljg5OTE0LDEzLjk0NQ0KMjAyMi1BdWctMDYgMDA6MDAsMjYwLjIyNzE5LDM1Ljc2MjkxLDEzLjg4NA0KMjAyMi1BdWctMTMgMDA6MDAsMjU1LjgxMzc4LDM1LjI1NTMzLDEzLjgzMg0KMjAyMi1BdWctMjAgMDA6MDAsMjUxLjkwMjg1LDM0LjQ2MDk1LDEzLjc4Ng0KMjAyMi1BdWctMjcgMDA6MDAsMjQ4LjU0MTIxLDMzLjQ2NzI5LDEzLjc0Mw0KMjAyMi1TZXAtMDMgMDA6MDAsMjQ1LjcyOTg2LDMyLjM1NzY0LDEzLjY5OQ0KMjAyMi1TZXAtMTAgMDA6MDAsMjQzLjQzNDc0LDMxLjIwMjc1LDEzLjY1MQ0KMjAyMi1TZXAtMTcgMDA6MDAsMjQxLjYwNDYzLDMwLjA1NTQ5LDEzLjU5Nw0KMjAyMi1TZXAtMjQgMDA6MDAsMjQwLjE4NTkwLDI4Ljk1NTI1LDEzLjUzNQ0KMjAyMi1PY3QtMDEgMDA6MDAsMjM5LjEyMzYxLDI3LjkzMzM1LDEzLjQ2Mg0KMjAyMi1PY3QtMDggMDA6MDAsMjM4LjM2MjExLDI3LjAxMzMyLDEzLjM3Nw0KMjAyMi1PY3QtMTUgMDA6MDAsMjM3Ljg1MDg4LDI2LjIxMDQwLDEzLjI3OA0KMjAyMi1PY3QtMjIgMDA6MDAsMjM3LjU0Nzc5LDI1LjUzNjc5LDEzLjE2NA0KMjAyMi1PY3QtMjkgMDA6MDAsMjM3LjQxMzg1LDI1LjAwNTUzLDEzLjAzNA0KMjAyMi1Ob3YtMDUgMDA6MDAsMjM3LjQxMDM4LDI0LjYyOTY5LDEyLjg4NQ0KMjAyMi1Ob3YtMTIgMDA6MDAsMjM3LjUwMzE2LDI0LjQyMDk3LDEyLjcxNw0KMjAyMi1Ob3YtMTkgMDA6MDAsMjM3LjY2MzgyLDI0LjM5NDg3LDEyLjUyOA0KMjAyMi1Ob3YtMjYgMDA6MDAsMjM3Ljg2NDA5LDI0LjU3NTE0LDEyLjMxNQ0KMjAyMi1EZWMtMDMgMDA6MDAsMjM4LjA3MjUyLDI0Ljk5NTEzLDEyLjA3Nw0KMjAyMi1EZWMtMTAgMDA6MDAsMjM4LjI1ODg1LDI1LjcwMTQ4LDExLjgxMQ0KMjAyMi1EZWMtMTcgMDA6MDAsMjM4LjM5MzEzLDI2Ljc3MTQ1LDExLjUxMg0KMjAyMi1EZWMtMjQgMDA6MDAsMjM4LjQzMzEyLDI4LjM0MTcyLDExLjE3Mw0KMjAyMi1EZWMtMzEgMDA6MDAsMjM4LjMwMzA0LDMwLjY2MTk2LDEwLjc4MQ0KMjAyMy1KYW4tMDcgMDA6MDAsMjM3Ljg1MTc3LDM0LjIyNTAxLDEwLjMxNg0KMjAyMy1KYW4tMTQgMDA6MDAsMjM2LjY3ODI5LDQwLjEzNzg4LDkuNzQ2DQoyMDIzLUphbi0yMSAwMDowMCwyMzMuMTY1NTcsNTEuMjE4MzksOS4wMjUNCjIwMjMtSmFuLTI4IDAwOjAwLDIwOS43NzE0Niw3My44NzI2NCw4LjIxMQ0KMjAyMy1GZWItMDQgMDA6MDAsODIuMzAwNjcsNTcuODA4NTUsOC4wNDUNCjIwMjMtRmViLTExIDAwOjAwLDcyLjA0MTMzLDI2LjE4MzI4LDguODc5DQoyMDIzLUZlYi0xOCAwMDowMCw2OS45NjA0OCwxMS40NjQzMSw5Ljc2OA0K`;
      this.createTableLayer({
        name: "Data",
        referenceFrame: "Sky",
        dataCsv: atob(ephemerisFullWeekly)
      }).then((layer) => {
        console.log("Here");
        console.log(layer);
        layer.set_lngColumn(1);
        layer.set_latColumn(2);
        this.applyTableLayerSettings({
          id: layer.id.toString(),
          settings: [
            ["scaleFactor", 25],
            ["color", Color.fromArgb(255, 0, 255, 0)],
            ["plotType", PlotTypes.circle],
            ["sizeColumn", 3]
          ]
        })
      });
      

      this.gotoRADecZoom({
        raRad: 0,
        decRad: this.decRadLowerBound,
        zoomDeg: 360,
        instant: true
      });

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

    createHorizon() {
      this.clearAnnotations();

      const color = '#5C4033';
      const now = new Date();

      // The initial coordinates are given in Alt/Az, then converted to RA/Dec
      // Use N annotations to cover below the horizon
      const N = 6;
      const delta = 2 * Math.PI / N;
      for (let i = 0; i < N; i++) {
        let points: [number, number][] = [
          [0, i * delta], [-Math.PI/2, i * delta], [0, (i + 1) * delta]
        ];
        points = points.map((point) => {
          const raDec = this.horizontalToEquatorial(...point, this.location.latitudeRad, this.location.longitudeRad, now);
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
      const raDec = this.horizontalToEquatorial(Math.PI/2, 0, this.location.latitudeRad, this.location.longitudeRad, now);
      console.log(raDec);
      this.createHorizon();
      this.gotoRADecZoom({
        raRad: raDec.raRad,
        decRad: raDec.decRad,
        zoomDeg: this.wwtZoomDeg,
        instant: true
      });
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
</style>
