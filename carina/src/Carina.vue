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
        id="splash-overlay"
      >
        <img
          id="splash-screen"
          :src="require(`./assets/Carina_Nebula_Splash_Screen${mobile ? '_Mobile' : ''}_Close.png`)"
          v-click-outside="closeSplashScreen"
          max-width="70vw"
          max-height="70vh"
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

      <div id="top-content">
        <icon-button
          v-model="showVideoSheet"
          id="video-icon"
          :color="accentColor"
          fa-icon="video" 
          :tooltip-location="smallSize ? 'bottom' : 'end'"
          tooltip-text="Watch video"
          tooltip-offset="10px"
          :show-tooltip="!mobile"
        >
        </icon-button>
        <div id="center-buttons-wrapper">
          <button
            id="show-layers-button"
            class="ui-text"
            @click="showLayers = !showLayers"
          >
            {{ showLayers ? "Hide Images" : "Show Images" }}
          </button>
          <icon-button
            id="reset-icon"
            fa-icon="redo"
            :color="accentColor"
            @activate="() => resetView(false)"
            tooltip-text="Return to Carina"
            tooltip-location="bottom"
            tooltip-offset="3px"
            :show-tooltip="!mobile"
          ></icon-button> 
        </div>
        <icon-button
          id="text-icon"
          fa-icon="book-open"
          :color="accentColor"
          v-model="showTextSheet"
          tooltip-text="Learn more"
          :tooltip-location="smallSize ? 'bottom' : 'start'"
          :tooltip-offset="smallSize ? '0' : '10px'"
          :show-tooltip="!mobile"
        >
        </icon-button>
      </div>

      <div id="bottom-content">
        <div id="tools" v-if="showLayers">
          <div class="tool-container">
            <template v-if="currentTool == 'crossfade'">
              <span
                class="ui-text slider-label"
                @click="crossfadeOpacity = 0"
                @keyup.enter="crossfadeOpacity = 0"
                tabindex="0"
              >Hubble<br><span class="light-type">(Visible)</span></span>
              <input
                class="opacity-range"
                type="range"
                v-model="crossfadeOpacity"
              />
              <span
                class="ui-text slider-label"
                @click="crossfadeOpacity = 100"
                @keyup.enter="crossfadeOpacity = 100"
                tabindex="0"
              >JWST<br><span class="light-type">(Infrared)</span></span>
            </template>
            <template v-else-if="currentTool == 'choose-background'">
              <span>Background imagery:</span>
              <select v-model="curBackgroundImagesetName">
                <option
                  v-for="bg in backgroundImagesets"
                  v-bind:value="bg.imagesetName"
                  v-bind:key="bg.imagesetName"
                >
                  {{ bg.displayName }}
                </option>
              </select>
            </template>
          </div>
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

      <v-dialog
        id="video-container"
        v-model="showVideoSheet"
        transition="slide-y-transition"
        fullscreen
      >
        <div class="video-wrapper">
          <font-awesome-icon
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
            <source src="./assets/CarinaFinal.mp4" type="video/mp4">
          </video>
        </div>
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
        <v-tabs
          v-model="tab"
          height="32px"
          slider-color="white"
          id="tabs"
          dense
          grow
        >
          <!-- <v-tabs-slider color="white"></v-tabs-slider> -->

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
                  <h4>Explore!</h4>
                  As scientists, we learn by observing and noticing. Explore these images of the <a href="https://webbtelescope.org/contents/media/images/2022/031/01G77PKB8NKR7S8Z6HBXMYATGJ" target="_blank" rel="noopener noreferrer">Carina Nebula</a> and see what you can find.<br>
                  • Look for stars that are “invisible” to our eyes because they are blocked by dust but shine in JWST’s infrared image.<br>
                  • Look near the edge of the dusty, dense clouds in the JWST image. See if you can find bright yellow arcs that indicate gas and dust being blown away by young forming stars.<br>
                  • Scan the dark blue region of the JWST image and see if you can find reddish smudgy objects that might be galaxies. Switch over to the Hubble image. Do you see those galaxies in the Hubble image?<br>
                  <br>
                  <h4>Images as “data”</h4>
                  When you think about scientific data, pictures might not immediately spring to mind, but in astronomy, images are some of the most important pieces of data available.
                  <br><br>
                  Images show us the structure of objects in space, which here provides clues on how stars form and evolve. In the Hubble and JWST images of the Carina Nebula, you can see regions of very high density dust and gas (the brown parts of the images) where new stars are being born. If you zoom out, you will see that the images are at the edge of what appears to be a larger bubble, which is the cavern of lower density gas carved out by winds from massive stars.
                  <br><br>
                  <h4>Visible vs Infrared Light</h4>
                  Our eyes can detect visible light, but visible light is only a small part of a broader <a href="https://hubblesite.org/contents/articles/the-electromagnetic-spectrum" target="_blank" rel="noopener noreferrer">spectrum</a> of light that has different energies, ranging from gamma rays and x-rays to infrared light and radio waves. Images from each part of the spectrum can tell a different part of the story about objects in space.
                  <br><br>
                  The Hubble Space Telescope takes pictures in visible light, like our eyes. The James Webb Space Telescope takes pictures in infrared light. Some “night vision” cameras image objects in the dark using infrared light. Animals and people “glow” in infrared in the dark because we usually have higher temperatures than our surroundings.
                  <br><br><br>
                  <h3>Credits:</h3>
                  <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">CosmicDS</a> Mini Stories Team:</h4>
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
                      <v-col cols="8" class="pt-2">
                        <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong> {{ touchscreen ? ":" : "or" }} <strong>{{ touchscreen ? ":" : "I-O" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <div
                          style="min-height: 120px;"
                        >
                          <p>
                            The frame above provides an <b>interactive view </b>of the night sky, powered by WorldWide Telescope (WWT). Here you can see a portion of the Carina Nebula imaged by the <a href="https://hubblesite.org/" target="_blank" rel="noopener noreferrer">Hubble Space Telescope</a> and the <a href="https://webbtelescope.org/" target="_blank" rel="noopener noreferrer">James Webb Space Telescope</a>. These colorful images are overlaid against a background of the whole sky.
                          </p>
                          <p>You can zoom out to see where these images fit within a larger cloud of gas and dust.</p>
                          <p>You can zoom in to see stunning detail within both images.</p>
                          <p>You can switch between the Hubble and Webb images and compare their views by using the slider, or you can hide both images and explore the whole sky. Click the reset button if you want to return to the location of the Carina Nebula.</p>
                        </div>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <h3>Credits:</h3>
                        <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">CosmicDS</a> Mini Stories Team:</h4>
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
    </div>
  </v-app>
</template>

<script lang="ts">
import { ImageSetLayer, Place } from "@wwtelescope/engine";
import { applyImageSetLayerSetting } from "@wwtelescope/engine-helpers";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common";
import { defineComponent } from "vue";

type ToolType = "crossfade" | "choose-background" | null;
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
      layers: {} as Record<string,ImageSetLayer>,
      cfOpacity: 50, // out of 100
      title: "Compare JWST and Hubble images of Carina!",
      description: "Pan, zoom, and compare the images using AAS WorldWide Telescope.",
      hashtags: ["jwst", "hubble", "wwt", "carina", "unfoldtheuniverse"],
      ready: false,
      backgroundImagesets: [] as BackgroundImageset[],
      showSplashScreen: false,
      showLayers: true,
      layersLoaded: false,
      sheet: null as SheetType,
      currentTool: "crossfade" as ToolType,
      tab: 0,
      accentColor: "#F0AB52",
      networks: [
        { name: "facebook", color: "#1877f2", text: "Share" },
        { name: "twitter", color: "#1da1f2", text: "Tweet" },
      ]
    };
  },

  created() {
    this.waitForReady().then(() => {

      console.log(this);

      this.backgroundImagesets = [...skyBackgroundImagesets];

      const layerPromises = Object.entries(this.wtml).map(([key, value]) =>
        this.loadImageCollection({
          url: value,
          loadChildFolders: false
        }).then((folder) => {
          const children = folder.get_children();
          if (children == null) { return; }
          const item = children[0] as Place;
          const imageset = item.get_backgroundImageset() ?? item.get_studyImageset();
          if (imageset === null) { return; }
          return this.addImageSetLayer({
            url: imageset.get_url(),
            mode: "autodetect",
            name: key,
            goto: false
          });
        }));

      Promise.all(layerPromises).then((layers) => {
        layers.forEach(layer => {
          if (layer === undefined) { return; }
          this.layers[layer.get_name()] = layer;
          applyImageSetLayerSetting(layer, ["opacity", 0.5]);
        });
        this.layersLoaded = true;
        this.resetView();

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
      

      this.loadImageCollection({
        url: this.bgWtml,
        loadChildFolders: true,
      }).then((_folder) => {
        this.curBackgroundImagesetName = this.bgName;
        this.backgroundImagesets.unshift(
          new BackgroundImageset("unWISE", "unwise")
        );
      });

      const splashScreenListener = (_event: KeyboardEvent) => {
        this.showSplashScreen = false;
        window.removeEventListener('keypress', splashScreenListener);
      };
      window.addEventListener('keypress', splashScreenListener);

    });
  },

  computed: {
    crossfadeOpacity: {
      get(): number {
        return this.cfOpacity;
      },
      set(o: number) {
        if (this.layers.hubble) {
          applyImageSetLayerSetting(this.layers.hubble, ["opacity", 1 - 0.01 * o]);
        }
        if (this.layers.jwst) {
          applyImageSetLayerSetting(this.layers.jwst, ["opacity", 0.01 * o]);
        }
        this.cfOpacity = o;
      }
    },

    curBackgroundImagesetName: {
      get(): string {
        if (this.wwtBackgroundImageset == null) return "";
        return this.wwtBackgroundImageset.get_name();
      },
      set(name: string) {
        this.setBackgroundImageByName(name);
      }
    },

    hashtagString() {
      return this.hashtags.join(",");
    },

    isLoading(): boolean {
      return !this.ready;
    },

    mobile(): boolean {
      return this.smallSize && this.touchscreen;
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

    smallSize(): boolean {
      return this.$vuetify.display.smAndDown;
    },

    cssVars() {
      return {
        '--app-content-height': this.showTextSheet ? '66%' : '100%'
      };
    }
  },

  methods: {
    closeSplashScreen() {
      this.showSplashScreen = false;
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

    resetView(instant = true) {
      const d2R = Math.PI / 180.0;
      const imageset = this.layers.jwst.get_imageSet();
      this.gotoRADecZoom({
        raRad: d2R * imageset.get_centerX(),
        decRad: d2R * imageset.get_centerY(),
        zoomDeg: 0.8595,
        rollRad: 1.799,
        instant: instant,
      });
    }
  },

  watch: {
    showLayers(show: boolean) {
      Object.values(this.layers).forEach(layer => {
        applyImageSetLayerSetting(layer, ["enabled", show]);
      });
    },
    layersLoaded(loaded: boolean) {
      if (loaded) {
        this.ready = true;
      }
    },
    ready(r: boolean) {
      if (r) {
        this.showSplashScreen = true;
      }
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
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
}

body {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;

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

.control-icon {
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: #FFFFFF;
  }
}

#bottom-content {
  display: flex;
  flex-direction: column;
  position: absolute;
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

#top-content {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: calc(100% - 1rem);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  #center-buttons-wrapper {
    display: flex;
    flex-direction: row;
  }

  #right-button-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.ui-text {
  color: #F0AB52;
  background: black;
  padding: 5px 5px;
  border: 2px solid black;
  border-radius: 10px;
  font-size: calc(0.7em + 0.2vw);

  &:focus {
    color: white;
  }
}

.slider-label {
  font-weight: bold;
  font-size: calc(0.8em + 0.5vw);
  padding: 5px 10px;
  text-align: center;
  line-height: 20px;

  .light-type {
    font-size: calc(0.56em + 0.35vw);
  }

  &:hover {
    cursor: pointer;
  }
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

.v-dialog--fullscreen {
  background: black;
  overflow-y: hidden;
}

.info-text {
  height: 33vh;
  padding-bottom: 25px;

  & a {
    text-decoration: none;
  }
}

.video-wrapper {
  height: 100%;
  background: black;
  text-align: center;
  z-index: 1000;
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

video {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

.scrollable {
  overflow-y: auto;
}

.no-bottom-border-radius {
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

.v-overlay {
  height: 100vh;
}

.v-navigation-drawer {
  height: 40% !important;
}

.v-navigation-drawer__scrim {
  display: none;
}

.v-window-item {
  height: fit-content;
}

#tabs {
  width: calc(100% - 3em);
  align-self: left;
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

#close-splash-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  color: #F0AB52;
}


#splash-screen {
  width: auto;
  height: auto;
  max-width: ~"min(70vw, 1624px)";
  max-height: ~"min(70vh, 2030px)";
  object-fit: contain;
}

#splash-overlay .v-overlay__content {
  position: fixed;
  margin: auto;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);

  a:hover {
    cursor: pointer;
  }
}

#splash-close {
  position: absolute;
  top: 5.5%;
  left: 89%;
  height: 4%;
  width: 3.8%;
  //border: 1px solid red;
}

#show-layers-button {
  font-size: calc(0.75em + 0.5vw);
  pointer-events: auto;
}

#video-container {
  position: absolute;
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0px;
}

// This prevents the tabs from having some extra space to the left when the screen is small
// (around 400px or less)
.v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next, .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
  display: none;
}

@media(max-width: 600px) {
  #left-controls {
    display: block;
  }

  #video-container {
    display: inherit;
  }

  #tabs h3 {
    font-size: 1em;
  }

  #tab-items .v-card-text .end-spacer {
    height: 70px;
  }
}

@media(max-width: 300px) {
  #tabs h3 {
    font-size: 0.67em;
  }
}
</style>
