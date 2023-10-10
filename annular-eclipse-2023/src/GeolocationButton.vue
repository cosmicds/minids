<template>
  <span :id="`gelocation-wrapper+${id}`" class="gelocation">
    <v-btn 
      v-if="!hideButton"
      class="geolocation-button"
      :density="density"
      :size="size"
      :variant="geolocation ? (useTextButton ? 'tonal' : 'flat') : 'outlined'"
      :elevation="elevation"
      :loading="loading"
      :icon="!useTextButton ? icon : false"
      :prepend-icon="useTextButton ? icon : ''"
      :color="geolocationError ? 'red' : color"
      @click="getLocation" 
    >
        <slot v-if="useTextButton">
          {{ label }}
        </slot>
    </v-btn>
    
    <span class="geolocation-text" v-if="!hideText && !useTextButton">
      <v-progress-circular
        v-if="loading && showTextProgress"
        :size="progressCircleSize"
        :width="2"
        :color="color"
        indeterminate
      />
      <slot>
      {{ label }}
      </slot>
    </span>
    
    <span class="geolocation-coords" v-if="showCoords">
      <p>Latitude: {{ geolocation?.latitude }}</p>
      <p>Longitude: {{ geolocation?.longitude }}</p>
    </span>
    
  </span>
  

</template>


<script lang="ts">
import { defineComponent } from 'vue';
import { VBtn } from 'vuetify/components/VBtn';
import { VProgressCircular } from 'vuetify/lib/components/index.mjs';

type Density = null | 'default' | 'comfortable' | 'compact';

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

    density: {
      type: String as () => Density,
      default: 'comfortable',
    },


    elevation: {
      type: String,
      default: "2",
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

    useTextButton: {
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

    id: {
      type: String,
      default: null,
    },

    trueIcon: {
      type: String,
      default: 'mdi-crosshairs-gps',
    },

    falseIcon: {
      type: String,
      default: 'mdi-crosshairs',
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

  computed: {
    icon() {
      return this.geolocation ? this.trueIcon : this.falseIcon;
    },
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