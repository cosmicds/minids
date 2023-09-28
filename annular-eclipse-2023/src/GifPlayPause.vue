<template>



  <div 
    :id="id"
    class="wcag-gif-container"
    >
    <img 
      :src="still" 
      :alt="alt" 
      loading="lazy">
    <details open>
      <summary role="button" aria-label="static image"></summary>
      <div class="wcag-gif-container1">
        <img 
        :src="gif" 
        :alt="'Animated: ' + alt"
        loading="lazy"
        >
      </div>
    </details>
    
    <cite style="display: none"> <!--  in the markup but not visible  -->
      Inspired by https://css-tricks.com/pause-gif-details-summary/ and https://codepen.io/chriscoyier/pen/pogQJER 
    </cite>
  </div>
  
</template>
  
<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: "GifPlayPause",
  

  props: {
    id: {
      type: String,
      default: "wcag-gif",
      required: false,
    },
    still: {
      type: String,
      required: true,
    },
    gif: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
  },

  mounted() {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce))");
    const details = document.querySelector(".wcag-gif-container > details");

    if (mediaQuery.matches && details) {
      details.removeAttribute("open");
    }
  }

});

</script>

<style scoped>


.wcag-gif-container {
  display: inline-block;
  position: relative;
}

.wcag-gif-container summary {
  color: #fff;
  background: #000;
  width: 2rem;
  height: 2rem;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
  border-radius: 50%;
  background-image: url("https://assets.codepen.io/128034/play_circle_filled-24px.svg");
  background-size: 90% auto;
  background-repeat: no-repeat;
  background-position: center;
  background-color: white;
}

.wcag-gif-container [open] summary {
  background-image: url("https://assets.codepen.io/128034/pause_circle_filled-24px.svg");
  box-shadow: 0 0 0 2px #fff;
  background-color: white;
}

/* for blink/webkit */
.wcag-gif-container details summary::-webkit-details-marker {
  display: none;
}
/* for firefox */
.wcag-gif-container details > summary:first-of-type {
  list-style: none;
}

.wcag-gif-container summary + * {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1rem;
  padding-top: 3rem;
  background: #000;
  color: #fff;
  overflow-y: auto;
}

.wcag-gif-container summary + * a {
  color: #fff;
}

.wcag-gif-container summary:focus {
  box-shadow: 0 0 0 0.25rem #aade87;
  outline: transparent;
}

.wcag-gif-container .wcag-gif-container1 img {
  display: inline-block;
  position: absolute;
  top: 0px;
  left: 0px;
  overflow: visible;
}

</style>
