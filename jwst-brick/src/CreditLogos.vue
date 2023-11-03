<template>
  <div id="logo-credits">
    <div id="icons-container">
      <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer"
        ><img alt="CosmicDS Logo" :src="require('../../assets/cosmicds_logo_for_dark_backgrounds.png')"
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
</template>


<script lang="ts">
import { defineComponent, } from "vue";

export default defineComponent({


  props: {
    visible: {
      type: Boolean,
      default: true
    },
  },

  data() {
    return {    };
  },

  created() {
    return;
  },

  methods: {
    
  },

  computed: { 

    isMobile() {
      return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    },
  },

  watch: {
  }
});
</script>