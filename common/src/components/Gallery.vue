<template>
  <v-window>
    <slot
      name="closed"
      v-if="!open"
    >
      <img :src="getImageset(places[0])?.get_thumbnailUrl() ?? ''"/>
    </slot>
    <v-window-item
      :style="cssVars"
      class="gallery-content"
      :fullscreen="open && fullscreen"
    >
      <div
        v-for="[index, place] of places.entries()"
        :key="index"
        class="gallery-item"
      >
        <img :src="getImageset(place)?.get_thumbnailUrl() ?? ''"/>
        <p>{{ place.get_name() }}</p>
      </div>
    </v-window-item>
  </v-window>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Folder, Imageset, Place } from "@wwtelescope/engine";
import { engineStore } from "@wwtelescope/engine-pinia";
import { mapActions } from "pinia";

export default defineComponent({
  
  props: {
    wtmlUrl: { type: String, required: true },
    width: { type: String, default: "67%" },
    height: { type: String, default: "50%" },
    fullscreen: { type: Boolean, default: false }
  },

  async created() {
    this.places = await this.placesFromWtml(this.wtmlUrl);
  },

  data() {
    return {
      open: false,
      places: [] as Place[]
    };
  },

  methods: {
    ...mapActions(engineStore, ["loadImageCollection"]),

    getImageset(place: Place): Imageset | null {
      return place.get_backgroundImageset() ?? place.get_studyImageset();
    },

    extractPlaces(folder: Folder): Place[] {
      let places: Place[] = [];
      for (const child of folder.get_children() ?? []) {
        if (child instanceof Place) {
          const iset = this.getImageset(child);
          if (iset !== null) {
            places.push(child);
          }
        } else if (child instanceof Folder) {
          places = places.concat(this.extractPlaces(child));
        }
      }
      return places;
    },

    async placesFromWtml(wtmlUrl: string): Promise<Place[]> {
      return this.loadImageCollection({
        url: wtmlUrl,
        loadChildFolders: true
      }).then((folder) => this.extractPlaces(folder));  
    }
  },

  computed: {
    cssVars() {
      return {
        "--width": this.width,
        "--height": this.height
      };
    }
  }
});

</script>

<style>
.gallery-content {
  background: transparent;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(6px);
}
</style>

