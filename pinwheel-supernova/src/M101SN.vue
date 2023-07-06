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
      :style="cssVars"
      id="splash-overlay"
    >
      <div id="splash-screen"
        :style="cssVars"
      >
        <div
          id="first-splash-row"
        >
          <div
            id="close-splash-button"
            @click="closeSplashScreen"
            >&times;</div>
          <div id="splash-screen-text">
            <p> See a </p>
            <p class="highlight"> Star Explode </p>
            <p class="small"> in a galaxy far, far away... </p>
          </div>
        </div>
        
        <div id="splash-screen-guide">
          <font-awesome-icon
            id="text-icon"
            icon="book-open"
          /> Read the guide 
          <br>
          <font-awesome-icon
            id="video-icon"
            icon="video"
          /> Watch the demo 
        </div>
        
        <div id="splash-screen-acknowledgements">
          This Mini Data Story is brought to you by <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank">Cosmic Data Stories</a> and <a href="https://www.worldwidetelescope.org/home/" target="_blank">WorldWide Telescope</a>.
          
          <div id="splash-screen-icons">
            <mini-credits/>
          </div>
        </div>
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
      <div id="center-buttons">
        <!-- add iconbutton for location -->
        <icon-button
          v-if="false"
          v-model="showLocationSelector"
          fa-icon="location-pin"
          :color="accentColor"
          :focus="accentColor2"
          tooltip-text="Select location"
          tooltip-location="bottom"
          >
      </icon-button>
      </div>
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
      <icon-button
          @activate="centerView"
          fa-icon="refresh"
          :color="accentColor"
          tooltip-text="Center the Pinwheel"
          tooltip-location="start"
          >
      </icon-button>
      <icon-button
          v-model="showConstellations"
          :color="accentColor"
          fa-icon="constellation"
          :tooltip-text="showConstellations ? 'Hide constellations' : 'Show constellations'"
          tooltip-location="start"
          >
      </icon-button>
      <icon-button
          v-model="showArrow"
          :color="accentColor"
          fa-icon="arrow-right"
          :tooltip-text="showArrow ? 'Hide the arrow' : 'Show the arrow'"
          tooltip-location="start"
        >
      </icon-button>
      </div>
    </div>

    <div class="right-content">
      <gallery
        wtml-url="https://raw.githubusercontent.com/johnarban/wwt_interactives/main/images/m101/gallery.wtml"
        width="1000px"
        :single-select="true"
        title="Click Image to Overlay"
        closed-text="Image Gallery"
        :selected-color="accentColor"
        :style="cssVars"
        :preview-index="1"
        @select="onItemSelected"
        @deselect="onItemDeselected"
      />
    </div>
    <div class="bottom-content">

      <div id="tools">
        <div 
        id="chart-button"
        :class="[chartVisible ? 'collapse-button': '']"
        >
          <v-btn
            flat
            @click="chartVisible = !chartVisible"
            @keyup.enter="chartVisible = !chartVisible"
            :color="accentColor"
            >
              <font-awesome-icon
                id="chart-icon"
                class="control-icon"
                :icon="chartVisible ? 'circle-xmark' : 'chart-line'"
                size="xl"
              />
            <span id="button-text">{{ chartVisible ? 'Hide' : 'Show' }} supernova brightness graph</span>
          </v-btn>
        </div>
          <div id="chart-container" v-show="chartVisible" >
            <div id="chart-title">
              Supernova Light Curve (Change in Brightness Over Time)
            </div>
            <div id="yaxis-text">
              Supernova <br />
              Brightness
            </div>
            <!-- :lineData="dates.map(d => {return {x: d, y: 12.5}})" -->
          <chartjs-scatter
            reversedY
            scatter
            line
            :animation=false
            :data="lightCurveData.filter(d => (d.time.getTime() <= selectedTime ))"
            :lineData="lightCurveData.filter(d => (d.time.getTime() <= selectedTime ))"
            :keys="{ x: 'time', y: 'magnitude' }"
            :xrange="[Math.min(...dates.map(d => d)), Math.max(...dates.map(d => d))]"
            :yrange="[10.5, 17]"
            :color="accentColor2"
            :borderColor="accentColor2"
            :scatterOptions="{radius: 5, borderWidth: 2}"
            :lineOptions="{borderColor: 'white', borderWidth: 1.5}"
            :yAxisOptions="{
              title: { display: false,
                text: 'Supernova Brightness',
                color: 'white',
                },
              border: { display: true,
                color: 'white',
                width: 4,
              },
              ticks: {display: false},
              }"
              :xAxisOptions="{
                border: { display: true,
                  color: 'white',
                  width: 4,
                },
                title: {display: false},
                ticks: {display: false},
              }"
            @bounds="(val: any) => { chartBounds = val; onResize() }"
            
          />
          
          <div id="xaxis-text">
              Time
            </div>
          
          </div>
          
        
        <span class="tool-container">
          <icon-button
          class="play-pause-icon-wrapper"
          tooltip-location="top"
          :color="accentColor"
          :focus-color="accentColor"
          tooltip-text="Watch the supernova change over time!"
          @activate="() => {
                  playing = !(playing || playingImagePath); // set playing to true if both playing & pCP are false. set playing to false if either playing or pCP are true.
                  playingImagePath = false; // don't reverse the order of this line and previous or logic will break.
                }"
          >
          <template #button>
          <span class="play-icon-text">Watch over time&nbsp;</span>
                <font-awesome-icon
                  id="play-pause-icon"
                  class="control-icon"
                  :icon="!(playing || playingImagePath) ? 'play' : 'pause'"
                  size="sm"
                ></font-awesome-icon>
          </template>
        </icon-button>
          <vue-slider
            adsorb
            included
            :duration="0.1"
            id="slider"
            :marks="(d: number) => {
              return allDates.includes(d) || imageDates.includes(d);
            }"
            :order="false"
            v-model="selectedTime"
            @change="onTimeSliderChange"
            :data="dates"
            tooltip="always"
            tooltip-placement="bottom"
            :tooltip-style="{opacity: 0.75}"
            :tooltip-formatter="(v: number) => 
              toDateString(new Date(v))
            "
            >
              <template v-slot:mark="{ pos, value }">
                <div
                  :class="[{ 'mark-line': imageDates.includes(value) }]"
                  :style="{ left: `${pos}%` }">
                </div>
              </template>
            </vue-slider>
          </span>
      </div>
      
      <div
        v-if="false"
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
            <v-btn
                block
                :color="accentColor"
                @click="() => {
                  playing =  !(playing || playingImagePath);;
                  playingImagePath = !playingImagePath;
                }"
              >
                {{ `${playingImagePath ? 'Stop' : 'Play'} supernova images` }}
              </v-btn>
            
            <!-- <v-btn
                block
                :color="accentColor"
                @click="centerView"
                @keyup.enter="centerView"
                class="mb-2"
              >
                Center the Pinwheel
            </v-btn> -->
          
            <toggle
              :show="false"
              :color="accentColor"
              :item="showAltAzGrid"
              label="Grid"
              @toggle="showAltAzGrid = $event"
            />
            <toggle
              :color="accentColor"
              :item="showConstellations"
              label="Constellations"
              @toggle="showConstellations = $event"
            />
            <toggle
              :show="false"
              :color="accentColor"
              :item="showHorizon"
              label="Horizon"
              @toggle="showHorizon = $event"
            />
            <div 
              v-if="false"
              id="time-picker-wrapper">
            <div
              style="color:white;"
              class="mt-3"
            >
              Selected location's time:
            </div>
            <date-picker
              v-if="false"
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
                  :color="accentColor"
                ></font-awesome-icon>
              </template>
            </date-picker>
          </div>
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

    </div>
    
    <div class="opacity-slider-wrapper">
        <vue-slider
          v-if="!smallSize"
          class="opacity-slider"
          adsorb
          :min="0"
          :max="1"
          :interval="0.01"
          id="opacity-slider"
          :order="false"
          tooltipPlacement="bottom"
          v-model="currentOpacity"
          @change="(opacity: number) => currentLayer?.set_opacity(opacity)"
          >
          <span>Change image opacity</span>
      </vue-slider>
    </div>
    
    <mini-credits class="bottom-credits"></mini-credits>
    
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
          <source src="./assets/video_2.mp4" type="video/mp4" autoplay>
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

                <h3><i>Something new has burst onto the scene in the Pinwheel Galaxy!</i></h3>

                <p>
                  On May 19, 2023 - renowned supernova hunter 
                  <a href="https://www.scientificamerican.com/article/astronomers-have-spotted-a-once-in-a-decade-supernova-and-you-can-too/" target="_blank">Koichi Itagaki discovered</a>
                  a new bright object in the very nearby Pinwheel Galaxy (also known as M101). This bright object was a <strong>new supernova</strong>. 
                </p>
                <br/>
                <h3>What is a Supernova?</h3>
                
                <p>
                  A <strong>supernova</strong> is an extremely bright, energetic explosion of a star. 
                  They are so bright that you can see when they occur in galaxies millions of light years away.
                </p>
                <p>
                  There are two situations which trigger a supernova&mdash;
                  a very large star (8+ times our Sun's mass) runs out of fuel and then blows up;
                  or a white dwarf (the remnants of stars like our Sun) pulls enough extra gas onto itself from a companion star that it blows up. 
                </p>
                <p>
                  The first type of supernova is called a <a href="https://astronomy.swin.edu.au/cosmos/c/core-collapse">core-collapse supernova</a> (Type II) and can teach us about the evolution and environment of massive stars. 
                  The second type (<a href="https://astronomy.swin.edu.au/cosmos/T/Type+Ia+Supernova">Type Ia</a>) have predictable brightness and are used to measure the cosmological expansion of the universe.
                </p>
                
                <h3>The Brightness Graph</h3>
                <p>
                Astronomers graph how a supernova's brightness changes over time (called a <strong>lightcurve</strong>) to distinguish between the two main types of supernovae. 
                Type II are characterized by a rapid rise followed by a plateau and or gradual dimming. 
                Type I have a rapid rise followed by a more rapid dimming. 
                </p>
                <img src="./assets/sntyp.gif">
                <p>
                You can learn about other types of supernovae <a href="https://astrobites.org/2016/12/02/classifying-supernovae/">here</a>.
                </p>
                <strong>What type of supernova do you think the one in the Pinwheel Galaxy is?</strong>
                <br>
                
                <div
                  v-if="!revealAnswer"
                  style="max-width: fit-content; margin-block: 1em"
                  class="control-icon-wrapper"
                  @click="revealAnswer = true"
                >
                  Click to reveal the answer
              </div>
              <br>
              <p v-if="revealAnswer"> With the rapid rise and long plateau this looks most similar to a Type II supernova. </p>


                

                <br><br><br>
                <div class="credits">
                <h3>Credits:</h3>
                <h4> MicroObservatory:</h4>
                <p>
                  The images shown in the "Watch over time" sequence were taken with <a href="https://mo-www.cfa.harvard.edu/MicroObservatory/" target="_blank">MicroObservatory</a>. We use them here because they observe the Pinwheel Galaxy every night in a consistent way. (Dates without MicroObservatory images had bad weather). 
                </p>

                <br/>
                <h4> MicroObservatory Images and Data Processing:</h4>
                <p>Martin Fowler (<a href="https://solarsystem.nasa.gov/people/647/martin-fowler/" target="_blank">NASA Citizen Scientist</a>)</p>
                <br/>

                <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank">CosmicDS</a> Mini Stories Team:</h4>
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
                            Click 
                              <font-awesome-icon
                                id="play-pause-icon"
                                class="control-icon"
                                icon="play"
                                size="lg"
                              ></font-awesome-icon>
                            to watch the supernova brightness change over time.
                          </li>
                          <li>
                            Adjust the date slider at the bottom to move to a specific time.
                          </li>
                          <li>
                            Click "Show supernova brightness graph" to see how its brightness changes with time.
                          </li>
                          <li>
                            Click the Image Gallery to see higher resolution images of the galaxy.
                          </li>
                          <li>
                            Use the "Change image opacity" slider to change the tranparency of the overlaid. 
                          </li>                          
                          <li>
                            Choose whether to display constellations or the arrow pointing to the supernova.
                          </li>
                          <li>
                            Re-center the view on the Pinwheel Galaxy's location "now" or Play the supernova images, in order, over time
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

    <notifications group="startup-location" position="top right" />

  </div>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { csvFormatRows, csvParse } from "d3-dsv";

import { distance } from "@wwtelescope/astro";
import { Color, Constellations, Folder, Grids, Layer, LayerManager, Poly, RenderContext, Settings, SpreadSheetLayer, WWTControl } from "@wwtelescope/engine";
import { MarkerScales, PlotTypes, Thumbnail } from "@wwtelescope/engine-types";

import L, { LeafletMouseEvent, Map } from "leaflet";
import { getTimezoneOffset } from "date-fns-tz";
import tzlookup from "tz-lookup";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common";

import { ImageSetLayer, Place } from "@wwtelescope/engine";
import { applyImageSetLayerSetting } from "@wwtelescope/engine-helpers";

import {GotoRADecZoomParams} from "@wwtelescope/engine-pinia";

import { drawSkyOverlays, initializeConstellationNames, makeAltAzGridText, drawSpreadSheetLayer, layerManagerDraw } from "./wwt-hacks";

interface MoveOptions {
  instant?: boolean;
  zoomDeg?: number;
  rollRad?: number;
}

type Point = [number, number];

import {
  m101DataList,
} from "./m101";


import {
  aavsoLightCurve,
} from "./aavsolightcurve";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

const SECONDS_PER_DAY = 60 * 60 * 24;
const MILLISECONDS_PER_DAY = 1000 * SECONDS_PER_DAY;

function parseCsvTable(csv: string) {
  return csvParse(csv, (d, index) => {
    const thisDate = new Date(d.Date ?? "");
    return {
      date: thisDate,
      ra: +(d.Ra ?? ""),
      dec: +(d.Dec ?? ""),
      objectName: d.objectName as string,
      bandpass: d.Bandpass as string,
      wtmlName: d.wtmlName as string,
      magnitude: +(d.magnitude ?? ""),
      dateString: thisDate.toUTCString().slice(4, 11) + " " + `${thisDate.getUTCHours()}` + ":" + thisDate.getUTCMinutes().toString().padStart(2, "0") + ` (${index})`,

      _filename: d.pngFilename as string,
      _index: index as number,
    };
  });
}
const fullDatesTable = parseCsvTable(m101DataList);
const imageDatesTable = parseCsvTable(m101DataList);


// parse the lightCurve data into a D3 table
const aavsoLightCurveTable = csvParse(aavsoLightCurve, (d) => {
  // d.timestamp
  // d.magnitude
  return {
    time: new Date(+(d.timestamp ?? "")),
    magnitude: +(d.magnitude ?? ""),

  };
});



// NB: The two tables have identical structures.
// We aren't exporting these types anywhere, so
// generic names are fine
type Table = typeof fullDatesTable;
type TableRow = typeof fullDatesTable[number];

function formatCsvTable(table: Table): string {
  return csvFormatRows([[
    "Date", "RA", "Dec"
  ]].concat(table.map((d, _i) => {
    return [
      d.date.toISOString(),
      d.ra.toString(),
      d.dec.toString(),
      // d.tMag.toString(),
      // d.angspeed.toString(),
    ];
  }))).replace(/\n/g, '\r\n');
  // By using a regex, we replace all instances.
  // For WWT implementation reasons (left over from 
  // the Windows client?), we need the line endings 
  // to be CRLF // lol
}

// const fullDatesString = formatCsvTable(fullDatesTable);
// const imageDatesString = formatCsvTable(imageDatesTable);

const allDates = fullDatesTable.map(r => r.date.getTime());
const imageDates = [... new Set(imageDatesTable.map(r => r.date.getTime()))];
const minDate = Math.min(...allDates, ...imageDates)-2*MILLISECONDS_PER_DAY;
const maxDate = Math.max(...allDates, ...imageDates)+2*MILLISECONDS_PER_DAY;
const dates: number[] = [];

let t = minDate - (minDate % MILLISECONDS_PER_DAY);
while (t <= maxDate) {
  dates.push(t);
  t += MILLISECONDS_PER_DAY/6;
}

for (const d of imageDates) {
  if (!dates.includes(d)) {
    // dates.push(d);
    // find the nearest value in dates to d and replace it with d
    const closest = dates.reduce((a, b) => {
      return Math.abs(b - d) < Math.abs(a - d) ? b : a;
    });
    dates.splice(dates.indexOf(closest), 1, d);
  }
}

// dates = [...new Set(dates)];
dates.sort((a, b) => a - b);


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
      places: {} as Record<string, Place>,

      playing: false,
      playingImagePath: false,
      playingIntervalId: null as ReturnType<typeof setInterval> | null,
      playingWaitCount: 0,
      playCount: 0,

      showAltAzGrid: false,
      showConstellations: false,
      showArrow: true,
      showHorizon: false,
      outerArrow: null as Poly | null,
      innerArrow: null as Poly | null,
      m101RADeg: 3.681181581357794 * R2D + 0.2/60,
      m101DecDeg: 0.9480289529731357 * R2D - 1/60,
      arrowAngleDeg: -60,

      showSpeadSheetLater: false,

      currentCometImageLayer: null as SpreadSheetLayer | null,
      currentAllLayer: null as SpreadSheetLayer | null,
      interpolatedDailyTable: null as Table | null,
      currentLayer: null as Layer | null,

      imageDates: imageDates,
      allDates: allDates,
      dates: dates,
      minDate: minDate,
      maxDate: maxDate,

      // imageNames: {} as Record<string, string>,
      // imageSortBy: {} as Record<string, number>,
      imageNames: Object.fromEntries(imageDatesTable.map(d => [d.wtmlName, d.dateString])),
      imageSortBy: Object.fromEntries(imageDatesTable.map(d => [d.wtmlName, d.date.getTime()])),
      imageDateRef: { 'names': imageDatesTable.map(d => d.wtmlName), 'dates': imageDatesTable.map(d => d.date.getTime()) },
      imageDateRefInv: Object.fromEntries(imageDatesTable.map(d => [d.date.getTime(), d.wtmlName])),
      imageDateSorted: imageDatesTable.map(d => d.date.getTime()).sort((a, b) => a - b),
      lastClosePt: null as TableRow | null,
      accentColor: "#ED6D5E",
      accentColor2: "#b3d3e0",
      accentColor3: " #0493d6",

      aavsoLightCurveData: aavsoLightCurveTable,
      // lightCurveData: imageDatesTable.map(d => { 'time': d.date, 'magnitude': d.magnitude };),
      lightCurveData: imageDatesTable.map(d => {
        return {
          time: d.date,
          magnitude: d.magnitude
        };
      }),

      currentOpacity: 0,
      
      incomingItemSelect: null as Thumbnail | null,
      initialPosition: {ra: 210.802, dec: 54.348, zoom: 7.75},

      chartBounds: {} as {
        'bounds': { xmin: number, xmax: number, ymin: number, ymax: number },
        'borders': { left: number, right: number, top: number, bottom: number }
      },  

      sheet: null as SheetType,
      showMapTooltip: false,
      showTextTooltip: false,
      showVideoTooltip: false,
      showPlayPauseTooltip: false,
      showResetTooltip: false,
      showConstellationTooltip: false,
      showLocationSelector: false,
      showControls: false,
      tab: 0,
      chartVisible: false,
      revealAnswer: false,

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
    };
  },

  mounted() {

    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
      this.onResize();
    });

    this.waitForReady().then(async () => {

      // Unlike the other things we're hacking here,
      // we aren't overwriting a method on a singleton instance (WWTControl)
      // or a static method (Constellations, Grids)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      SpreadSheetLayer.prototype.draw = drawSpreadSheetLayer;

      this.imagesetFolder = await this.loadImageCollection({
        url: this.wtml.imageCollection,
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
          this.places[name] = item;
          applyImageSetLayerSetting(layer, ["opacity", 0]);
          return layer;
        }));
      });
      

      this.loadImageCollection({
        url: this.bgWtml,
        loadChildFolders: true,
      });
      
      this.backgroundImagesets = [...skyBackgroundImagesets];

      // this.getLocation(true);
      this.setClockSync(false);
      // create date with y m d h m s

      this.setTime(this.dateTime);

      this.showControls = !this.mobile;

      Promise.all(layerPromises).then(() => {
        this.layersLoaded = true;
        
        // Set all of the imageset layers to be above the spreadsheet layers
        this.resetImagesetLayerOrder();

        const splashScreenListener = (_event: KeyboardEvent) => {
          this.showSplashScreen = false;
          window.removeEventListener('keyup', splashScreenListener);
        };
        window.addEventListener('keyup', splashScreenListener);

        window.addEventListener('keyup', (event: KeyboardEvent) => {
          if (["Esc", "Escape"].includes(event.key) && this.showVideoSheet) {
            this.showVideoSheet = false;
          }
        });
      });

      // set to use SDSS as background
      // this.wwtControl.setBackgroundImageByName("SDSS: Sloan Digital Sky Survey (Optical) [DR7]");
      this.wwtControl.setBackgroundImageByName(this.bgName ? this.bgName : "Digitized Sky Survey (Color)");
      this.wwtSettings.set_localHorizonMode(false);
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
        this.centerView();
        this.positionSet = true;
      }, 100);

      this.gotoRADecZoom({
        raRad: D2R * this.initialPosition.ra,
        decRad: D2R * this.initialPosition.dec,
        zoomDeg: 2,
        instant: true
      });

      setTimeout(() => {
        this.createArrow();
        if (this.showArrow) {
          this.displayArrow();
        }
        this.gotoRADecZoom({
          raRad: this.wwtRARad,
          decRad: this.wwtDecRad,
          zoomDeg: this.initialPosition.zoom,
          instant: true
        });
      }, 100);

    });
  },

  computed: {

    selectedDate(): Date {
      return new Date(this.selectedTime);
    },
    
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
    smallSize(): boolean {
      return this.$vuetify.display.smAndDown;
    },
    mobile(): boolean {
      return this.smallSize && this.touchscreen;
    },
    cssVars() {
      return {
        '--accent-color': this.accentColor,
        '--accent-color-2': this.accentColor2,
        '--accent-color-3': this.accentColor3,
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
      const timezoneOffsetHours = this.selectedTimezoneOffset / (60 * 60 * 1000);
      dateForTOD.setUTCHours(this.timeOfDay.hours - timezoneOffsetHours, this.timeOfDay.minutes, this.timeOfDay.seconds);
      const todMs = 1000 * (3600 * dateForTOD.getUTCHours() + 60 * dateForTOD.getUTCMinutes() + dateForTOD.getUTCSeconds());
      return todMs / MILLISECONDS_PER_DAY;
    },

    dontSetTime(): boolean {
      // return this.selectedTime %MILLISECONDS_PER_DAY !== 0;
      return false;
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
    
    
    getCssVal(element: HTMLElement, property: string): number {
      const val = window.getComputedStyle(element).getPropertyValue(property);
      return val ? parseFloat(val.slice(0,-1)) : 0;
    }, 
    
    onResize() {
      const toolsDiv = document.getElementById("tools");
      if (toolsDiv == null) {
        return;
      }

      const chartContainer = document.getElementById("chart-container");
      if (chartContainer == null) {
        return;
      }

      const slider = document.getElementById("slider") as HTMLElement;
      if (slider == null) {
        return;
      }

      const inputRail = toolsDiv.getElementsByClassName("vue-slider-rail")[0] as HTMLElement;
      if (inputRail == null) {
        return;
      }
      
      const borderWidth = chartContainer.style.borderWidth ? parseInt(chartContainer.style.borderWidth) : 0;
      const inputRailWidth = inputRail.clientWidth;
      const chartContainerNewWidth = Math.round(inputRailWidth + this.chartBounds.borders.left + this.chartBounds.borders.right +  borderWidth);
      
      chartContainer.style.width = `${chartContainerNewWidth}px`;
      // chartContainer.style.left = `${inputRail.offsetLeft}px`;
      const sliderMarginRight = this.getCssVal(slider, 'margin-right');
      const chartContainerMarginRight = sliderMarginRight - this.chartBounds.borders.right;
      chartContainer.style.marginRight = `${chartContainerMarginRight}px`; 



      // fix updown position
      const inputRailBounds = inputRail.getBoundingClientRect();


      const chartYAxisDelta = this.chartBounds.borders.bottom;
      const chartYAxisPosition = chartContainer.getBoundingClientRect().bottom - chartYAxisDelta;
      const inputRailMid = (inputRailBounds.top + inputRailBounds.bottom) / 2;
      const difference = chartYAxisPosition - inputRailMid;

      const newMargin = this.getCssVal(chartContainer, 'margin-bottom') + difference;

      chartContainer.style.marginBottom = `${Math.round(newMargin)}px`;
      
      return;
    },

    rotatePoint(point: Point, origin: Point, angleDeg: number): Point {
      const xp = point[0] - origin[0];
      const yp = point[1] - origin[1];
      const angleRad = angleDeg * D2R;
      return [
        origin[0] + xp * Math.cos(angleRad) - yp * Math.sin(angleRad),
        origin[1] + xp * Math.sin(angleRad) + yp * Math.cos(angleRad)
      ];
    },

    createArrow() {

      const m101XY = this.findScreenPointForRADec({ra: this.m101RADeg, dec: this.m101DecDeg});
      const m101Point: Point = [m101XY.x, m101XY.y];
    
      // Create the outer (purple) arrow
      this.outerArrow = new Poly();
      const outerArrowCoordinates: Point[] = [];

      const pointRA = this.m101RADeg;
      const centerDec = this.m101DecDeg;
      const arrowHalfHeight = 0.02;
      const stemFraction = 0.4;
      const headWidth = 0.05;
      const stemWidth = 0.05;
      const headBackRA = pointRA + headWidth;
      const stemBackRA = headBackRA + stemWidth;
      const topDec = centerDec + arrowHalfHeight;
      const bottomDec = centerDec - arrowHalfHeight;
      const stemHalfHeight = stemFraction * arrowHalfHeight;
      const stemTopDec = centerDec + stemHalfHeight;
      const stemBottomDec = centerDec - stemHalfHeight;
      outerArrowCoordinates.push([pointRA, centerDec]);
      outerArrowCoordinates.push([headBackRA, topDec]);
      outerArrowCoordinates.push([headBackRA, stemTopDec]);
      outerArrowCoordinates.push([stemBackRA, stemTopDec]);
      outerArrowCoordinates.push([stemBackRA, stemBottomDec]);
      outerArrowCoordinates.push([headBackRA, stemBottomDec]);
      outerArrowCoordinates.push([headBackRA, bottomDec]);

      for (const coords of outerArrowCoordinates) {
        const point = this.findScreenPointForRADec({ra: coords[0], dec: coords[1]});
        const rotatedPoint = this.rotatePoint([point.x, point.y], m101Point, this.arrowAngleDeg);
        const rotatedCoords = this.findRADecForScreenPoint({x: rotatedPoint[0], y: rotatedPoint[1]});
        this.outerArrow.addPoint(rotatedCoords.ra, rotatedCoords.dec);
      }


      this.outerArrow.set_lineColor(this.accentColor);
      this.outerArrow.set_fillColor(this.accentColor);
      this.outerArrow.set_fill(true);
      
      // Create the inner (white) arrow
      this.innerArrow = new Poly();
      const innerArrowCoordinates: Point[] = [];
      
      const delta = 0.002; // The thickness of the outer "border"
      const headSlope = (topDec - centerDec) / (headBackRA - pointRA);
      const innerPointRA = pointRA + delta * Math.sqrt(1 + (headSlope ** 2) ) / headSlope;
      const innerHeadBackRA = headBackRA - delta; 
      const innerStemBackRA = stemBackRA - delta;
      const innerTopDec = headSlope * (innerHeadBackRA - innerPointRA) + centerDec;
      const innerBottomDec = 2 * centerDec - innerTopDec;
      const innerStemTopDec = stemTopDec - delta;
      const innerStemBottomDec = stemBottomDec + delta;
      innerArrowCoordinates.push([innerPointRA, centerDec]);
      innerArrowCoordinates.push([innerHeadBackRA, innerTopDec]); 
      innerArrowCoordinates.push([innerHeadBackRA, innerStemTopDec]);
      innerArrowCoordinates.push([innerStemBackRA, innerStemTopDec]); 
      innerArrowCoordinates.push([innerStemBackRA, innerStemBottomDec]);
      innerArrowCoordinates.push([innerHeadBackRA, innerStemBottomDec]);
      innerArrowCoordinates.push([innerHeadBackRA, innerBottomDec]);

      for (const coords of innerArrowCoordinates) {
        const point = this.findScreenPointForRADec({ra: coords[0], dec: coords[1]});
        const rotatedPoint = this.rotatePoint([point.x, point.y], m101Point, this.arrowAngleDeg);
        const rotatedCoords = this.findRADecForScreenPoint({x: rotatedPoint[0], y: rotatedPoint[1]});
        this.innerArrow.addPoint(rotatedCoords.ra, rotatedCoords.dec);
      }

      const innerColor = "#ffffff";
      this.innerArrow.set_lineColor(innerColor);
      this.innerArrow.set_fillColor(innerColor);
      this.innerArrow.set_fill(true);
    },

    displayArrow() {
      if (this.outerArrow == null || this.innerArrow == null) {
        this.createArrow();
      }
      if (this.outerArrow) {
        this.addAnnotation(this.outerArrow);
      }
      if (this.innerArrow) {
        this.addAnnotation(this.innerArrow);
      }
    },

    hideArrow() {
      if (this.outerArrow) {
        this.removeAnnotation(this.outerArrow);
      }
      if (this.innerArrow) {
        this.removeAnnotation(this.innerArrow);
      }
    },

    updateArrow(show: boolean) {
      if (show) {
        this.displayArrow();
      } else {
        this.hideArrow();
      }
    },

    clearPlayingInterval() {
      if (this.playingIntervalId !== null) {
        clearInterval(this.playingIntervalId);
        this.playingIntervalId = null;
      }
    },


    getClosest(arr: number[], val: number, index = false): number {
      if (arr.includes(val)) {
        return arr.indexOf(val);
      }

      const closest = arr.reduce((prev, curr) => {
        return (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
      });

      return index ? arr.indexOf(closest) : closest;
    },


    nextDate(wrap = false) {
      const index = this.getClosest(this.dates, this.selectedTime, true);
      if (this.dates[index] > this.selectedTime) {
        return this.dates[index];
      } else {
        const next = index + 1;
        return this.dates[(wrap || next === this.dates.length) ? 0 : next];

      }
    },

    previousDate(wrap = false) {
      const index = this.getClosest(this.dates, this.selectedTime, true);
      if (this.dates[index] < this.selectedTime) {
        this.selectedTime = this.dates[index];
      } else {
        const prev = index - 1;
        this.selectedTime = this.dates[(wrap || prev < 0) ? this.dates.length + -1 : prev];

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
      const dateString = `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
      // const timeString = `${date.getUTCHours()}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
      return dateString;
    },

    interpolatedTable(table: Table): Table | null {
      const index = table.findIndex(r => r.date.getTime() === this.selectedTime);
      if (index === -1) { return null; }
      const row = table[index];
      const nextRow = table[index + 1] ?? row;
      const deltaT = (nextRow.date.getTime() - row.date.getTime()) / MILLISECONDS_PER_DAY;
      // get how far we are into the day
      const dayFracPassed = (row.date.getTime() / MILLISECONDS_PER_DAY) % 1;
      const f = (this.dayFrac - dayFracPassed) / deltaT;
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
      if (!this.showSpeadSheetLater) { return; }
      
      this.interpolatedDailyTable = this.interpolatedTable(fullDatesTable);
      if (this.currentAllLayer !== null) {
        this.deleteLayer(this.currentAllLayer.id);
        this.currentAllLayer = null;
      }
    },

    closeSplashScreen() {
      this.showSplashScreen = false;
    },

    updateWWTLocation() {
      this.wwtSettings.set_locationLat(R2D * this.location.latitudeRad);
      this.wwtSettings.set_locationLng(R2D * this.location.longitudeRad);
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

    getImageSetDate(place: Place): Date | null  {
      const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
      if (iset == null) { return null; }
      const names = this.imageDateRef['names'];
      const dates = this.imageDateRef['dates'];
      return new Date(dates[names.indexOf(iset.get_name())]);
    },
    
    onItemDeselected(place: Place) {
      
      if (place == null) {
        return;
      }
      const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
      if (iset == null) { return; }

      const name = iset.get_name();
      const layer = this.imagesetLayers[name];
      console.log('onItemDeselected', name);
      if (layer == null) {
        return;
      } else {
        this.setLayerOpacityForImageSet(name, 0);
      }
      
    },
    
    async onItemSelected(place: Place) {

      if (place == null) {
        console.log('place is null');
        this.hideAllImagesets();
        return;
      }
      // hide previous so it compares to background
      this.hideAllImagesets();
      
      const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
      if (iset == null) { return; }

      const name = iset.get_name();
      let layer = this.imagesetLayers[name];
      if (layer == null) {
        layer = await this.addImageSetLayer({
          url: iset.get_url(),
          mode: "autodetect",
          name: iset.get_name(),
          goto: false 
        });
        this.imagesetLayers[name] = layer;
      }
      this.currentLayer = layer;
      this.setLayerOpacityForImageSet(name, 1);
            
      this.playing = false;
      this.playingImagePath = false;
      console.log('onItemSelected', name);
      if (this.imageOutOfView(place) || this.needToZoomIn(place)) {
        this.gotoRADecZoom({
          raRad: D2R * iset.get_centerX(),
          decRad: D2R * iset.get_centerY(),
          zoomDeg: this.wwtZoomDeg,
          instant: true
        });
      }
    },
    

    wwtSmallestFov(): number {
      // ignore the possibility of rotation
      const w = this.wwtRenderContext.width;
      const h = this.wwtRenderContext.height;
      const fovH = this.wwtRenderContext.get_fovAngle() * D2R;
      const fovW = fovH * w / h;
      return Math.min(fovW, fovH);
    },

    radecInFOV(ra: number, dec: number, center_ra: number, center_dec: number, fov: number, fov_view: number, fraction_of_place: number): boolean {
      let dist = distance(ra, dec, center_ra, center_dec);
      dist += (fraction_of_place - 1/2) * fov;
      return dist < fov_view / 2;
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
      );

      return move;
      
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
      const isetFov = (place.get_zoomLevel() / 6) * D2R;
      
      const curRa = this.wwtRARad;
      const curDec = this.wwtDecRad;
      const curFov = this.wwtSmallestFov();

      return this.radecInFOV(isetRa, isetDec, curRa, curDec, isetFov, curFov, fraction_of_place);
    },

    // convenience wrapper for (not checkIfPlaceIsInTheCurrentFOV)
    imageOutOfView(place: Place): boolean {
      return !this.checkIfPlaceIsInTheCurrentFOV(place);
    },

    needToZoomIn(place = null as Place | null, factor = 5): boolean {
      // 1) we are already zoomed all the way out (if FOV > 50)
      if (this.wwtZoomDeg > 300) { return true; }

      if (place == null) {
        if (this.incomingItemSelect == null) { return false; }
        place = this.incomingItemSelect as Place;
      }
      // 2) the image is too small (so it's fov < 1/6 of the current fov)
      const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
      if (iset != null) {
        if (place.get_zoomLevel() * factor < this.wwtZoomDeg) { return true; }
      }
      
      return false;
    },
    
    viewIsBad(place: Place, factor = 5): boolean {
      if (place == null) {
        place = this.incomingItemSelect as Place;
      }

      if (place == null) { return false; }

      return this.imageOutOfView(place) || this.needToZoomIn(place, factor);
    },
    
    onTimeSliderChange(options?: MoveOptions) {
      this.$nextTick(() => {
        this.showImageForDateTime(new Date(this.selectedTime), true);
        this.updateViewForDate(options);
      });
    },

    
    
    onOpacityChanged(place: Place, opacity: number, move: boolean) {
      const iset = place.get_studyImageset() ?? place.get_backgroundImageset();
      if (iset == null) { return; }
      this.updateImageOpacity(place, opacity);

      this.$nextTick(() => {
        if ((this.imageOutOfView(place) && move) || (this.needToZoomIn(place, 8) && move)) {
          this.selectedTime = this.imageSortBy[iset.get_name()];
          // const [month, day, year] = iset.get_name().split("/").map(x => parseInt(x));
          // if (month && day && year) {
          //   this.selectedTime = Date.UTC(year, month - 1, day); 
          // }
          
          
          this.incomingItemSelect = place;

          this.gotoRADecZoom({
            raRad: D2R * iset.get_centerX(),
            decRad: D2R * iset.get_centerY(),
            zoomDeg: this.optionalZoom(place), // zoom if factor of 2.5x image zoomLevel
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
      const iname = iset.get_name();
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

    circleForLocation(latDeg: number, lonDeg: number): L.Circle {
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
          };

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
          //this.updateHorizon();
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

    closestPoint(
      point: { x: number; y: number; },
      threshold?: number
    ): TableRow | null {
      const raDecDeg = this.findRADecForScreenPoint(point);
      const target = { ra: D2R * raDecDeg.ra, dec: D2R * raDecDeg.dec };

      let minDist = Infinity;
      let closestPt = null as TableRow | null;

      [imageDatesTable, fullDatesTable].forEach((table) => {
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
      //this.clearAnnotations();
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
            this.onTimeSliderChange();
          });
        }
      }
      this.pointerStartPosition = null;
      this.isPointerMoving = false;
    },

    updateViewForDate(options?: MoveOptions) {
      let position = null as TableRow | null;

      const cometImageIndex = imageDates.findIndex(d => d === this.selectedTime);
      
      if (cometImageIndex > -1) {
        if (this.interpolatedDailyTable !== null) {
          position = this.interpolatedDailyTable[0];
        } else {
          position = imageDatesTable[cometImageIndex];
        }
      } else {
        const allIndex = allDates.findIndex(d => d === this.selectedTime);
        if (allIndex > -1) {
          position = fullDatesTable[allIndex];
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

    // matchImageSetName(date: Date): string {
    //   // imageset names are keys in this.imagesetLayers
    //   const imagesetNames = Object.keys(this.imagesetLayers);
    //   // loop over image set names. find the name (which is a MM/DD/YYYY date string)
    //   // that is or comes after the date we are looking for

    //   for (const name of imagesetNames) {
    //     // convert the name to a date
    //     // if the name is after the date we are looking for, return it
    //     const wwtDateString = this.namefromDate(date);
    //     if (name == wwtDateString) {
    //       return name;
    //     }
    //   }
    //   return '';
    // },
    
        
    binarySearch(arr: number[], target: number, lo = 0, hi = arr.length - 1): number {
      if (target < arr[lo]) { return arr[0];}
      if (target > arr[hi]) { return arr[hi]; }
      
      const mid = Math.floor((hi + lo) / 2);

      return hi - lo < 2
        ? (target - arr[lo]) < (arr[hi] - target) ? arr[lo] : arr[hi]
        : target < arr[mid]
          ? this.binarySearch(arr, target, lo, mid)
          : target > arr[mid]
            ? this.binarySearch(arr, target, mid, hi)
            : arr[mid];
    },

    matchImageSetName(date: Date): string {
      const thisDate = date.getTime();
      if (this.imageDateSorted.includes(thisDate)) {
        return this.imageDateRefInv[thisDate];
      }
      
      const closestDate = this.binarySearch(this.imageDateSorted, thisDate);

      // within 1 hour, in milliseconds
      if (Math.abs(thisDate - closestDate) > (12 * 60 * 60 * 1000)) { return '';}
      
      const name = this.imageDateRefInv[closestDate];
      
      return name;
    },

    hideAllImagesets() {
      console.log('hiding everything');
      for (const name of Object.keys(this.imagesetLayers)) {
        this.setLayerOpacityForImageSet(name, 0);
      }
    },

    setLayerOpacityForImageSet(name: string, opacity: number, setting_opacity_from_ui=false) {
      const layer = this.imagesetLayers[name];
      if (layer != null) {
        // update the image opacity in the WWT control
        applyImageSetLayerSetting(layer, ['opacity', opacity]);

        try {
          // update the value for the slider only if we are not setting the opacity from the UI
          if (!setting_opacity_from_ui) {
            // check if name is a valid queryselector
            const selector = `#items div.item[id='fv-${name}'] input.opacity-range[type='range']`;
            const el = (document.querySelector(selector) as HTMLInputElement);
            if (el != null) {
              el.value = `${opacity * 100}`;
            }
          }
        }
        catch (error) {
          //
        }

        try {
          const toggleSelector = `#items input[type='checkbox'][title='${name}']`;
          const el2 = (document.querySelector(toggleSelector) as HTMLInputElement);
          // truth table: opacity == 0 and el.checked == false => do nothing
          // truth table: opacity == 0 and el.checked == true => set el.checked = false
          // truth table: opacity > 0 and el.checked == false => set el.checked = true
          // truth table: opacity > 0 and el.checked == true => do nothing
          if (el2 != null) {
            if (opacity == 0 && el2.checked) {
              el2.checked = false;
            } else if (opacity > 0 && !el2.checked) {
              el2.checked = true;
            }
          }
        }
        catch (error) {
          //
        }
        
      }
    },

    showImagesetByName(name: string, moveTo = false): boolean {
      const imagesetNames = Object.keys(this.imagesetLayers);
      let shown = false;
      imagesetNames.forEach((iname: string) => {
        if (iname != name) {
          this.setLayerOpacityForImageSet(iname, 0);
        } else {
          this.setLayerOpacityForImageSet(iname, 1);
          this.currentLayer = this.imagesetLayers[iname];
          this.currentOpacity = 1;
          shown = true;
          // need to get the Place object for the image set and use it to set the view
          if (this.imagesetFolder != null) {
            const places = this.imagesetFolder.get_children();
            if (places != null) {
              const place = places.filter((place) => place.get_name() == iname);
              this.incomingItemSelect = place[0];
            }
          }
          
          if (!moveTo) { return; }
          
          const iset = this.wwtControl.getImagesetByName(iname);
          const place = this.places[iname];
          if (iset == null) { return; }
          if (place == null) { return; }
          this.$nextTick(() => {
            this.gotoRADecZoom({
              raRad: D2R * place.get_RA() * 15,
              decRad: D2R * place.get_dec(),
              zoomDeg: this.optionalZoom(place),
              instant: true
            });
          });
          
        }
      });
      return shown;
    },
    
    showImageForDateTime(date: Date, moveTo = false): boolean {
      const name = this.matchImageSetName(date);
      if (name == null || name == '') {
        // this.incomingItemSelect = null;
        return false;
      }
      
      if ((this.incomingItemSelect?.get_name() == name) && (!this.viewIsBad(this.places[name]))) {
        // console.log('image already shown and view is good, so it has been "shown"');
        return true;
      }

      return this.showImagesetByName(name, moveTo);

    },

    
    centerView(_options?: MoveOptions) {
      
      this.gotoRADecZoom({
        raRad: this.initialPosition.ra * D2R,
        decRad: this.initialPosition.dec * D2R,
        zoomDeg: this.initialPosition.zoom,
        instant: false,
      });
      // show the first image
      if (!this.playing) {
        this.selectedTime = this.imageDates[0];
        this.onTimeSliderChange({ zoomDeg: this.initialPosition.zoom });
      }
    },

    updateForDateTime() {
      if (!this.dontSetTime) { this.setTime(this.dateTime); }
      this.updateHorizon(this.dateTime); 
      // this.showImageForDateTime(this.dateTime);
      // this.updateViewForDate(options);
      this.updateLayersForDate();
    },

    updateHorizon(when: Date | null = null) {
      if (this.showHorizon) {
        this.createHorizon(when);
      } else {
        this.removeHorizon();
      }
    },

    setToFirstCometImage() {
      this.selectedTime = Math.min(...this.imageDates);
      const children = this.imagesetFolder?.get_children();
      if (children == null) { return; }
      const place = children[0] as Place;
      this.onItemSelected(place);
    },

    showChart() {
      this.chartVisible = true;
    },

    wwtMove(options: GotoRADecZoomParams) {
      this.$nextTick(() => {
        this.gotoRADecZoom(options);
      });
    },

    moveToPlace(place: Place, fovDeg = null as number | null) {
      let zoomDeg: number;

      if (fovDeg) {
        zoomDeg = fovDeg * 6;
      } else {
        zoomDeg = this.optionalZoom(place);
      }

      this.wwtMove({
        raRad: D2R * place.get_RA() * 15,
        decRad: D2R * place.get_dec(),
        zoomDeg: zoomDeg,
        instant: true
      });

    },

    optionalZoom(place: Place, factor = 3): number {
      if (this.needToZoomIn(place, factor)) {
        console.log('optionalZoom: zoom in');
      }
      return this.needToZoomIn(place, factor) ? place.get_zoomLevel() : this.wwtZoomDeg;
    }
  },

  watch: {
    showArrow(show: boolean) {
      this.updateArrow(show);
    },
    showAltAzGrid(show: boolean) {
      this.wwtSettings.set_showAltAzGrid(show);
      this.wwtSettings.set_showAltAzGridText(show);
    },
    showConstellations(show: boolean) {
      this.wwtSettings.set_showConstellationLabels(show);
      this.wwtSettings.set_showConstellationFigures(show);
      if (show) {
        this.playing = false;
        this.$nextTick(() => {
          this.gotoRADecZoom({
            raRad: this.wwtRARad,
            decRad: this.wwtDecRad,
            zoomDeg: this.wwtZoomDeg > 300 ? this.wwtZoomDeg : 300,
            instant: false
          });
        });
      }
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
      this.updateForDateTime();
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
        this.playCount += 1;
        this.showImageForDateTime(this.dateTime, true);
        this.playingIntervalId = setInterval(() => {
          if (this.selectedTime < Math.max(...this.dates)) {
            this.selectedTime = this.nextDate();
          } else {
            this.playCount += 1;
            // this.showChart();
            this.selectedTime = minDate;
          }
          this.$nextTick(() => {
            this.showImageForDateTime(this.dateTime);
            // this.updateViewForDate();
          });
        }, 100);
      } else if (this.playCount > 0) {
        this.playCount += 1;
      }
    },

    playingImagePath(play: boolean) {
      this.clearPlayingInterval();
      if (!play) {
        return;
      }
      const minTime = Math.min(...imageDates) - MILLISECONDS_PER_DAY;
      const maxTime = Math.max(...imageDates) + MILLISECONDS_PER_DAY;

      if(this.selectedTime < minTime || this.selectedTime >= maxTime){
        this.selectedTime = minTime;
      }

      this.updateViewForDate({ zoomDeg: this.initialPosition.zoom });

      this.playingIntervalId = setInterval(() => {
        if (this.playingWaitCount > 0) {
          this.playingWaitCount -= 1;
          return;
        }
        if (this.selectedTime < maxTime) {
          this.selectedTime = this.nextDate();
          this.$nextTick(() => {
            const image = this.showImageForDateTime(this.dateTime);
            this.updateViewForDate();
            if (image) {
              this.playingWaitCount = 1;
            }
          });
        } else {
          this.playingImagePath = false;
        }
      }, 500);
    },

    playCount(count: number) {
      if (count % 2) {
        // if playcount is even then we have either finished a loop or paused
        // this.showChart();
        return;
      }
    },
  }

  
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

.pointer {
  cursor: pointer;
}

.control-icon {
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: var(--accent-color-2);
  }
}

.icon-wrapper {
  padding:  .5em 1em;
}

.control-icon-wrapper {
  color: var(--accent-color);
  background: #040404;
  padding: .5em 1em;
  border: 1px solid var(--accent-color);
  border-radius: 1.25em;
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
#chart-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  margin-bottom: 2em;
  span {
    text-transform: none;
  }
}

#chart-button.collapse-button {
  justify-content: right;
  margin-right: calc(30px + 1em);
  margin-bottom: 0em;
  background-color: transparent;
  span#button-text {
    display: none;
  }
}
  
#chart-container {
  // pointer-events: auto;
  position: relative;
  --line-color: white;
  margin-left: auto;
  // margin-right: 30px;
  // box-shadow: -4px 0 0 0 var(--line-color);
  color: var(--line-color);
  margin-bottom: -33px;
  
  // makes the y-axis border look like an arrow
  // #plot::before {
  //   content: "^";
  //   position: absolute;
  //   font-size: 1.5rem;
  //   font-weight: bold;
  //   // transform: translateX(-.51em) translateY(-.55em);
  //   transform: translateX(-.14rem) translateY(-.52rem);
  //   transform-origin: 0 0;
  //   pointer-events: none;
  // }
  
  #chart-title {
    display: none;
    text-align: center;
    font-weight: bold;
    color: var(--accent-color);
    @media (max-width: 600px) {
      font-size: 0.75em;
    }
  }
  
  #yaxis-text {
    // outline: 1px solid gold;
    font-size: 1.15em;
    max-width: fit-content;
    position: absolute;
    top: 50%;
    transform: translateX(calc(-100% - 0.5em)) translateY(-50%);
    
    @media (max-width: 600px) {
      font-size: 0.75em;
    }
    
    
    @media (max-width: 400px) {
      position: relative;
      top: unset;
      max-width: none;
      text-align: center;
      transform: none;
      font-size: 1em;
      // transform: translateX(50%)
      br {
        display: none;
      }
      
    }
  }
  
  #xaxis-text {
    width: 30%;
    text-align: center;
    position: absolute;
    left: 50%;
    bottom: -2em;
    // box-shadow: 0px -4px 0px 0px var(--line-color);
    transform: translate(-50%, 0);
    padding: 2px 5px;
    
    @media (max-width: 600px) {
      font-size: 0.75em;
    }
  }
  
  
}

.icon-wrapper:has(.play-icon-text) {
  // padding: 0.5em .75em;
  line-height: 1.15;
  max-height: 50px;
}

.play-icon-text {
  font-size: 1em;
  margin: 0.5em;
}

#play-pause-icon-wrapper {
  color: var(--accent-color);
  border-color: var(--accent-color);
  margin-left: 0;
  font-size: 0.75em;
  max-height: 50px;

  &:focus {
    color: white;
  }
}

// #play-pause-icon-wrapper > #play-icon-text {
//   white-space: nowrap;
// }

// @media (max-width: 600px) {
//   #play-pause-icon-wrapper {
//     max-width: unset;
//   }
// }

#video-icon-dummy {
  pointer-events: none;
  visibility: hidden;
}

#video-icon-wrapper {
  display: initial;
}

#const-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    fill: var(--accent-color);
    stroke: white;
  }
}

.active {
  // background-color: var(--active-button-color);
  box-shadow: inset 0px 0px 10px 3px var(--accent-color), 0px 0px 10px 3px var(--accent-color);
}

.top-content {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
}


div.opacity-slider-wrapper {
  display:flex;
  position:absolute;
  bottom: 1rem;
  left: 1rem;
  width: 200px;
  border-radius: 20px;
  
  .opacity-slider {
    pointer-events: auto;

  }
  span {
    color: white;
    margin-top: 0.75em;
    font-size: 0.75em;
  }
}



.bottom-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 4rem;
  right: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  align-items: center;
  gap: 5px;
}
  
.bottom-credits {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

div#main-content > div {
  content: "";
  // outline: 1px solid orange;
}


.right-content {
  position: absolute;
  right: 1rem;
  top: 30px;
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
  
  @media (max-width: 400px) {
    margin-top: 11px;
    padding-left: 6px;
    flex-direction: column-reverse;
    align-items: center;
    
    #play-pause-icon-wrapper {
      margin-top: 1em;
    }
  }
}

.folder-view {
  max-height: calc(100% - 150px);
  width: ~"min(160px, 35vw)";
}

#controls {
  position: absolute;
  bottom: 8rem;
  z-index: 10;
  background: black;
  padding: 10px;
  border-radius: 10px;
  border: solid 1px var(--accent-color);
  display: flex;
  flex-direction: column;
  align-self: flex-end;
  margin-right: 1rem;
  margin-bottom: 1rem;
  pointer-events: auto;

  .v-label {
    // color: var(--accent-color);
    color: white;
    opacity: 1;
  }

  #controls-top-row {
    margin-right: 0px;
    margin-left: auto;
  }
}

.dp__select {
  color: var(--accent-color) !important;
}

#show-controls {
  color: var(--accent-color);
}

.v-selection-control--focus-visible .v-selection-control__input::before {
  opacity: 0.25;
}

.ui-text {
  color: var(--accent-color);
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
  color: var(--accent-color);
  background: black;
  padding: 5px 5px;
  border: 2px solid var(--accent-color);
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

#left-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.video-wrapper {  
  display: flex;
  padding: 10px;
  height: 100%;
  max-width: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  text-align: center;
  z-index: 1000;
  // border: 1px solid white;
}

video {
  margin: auto;
  height: 90%;
  width: auto;
  max-width: 95%;
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
  
  & h3 {
    margin-bottom: 1em;
    margin-top: 1em;
  }
  
  & p {
    margin-bottom: 1em;
  }
  
  & img {
    display: block;
    margin-inline: auto;
    margin-block: 20px;
    background-color: white;
    width: 300px;
  }
  
  & ul {
    margin-left: 1em;
    margin-block: 0.5em;
    font-size: 0.95em;
  }
  
  & strong {
    color: var(--accent-color-2);
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
  background-color: var(--accent-color-2);
  overflow: visible;
}

#slider {
  width: 100% !important;
  margin: 5px 30px;
  // display: none;
  // opacity: 0;

  
  // &:after {
  //   content: "^";
  //   position: absolute;
  //   right: 0;
  //   line-height: 1;
  //   font-size: 1.5rem;
  //   font-weight: bold;
  //   transform: translateX(0.36rem) translateY(-0.86rem) rotate(90deg);
  //   color: #ccc;
  //   transform-origin: 50% 50%;
  //   pointer-events: none;
  // }
}

#opacity-slider {
  width: 100% !important;
  margin: 5px 30px;
}

.vue-slider-process {
  background-color: white !important;
}

.vue-slider-dot-tooltip-inner {
  cursor: grab;
  padding: 4px 10px !important;
  color: black !important;
  background-color: var(--accent-color-2) !important;
  border: 1px solid var(--accent-color-2) !important;
  opacity: 1 !important;

  &:active {
    cursor: grabbing;
  }
}

.vue-slider-dot-handle {
  cursor: grab;
  background-color: var(--accent-color-2) !important;
  border: 1px solid black !important;

  &:active {
    cursor: grabbing;
  }
}

// adds a vertical line to track it better
// .tool-container {
// .vue-slider-dot-handle::before {
//   content:"";
//   --length: 200px;
//   position: absolute;
//   border: 1px solid white;
//   width: 100%;
//   height: var(--length);
//   transform: translateY(calc(-1 * var(--length)));
// }
// }


.mark-line {
  position: absolute;
  height: 20px;
  width: 2px;
  margin: 0;
  background-color: var(--accent-color-2);
  transform: translateX(-50%) translateY(calc(-50% + 2px));

}

.left-content {
  display: none !important;
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
  font-size: min(8vw,7vh);

}


#splash-screen {
  // for some reason the view props don't work
  // for max-width and max-height
  // splash image size 1908 × 2040 px
  display: flex;
  flex-direction: column;
  max-height: calc(min(90vh,2040px)); 
  max-width: 90vw;
  aspect-ratio: 8 / 10;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  align-content: center;
  justify-content: space-around;
  
  border-radius: 10%;
  border: 10px solid var(--accent-color);
  overflow: auto;
  font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
  
  div {
    margin-inline: auto;
    text-align: center;
  }
  // make a paragraph inside the div centered horizontally and vertically
  p {
    font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
    font-weight: bold;
    vertical-align: middle;
  }

    
  p.highlight {
    color: var(--accent-color-2);
    filter: drop-shadow(0 0 .15em var(--accent-color-2));
    // make uppercase
    font-size: 1.15em;
    text-transform: uppercase;
    font-weight: bolder;
  }
  
  p.small {
    font-size: .75em;
    font-weight: bold;
  }

  #first-splash-row {
    width: 100%;
  }

  #close-splash-button {
    text-align: end;
    margin-top: -5%;
    margin-right: 7%;
    color: var(--accent-color-2);
    font-size: 3rem;

    &:hover {
      cursor: pointer;
    }
  }

  #splash-screen-text {
    // in the grid, the text is in the 2nd column
    display: flex;
    flex-direction: column;
    
  }

  #splash-screen-guide {
    font-size: .6em;
    line-height: 2em;
    width: 75%;
    
    .svg-inline--fa {
      color:var(--accent-color);
      margin: 0 10px;
    }
  }

  #splash-screen-acknowledgements {
    font-size: .5em;
    width: 70%; 
  }

  #splash-screen-icons {
    margin-top: 1em;
    
    #credits {
      background-color: transparent;
      border: 2px solid transparent;
    }
  }
  
  a {
    text-decoration: none;
    color: var(--accent-color-3);
    white-space: nowrap;
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

.gallery, .default-activator, .gallery-item {
  border: 1px solid var(--accent-color-2) !important;
}

.gallery-content img {
  box-shadow: 0 0 1px var(--accent-color-2);
  margin-top: 2px;
}

.dipper_svg_icon:focus {
  color: var(--accent-color-2) !important;
}

</style>
