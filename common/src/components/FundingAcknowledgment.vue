<template>
  <div id="funding-acknowledgment">
    The material contained in this product is based upon work supported by NASA under cooperative agreement award No. 80NSSC21M0002. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the authors and do not necessarily reflect the views of the National Aeronautics and Space Administration.
  </div>
</template>


<script lang="ts">
import { defineComponent, } from "vue";

export default defineComponent({


  props: {
    visible: {
      type: Boolean,
      default: true
    },
  },

  data() {
    return {    };
  },

  created() {
    return;
  },

  methods: {
    
  },

  computed: { 

  },

  watch: {
  }
});
</script>


<style lang="less">

#funding-acknowledgment {
  color: white;
  background-color: #0c3d91;
  font-size: calc(0.8em + 0.1vw + 0.1vh);
  line-height: calc(1em + 0.3vw + 0.3vh);
  padding-inline: 1em;
  padding-block: 0.7em;
  justify-self: flex-end;
  align-self: flex-end;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;

}

</style>