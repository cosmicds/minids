<template>
  <div
    :class="['gallery-root', {'open': open}]">
    <div class="just-holding-events"
        @click="open = true"
        @keyup.enter="open = true"
        tabindex="0"
    >
    <slot
      name="closed"
      v-if="!open"
    >
      <div
        class="default-activator blurred"
        @click="open = true"
        @keyup.enter="open = true"
      >
        <span
          class="default-activator-title noselect"
        >
          {{ closedText }}
        </span>
        <img
          class="noselect"
          :src="places[previewIndex] ? (getImageset(places[previewIndex])?.get_thumbnailUrl() ?? '') : ''"
        />
      </div>
    </slot>
  </div>
    <div
      :style="cssVars"
      class="gallery blurred"
      v-if="open"
    >
      <div
        class="gallery-header"
      >
        <span class="gallery-title">{{ title }}</span>
        <font-awesome-icon
          v-if="!stayOpen"
          class="gallery-close"
          icon="times"
          size="lg"
          @click="open = false"
          @keyup.enter="open = false"
          tabindex="0"
        ></font-awesome-icon>
      </div>
      <div
        class="gallery-content"
      >
        <div
          v-for="[index, place] of places.entries()"
          :key="index"
          :class="['gallery-item', {'selected': highlightLastOnly ? selectedPlace === place : selectedPlaces.includes(place)}]"
          @click="selectPlace(place)"
        >
          <img
            class="noselect"
            :src="getImageset(place)?.get_thumbnailUrl() ?? ''"
          />
          <span class="place-name noselect">{{ place.get_name() }}</span>
        </div>
      </div>
      <slot
        v-if="open"
      >
        
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Folder, Imageset, Place } from "@wwtelescope/engine";
import { engineStore } from "@wwtelescope/engine-pinia";
import { mapActions } from "pinia";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

library.add(faTimes);

export default defineComponent({

  components: {
    'font-awesome-icon': FontAwesomeIcon
  },
  
  props: {
    wtmlUrl: { type: String, required: false, default: '' },
    placesList: { type: Array<Place>, default: () => [] as Place[], required: false},
    columns: { type: [Number, String], default: "auto-fit" },
    width: { type: String, default: "300px" },
    maxHeight: { type: String, default: "500px" },
    title: { type: String, default: "Gallery" },
    selectedColor: { type: String, default: "dodgerblue" },
    singleSelect: { type: Boolean, default: true },
    highlightLastOnly: { type: Boolean, default: false },
    previewIndex: { type: Number, default: 0 },
    closedText: { type: String, default: "Image Gallery" },
    stayOpen: { type: Boolean, default: false },
    incomingItemSelect: { type: Place, default: null }
  },

  // use mounted instead of created since places list needs to be generated
  async mounted() {
    this.waitForReady().then(async () => {
      if (this.placesList.length > 0) {
        return;
      }
      this.wtmlPlaces = await this.placesFromWtml(this.wtmlUrl);
    });
  },

  data() {
    return {
      open: this.stayOpen,
      wtmlPlaces: [] as Place[],
      selectedPlace: null as Place | null,
      selectedPlaces: [] as Place[],
      lastSelectedItem : null as Place | null
    };
  },

  methods: {
    ...mapActions(engineStore, ["loadImageCollection", "waitForReady"]),

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
    },

    selectPlace(place: Place) {
      if (this.singleSelect) {
        // if we're already selected, deselect
        if (this.selectedPlace === place) {
          this.$emit("deselect", place);
          this.selectedPlaces = [];
          this.selectedPlace = null;
          return;
        } else {
          // else deselect whatever was there before, and select this
          this.selectedPlaces.forEach((p) => this.$emit("deselect", p));
          this.selectedPlaces = [place];
          this.selectedPlace = place;
          return;
        }
      }

      // for multi-select
      // if we're already selected, deselect
      if (this.selectedPlaces.includes(place)) {
        this.$emit("deselect", place);
        this.selectedPlace = null;
        this.selectedPlaces.splice(this.selectedPlaces.indexOf(place), 1);
      } else {
        this.selectedPlace = place;
        this.selectedPlaces = this.singleSelect ? [place] : [...this.selectedPlaces, place];
      }
      
    }
  },

  computed: {
    cssVars() {
      return {
        "--column-count": this.columns,
        "--selected-color": this.selectedColor,
        "--gallery-width": this.width,
        "--gallery-max-height": this.maxHeight
      };
    },
    
    places(): Place[] {
      return this.placesList.length > 0 ? this.placesList : this.wtmlPlaces;
    }
  },

  watch: {
    selectedPlace(place) {
      this.lastSelectedItem = place;
      if (place == null) { return; }
      this.$emit("select", place);
      if (!this.singleSelect) {
        this.$emit("listAllSelected", this.selectedPlaces);
      }
    },
    
    incomingItemSelect() {
      if (this.incomingItemSelect != null) {
        if (this.incomingItemSelect == this.lastSelectedItem) {
          return;
        }
        this.selectPlace(this.incomingItemSelect);
      }
    }
  }
});

</script>

<style lang="less">
.gallery-root {
  transition-property: height, width;
  transition: 0.5s ease-out;
  pointer-events: auto;

  .blurred {
    background: transparent;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(6px);
  }

  .gallery {
    border-radius: 5px;
    border: 1px solid white;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: var(--gallery-max-height);
    width: min(calc(var(--gallery-width)), calc(100%));

    // Better way to do this?
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  }

  .noselect {
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  .gallery-header {
    position: relative;
    display: flex;
    justify-content: center;
  }

  .gallery-title {
    font-size: 16pt;
  }

  .gallery-close {
    position: absolute;
    right: 3px;
    cursor: pointer;
  }

  .gallery-content {
    display: grid;
    grid-template-columns: repeat(var(--column-count), minmax(100px, 1fr));
    column-gap: 10px;
    row-gap: 5px;
    padding: 5px
  }

  .default-activator {
    border-radius: 3px;
    border: solid 1px white;
    position: relative;
    height: fit-content;
    width: fit-content;
    display: flex;
    flex-direction: column;
    cursor: pointer;

    img {
      padding: 5px;
      border-radius: 3px;
    }
  }

  .default-activator-title {
    margin: auto;
  }

  .gallery-item {
    border-radius: 3px;
    border: 1px solid white;
    display: flex;
    flex-direction: column;
    cursor: pointer;

    img {
      margin-left: auto;
      margin-right: auto;
      border-radius: 3px;
      width: 96px;
      height: 45px;
      object-fit: cover;
    }

    span {
      flex-grow: 1;
      display: inline-grid;
      align-items: center;
      text-align: center;
    }
  }

  .selected {
    border: 1px solid var(--selected-color);

    span {
      color: var(--selected-color);
    }
  }

  .place-name {
    font-size: 10pt;
  }

}
</style>

