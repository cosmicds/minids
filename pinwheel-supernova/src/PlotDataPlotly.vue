<!-- Vue component for plotting a scatter plot of x,y data in plotly -->
<template>
  <div id="plot">
    <div id="plotly"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
// eslint-disable-next-line
// import Plotly from "plotly.js"; 
// eslint-disable-next-line @typescript-eslint/no-var-requires

export default defineComponent({
  name: "PlotDataPlotly",
  props: {
    data: {
      type: Array as PropType<{ x: Date; y: number }[]>,
      required: false,
      // fill in some default data
      default: () =>
        [
          { x: new Date("2020-01-01"), y: 1 },
          { x: new Date("2020-01-02"), y: 2 },
          { x: new Date("2020-01-03"), y: 3 },
          { x: new Date("2020-01-04"), y: 4 },
          { x: new Date("2020-01-05"), y: 5 },
          { x: new Date("2020-01-06"), y: 6 },
          { x: new Date("2020-01-07"), y: 7 },
          { x: new Date("2020-01-08"), y: 8 },
          { x: new Date("2020-01-09"), y: 9 },
          { x: new Date("2020-01-10"), y: 10 }
        ]

    },

    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
  },
  mounted() {
    // width and height of #d3 element should be set here to be props passed in
    this.draw();

  },
  methods: {
    draw() {
      console.log('plotly', this.data);
      // const el  = this.$el.querySelector("#plotly");
      // Plotly.newPlot(el, [{
      //   x: this.data.map(d => d.x),
      //   y: this.data.map(d => d.y),
      //   mode: 'markers',
      //   type: 'scatter'
      // }], {
      //   margin: { t: 0 }
      // });
      // console.log(Plotly);
      
      return ;
      // return Plotly.newPlot('plotly', [{
      //   x: this.data.map(d => d.x),
      //   y: this.data.map(d => d.y)
      // }], {
      //   margin: { t: 0 }
      // });
    },
  },
});

</script>

<style scoped lang="less">

</style>
