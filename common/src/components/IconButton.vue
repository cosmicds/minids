<template>
  <v-tooltip
    v-model="tooltip"
    :location="tooltipLocation"
    :open-on-click="tooltipOnClick"
    :open-on-focus="tooltipOnFocus"
    :open-on-hover="tooltipOnHover"
    :offset="tooltipOffset"
    :disabled="!tooltipText || !showTooltip"
  >
    <template v-slot:activator="{ props }: { props: Record<string,any> }">
      <div
        v-bind="props"
        :id="buttonID"
        :class="['icon-wrapper', {'active': modelValue}]"
        @click="handleAction"
        @keyup.enter="handleAction"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        :style="cssVars"
        tabindex="0"
      >
        <slot name="button">
          <font-awesome-icon
            v-if="faIcon"
            :icon="faIcon"
            :size="faSize"
            :class="['fa-icon', faIcon]"
          ></font-awesome-icon>
          <v-icon
            v-if="mdIcon"
            :size="mdSize"
            :class="['md-icon', mdIcon]"
          >{{ `mdi-${mdIcon}` }}
        </v-icon>
        </slot>
      </div>
    </template>
    <span>{{ tooltipText }}</span>
  </v-tooltip>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VTooltip } from "vuetify/components/VTooltip";
import { VIcon } from "vuetify/components/VIcon";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import type { FontAwesomeIconProps } from "@fortawesome/vue-fontawesome/";

type SizeType = Extract<FontAwesomeIconProps, 'size'>;

export default defineComponent({

  components: {
    'v-tooltip': VTooltip,
    'v-icon': VIcon,
    'font-awesome-icon': FontAwesomeIcon
  },

  props: {
    modelValue: { type: Boolean, required: false },
    faIcon: { type: String, required: false, default: null},
    mdIcon: { type: String, required: false, default: null},
    color: { type: String, default: "#ffffff" },
    focusColor: { type: String, default: "#ffffff" },
    backgroundColor: { type: String, default: "#040404" },
    boxShadow: { type: Boolean, default: true },
    border: { type: Boolean, default: true },
    longPressTimeMs: { type: Number, default: 500 },
    tooltipText: { type: String, required: false },
    tooltipLocation: { type: String, default: "start" },
    tooltipOnClick: { type: Boolean, default: false },
    tooltipOnFocus: { type: Boolean, default: false },
    tooltipOnHover: { type: Boolean, default: true },
    tooltipOffset: { type: [String, Number], default: 0 },
    showTooltip: { type: Boolean, default: true },
    faSize: { type: String as SizeType, default: 'lg' }, // fa: lg, md: 20px
    mdSize: { type: String, default: '1.25em' } // fa: lg, md: 20px
  },

  methods: {
    updateValue() {
      if (this.modelValue === undefined) { return; }
      this.$emit('update:modelValue', !this.modelValue); 
    },

    handleAction() {
      this.updateValue();
      this.$emit('activate');
    },

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
    cssVars() {
      return {
        "--color": this.color,
        "--background-color": this.backgroundColor,
        "--focus-color": this.focusColor,
        "--active-shadow": this.boxShadow ? this.color : 'transparent',
        "--focus-shadow": this.boxShadow ? this.focusColor : 'transparent',
      };
    },

    buttonID() {
      const id = this.$attrs['id'];
      return id ? `${id}-button` : null;
    }
  }

});
</script>

<style lang="less">
.icon-wrapper {
  color: var(--color);
  border-color: var(--color);
  background: var(--background-color);
  padding: 6px 8px;
  border: 1px solid var(--color);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  border-radius: 20px;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: var(--focus-color);
    border-color: var(--focus-color);
  }

  &.active {
    box-shadow: 0px 0px 10px 3px var(--active-shadow);

    &:focus {
      box-shadow: 0px 0px 10px 3px var(--focus-shadow);
    }
  }
}
</style>
