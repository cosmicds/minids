<!-- this v-checkbox based component that toggles a boolean. -->
<template>
  <div 
    v-if="show" 
    class="toggle">
    <div class="toggle__checkboxes">
      <v-checkbox
        :color="color"
        :label="label"
        v-model="selected"
        @keyup.enter="() => {selected = !selected; onChange();}"
        @change="onChange"
        hide-details
        >
      </v-checkbox>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, } from "vue";


export default defineComponent({

  name: 'Toggle',
  props: {

    show: {
      type: Boolean,
      default: true
    },
    
    label: {
      type: String,
      required: true,
    },
    item: {
      type: Boolean,
      required: true,
    },
    color: {
      type: String,
      required: true,
      default: 'white',
    },
  },
  
  data() {
    return {
      selected: this.item,
    };
  },
  methods: {
    onChange() {
      this.$emit('toggle', this.selected );
    },
  },
});
</script>


<style scoped lang="less">

</style>