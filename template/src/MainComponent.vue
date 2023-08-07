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

    <div class="bottom-content">
    </div>

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
      
      showTextTooltip: false,
      showVideoTooltip: false,

      accentColor: "#ffffff"
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
    ready(): boolean {
      return this.layersLoaded && this.positionSet;
    },
    isLoading(): boolean {
      return !this.ready;
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
        '--app-content-height': this.showTextSheet ? '66%' : '100%',
      };
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

.pointer {
  cursor: pointer;
}

.control-icon {
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

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

#left-buttons, #right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#splash-overlay {
  position: fixed;
  align-items: center;
  justify-content: center;
  font-size: min(8vw, 7vh);
}

#splash-screen {
  max-height: calc(min(90vh, 2040px));
  max-width: 90vw;
  background-color: black;
  backdrop-filter: blur(5px);
  justify-content: space-around;
  align-content: center;

  border-radius: 10%;
  border: min(1.2vw, 0.9vh) solid var(--accent-color);
  overflow: auto;
  font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
}
</style>
