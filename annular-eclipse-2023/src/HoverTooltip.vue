<template>
  <v-tooltip
    v-model="tooltip"
    :location="tooltipLocation as LocationType"
    :open-on-click="tooltipOnClick"
    :open-on-focus="tooltipOnFocus"
    :open-on-hover="tooltipOnHover"
    :offset="tooltipOffset"
    :disabled="!tooltipText || !showTooltip"
    v-bind="$attrs"
  >
    <template v-slot:activator="{ props }: { props: Record<string,any> }">
      <div
        v-bind="props"
        :id="buttonID"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <slot name="target">
          
        </slot>
      </div>
    </template>
    <slot>
      <span>{{ tooltipText }}</span>
    </slot>
  </v-tooltip>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VTooltip } from "vuetify/components/VTooltip";


declare const block: readonly ["top", "bottom"];
declare const inline: readonly ["start", "end", "left", "right"];
type Tblock = typeof block[number];
type Tinline = typeof inline[number];
type Anchor = Tblock | Tinline | 'center' | 'center center' | `${Tblock} ${Tinline | 'center'}` | `${Tinline} ${Tblock | 'center'}`;

type LocationType = NonNullable<Anchor>;

export default defineComponent({

  components: {
    'v-tooltip': VTooltip,
  },

  inheritAttrs: false,

  props: {

    longPressTimeMs: { type: Number, default: 500 },
    tooltipText: { type: String, required: false },
    tooltipLocation: { type: String, default: "start" as LocationType},
    tooltipOnClick: { type: Boolean, default: false },
    tooltipOnFocus: { type: Boolean, default: false },
    tooltipOnHover: { type: Boolean, default: true },
    tooltipOffset: { type: [String, Number], default: 0 },
    showTooltip: { type: Boolean, default: true },
  },

  methods: {

    handleTouchStart() {
      this.longPressTimeout = setTimeout(() => {
        this.tooltip = true;
      }, this.longPressTimeMs);
    },

    handleTouchEnd() {
      if (this.longPressTimeout) {
        clearTimeout(this.longPressTimeout);
        this.longPressTimeout = null;
      }
      this.tooltip = false;
    }
  },

  data() {
    return {
      tooltip: false,
      longPressTimeout: null as ReturnType<typeof setTimeout> | null
    };
  },

  // Since our colors are used in compound values like e.g. box-shadows,
  // we need to directly bind to CSS variables
  computed: {

    buttonID() {
      const id = this.$attrs['id'];
      return id ? `${id}-button` : undefined;
    },
  }

});
</script>

<style lang="less">


</style>
