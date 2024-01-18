<template>
  <div :style="cssVars">
    <div 
      id="wwt-hud"
      >
      <h3> Camera settings </h3>
      <p> RA: {{ wwtRARad }} ({{ wwtRADeg }}) </p>
      <p> Dec: {{ wwtDecRad }} ({{ wwtDecDeg }}) </p>
      <p> Roll: {{ wwtRollRad }} </p>
      <p> Zoom: {{ wwtZoomDeg }} </p>
      <p> Mode: {{ mode }} </p>
      <h3> Imagesets </h3>
      <p> Bkg: {{ bkgImage }} </p>
      <p> Fg: {{ fgImg }} (op: {{ wwtForegroundOpacity }} ) </p>
      <h3> Clock </h3>
      <p> Time: {{ wwtCurrentTime }} </p>
      <p> Rate: {{ wwtClockRate }} </p>
      <p> Location: {{ wwtLocation }} </p>
      
      <h3 v-if="Object.keys(otherVariables).length > 0"> 
        User defined vars 
      </h3>
      <!-- loop over otherVariable keys -->
      <p v-for="(value, key) in otherVariables" :key="key">
        {{ key }}: {{ value }}
      </p>
      
      <!-- a default slot for whatever -->
      <slot></slot>
      
    </div>
  </div>
  
</template>


<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { WWTAwareComponent } from "@wwtelescope/engine-pinia";
import { Settings, WWTControl, ScriptInterface } from "@wwtelescope/engine";

const R2D = 180 / Math.PI;

type LocationType = {
  top?: string | number,
  left?: string | number,
  bottom?: string | number,
  right?: string | number,
};

export default defineComponent({
  name: 'wwtHUD',
  extends: WWTAwareComponent,
  
  props: {
    // location: center {x, y} in percent
    location: {
      type: Object as PropType<LocationType>,
      default: () => ({top: '50%', left: '50%'})
    },
    
    offsetCenter: {
      // example: {x: 0.5, y: 0.5} for transform: translate(-50%, -50%)
      type: Object,
      default: () => ({x: .5, y: .5})
    },
    
    otherVariables: {
      type: Object,
      default: () => ({})
    },
    
    // styling props
    fontSize: {
      type: String,
      default: '1em'
    },
    
    backgroundColor: {
      type: String || null,
      default: 'rgba(0, 0, 0, 0.5)'
    },
    
    textShadow: {
      type: String || null,
      default: '0 0 5px black'
    },
    
  },
    
  computed: {
    
    wwtSettings(): Settings {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return Settings.get_active();
    },
    
    wwtControl(): WWTControl {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return WWTControl.singleton;
    },
    
    wwtScriptInterface(): ScriptInterface {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return ScriptInterface.singleton;
    },
    
    cssVars() {
      return {
        '--hud-top': this.location.top ?? 'auto',
        '--hud-left': this.location.left ?? 'auto',
        '--hud-bottom': this.location.bottom ?? 'auto',
        '--hud-right': this.location.right ?? 'auto',
        '--font-size': this.fontSize,
        '--background-color': this.backgroundColor || 'transparent',
        '--text-shadow': this.textShadow || 'none',
        '--offset-center-x': `-${this.offsetCenter.x * 100}%`,
        '--offset-center-y': `-${this.offsetCenter.y * 100}%`,
      };
    },
    
    wwtRADeg() {
      return this.wwtRARad * R2D;
    },
    
    wwtDecDeg() {
      return this.wwtDecRad * R2D;
    },
    
    bkgImage() {
      return this.wwtBackgroundImageset?.get_name();
    },
    
    fgImg() {
      return this.wwtForegroundImageset?.get_name();
    },
    
    mode() {
      if (this.bkgImage == "3D Solar System View") {
        return '3D';
      } 
      
      if (this.wwtSettings.get_galacticMode()) {
        return 'Sky (galactic)';
      }
      
      if (this.wwtSettings.get_localHorizonMode()) {
        return 'Sky (local horizon)';
      } 
      
      return 'Sky (equatorial)';
    },

    wwtLocation() {
      return {
        lat: this.wwtSettings.get_locationLat(),
        lon: this.wwtSettings.get_locationLng(),
        alt: this.wwtSettings.get_locationAltitude(),
      } ;
    },
      
  },
    
    
});

</script>

<style lang="less">

#wwt-hud {
  position: absolute;
  top: var(--hud-top);
  left: var(--hud-left);
  bottom: var(--hud-bottom);
  right: var(--hud-right);
  padding: 0.5em;
  transform: translate(var(--offset-center-x), var(--offset-center-y));
  color: white;
  font-size: var(--font-size);
  font-family: monospace;
  text-align: center;
  text-shadow: var(--text-shadow);
  pointer-events: auto;
  text-align: left;
  background-color: var(--background-color);
}


</style>
```
  