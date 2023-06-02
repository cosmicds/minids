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

    lineData: {
      type: Array as PropType<{ x: Date | number; y: number }[]>,
      required: false,
      default: () => [],
    },

    keys: {
      type: Object as PropType<{ x: string; y: string }>,
      required: false,
      default: () => ({ x: "x", y: "y" }),
    },

    width: {
      type: Number,
      required: false,
    },
    height: {
      type: Number,
      required: false,
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

    scatter: {
      type: Boolean,
      required: false,
      default: false,
    },

    animation: {
      type: Boolean,
      required: false,
      default: true,
    },

    maintainAspectRatio: {
      type: Boolean,
      required: false,
      default: false,
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

    color: {
      type: String,
      required: false,
      default: null,
    },

    borderColor: {
      type: String,
      required: false,
      default: null,
    },
    
    lineOptions: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    
    
  },
  mounted() {
    this.draw();

    new ResizeObserver(() => {
      this.draw();
    }).observe(this.$el);

  },
  methods: {

    getKey(obj: { [key: string]: unknown}  , key: string, defaultKey: string | null = null) {
      // check if obj has key
      if (key in obj) {
        return obj[key as keyof typeof obj];
      } else if (defaultKey != null && defaultKey in obj) {
        return obj[defaultKey as keyof typeof obj];
      }
    },
    
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

      this.x0;

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
        return [{ x: null, y: null }];
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

    computedLineData() {
      if (this.line) {
        if (this.lineData.length == 0) {
          return this.computedData;
        } else {
          return this.lineData.map(d => (
            {
              x: this.getKey(d, this.keys['x'], 'x'),
              y: this.getKey(d, this.keys['y'], 'y'),
            }));
        }
      }
      return [{ x: null, y: null}];
    },

    computedYRange() {
      if (this.yrange == null) {
        const y = this.computedData.map(d => d.y as number);
        return [Math.min(...y), Math.max(...y)];
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
        backgroundColor: this.color,
        borderColor: this.borderColor,
        ...this.scatterOptions
      };
      const lineData = {
        type: 'line',
        label: 'Supernove Lightcurve',
        data: this.computedLineData,
        backgroundColor: 'transparent',
        radius: 0,
        borderColor: this.color,
        ...this.lineOptions
      };

      let outData = [];


      if (this.scatter) {
        outData.push(scatterData);
      }
      
      if (this.line) {
        outData.push(lineData);
      }
      
      if (outData.length == 0) {
        outData = [scatterData, lineData];
      }
      
      return { datasets: outData };

    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartOptions(): any {
      const options =  {
        animation: this.animation,
        responsive: true,
        maintainAspectRatio: this.maintainAspectRatio,
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
            type: 'linear',
            reverse: this.reversedY,
            min: this.computedYRange[0],
            max: this.computedYRange[1],
            title: {
              display: true,
              text: "Brightness",
              color: 'white',
            },
            border: {
              display: true,
              color: 'white',
              width: 2,
              // top: false,
              // bottom: false,
              // left: false,
              // right: false
            },
            grid: {
            },
            ticks: { // https://www.chartjs.org/docs/latest/axes/styling.html#tick-configuration
              display: false,
              stepSize: 1,
              autoSkip: true,
            }
          }
        },

        plugins: {
          legend: {
            display: false
          }
        }
      };

      
      return options;
    },

    // get the x-pixel postion of the first data point
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    x0(): any {
      if (this.chart == null) {
        return;
      }
      const chart = this.chart as Chart;
      if (this.computedData[0].x == null) {
        return;
      }
      
      const val = chart.scales.x.getPixelForValue(this.chartOptions.scales.x.min as number);
      console.log(val);
      if (isNaN(val)) {
        return ;
      }
      this.$emit("offset", val);
      return val;

    },
    
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
  position: relative;
  // border: 2px solid greenyellow;
  width: 100%;
  max-height: 20dvh;
  height: 100%;
}

.chartjs {
  // border: 1px solid #eee;
  width: 100%;
}

</style>
