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


    <!-- This block contains the elements (e.g. icon buttons displayed at/near the top of the screen -->

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
      </div>
      <div id="right-buttons">
      </div>
    </div>


    <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->

    <div class="bottom-content">
      <div id="project-credits">
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
        </div>
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
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common";
import { GotoRADecZoomParams } from "@wwtelescope/engine-pinia";

type SheetType = "text" | "video" | null;

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
          raRad: 0,
          decRad: 0,
          zoomDeg: 60
        };
      }
    }
  },
  data() {
    return {
      showSplashScreen: true,
      backgroundImagesets: [] as BackgroundImageset[],
      sheet: null as SheetType,
      layersLoaded: false,
      positionSet: false,
      
      accentColor: "#ffffff",

      tab: 0
    };
  },

  mounted() {
    this.waitForReady().then(async () => {
      
      this.backgroundImagesets = [...skyBackgroundImagesets];

      this.gotoRADecZoom({
        ...this.initialCameraParams,
        instant: true
      }).then(() => this.positionSet = true);

      // If there are layers to set up, do that here!
      this.layersLoaded = true;

    });
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
    }
  },

  methods: {
    closeSplashScreen() {
      this.showSplashScreen = false; 
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
    }
  }
});
</script>

<style lang="less">
</style>
