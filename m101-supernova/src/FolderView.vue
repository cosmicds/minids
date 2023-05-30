<template>
  <div
    class="fv-root"
    :style="cssVars"
  >
    <div
      v-if="expandable"
      id="expand-row"
      class="bordered pa-1"
      @click="expanded = !expanded"
    >
      <div class="wrapper">
        <img
          src="https://github.com/cosmicds/cds-website/raw/main/public/comet_c2022-e3/thumbnails/694_2022E3_14_01_23.jpg" v-if="!thumbnails"
        />
        <div class="thumbnail-header" v-if="expanded">
          Click <span v-if="thumbnails">thumbnail</span><span v-else>date</span> to see image in sky
        </div>
        <div class="thumbnail-header" v-if="!expanded">
          Image Controls
        </div>

      </div>
      <font-awesome-icon
        id="expand-icon"
        :icon="expanded ? 'chevron-up' : 'chevron-down'"
      />
    </div>
    <transition-expand>
      <div id="items">
        <div
          v-if="items !== null && expanded"
        >
          <div
            :class="['bordered', 'item', lastSelectedItem === item ? 'selected' : '']"
            v-for="item of items"
            :key="item.get_name()"
            :id="`fv-${item.get_name()}`"
          >
            <div
              class="item-thumbnails"
            >
              <img
                class="thumbnail-images"
                v-if="thumbnails"
                :src="item.get_thumbnailUrl()"
                :alt="item.get_name()"
                @click="() => selectItem(item)"
              />
              <div
                v-if = "showName"
                class="item-name"
                :class="['thumbnail']"
                @click="() => selectItem(item)"
              >
                {{ displayName(item) }}
              </div>
            </div>
            <div class="slider-container">
              <input
                v-if="sliders"
                class="opacity-range"
                type="range"
                value="0"
                @input="(e: Event) => onSliderInputChanged(e , item)"
                @keyup.enter="() => selectItem(item)"
                @mouseup="() => { lastOpacityChanged = null}"
              />
            
              <!--
              <label class="switch">
                <input 
                  type="checkbox"
                  :title="item.get_name()"
                  @change="(e) => onToggleImage(e, item)"
                  >
                <span class="slider"></span>
              </label>
              -->
            </div>

          </div>
        </div>
      </div>
    </transition-expand>
  </div>
</template>

<script lang="ts">
import { defineComponent, isProxy, toRaw, PropType } from "vue";
import { Folder, FolderUp, Place, Imageset } from "@wwtelescope/engine";
import { Thumbnail } from "@wwtelescope/engine-types";
import { WWTAwareComponent } from "@wwtelescope/engine-pinia";

type FlexDirection = "row" | "column";

export default defineComponent({
  extends: WWTAwareComponent,

  props: {
    rootFolder: {
      type: Object as PropType<Folder>,
      required: true
    },
    flexDirection: {
      type: String as PropType<FlexDirection>,
      default: "column"
    },
    expandable: {
      type: Boolean,
      default: false
    },
    sliders: {
      type: Boolean,
      default: false
    },
    scrolling: {
      type: Boolean,
      default: false
    },
    startFirstSelected: {
      type: Boolean,
      default: false
    },
    thumbnails: {
      type: Boolean,
      default: true
    },
    open: {
      type: Boolean,
      default: false
    },
    incomingItemSelect: {
      type: Object as PropType<Thumbnail>,
      default: null
    },
    showName: {
      type: Boolean,
      default: true
    },

    itemNames: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({})
    },

    sortBy: {
      type: Object as PropType<Record<string, number>>,
      default: () => ({})
    },

    reversed: {
      type: Boolean,
      default: false
    }
    
  },

  data() {
    return {
      items: [] as Thumbnail[],
      originalOrder: [] as string[],
      lastSelectedItem: null as Thumbnail | null,
      opacities: {} as Record<string, number>,
      expanded: this.open,
      lastOpacityChanged: null as Thumbnail | null,
      sorted: false
    };
  },

  created() {
    this.populate();
    this.originalOrder = this.items.map((item) => item.get_name());
    if (this.validSortBy) { this.sortItems(); this.sorted=true; }
  },

  methods: {
    populate(): void {
      for (const c of this.rootFolder.get_children() ?? []) {
        const cr = isProxy(c) ? toRaw(c) : c;
        if (cr instanceof Place) {
          this.items.push(cr);
        }
      }
      if (this.startFirstSelected && this.items?.length > 0) {
        this.selectItem(this.items[0]);
      }
    },
    showSlider(item: Thumbnail | null): boolean {
      return item instanceof Imageset;
    },

    sortItems(): void {
      if (!this.validSortBy) {
        // restore original order
        this.items.sort((a, b) => {
          const aIndex = this.originalOrder.indexOf(a.get_name());
          const bIndex = this.originalOrder.indexOf(b.get_name());
          return aIndex - bIndex;
        });
        return;
      }
      this.items.sort((a, b) => {
        const aIndex = this.sortBy[a.get_name()] ?? this.items.length;
        const bIndex = this.sortBy[b.get_name()] ?? this.items.length;
        return this.reversed ? bIndex - aIndex : aIndex - bIndex;
      });
    },
    
    selectItem(item: Thumbnail): void {
      if (!this.sliders && (item === this.lastSelectedItem)) {
        this.lastSelectedItem = null;
        this.$emit('select', null);
        return;
      }
      this.lastSelectedItem = item;
      if (item instanceof Folder || item instanceof FolderUp) {
        this.items = item.get_children() ?? [];
      } else {
        this.$emit('select', item);
      }
    },

    displayName(item: Thumbnail): string {
      // check if items names is empty or a function
      if (this.validItemNames && Object.keys(this.itemNames).includes(item.get_name())) {
        return this.itemNames[item.get_name()];
      }
      console.log("item name", item.get_name());
      return item.get_name();
    },
    
    onSliderInputChanged(e: Event, item: Thumbnail) {
      let dragging = false;
      if (this.lastOpacityChanged == item) {
        dragging = true;
      } else {
        this.lastOpacityChanged = item;
      }
      this.$emit('opacity', item, (e.target as HTMLInputElement).value, !dragging);
    },

    onToggleImage(e: Event, item: Thumbnail) {
      this.$emit('toggle', item, (e.target as HTMLInputElement).checked);
    },

    scrollToItem(id: string) {
      const element = document.getElementById(id);
      if (element !== null) {
        const container = document.getElementById("items");
        if (container !== null) {
          const y = Math.max(Math.min(element.offsetTop - element.clientHeight * 1.5, container.scrollHeight), 0);
          container.scrollTo(0, y);
        }
      }
    },
  },

  computed: {
    cssVars() {
      return {
        "--flex-direction": this.flexDirection
      };
    },

    isMobile() {
      return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    },

    validItemNames(): boolean {
      const length = Object.keys(this.itemNames).length;
      
      if (length == 0) { return false; }
      
      if ((length - this.items.length) != 0) {
        console.warn(`itemNames length (${length}) does not match items length (${this.items.length})`);
      }

      // this.items.forEach((item) => {
      //   if (!Object.keys(this.itemNames).includes(item.get_name())) {
      //     console.warn(`itemNames does not contain ${item.get_name()}`);
      //   }
      // });
      
      return length > 0;
    },

    validSortBy(): boolean {
      let valid = true;
      const sortKeys = Object.keys(this.sortBy);
      for (const item of this.items) {
        if (!sortKeys.includes(item.get_name())) {
          console.warn(`sortBy does not contain ${item}`);
          valid = false;
        }
      }
      return valid;
    },
  
  },

  watch: {
    incomingItemSelect() {
      if (this.incomingItemSelect != null) {
        this.lastSelectedItem = this.incomingItemSelect;
        if (this.scrolling) {
          this.scrollToItem(`fv-${this.incomingItemSelect.get_name()}`);
        }
      } else {
        this.lastSelectedItem = null;
      }
    },

    sortBy() {
      this.sortItems();
    },
  }
});
</script>

<style scoped lang="less">
.fv-root {
  display: flex;
  flex-direction: var(--flex-direction);
  overflow-x: auto;
  overflow-y: auto;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.5);
  // outline: 1px solid rgb(4, 214, 175);
  padding: 3px;
  border-radius: 2px;
}

#items {
  height: 100%;
  overflow-y: auto;
  &::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 15px;
  }
  &::-webkit-scrollbar-track {
    background: rgb(0, 0, 0,0.5);
    // border: 5px solid red;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 100, 100, 0.5);
    width: 10px;
    border: 3px solid black;
    border-radius: 10px;
  }
  //width: 100%;
  //justify-content: space-around;
}

.item {
  display: flex;
  flex-direction: column;
  padding: 3px;
  width: 100%;
  cursor: pointer;
  pointer-events: auto;
  margin: .5em 0;
  & img {
    width: 100%;
    height: ~"min(45px, 7.5vh)";
    object-fit: cover;
    border-radius: 2px;
  }

  & input[type=range] {
    width: calc(min(12vh, 100px));
  }
  &.selected {
    border: 1px solid #D60493;
  }
}


.selected .item-name {
  color: #fb46c2;
}
.item-name {
  position: absolute;
  top:5px;
  right:5px;
  margin:0px 5px;
  text-align: right;
  color: white;
  font-size: 0.7em;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-shadow: 0px 0px 5px black;
}

.thumbnail-header {
  color: white;
  width: 100%;
  font-size: 0.7rem;
  padding: 4px 8px;
}

.item-thumbnails {
  position: relative;
  display: inline-block;
  height: 45px;
}

.thumbnail-images {
  width: 100px;
  position: absolute;
  height: 45px;
}

.bordered {
  border: 1px solid rgb(68, 68, 68);
  // background-color: rgba(68, 68, 68, 0.5);
  border-radius: 5px;
}

#expand-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 3px;
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }
}

.wrapper {
  position:relative;
  width: 150px;
  overflow-wrap:break-word;
}

.overlay {
  position:absolute;
  top:0;
  left:75%;
}

.slider-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5em;
  margin-top: 2px;
}
.switch {
  // moving toggle
  --toggle-size: 0.77em;
  --slider-height: calc(var(--toggle-size) * 1.3);
  --toggle-bottom-gap: calc((var(--slider-height) - var(--toggle-size))/2);
  --toggle-left-gap: var(--toggle-bottom-gap);
  --slider-width: calc(2*(var(--toggle-left-gap) + var(--toggle-size)));
  --translateX: var(--toggle-size);

  position: relative;
  display: flex;
  width: var(--slider-width);
  height: var(--slider-height);
}

.switch input { 
  visibility: hidden;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: var(--slider-height);
}

.slider:before {
  position: absolute;
  content: "";
  height: var(--toggle-size);
  width: var(--toggle-size);
  left: var(--toggle-left-gap);
  bottom: var(--toggle-bottom-gap);
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(var(--translateX));
  -ms-transform: translateX(var(--translateX));
  transform: translateX(var(--translateX));
}

#expand-icon {
  color: var(--ephemeris-color);
  margin:10px;
}


</style>
