<template>
  <v-dialog
    v-model="show"
    class="location-selector-dialog"
  >
    <!-- TODO: What should the real types here be?
              We don't need them so it doesn't matter,
              but would be good to know.
    -->
    <template v-slot:activator>
      <slot
        name="activator"
        :open="open"
      >
        <icon-button
          v-model="show"
          :color="activatorColor"
          fa-icon="location-pin"
          class="map-icon"
          tooltip-text="Select location"
          tooltip-location="bottom"
          tooltip-offset="5px"
        ></icon-button>
      </slot>
    </template>
    <v-card class="location-selector">
      <div class="text-center">
        Move around the map and double-click to change location
      </div>
      <v-btn
        @click="getLocation"
        @keyup.enter="getLocation"
      >
        Use My Location
      </v-btn>
      <div class="text-center red--text">{{ locationErrorMessage }}</div>
      <div id="map-container"></div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { VDialog } from "vuetify/components/VDialog";
import { VCard } from "vuetify/components/VCard";
import { VBtn } from "vuetify/components/VBtn";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faLocationPin } from "@fortawesome/free-solid-svg-icons";
import tzlookup from "tz-lookup";
import { getTimezoneOffset } from "date-fns-tz";
import L, { LeafletMouseEvent, Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import Notifications from "@kyvg/vue3-notification";
import { defineComponent } from "vue";
import IconButton from "./IconButton.vue";

library.add(faLocationPin);

export type LocationDeg = {
  longitudeDeg: number;
  latitudeDeg: number;
};

export default defineComponent({

  components: {
    'v-btn': VBtn,
    'v-card': VCard,
    'v-dialog': VDialog,
    'icon-button': IconButton
  },

  props: {
    activatorColor: {
      type: String,
      default: "#ffffff"
    }
  },

  mounted() {
    this.getLocation(true);
  },

  data() {
    return {
      circle: null as L.Circle | null,
      map: null as Map | null,
      location: {
        latitudeDeg: 42.3814,
        longitudeDeg: -71.1281
      } as LocationDeg,
      timezone: "America/New_York",
      locationErrorMessage: "",
      show: false
    };
  },

  methods: {

    open() {
      this.show = true;
    },

    getLocation(startup=false) {
      const options = { timeout: 10000, enableHighAccuracy: true };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.location = {
            longitudeDeg: position.coords.longitude,
            latitudeDeg: position.coords.latitude
          };

          if (this.map) {
            this.map.setView([position.coords.latitude, position.coords.longitude], this.map.getZoom());
          }
        },
        (_error) => {
          const msg = "Unable to autodetect location. Location will default to Cambridge, MA, USA, or you can\nuse the location selector to manually input a location.";
          if (startup) {
            this.$notify({
              group: "startup-location",
              type: "error",
              text: msg,
              duration: 4500
            });
          } else {
            this.locationErrorMessage = msg;
          }
        },
        options
      );
    },

    circleForLocation(location: LocationDeg): L.Circle {
      return L.circle([location.latitudeDeg, location.longitudeDeg], {
        color: "#FF0000",
        fillColor: "#FF0033",
        fillOpacity: 0.5,
        radius: 200
      });
    },

    onMapSelect(event: LeafletMouseEvent) {
      let longitudeDeg = event.latlng.lng + 180;
      longitudeDeg = ((longitudeDeg % 360) + 360) % 360;  // We want modulo, but JS % operator is remainder
      longitudeDeg -= 180;
      this.location = {
        latitudeDeg: event.latlng.lat,
        longitudeDeg
      };
    },

    setup() {
      const map = L.map("map-container").setView([this.location.latitudeDeg, this.location.longitudeDeg], 4);
      
      L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3'],
        attribution: `&copy <a href="https://www.google.com/maps">Google Maps</a>`,
        className: 'map-tiles'
      }).addTo(map);

      this.circle = this.circleForLocation(this.location).addTo(map);

      map.doubleClickZoom.disable();
      map.on('dblclick', this.onMapSelect);
      this.map = map;
    },

  },

  computed: {
    selectedTimezoneOffset() {
      return getTimezoneOffset(this.timezone);
    }
  },

  watch: {
    location(location: LocationDeg) {
      if (this.map) {
        this.circle?.remove();
        this.circle = this.circleForLocation(location).addTo(this.map as Map); // Not sure why, but TS is cranky w/o the Map cast
      }

      this.timezone = tzlookup(location.latitudeDeg, location.longitudeDeg);

      this.$emit('locationChange', { location, timezone: this.timezone });
    },

    show(show: boolean) {
      if (show) {
        this.locationErrorMessage = "";
        this.$nextTick(() => {
          this.setup();
        });
      } else {
        this.map?.remove();
        this.circle = null;
      }
    }
  }

});
</script>

<style lang="less">
.location-selector-dialog {
  
  .v-overlay__content {
    width: fit-content !important;
  }

  .location-selector {
    align-items: center;
    margin: auto;
    width: 70vw;
    height: fit-content;
  }

  #map-container {
    width: 60vw;
    height: 70vh;
    margin: auto;
    padding: 5px 0px;
    border-radius: 5px;
  }

}
</style>
