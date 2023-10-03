<template>
  <!-- WCAG (Web Accessability compliant GIF display) -->
  <div 
    :id="id"
    class="wcag-gif-container"
    >
    <img 
      :src="still" 
      :alt="alt" 
      loading="lazy">
    <details v-if="!(stayPaused || stillOnly)">
      <summary  role="button" aria-label="static image" v-on:click="onClick">
        <v-icon 
          color="black"
        >
          {{ pause ? 'mdi-play' : 'mdi-pause' }}
        </v-icon>
      </summary>
      <div class="wcag-gif-container1">
        <img 
        :src="gif" 
        :alt="'Animated: ' + alt"
        loading="lazy"
        >
      </div>
    </details>
    
    <cite style="display: none"> <!--  in the markup but not visible  -->
      Adapted from <a href="https://css-tricks.com/pause-gif-details-summary/">CSS Tricks</a> and <a href="https://codepen.io/chriscoyier/pen/pogQJER">CodePen</a>
    </cite>
  </div>
  
  
</template>
  
<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { VIcon } from "vuetify/components/VIcon";


export default defineComponent({
  name: "GifPlayPause",

  components: {
    'v-icon': VIcon,
  },
  

  props: {
    stillOnly : {
      type: Boolean,
      default: false,
      required: false,
    },

    startPaused: {
      type: Boolean,
      default: false,
      required: false,
    },

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

  data() {
    return {
      stayPaused: this.stillOnly,
      pause: this.stillOnly || this.startPaused,
    };
  },

  mounted() {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce))");
    const details = document.querySelector(".wcag-gif-container > details") as HTMLDetailsElement;

    if (mediaQuery.matches && details) {
      this.stayPaused = true;
      details.removeAttribute("open");
      return;
    } else if (details) {
      details.open = ! (this.startPaused || this.stillOnly);
    }
  },

  methods: {

    onClick(): void {
      if (this.stayPaused) {
        return;
      } 

      this.pause = !this.pause;
      
    },
  }

});

</script>

<style scoped>


.wcag-gif-container {
  /* display: inline-block; */
  display: flex;
  position: relative;
  width: 100%;
  
}

.wcag-gif-container summary {
  color: #fff;
  background: transparent;
  width: 2rem;
  height: 2rem;
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  z-index: 2;
  border-radius: 50%;
  background-color: white;
}

.wcag-gif-container details[open] summary {
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

.wcag-gif-container summary > .v-icon {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* .wcag-gif-container summary:focus {
  box-shadow: 0 0 0 0.25rem #aade87;
  outline: transparent;
} */

.wcag-gif-container .wcag-gif-container1 img {
  display: inline-block;
  position: absolute;
  top: 0px;
  left: 0px;
  overflow: visible;
}

.wcag-gif-container img {
  width: 100%;
}

</style>
