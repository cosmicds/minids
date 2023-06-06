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
      :fullscreen="open && props.fullscreen"
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

<script setup lang="ts">
import { defineProps, reactive, ref, onBeforeMount, computed } from "vue";
import { Folder, Imageset, Place } from "@wwtelescope/engine";
import { engineStore } from "@wwtelescope/engine-pinia";

const wwtStore = engineStore();

interface GalleryProps {
  wtmlUrl: string;
  width: string;
  height: string;
  fullscreen: boolean;
}


function getImageset(place: Place): Imageset | null {
  return place.get_studyImageset() ?? place.get_backgroundImageset();
}


function extractPlaces(folder: Folder): Place[] {
  let places: Place[] = [];
  for (const child of folder.get_children() ?? []) {
    if (child instanceof Place) {
      const iset = getImageset(child);
      if (iset !== null) {
        places.push(child);
      }
    } else if (child instanceof Folder) {
      places = places.concat(extractPlaces(child));
    }
  }
  return places;
}

async function placesFromWtml(wtmlUrl: string): Promise<Place[]> {
  return wwtStore.loadImageCollection({
    url: wtmlUrl,
    loadChildFolders: true
  }).then((folder) => extractPlaces(folder));
}

const cssVars = computed(() => {
  return {
    "--width": props.width,
    "--height": props.height
  };
});

const open = ref(false);
const props = defineProps<GalleryProps>();

let places = reactive<Place[]>([]);

onBeforeMount(async () => {
  places = await placesFromWtml(props.wtmlUrl);
});
</script>

<style scoped>
.gallery-content {
  background: transparent;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(6px);
}
</style>
