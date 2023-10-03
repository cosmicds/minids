<template>
  <div class="flip-card" :style="size">
    <div class="flip-card-inner" :style="cssVars">
    
      <div class="flip-card-front">
        <slot name="front">
          Front
        </slot>
      </div>
      
      <div class="flip-card-back">
        <slot name="back">
          Back
        </slot>
      </div>
      
    </div>
    
    <cite style="display:none">Code is from <a href="w3schools.com/howto/howto_css_flip_card.asp">w3schools.com/howto/howto_css_flip_card.asp</a></cite>
  </div>
  
  
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({

  name: 'FlipTransition',

  props: {
    width: {
      type: String,
      default: 'auto'
    },
    height: {
      type: String,
      default: 'auto'
    },
    duration: {
      type: String,
      default: '0.8s'
    },
  },

  computed: {
    size(): string {
      return `width: ${this.width}; height: ${this.height};`;
    },

    cssVars(): string {
      return `--duration: ${this.duration};`;
    }
  },

  

});

</script>

<style scoped>
/* The flip card container - set the width and height to whatever you want. We have added the border property to demonstrate that the flip itself goes out of the box on hover (remove perspective if you don't want the 3D effect */
.flip-card {
  perspective: 1000px; /* Remove this if you don't want the 3D effect */
}

/* This container is needed to position the front and back side */
.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform var(--duration);
  transform-style: preserve-3d;
}

/* Do an horizontal flip when you move the mouse over the flip box container */
.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

/* Position the front and back side */
.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden; /* Safari */
  backface-visibility: hidden;
}

/* Style the front side (fallback if image is missing) */
.flip-card-front {
}

/* Style the back side */
.flip-card-back {
  transform: rotateY(180deg);
}
</style>