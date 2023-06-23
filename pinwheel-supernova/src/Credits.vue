<template>
  <div id="credits" class="ui-text">
    <div id="icons-container">
      <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank"
        ><img alt="CosmicDS Logo" src="../../assets/cosmicds_logo_for_dark_backgrounds.png"
      /></a>
      <a href="https://worldwidetelescope.org/home/" target="_blank"
        ><img alt="WWT Logo" src="../../assets/logo_wwt.png"
      /></a>
      <a href="https://mo-www.cfa.harvard.edu/MicroObservatory/" target="_blank" class="pl-1"
        ><img alt="MicroObservatory at CfA" src="../src/assets/MicroObservatory_Logo.png"
      /></a>
      <a href="https://science.nasa.gov/learners" target="_blank" class="pl-1"
        ><img alt="SciAct Logo" src="../../assets/logo_sciact.png"
      /></a>
      <a href="https://nasa.gov/" target="_blank" class="pl-1"
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


<style scoped lang="less">

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
</style>