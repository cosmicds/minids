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
        class="icon-wrapper"
      >
        <slot name="button">
          <font-awesome-icon
            v-if="faIcon"
            :icon="faIcon"
            size="lg"
            :class="['fa-icon', {'active': modelValue}]"
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
    tooltipOffset: { type: String, default: "0" }
  },

  data() {
    return {
      tooltip: false
    };
  },

  methods: {
    updateValue() {
      this.$emit('update:modelValue', !this.modelValue); 
    }
  }

});
</script>

<style lang="less">
.icon-wrapper {
  color: v-bind(color);
  border-color: v-bind(color);
  background: v-bind(backgroundColor);
  padding: .5em 1em;
  border: 1px solid v-bind(color);
  display: flex;
  align-items: center;
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    color: v-bind(focusColor);
    border-color: v-bind(focusColor);
  }
}

.active { 
  box-shadow: 0px 0px 10px 3px v-bind(color);
}
</style>
