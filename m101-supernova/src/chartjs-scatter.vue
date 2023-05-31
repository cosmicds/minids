<!-- Vue component for plotting a scatter plot of x,y data in Chart.js -->
<template>
    <div id="plot">
      <canvas id="chartjs" class="chartjs"></canvas>
    </div>
    
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Chart from "chart.js/auto"; 
import { ChartItem } from "chart.js";

export default defineComponent({
  name: "chartjsScatter",

  data() {
    return {
      chart: null as ChartItem | null,
      canvasel: null as HTMLCanvasElement | null,
    };
  },
  
  props: {
    data: {
      type: Array as PropType<{ x: Date | number; y: number }[]>,
      required: true,
      // fill in some default data
      default: () =>
        [
          { x: (new Date("2020-01-01")).getTime(), y: 1 },
          { x: (new Date("2020-01-02")).getTime(), y: 2 },
          { x: (new Date("2020-01-03")).getTime(), y: 3 },
          { x: (new Date("2020-01-04")).getTime(), y: 4 },
          { x: (new Date("2020-01-05")).getTime(), y: 5 },
          { x: (new Date("2020-01-06")).getTime(), y: 6 },
          { x: (new Date("2020-01-07")).getTime(), y: 7 },
          { x: (new Date("2020-01-08")).getTime(), y: 8 },
          { x: (new Date("2020-01-09")).getTime(), y: 9 },
          { x: (new Date("2020-01-10")).getTime(), y: 10 }
        ]

    },

    keys: {
      type: Object as PropType<{ x: string; y: string }>,
      required: false,
      default: () => ({ x: "x", y: "y" }),
    },

    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },

    xrange: {
      type: Array<number>,
      required: true,
    },

    yrange: {
      type: Array<number>,
      required: false,
      default: () => null as unknown as Array<number>,
    },

    line: {
      type: Boolean,
      required: false,
      default: false,
    },

    animation: {
      type: Boolean,
      required: false,
      default: true,
    },

    reversedY: {
      type: Boolean,
      required: false,
      default: false,
    },

    reversedX: {
      type: Boolean,
      required: false,
      default: false,
    },

    hideXAxis: {
      type: Boolean,
      required: false,
      default: false,
    },

    hideYAxis: {
      type: Boolean,
      required: false,
      default: false,
    },

    scatterOptions: {
      type: Object,
      required: false,
      default: () => ({}),
    },

    lineOptions: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    
    
  },
  mounted() {
    this.draw();

  },
  methods: {
    
    draw() {
      
      const ctx = this.$el.querySelector("#chartjs");
      
      if (this.chart) {
        const oldChart = Chart.getChart(ctx as HTMLCanvasElement);
        if (oldChart) {
          oldChart.destroy();
        }
      }

      this.chart = new Chart(ctx, {
  
        data: this.chartData,
        options: this.chartOptions,
        
      });

      return ;
    },
    
  },

  computed: {

    // check if data.x is a timeseries
    isDate() {
      return this.data[0].x instanceof Date;
    },
    
    computedData() {

      if (this.data.length == 0) {
        return [{ x: 0, y: 0 }];
      }
      
      const data = this.data.map(d => (
        {
          x: d[this.keys['x'] as keyof typeof d],
          y: d[this.keys['y'] as keyof typeof d]
        }));
        
      if (this.data[0].x instanceof Date) {
        console.log("is a date");
        return data.map(d => ({ x: (d.x as Date).getTime(), y: d.y }));
      } 

      return data;
    },

    computedYRange() {
      if (this.yrange == null) {
        const y = this.computedData.map(d => d.y as number);
        return [Math.min(...y), Math.max(...y)].sort();
      } else {
        return this.yrange;
      }
    },
    

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartData(): any {
      // https://www.chartjs.org/docs/latest/configuration/elements.html#point-configuration
      const scatterData = {
        type: 'scatter',
        label: 'Supernove Lightcurve',
        data: this.computedData,
        radius: 3, // Chart.js default
        pointStyle: 'circle', // Chart.js default
        ...this.scatterOptions
      };
      const lineData = {
        type: 'line',
        label: 'Supernove Lightcurve',
        data: this.computedData,
        ...this.scatterOptions,
        ...this.lineOptions
      };

      if (this.line) {
        return { datasets: [ lineData] };
      } else {
        return { datasets: [scatterData] };
      }

    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartOptions(): any {
      const options =  {
        animation: this.animation,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: !this.hideXAxis,
            type: 'linear' ,
            min: this.xrange[0],
            max: this.xrange[1],
            reverse: this.reversedX
            // position: "bottom", // axis is along the bottom
          },

          y: {
            display: !this.hideYAxis,
            reverse: this.reversedY,
            min: this.computedYRange[0],
            max: this.computedYRange[1],
          }
        },

        plugins: {
          legend: {
            display: false
          }
        }
      };

      
      
      return options;
    }
    
  },

  // what data and update the chart as it changes
  watch: {
    data() {
      this.draw();
    },
      
  },
  
});

</script>

<style scoped lang="less">


#plot {
  // display: flex;
  // border: 2px solid orange;
  width: 100%;
  height: 100%;
}

.chartjs {
  border: 20px solid greenyellow;
  width: 100%;
  height: 100%;
}

</style>
