<template>
  <div
    class="fv-root"
    v-if="items !== null"
    :style="cssVars"
  >
    <div
      :class="['item', lastSelectedItem === item ? 'selected' : '']"
      v-for="item of items"
      :key="item.get_name()"
      :title="item.get_name()"
      @click="() => selectItem(item)"
    >
      <img :src="item.get_thumbnailUrl()" :alt="item.get_name()" />
      <div
        class="item-name"
      >{{item.get_name()}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Folder, FolderUp, Place, Imageset } from "@wwtelescope/engine";
import { GotoTargetOptions } from "@wwtelescope/engine-helpers";
import { ImageSetType, Thumbnail } from "@wwtelescope/engine-types";
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
    startFirstSelected: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      items: [] as Thumbnail[],
      lastSelectedItem: null as Thumbnail | null
    }
  },

  created() {
    for (const c of this.rootFolder.get_children() ?? []) {
      if (c instanceof Place) {
        this.items.push(c);
      }
    }
    if (this.startFirstSelected && this.items?.length > 0) {
      this.selectItem(this.items[0]);
    }
  },

  methods: {
    selectItem(item: Thumbnail): void {
      this.lastSelectedItem = item;
      if (item instanceof Folder || item instanceof FolderUp) {
        this.items = item.get_children() ?? [];
      } else if (item instanceof Imageset) {
        const type = item.get_dataSetType();
        this.setForegroundImageByName(item.get_name());
        if (type === ImageSetType.planet) {
          this.setBackgroundImageByName(item.get_name());
        }
      } else if (item instanceof Place) {
        const imageset = item.get_backgroundImageset();
        if (imageset !== null) {
          this.setForegroundImageByName(imageset.get_name());
        }
        this.gotoTarget({
          place: item,
          noZoom: false,
          instant: false,
          trackObject: true
        });
      }
    }
  },

  computed: {
    cssVars() {
      return {
        "--flex-direction": this.flexDirection
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
  background: black;
  &::-webkit-scrollbar {
    padding: 1px;
    height: 3px;
  }
  &::-webkit-scrollbar-track {
    background: black;
  }
  &::-webkit-scrollbar-thumb {
    background: white;
    border-radius: 1px;
  }
  //width: 100%;
  //justify-content: space-around;
}
.item {
  padding: 3px;
  border: 1px solid #444;
  border-radius: 2px;
  width: ~"min(96px, 16vw)";
  cursor: pointer;
  pointer-events: auto;
  & img {
    width: 100%;
    height: ~"min(45px, 7.5vw)";
    object-fit: cover;
    border-radius: 2px;
  }
  &.selected {
    border: 1px solid dodgerblue;
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
</style>