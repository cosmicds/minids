<!-- Background image with centered text -->
<!-- has hovered, active, and focus states -->
<!-- with dynamic control of colors and background properties via props -->
<template>
  
  <div class="focus-wrapper"
    @focus="focused = true"
    @keydown.enter="$emit('click')"
    :aria-label="altText ? 'Select if ' + altText : 'Image Label'"
    role="button"
  >
    <div
      :id="`image-label-${id}`"
      class="image-label-container"
      :style="containerCSS"
      @mouseover="hovered = true"
      @mouseout="hovered = false"
      @mousedown="active = true"
      @mouseup="active = false"
      @blur="focused = false"
      aria-hidden="true"
    >
    <img v-if="image" :src="image" :alt="altText ?? image">
      <div
        class="image-label-background"
        :style="backgroundCSS"
        aria-hidden="true"
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

    id: {
      type: String,
      default: ''
    },
    
    image: {
      type: String || null,
      default: null
    },

    altText: {
      type: String || null,
      default: null
    },
    backgroundColor: {
      type: String,
      default: 'transparent'
    },
    backgroundOpacity: {
      type: Number,
      default: 1
    },
    color: {
      type: String,
      default: 'white'
    },

    width: {
      type: String,
      default: "100%",
      required: true
    },

    height: {
      type: String,
      required: true
    },

    fontSize: {
      type: String,
      default: null
    },

    border: {
      type: String,
      default: null
    },

    borderRadius: {
      type: String,
      default: null
    },
    // hovered, active, and focused states
    
    hoveredColor: {
      type: String,
      default: null
    },
    activeColor: {
      type: String,
      default: null
    },
    focusedColor: {
      type: String,
      default: null
    },
    
    hoveredBorder: {
      type: String,
      default: '2px solid white'
    },
    activeBorder: {
      type: String,
      default: null
    },
    focusedBorder: {
      type: String,
      default: null
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

    containerCSS() {
      const css = {
        color: this.color,
        width: this.width,
        height: this.height,
        border: this.border,
      };

      if (this.hovered && this.hoveredBorder) {
        return {...css, border: this.hoveredBorder };
      }

      if (this.active && this.activeBorder) {
        return {...css, border: this.activeBorder };
      }

      if (this.focused && this.focusedBorder) {
        return {...css, border: this.focusedBorder };
      }

      return css;

      
    },

    textCSS() {

      let css = {
        fontSize: this.fontSize,
      } as object as Record<string, string>;

      if (this.hovered || this.focused) {
        css = {...css, fontWeight: 'bold' };
      }
      
      // if hovered
      if (this.hovered && this.hoveredColor) {
        return {...css, color: this.hoveredColor,  };
      }

      // if active
      if (this.active && this.activeColor) {
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
  pointer-events: auto;
}

.image-label-container {
  position: relative;
  overflow: hidden;
  
}
  
.image-label-container img { 
  position: absolute;
  top: 0;
  left: 0;
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