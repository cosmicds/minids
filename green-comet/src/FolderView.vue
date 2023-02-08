<template>
  <div
    class="fv-root"
    :style="cssVars"
  >
    <div
      v-if="expandable"
      id="expand-row"
      class="bordered"
      @click="expanded = !expanded"
    >
      <div class="wrapper">
        <img
          src="https://github.com/cosmicds/cds-website/raw/main/public/comet_c2022-e3/thumbnails/694_2022E3_14_01_23.jpg"
        />
        <div class="item-name">
          Press <span v-if="thumbnails">image</span><span v-else>date</span> to go to image
        </div>
        <div class="overlay">
          <font-awesome-icon
            icon="images"
          />
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
            :title="item.get_name()"
          >
            <img
              v-if="thumbnails"
              :src="item.get_thumbnailUrl()"
              :alt="item.get_name()"
              @click="() => selectItem(item)"
            />
            <div
              class="item-name"
              :class="['thumbnail']"
              @click="() => selectItem(item)"
            >
              {{item.get_name()}}
            </div>
            <div class="slider-container">
            <input
              v-if="sliders"
              class="opacity-range"
              type="range"
              value="0"
              @input="(e) => onSliderInputChanged(e, item)"
            />
            
<!--
              <label class="switch">
                <input 
                  type="checkbox"
                  :title="item.get_name()"
                  @change="(e) => onToggleImage(e, item)"
                  >
                <span class="slider"></span>
              </label>  -->
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
    }
    
  },

  data() {
    return {
      items: [] as Thumbnail[],
      lastSelectedItem: null as Thumbnail | null,
      opacities: {} as Record<string, number>,
      expanded: this.open,
      lastOpacityChanged: null as Thumbnail | null
    }
  },

  created() {
    this.populate();
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
    selectItem(item: Thumbnail): void {
      console.log("FolderView: item selected")
      this.lastSelectedItem = item;
      if (item instanceof Folder || item instanceof FolderUp) {
        this.items = item.get_children() ?? [];
      } else {
        this.$emit('select', item);
      }
    },
    onSliderInputChanged(e: Event, item: Thumbnail) {
      console.log("FolderView: slider changed")
      let move = true
      if (this.lastOpacityChanged == item) {
        move = false
      } else {
        this.lastOpacityChanged = item;
      }
      this.$emit('opacity', item, (e.target as HTMLInputElement).value, move)
    },

    onToggleImage(e: Event, item: Thumbnail) {
      console.log("FolderView: toggled")
      this.$emit('toggle', item, (e.target as HTMLInputElement).checked)
    }
  },

  computed: {
    cssVars() {
      return {
        "--flex-direction": this.flexDirection
      }
    },

    isMobile() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
      }
    },
  },

  watch: {
    incomingItemSelect() {
      if (this.incomingItemSelect != null) {
        this.lastSelectedItem = this.incomingItemSelect;
      }
    }
  }
});
</script>

<style scoped lang="less">
.fv-root {
  display: flex;
  flex-direction: var(--flex-direction);
  width: auto;
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
  margin: .35em 0;
  & img {
    width: 100%;
    height: ~"min(45px, 7.5vw)";
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

.item-name {
  color: white;
  width: 100%;
  font-size: 7pt;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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
  position:relative
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


</style>
