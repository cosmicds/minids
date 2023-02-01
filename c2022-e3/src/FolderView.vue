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
            />
            <div
              class="item-name"
              @click="() => selectItem(item)"
            >
              {{item.get_name()}}
            </div>
            <input
              v-if="sliders"
              class="opacity-range"
              type="range"
              value="100"
              @input="(e) => onSliderInputChanged(e, item)"
            />
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
  },

  data() {
    return {
      items: [] as Thumbnail[],
      lastSelectedItem: null as Thumbnail | null,
      opacities: {} as Record<string,number>,
      expanded: true
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
      this.lastSelectedItem = item;
      if (item instanceof Folder || item instanceof FolderUp) {
        this.items = item.get_children() ?? [];
      } else {
        this.$emit('select', item);
      }
    },
    onSliderInputChanged(e: Event, item: Thumbnail) {
      this.$emit('opacity', item, (e.target as HTMLInputElement).value)
    }
  },

  computed: {
    cssVars() {
      return {
        "--flex-direction": this.flexDirection
      }
    },
  },
});
</script>

<style scoped lang="less">
.fv-root {
  display: flex;
  flex-direction: var(--flex-direction);
  width: auto;
  overflow-x: auto;
  overflow-y: hidden;
  pointer-events: auto;
  background: black;
  &::-webkit-scrollbar {
    padding: 1px;
    height: 3px;
  }
  &::-webkit-scrollbar-track {
    background: black;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(4, 129, 187, 0.5);
    border-radius: 2px;
  }
  //width: 100%;
  //justify-content: space-around;
}

#items {
  height: 100%;
  overflow-y: auto;
}

.item {
  display: flex;
  flex-direction: column;
  padding: 3px;
  width: 100%;
  cursor: pointer;
  pointer-events: auto;
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
  border: 1px solid #444;
  border-radius: 2px;
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
</style>
