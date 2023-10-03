<!-- Background image with centered text -->
<!-- has hovered, active, and focus states -->
<!-- with dynamic control of colors and background properties via props -->
<template>
  
  <div class="focus-wrapper"
    @focus="focused = true"
    @keydown.enter="$emit('click')"
    tabindex="0"
  >
  <div
    id="image-label-container"
    class="image-label"
    :style="backgroundImageCSS"
    @mouseover="hovered = true"
    @mouseout="hovered = false"
    @mousedown="active = true"
    @mouseup="active = false"
    @blur="focused = false"
    
  >
  <img :src="backgroundImage" :alt="backgroundImage">
    <div
      class="image-label-background"
      :style="backgroundCSS"
    ></div>
    <div
      class="image-label-text"
      :style="textCSS"
    >
      <slot></slot>
    </div>
  </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({

  name: 'ImageLabel',

  props: {
    backgroundImage: {
      type: String,
      default: ''
    },
    backgroundColor: {
      type: String,
      default: 'transparent'
    },
    backgroundOpacity: {
      type: String,
      default: '1'
    },
    color: {
      type: String,
      default: 'white'
    },

    width: {
      type: String,
      default: '100%'
    },

    height: {
      type: String,
      default: ''
    },

    border: {
      type: String,
      default: ''
    },

    borderRadius: {
      type: String,
      default: ''
    },
    // hovered, active, and focused states
    
    hoveredColor: {
      type: String,
      default: ''
    },
    activeColor: {
      type: String,
      default: ''
    },
    focusedColor: {
      type: String,
      default: ''
    },
    
    hoveredBorder: {
      type: String,
      default: '3px solid white'
    },
    activeBorder: {
      type: String,
      default: ''
    },
    focusedBorder: {
      type: String,
      default: ''
    },
  },

  data() {
    return {
      hovered: false,
      active: false,
      focused: false
    };
  },

  computed: {

    backgroundImageCSS() {
      const css = {
        color: this.color,
        width: this.width,
        height: this.height,
        border: this.border,
      };

      if (this.hovered) {
        return {...css, border: this.hoveredBorder };
      }

      if (this.active) {
        return {...css, border: this.activeBorder };
      }

      if (this.focused) {
        return {...css, border: this.focusedBorder };
      }

      return css;

      
    },

    textCSS() {

      const css = {
      };
      
      // if hovered
      if (this.hovered) {
        return {...css, color: this.hoveredColor, fontWeight: 'bold' };
      }

      // if active
      if (this.active) {
        return {...css, color: this.activeColor, fontWeight: 'bold' };
      }

      return {...css, color: this.color };
    },

    backgroundCSS() {
      const css = { backgroundColor: this.backgroundColor, opacity: this.backgroundOpacity };
      
      return css;
    }

  },



});

</script>

<style lang="less" scoped>

.focus-wrapper {
  display: block;
  padding: 2px;
  pointer-events: auto;
}

#image-label-container {
  position: relative;
  overflow: hidden;
  
}
  
img { 
  position: absolute;
  width: 100%;
  height: 100%;
}

.image-label-background {
  position: absolute;
  width: 100%;
  height: 100%;
}

.image-label-text {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}



</style>