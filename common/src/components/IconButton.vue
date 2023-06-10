<template>
  <v-tooltip
    v-model="tooltip"
    :location="tooltipLocation"
    :open-on-click="tooltipOnClick"
    :open-on-focus="tooltipOnFocus"
    :open-on-hover="tooltipOnHover"
    :offset="tooltipOffset"
    :disabled="!tooltipText"
  >
    <template v-slot:activator>
      <div
        :class="['icon-wrapper', {'active': modelValue}]"
        @click="updateValue"
        :style="cssVars"
      >
        <slot name="button">
          <font-awesome-icon
            v-if="faIcon"
            :icon="faIcon"
            size="lg"
            class="fa-icon"
          ></font-awesome-icon>
        </slot>
      </div>
    </template>
    <span>{{ tooltipText }}</span>
  </v-tooltip>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VTooltip } from "vuetify/components/VTooltip";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

export default defineComponent({

  components: {
    'v-tooltip': VTooltip,
    'font-awesome-icon': FontAwesomeIcon
  },

  props: {
    modelValue: { type: Boolean, required: false },
    faIcon: { type: String, required: false },
    color: { type: String, default: "#ffffff" },
    focusColor: { type: String, default: "#ffffff" },
    backgroundColor: { type: String, default: "#040404" },
    tooltipText: { type: String, required: false },
    tooltipLocation: { type: String, default: "start" },
    tooltipOnClick: { type: Boolean, default: true },
    tooltipOnFocus: { type: Boolean, default: true },
    tooltipOnHover: { type: Boolean, default: true },
    tooltipOffset: { type: String, default: "0" },
    padding: { type: String, default: "6px" },
    borderRadius: { type: String, default: "20px" }
  },

  methods: {
    updateValue() {
      if (this.modelValue === undefined) { return; }
      this.active = !this.active;
      this.$emit('update:modelValue', this.active); 
    }
  },

  data() {
    return {
      active: false,
      tooltip: false,
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
        "--padding": this.padding,
        "--border-radius": this.borderRadius
      };
    }
  }

});
</script>

<style lang="less">
.icon-wrapper {
  color: var(--color);
  border-color: var(--color);
  background: var(--background-color);
  padding: var(--padding);
  border: 1px solid var(--color);
  display: flex;
  align-items: center;
  pointer-events: auto;
  border-radius: var(--border-radius);

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: var(--focus-color);
    border-color: var(--focus-color);
  }
}

.active { 
  box-shadow: 0px 0px 10px 3px var(--color);
}
</style>
