<template>
  <div id="map-container"></div>
</template>

<script lang="ts">
import L, { LeafletMouseEvent, Map, TileLayerOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import { notify } from "@kyvg/vue3-notification";
import { defineComponent, PropType } from "vue";

export interface LocationDeg {
  longitudeDeg: number;
  latitudeDeg: number;
}

interface MapOptions extends TileLayerOptions {
  templateUrl: string;
}

interface Place extends LocationDeg { 
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  radius?: number;
  name?: string;
}

export default defineComponent({

  emits: ["place", "update:modelValue", "error"],

  props: {
    activatorColor: {
      type: String,
      default: "#ffffff"
    },
    detectLocation: {
      type: Boolean,
      default: true
    },
    modelValue: {
      type: Object as PropType<LocationDeg>,
      default() {
        return {
          latitudeDeg: 42.3814,
          longitudeDeg: -71.1281
        };
      }
    },
    mapOptions: {
      type: Object as PropType<MapOptions>,
      default() {
        return {
          templateUrl: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3'],
          attribution: `&copy <a href="https://www.google.com/maps">Google Maps</a>`,
          className: 'map-tiles'
        };
      }
    },
    places: {
      type: Array as PropType<Place[]>,
      default() {
        return [];
      }
    },
    placeCircleOptions: {
      type: Object as PropType<Record<string, any>>,
      default() {
        return {
          color: "#0000FF",
          fillColor: "#3333FF",
          fillOpacity: 0.5,
          radius: 150 
        };
      }
    },
    placeSelectable: {
      type: Boolean,
      default: true
    },
    selectable: {
      type: Boolean,
      default: true
    },
    selectedCircleOptions: {
      type: Object as PropType<Record<string,any>>,
      default() {
        return {
          color: "#FF0000",
          fillColor: "#FF0033",
          fillOpacity: 0.5,
          radius: 200
        };
      }
    }
  },

  mounted() {
    console.log(this);
    if (this.detectLocation) {
      this.getLocation(true);
    }
    this.setup();
  },

  data() {
    return {
      placeCircles: [] as L.Circle[],
      hoveredPlace: null as Place | null,
      selectedCircle: null as L.Circle | null,
      selectedPlace: null as Place | null,
      selectedPlaceCircle: null as L.Circle | null,
      map: null as Map | null,
    };
  },

  methods: {

    getLocation(startup=false) {
      const options = { timeout: 10000, enableHighAccuracy: true };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.updateValue({
            longitudeDeg: position.coords.longitude,
            latitudeDeg: position.coords.latitude
          });

          if (this.map) {
            this.map.setView([position.coords.latitude, position.coords.longitude], this.map.getZoom());
          }
        },
        (_error) => {
          const msg = "Unable to autodetect location. Location will default to Cambridge, MA, USA, or you can\nuse the location selector to manually input a location.";
          if (startup) {
            notify({
              group: "startup-location",
              type: "error",
              text: msg,
              duration: 4500
            });
          } else {
            this.$emit("error", msg);
          }
        },
        options
      );
    },

    circleForLocation(location: LocationDeg, circleOptions: Record<string,any>): L.Circle {
      return L.circle([location.latitudeDeg, location.longitudeDeg], circleOptions);
    },

    circleForSelection() : L.Circle | null {
      if (this.selectedPlace) {
        return null;
      }
      return this.circleForLocation(this.modelValue, { ...this.selectedCircleOptions, interactive: false });
    },

    circleForPlace(place: Place): L.Circle {
      const options = (place === this.selectedPlace) ? this.selectedCircleOptions : this.placeCircleOptions;
      const circle = this.circleForLocation(place, options);
      if (place.name) {
        circle.bindTooltip(place.name);
      }
      return circle;
    },

    onPlaceSelect(place: Place) {
      this.updateValue({
        longitudeDeg: place.longitudeDeg,
        latitudeDeg: place.latitudeDeg
      });
      this.$emit('place', place);
      this.selectedPlace = place;
    },

    onMapSelect(event: LeafletMouseEvent) {
      let longitudeDeg = event.latlng.lng + 180;
      longitudeDeg = ((longitudeDeg % 360) + 360) % 360;  // We want modulo, but JS % operator is remainder
      longitudeDeg -= 180;
      this.selectedPlace = null;
      this.updateValue({
        latitudeDeg: event.latlng.lat,
        longitudeDeg
      });
    },

    setup() {
      console.log("setup");
      const map = L.map("map-container").setView([this.modelValue.latitudeDeg, this.modelValue.longitudeDeg], 4);
      
      const options = { minZoom: 1, maxZoom: 20, ...this.mapOptions };
      L.tileLayer(this.mapOptions.templateUrl, options).addTo(map);
      this.selectedCircle = this.circleForSelection();
      this.selectedCircle?.addTo(map);
      this.placeCircles = this.places.map(place => this.circleForPlace(place));
      this.placeCircles.forEach((circle, index) => {
        circle.on('mouseover', () => {
          const place = this.places[index];
          this.hoveredPlace = place;
          circle.openTooltip([place.latitudeDeg, place.longitudeDeg]);
        });

        if (this.placeSelectable) {
          circle.on('click', () => {
            this.onPlaceSelect(this.places[index]);
          });
        }

        circle.on('mouseout', () => {
          this.hoveredPlace = null;
        });

        circle.addTo(map);
      });

      map.doubleClickZoom.disable();
      if (this.selectable) {
        map.on('dblclick', this.onMapSelect);
      }
      this.map = map;
    },

    updateValue(value: LocationDeg) {
      this.$emit('update:modelValue', value);
    },

    updateCircle() {
      if (this.map) {
        this.selectedCircle?.remove();
        this.selectedCircle = this.circleForSelection();
        console.log(this.selectedCircle);
        if (this.selectedCircle) {
          this.selectedCircle.addTo(this.map as Map); // Not sure why, but TS is cranky w/o the Map cast
        }
      }
    }

  },

  watch: {
    modelValue() {
      this.updateCircle();
    },
    places() {
      this.map?.remove();
      this.setup();
    },
    selectedPlace(newPlace) {
      const index = this.places.indexOf(newPlace);
      const oldSelectedCircle = this.selectedPlaceCircle;
      this.selectedPlaceCircle = this.placeCircles[index];

      oldSelectedCircle?.setStyle(this.placeCircleOptions);
      this.selectedPlaceCircle?.setStyle(this.selectedCircleOptions);
    }
  }
  
});
</script>

<style lang="less">
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
</style>
