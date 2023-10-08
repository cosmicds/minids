<template>
  <span id="gelocation-wrapper" class="gelocation">
    <v-btn 
      v-if="!hideButton"
      class="geolocation-button"
      density="comfortable"
      :size="size"
      :variant="geolocation ? 'flat' : 'outlined'"
      :elevation="elevation"
      :loading="loading"
      icon="mdi-crosshairs-gps"
      :color="geolocationError ? 'red' : color"
      @click="getLocation" 
    />
    
    <span class="geolocation-text" v-if="!hideText">
      <v-progress-circular
        v-if="loading && showTextProgress"
        :size="progressCircleSize"
        :width="2"
        :color="color"
        indeterminate
      />
      {{ label }} 
    </span>
    
    <span class="geolocation-coords" v-if="showCoords">
      <p>Latitude: {{ geolocation?.latitude }}</p>
      <p>Longitude: {{ geolocation?.longitude }}</p>
    </span>
    
  </span>
  

</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { VBtn, } from 'vuetify/components/VBtn';
import { VProgressCircular } from 'vuetify/lib/components/index.mjs';

export default defineComponent({
  
  name: 'GeolocationButton',


  components: {
    'v-btn': VBtn,
    'v-progress-circular': VProgressCircular,
  },

  props: {
    color: {
      type: String,
      default: 'white',
    },
    debug: {
      type: Boolean,
      default: false,
    },


    disabled: {
      type: Boolean,
      default: false,
    },

    size: {
      type: String,
      default: 'small',
    },


    elevation: {
      type: String,
      default: "2",
    },

    variant: {
      type: String,
    },

    hideButton: {
      type: Boolean,
      default: false,
    },

    hideText: {
      type: Boolean,
      default: false,
    },

    showCoords: {
      type: Boolean,
      default: false,
    },

    showTextProgress: {
      type: Boolean,
      default: false,
    },

    progressCircleSize: {
      type: Number,
      default: 12,
    },
      

    label: {
      type: String,
      default: 'My Location',
    },
    
    
  },

  emits: {
    // declare emits but w/o any verification. -_- 
    geolocation: (_payload: GeolocationCoordinates) => true,
    error: (_payload: GeolocationPositionError) => true,
  },
  
  data() {
    return {
      geolocation: null as GeolocationCoordinates | null,
      geolocationError: null as GeolocationPositionError | null,
      loading: false
    };
  },
  mounted() {

    
  },

  methods: {
    getLocation() {
      // Get the users location, and emit and event with
      // the coordinates or the error
      if (this.geolocation) {
        this.$emit('geolocation', this.geolocation);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 60 * 1000, // 1 minute
        maximumAge: 0,
      };
      
      if (navigator.geolocation) {
        this.loading = true;  
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.geolocation = position.coords;
            this.$emit('geolocation', this.geolocation);
            this.loading = false;
          },
          
          (error) => {
            this.geolocationError = error;
            this.$emit('error', this.geolocationError);

            this.loading = false;
          },
          options
        );
      }
    },
  },
  
});

</script>