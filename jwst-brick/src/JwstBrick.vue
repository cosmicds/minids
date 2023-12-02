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
        <div
          id="first-splash-row"
      >
        <div
            id="close-splash-button"
            @click="closeSplashScreen"
            >&times;</div>
          <div id="splash-screen-text">
            <p>Want to see JWST's view of our</p>
            <p class="highlight"> Galactic Center? </p>
          </div>
        </div>
        
        <div id="splash-screen-guide">
        </div>
        
        <div id="splash-screen-acknowledgements">
          This Mini Data Story is brought to you by <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">Cosmic Data Stories</a> and <a href="https://www.worldwidetelescope.org/home/" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a>.
          
          <div id="splash-screen-logos">
            <credit-logos/>
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
        <icon-button
          md-icon="wall"
          :color="accentColor"
          tooltip-text="Center Brick"
          tooltip-location="start"
          @activate="goToBrickPosition"
        >
        </icon-button>

      </div>
      <div id="center-buttons">
      </div>
      <div id="right-buttons">
      </div>
      <places-gallery
        :stay-open="true"
        :places-list="jwstPlaces"
        :alt-labels="['w/ stars', 'no stars']"
        @select="onGallerySelect"
        :incomingItemSelect="selectedGalleryItem"
        :title="null"
        columns="2"
        width="200px"
        prevent-deselect
        style="box-shadow: 0px 0px 10px black;"
      >
        <div
          v-if="showJWSTOpacity"
          id="jwst-crossfade">
          <span class="mobile-off">Stars</span>
          <input
            class="opacity-range"
            type="range"
            v-model="crossfadeJWST"
          />
          <span class="mobile-off">No stars</span>
        </div>
      </places-gallery>
    </div>


    <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->

    <div class="bottom-content">
      <div id="overlay-button-container">
        <v-btn
          style="pointer-events: auto;"
          id="overlay-button"
          @click="showOverlay = !showOverlay"
          @keyup.enter="showOverlay = !showOverlay"
          tabindex="0"
          :color="accentColor"
          size="small"
        >{{ showOverlay ? `Hide` : `Show` }} annotations
        </v-btn>
      </div>

      <div id="tools" v-if="showLayers">
        <div class="tool-container">
          <template v-if="currentTool == 'crossfade'">
            <span
              class="ui-text slider-label"
              @click="crossfadeOpacity = 0"
              @keyup.enter="crossfadeOpacity = 0"
              tabindex="0"
            >Spitzer<br><span class="light-type"></span></span>
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
            >JWST<br><span class="light-type"></span></span>
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
          id="tabs"
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
                <h3>About this Image</h3>
                <p>Our Milky Way galaxy is full of cold, dark clouds of gas and dust where new stars like our Sun are born. A cloud near the center of the galaxy, called &ldquo;The Brick,&rdquo; is possibly the <strong><em>densest, most massive</em></strong> dark cloud in the entire Galaxy! Despite its large amount of mass, The Brick does not seem to be actively forming many new stars, so it remains dark and cold. A team of astronomers led by Adam Ginsburg observed The Brick using one of JWST&rsquo;s near-infrared cameras. In the image, you can see many, many of the Milky Way&rsquo;s stars in front of The Brick (left thumbnail). With some processing, the astronomers were able to remove the stars from the image and show only the cloud itself, revealing stripey structures and wisps in both the dark, cold gas and the hot, glowing background material (right thumbnail). The &rdquo;blue&rdquo; colors in the image show where frozen carbon monoxide, CO ice, is blocking out some of the light emitted by the hot glowing hydrogen that fills the Galactic Center.</p>
                <p>The background image shows the Milky Way as observed in infrared light by the Spitzer Space Telescope, a predecessor to JWST.</p>

                <h3>Seeing in Infrared light</h3>
                <p>Our eyes see visible light, but visible light is only a small part of a broader spectrum of light that has different energies, ranging from gamma rays and x-rays to infrared light and radio waves. Blue light corresponds to shorter wavelength (and higher energy) light, while red corresponds to longer wavelength (and lower energy) light. Images from each part of the spectrum can tell a different part of the story about objects in space.</p>
                    <p>JWST takes pictures in infrared (or IR) light, which is longer than visible light and cannot be seen by our eyes. Astronomers can still assign &ldquo;false&rdquo; colors to help us make sense of the images. In&nbsp; JWST&rsquo;s images of The Brick, the shorter wavelength IR light is displayed in &ldquo;blue,&rdquo; and the longer wavelength IR light is displayed in &ldquo;red.&rdquo; Atoms of hot hydrogen gas in the center of our galaxy emit light at both these IR wavelengths.</p>
                <v-row>
                  <v-col cols="5">
                    <p>The dense cloud that makes up &ldquo;The Brick&rdquo; is mostly cold hydrogen, dust, and carbon monoxide (CO). The Brick is so dense that it blocks the infrared light emitted by the surrounding hot hydrogen, creating the dark jelly bean shape we see at the center of the JWST images. In the center of the cloud, the dust blocks both the shorter (&ldquo;blue&rdquo;) and longer (&ldquo;red&rdquo;) IR wavelengths. Towards the edge of the cloud where it is less dense, frozen CO ice does most of the blocking. CO ice tends to block more of the &ldquo;red&rdquo; and less of the &ldquo;blue&rdquo; IR light, so the edge of the cloud glows &ldquo;blue&rdquo;in these images.</p>
                  </v-col>
                  <v-col>
                    <img id="brick-diagram" alt="This is a schematic of The Brick as imaged by JWST, separated into layers. The bottom layer depicts light from hot background gas that emits at both longer and shorter IR wavelengths, depicted with red and blue arrows. Above that is The Brick layer. In the middle of The Brick, red and blue arrows from the bottom layer are stopped by The Brick layer. Near the edge of the Brick, the red arrow is stopped, but the blue arrow can pass. Outside of The Brick region, both red and blue arrows can pass. The top of the schematic shows the direction the light moves towards JWST. " src="./assets/BrickDiagram.png"/>
                  </v-col>
                </v-row>

                <h3><a href="https://ui.adsabs.harvard.edu/abs/2023arXiv230816050G/abstract" target="_blank" rel="noopener noreferrer">Science</a> Team</h3>
                      Adam Ginsburg<br>
                      Ashley Barnes<br>
                      Cara Battersby<br>
                      Alyssa Bulatek<br>
                      Savannah Gramze<br>
                      Jonathan Henshaw<br>
                      Desmond Jeff<br>
                      Xing Lu<br>
                      E. A. C. Mills<br>
                      Daniel Walker<br>
                      <br>
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
                      <ul>
                        <li>
                          Use the bottom slider to switch between the Spitzer and JWST images.
                        </li>
                        <li>
                          Use the top slider to switch between the "with stars" and "no stars" version of The Brick as seen by JWST.
                        </li>
                      </ul>

                      <div class="credits">
                      <h3>Credits</h3>


                      <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">CosmicDS</a> Mini Stories Team:</h4>
                      John Lewis<br>
                      Pat Udomprasert<br>
                      Jon Carifio<br>
                      Alyssa Goodman<br>
                      Harry Houghton<br>
                      Anna Nolin<br>
                      Mary Dussault<br>
                      Evaluator: Sue Sunbury<br>
                      <br>
                      <h4>WorldWide Telescope Team:</h4>
                      Peter Williams<br>
                      A. David Weigel<br>
                      Jon Carifio<br>
                      </div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <funding-acknowledgement/>
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
import { ImageSetLayer, Place, Settings } from "@wwtelescope/engine";
import { applyImageSetLayerSetting } from "@wwtelescope/engine-helpers";
import { defineComponent, PropType } from "vue";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common";
import { GotoRADecZoomParams } from "@wwtelescope/engine-pinia";

type ToolType = "crossfade" | "choose-background" | null;
type SheetType = "text" | "video" | null;

const D2R = Math.PI / 180;

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
    bgWtml: {
      type: String,
      required: true
    },
    bgName: {
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
      layers: {} as Record<string,ImageSetLayer>,
      cfOpacity: 100, // out of 100
      ready: false,
      showSplashScreen: true,
      backgroundImagesets: [] as BackgroundImageset[],
      sheet: null as SheetType,
      showLayers: true,
      layersLoaded: false,
      positionSet: false,
      currentTool: "crossfade" as ToolType,
      places: [] as Place[],
      jwstPlaces: [] as Place[],
      jwstCfOpacity: 100,
      selectedGalleryItem: null as Place | null,
      showJWSTOpacity: true,
      ignoreSelect: false,
      keepCfOpacity: false,
      imageSetLayerOrder: [ "stars", "nostars", "zannotation"],
      
      showOverlay: false,
      overlayWasVisible: false,
      
      accentColor: "#F0AB52",
      accentColor2: "#99c8ff",

      initialPosition: {ra: 266.5375, dec:-28.708, zoom: 120 },

      tab: 0
    };
  },

  created() {
    this.waitForReady().then(async () => {
      
      this.backgroundImagesets = [...skyBackgroundImagesets];
      this.wwtSettings.set_galacticMode(true);
      this.wwtSettings.set_showSolarSystem(false);

      const layerPromises = Object.entries(this.wtml).map(([key, value]) =>
        this.loadImageCollection({
          url: value,
          loadChildFolders: true
        }).then((folder) => {
          const children = folder.get_children();
          if (children == null) { return; }
          const item = children[0] as Place;
          this.places.push(item);
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
          applyImageSetLayerSetting(layer, ["opacity", 1]);
        });
        this.layersLoaded = true;
        // this.resetView();

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
      }).then(() => {
        // initialized the selected item to the w/o stars brick
        this.selectedGalleryItem = this.jwstPlaces[1];
        this.crossfadeJWST = 100;
        applyImageSetLayerSetting(this.layers.zannotation, ["enabled", false]);
        this.imageSetLayerOrder.forEach((name) => {
          const layer = this.layers[name];
          this.setImageSetLayerOrder({ 
            id: layer.id.toString(), 
            order: this.imageSetLayerOrder.indexOf(name) });
        });
      });

      this.loadImageCollection({
        url: this.bgWtml,
        loadChildFolders: false,
      }).then((_folder) => {
        
        this.curBackgroundImagesetName = this.bgName;
        if (_folder) {return;}
        this.backgroundImagesets.unshift(
          new BackgroundImageset("GLIMPSE", this.bgName)
        );
        
      });


      const splashScreenListener = (_event: KeyboardEvent) => {
        this.showSplashScreen = false;
        window.removeEventListener('keypress', splashScreenListener);
      };
      window.addEventListener('keypress', splashScreenListener);

    });
    
  },

  mounted() {
    // only needed for intro video
    // this.$nextTick(() => {
    //   setTimeout(() => {
    //     this.crossfadeJWST = 0;
    //     this.$nextTick(() => {
    //       this.crossfadeOpacity = 0;
    //     });
    //   }, 1000);
    // });
    
  },

  computed: {
    
    wwtSettings(): Settings {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return Settings.get_active();
    },
    
    crossfadeOpacity: {
      get(): number {
        return this.cfOpacity;
      },
      set(o: number) {
        const jcfo = this.jwstCfOpacity * 0.01;
        
        if (this.layers.stars) {
          if (jcfo > 0.99) {
            applyImageSetLayerSetting(this.layers.stars, ["opacity", 0]);
          } else {
            applyImageSetLayerSetting(this.layers.stars, ["opacity", 0.01 * o]);
          }
        }
        if (this.layers.nostars) {
          applyImageSetLayerSetting(this.layers.nostars, ["opacity", jcfo * 0.01 * o]);
        }
        
        this.cfOpacity = o;
      }
    },

    crossfadeJWST: {
      get(): number {
        return this.jwstCfOpacity;
      },
      
      set(o: number) {
        const cfO = this.crossfadeOpacity * 0.01;

        if (this.layers.stars) {
          // keep this at 100% opacity
          applyImageSetLayerSetting(this.layers.stars, ["opacity", 1]);
        }
        
        if (this.layers.nostars) {
          applyImageSetLayerSetting(this.layers.nostars, ["opacity", 0.01 * o * cfO]);
        }
        
        this.jwstCfOpacity = o;
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
        '--accent-color2': this.accentColor2,
        '--app-content-height': this.showTextSheet ? '66%' : '100%',
      };
    },

    isLoading(): boolean {
      return !this.ready;
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
    },
    
    // set brick initial zoom based on screen size
    initialBrickZoom(): number {
      return this.mobile ? 1 : 0.7;
    }
  },

  methods: {
    
    async goToBrickPosition(instant = true) {
      return this.gotoRADecZoom({
        raRad: D2R * this.initialPosition.ra,
        decRad: D2R * this.initialPosition.dec,
        zoomDeg:this.initialBrickZoom,
        instant: instant
      });
    },
    
    onGallerySelect(place: Place) {
      // show the corresponding brick by setting the opacity of it to 100%
      if (this.ignoreSelect) {
        return;
      }
      
      if (!this.keepCfOpacity) {
        this.crossfadeOpacity = 100;
      }
      
      let opacity = 0;
      if (this.selectedGalleryItem == place) {
        const name = place.get_name();
        opacity = name.includes('without') ? 100 : 0;
      } else {
        this.selectedGalleryItem = place;
        opacity = 100 - this.jwstCfOpacity;
      }
      this.crossfadeJWST = opacity;
    },
    
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
  },

  watch: {
    
    showSplashScreen(value: boolean) {
      if (!value) {
        this.goToBrickPosition(false).catch(() => {
          console.log('Move interrupted');
        });
      }
    },
    
    // deep watcher for places to update jwstPlaces
    places: {
      handler: function (newPlaces: Place[]) {
        newPlaces.forEach(place => {
          const name = place.get_name().toLowerCase();
          if (name.includes('brick')) {
            this.jwstPlaces[name.includes('without') ? 1 : 0] = place;
          }
        }
        );
      },
      deep: true
    },
    
    showOverlay(value: boolean) {
      applyImageSetLayerSetting(this.layers.zannotation, ["enabled", value]);
    },
    
    crossfadeOpacity(val: number) {
      if (val <= 0.05) {
        this.overlayWasVisible = this.showOverlay;
        this.showOverlay = false;
      } else if (this.overlayWasVisible) {
        this.showOverlay = true;
        this.overlayWasVisible = false;
      }
    },
    
    crossfadeJWST(val: number) {
      // return the brick that is the most opaque
      if (!this.keepCfOpacity) {
        this.crossfadeOpacity = 100;
      }
      
      this.ignoreSelect = true;
      if (this.jwstPlaces.length == 0) {
        this.selectedGalleryItem = null;
      }
      if (val > 50) {
        this.selectedGalleryItem = this.jwstPlaces[1];
      } else {
        this.selectedGalleryItem = this.jwstPlaces[0];
      }
      this.$nextTick(() => {
        this.ignoreSelect = false;
      });
    },
    
    selectedGalleryItem(_place: Place | null) {
    },

    
    
    
    showLayers(show: boolean) {
      Object.values(this.layers).forEach(layer => {
        applyImageSetLayerSetting(layer, ["opacity", show ? 1 : 0]);
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
@font-face {
  font-family: "Highway Gothic Narrow";
  src: url("../../assets/HighwayGothicNarrow.ttf");
}

:root {
  --default-font-size: clamp(0.7rem, min(1.7vh, 1.7vw), 1.1rem);
  --default-line-height: clamp(1rem, min(2.2vh, 2.2vw), 1.6rem);
}

/* Overall page styling */
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


/*
  The main content of the mini.
  The --app-content-height allows the app to shrink when the text is open
 */
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


/* The modal loading window */
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

/* Top and bottom content */
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
  bottom: 0.5rem;
  right: 0.5rem;
  width: calc(100% - 1rem);
  pointer-events: none;
  align-items: center;
  gap: 5px;
}

#overlay-button-container {
  align-self: flex-start;
  padding-bottom: 0.5rem;
  // position:absolute;
  // bottom: 0.5rem;
  // left: 50%;
  // transform: translateX(-50%);
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

#left-buttons, #right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#gallery-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  height: 50vh;
  width: 20vw;
  border: 1px solid red;
}

/* Splash screen */
#splash-overlay {
  align-items: center;
  justify-content: center;
  font-size: min(8vw, 7vh);
}

#splash-screen {
  color: var(--accent-color);

  @media (max-width: 699px) {
    max-height: 80vh;
    max-width: 90vw;
  }

  @media (min-width: 700px) {
    max-height: 85vh;
    max-width: min(70vw, 800px);
  }

  background-color: black;
  backdrop-filter: blur(5px);
  justify-content: space-around;
  align-content: center;
  padding-top: 4rem;
  padding-bottom: 1rem;
  padding-inline: 0.5rem;

  border-radius: 50px;
  border: min(1.2vw, 0.9vh) solid var(--accent-color);
  overflow: auto;
  font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;

  box-shadow: 0px 0px 25px black;

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
    // make uppercase
    text-transform: uppercase;
    font-weight: bolder;
  }
  
  p.small {
    font-size: var(--default-font-size);
    font-weight: bold;
  }

  #first-splash-row {
    width: 100%;
  }

  #close-splash-button {
    position: absolute;
    top: 0.5rem;
    right: 1.75rem;
    text-align: end;
    color: var(--accent-color);
    font-size: min(8vw, 5vh);

    &:hover {
      cursor: pointer;
    }
  }

  #splash-screen-text {
    // in the grid, the text is in the 2nd column
    display: flex;
    flex-direction: column;
    line-height: 130%;
    
  }

  #splash-screen-guide {
    margin-block: 1.5em;
    font-size: min(5vw, 4vh);
    line-height: 140%;
    width: 75%;

    .v-col{
      padding: 0;
    }
    
    .svg-inline--fa {
      color:var(--accent-color);
      margin: 0 10px;
    }
  }

  #splash-screen-acknowledgements {
    font-size: calc(1.7 * var(--default-font-size));
    line-height: calc(1.5 * var(--default-line-height));
    width: 70%; 
  }

  #splash-screen-logos {
    margin-block: 0.75em;

    img {
    height: 5vmin;
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
}

#project-credits {
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

/* Video and text dialogs */
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
  font-size: var(--default-font-size);
  line-height: var(--default-line-height);
  
  height: 33vh;
  padding-bottom: 25px;

  & img {
    max-width: 100%;
  }

  & h3 {
    margin-top: calc(var(--default-line-height));
    margin-bottom: calc(0.3 * var(--default-line-height));
    color: var(--accent-color2);
  }

  & p {
    margin-bottom: calc(0.5 * var(--default-line-height));
  }

  & a {
    text-decoration: underline;
  }


}


/* Miscellaneous class styling */
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

.pointer {
  cursor: pointer;
}

.control-icon {
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

}

.scrollable {
  overflow-y: auto;
}

.no-bottom-border-radius {
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}


/*
  These last few blocks contain some hackery related to the text tabs.
  The close icon isn't part of the standard v-tabs setup, so we need to
  create some space for that ourselves.
 */
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

.v-tabs [aria-selected="false"]:not(.v-slide-group-item--active) {
  color: #BDBDBD !important;
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

a {
    text-decoration: none;
    font-weight: bold;
    color: #589eef; // lighter variant of sky color
    pointer-events: auto;
  }

#jwst-crossfade {
  pointer-events: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  
  span {
    flex-grow: 0;
  }
  
  input {
    flex-grow: .7;
  }
}

// apply some styles to th places-gallery
#main-content {
  .gallery-root .gallery {
    border: none;
  }
}

@media only screen and (max-width: 600px) {
  #icons-container {
    display: none;
  }

  .mobile-off {
    display: none;
  }
}


</style>
