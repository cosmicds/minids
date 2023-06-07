<!-- Vue component for plotting a scatter plot of x,y data in d3 -->
<template>
  <div id="plot">
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import * as d3 from "d3";

export default defineComponent({
  name: "PlotDataD3",

  data() {
    return {
      margins: {top: 0, right: 0, bottom: 0, left: 0},
    };
  },  
  
  props: {
    data: {
      type: Array as PropType<{ x: Date | number; y: number }[]>,
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

    scatter: {
      type: Boolean,
      required: false,
      default: false,
    },

    line: {
      type: Boolean,
      required: false,
      default: false,
    },

    xrange: {
      type: Array<number>,
      required: false,
      default: () => [],
    },

    yrange: {
      // type is a tuple of length 2
      type: Array<number>,
      required: false,
      default: () => [],
    },

    reversedX: {
      type: Boolean,
      required: false,
      default: false,
    },

    reversedY: {
      type: Boolean,
      required: false,
      default: false,
    },

    cssVars: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    
    width: {
      type: Number,
      required: false,
      default: 500,
    },

    height: {
      type: Number,
      required: false,
      default: 500,
    },

    margin: {
      type: Object as PropType<{ top: number; right: number; bottom: number; left: number }>,
      required: false,
      default: null,
    }

    
    
  },


  
  mounted() {

    this.draw();
    this.$emit("offset", this.x0Pixel());
    // create resize watcher
    new ResizeObserver(() => {

      if (this.$el.querySelector("svg") != null) {
        d3.select("#plot").selectAll("svg").remove();
        this.draw();
        this.$emit("offset", this.x0Pixel());
      }
      
    });

    // add cssVars to #plot style
    const plot = this.$el.querySelector("#plot");
    for (const [key, value] of Object.entries(this.cssVars)) {
      plot.style.setProperty(key, value);
    }
    
  },
  
  methods: {

    xScale(range: Array<number | Date>, width: number): d3.ScaleTime<number, number> | d3.ScaleLinear<number, number> {
      if (this.computedData[0].x instanceof Date || range[0] instanceof Date) {
        return d3
          .scaleTime()
          .domain(range)
          .range(this.reversedX ? [width, 0] : [0, width]);
      } else {
        return d3
          .scaleLinear()
          .domain(range)
          .range(this.reversedX ? [width, 0] : [0, width]);
      }
    },

    yScale(range: Array<number>, height: number): d3.ScaleLinear<number, number> {
      return d3
        .scaleLinear()
        .domain(range) 
        .range(this.reversedY ? [0, height] : [height, 0]);
    },

    x0Pixel(): number {
      // get the x pixel value of the origin
      const width = this.width - this.margins.left - this.margins.right;
      const x = this.xScale(this.computedXrange, width);
      const zero = this.computedXrange[0];
      return x(zero);


      
    },
    
    draw() {

      if (this.margin == null) {
        this.margins = { top: 20, right: 20, bottom: 30, left: 40 };
      } else {
        this.margins = this.margin;
      }
      
      const width = this.width - this.margins.left - this.margins.right;
      const height = this.height - this.margins.top - this.margins.bottom;

      
      const data = this.computedData;
      const x = this.xScale(this.computedXrange, width);
      const y = this.yScale(this.computedYrange, height);

      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y);

      const svg = d3
        .select("#plot")
        .append("svg")
        .attr("viewBox", `0 0 ${this.width} ${this.height}`)
        .append("g")
        .attr("transform", `translate(${this.margins.left}, ${this.margins.top})`);

      if (!this.hideXAxis) {
        svg
          .append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis);
      }

      if (!this.hideYAxis) {
        svg
          .append("g")
          .attr("class", "y-axis")
          .call(yAxis);
      }

      // if (this.data.length == 0) {
      //   return;
      // }
      
      if (this.scatter && this.data.length > 0) {
        svg.append("g")
          .selectAll(".dot")
          .data(data.map(d => [d.x, d.y]))
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("r", 3.5)
          .attr("cx", (d) => x(d[0]))
          .attr("cy", (d) => y(d[1]))
          .style("fill", "steelblue");
      }

      if (this.line && this.lineData.length > 0) {
        const line = d3.line()
          .x((d) => x(d[0]))
          .y((d) => y(d[1]));

        svg.append("path")
          .datum(this.computedLineData.map(d => [d.x, d.y]))
          .attr("class", "line")
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          .attr("d", line as any)
          .style("stroke", "steelblue")
          .style("fill", "none");
      }
      
    },

    getKey(obj: { [key: string]: unknown}  , key: string, defaultKey: string | null = null): unknown {
      // check if obj has key
      if (key in obj) {
        return obj[key as keyof typeof obj];
      } else if (defaultKey != null && defaultKey in obj) {
        return obj[defaultKey as keyof typeof obj];
      }
    },
    
  },

  computed: {
    


    computedData(): Array<{ x: Date | number; y: number }> {

      if (this.data.length == 0) {
        return [{x: null as unknown as number, y: null as unknown as number}];
      }
      
      const data = this.data.map(d => (
        {
          x: this.getKey(d, this.keys['x'], 'x') as Date | number,
          y: this.getKey(d, this.keys['y'], 'y') as number,
        }));

      return data;
    },

    computedLineData(): Array<{ x: Date | number; y: number }>  {
      if (this.line) {
        if (this.lineData.length == 0) {
          return this.computedData;
        } else {
          return this.lineData.map(d => (
            {
              x: this.getKey(d, this.keys['x'], 'x') as Date | number,
              y: this.getKey(d, this.keys['y'], 'y') as number,
            }));
        }
      }
      return [{ x: 0, y: 0 }];
    },

    // should output an array of length 2 with generic type
    computedXrange(): Array<number | Date> {
      if (this.xrange.length > 0) {
        return this.xrange as Array<number | Date>;
      } else {
        return d3.extent(this.computedData.map(d => d.x)) as Array<number | Date>;
      }
    },

    computedYrange(): [number, number] {
      if (this.yrange.length > 0) {
        return this.yrange as [number, number];
      } else {
        return d3.extent(this.computedData.map(d => d.y as number)) as [number, number];
      }
    },

    
  },

  watch: {
    data() {

      if (this.$el.querySelector("svg") != null) {
        d3.select("#plot").selectAll("svg").remove();
      }
      this.draw();
    },
  },
  
});
</script>


<style lang="less">
circle.dot {
  fill: steelblue;
  stroke: white;
  stroke-width: 2px;
}

circle.dot:hover {
  fill: red;
}

</style>

<style scoped lang="less">

#plot {
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  border: 1px solid blue;
  pointer-events: auto;
  
}






</style>
