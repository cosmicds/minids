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
import { Circle, ImageSetLayer, Poly, PolyLine, Place } from "@wwtelescope/engine";
import { applyImageSetLayerSetting } from "@wwtelescope/engine-helpers";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common";
import { defineComponent } from 'vue';

export default defineComponent({
  extends: MiniDSBase,

  data() {
    return {
      backgroundImagesets: [] as BackgroundImageset[],
      decRadLowerBound: 0.2,
    }
  },

  created() {
    this.waitForReady().then(() => {

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.wwt = this;

      this.backgroundImagesets = [...skyBackgroundImagesets];

      const poly1 = new Poly();
      const dec = -0.01;
      poly1.addPoint(0, dec);
      poly1.addPoint(100, dec);
      poly1.addPoint(200, dec);
      poly1.addPoint(300, dec);
      poly1.addPoint(360, -90);
      poly1.addPoint(0, -90);
      poly1.set_lineColor('black');
      poly1.set_fill(true);
      poly1.set_fillColor('black');
      this.addAnnotation(poly1);

      const poly2 = new Poly();
      poly2.addPoint(0, dec);
      poly2.addPoint(0, -90);
      poly2.addPoint(300, -90);
      poly2.addPoint(300, dec);
      poly2.set_lineColor('black');
      poly2.set_fill(true);
      poly2.set_fillColor('black');
      this.addAnnotation(poly2);

      this.gotoRADecZoom({
        raRad: 0,
        decRad: this.decRadLowerBound,
        zoomDeg: 360,
        instant: true
      });

    });

  },

  watch: {
    wwtDecRad(dec: number) {
      if (dec < this.decRadLowerBound) {
        this.gotoRADecZoom({
          raRad: this.wwtRARad,
          decRad: this.decRadLowerBound,
          zoomDeg: this.wwtZoomDeg,
          instant: true
        });
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
