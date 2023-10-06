import Vue, { createApp } from "vue";

import M101SN from "./M101SN.vue";
import FolderView from "./FolderView.vue";
import Credits from "./Credits.vue";
import Toggle from "./Toggle.vue";
import TransitionExpand from "./TransitionExpand.vue";
import chartjsScatter from "./chartjs-scatter.vue";
import d3Scatter from "./d3-scatter.vue";
// import PlotDataPlotly from "./PlotDataPlotly.vue";
import ConstellationIcon from "./ConstellationIcon.vue";
import { IconButton } from "@minids/common";
import { FundingAcknowledgment } from "@minids/common";

import { Gallery } from "@minids/common";

import "./polyfills";

import VueSlider from "vue-slider-component";
import 'vue-slider-component/theme/default.css';

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import vuetify from "../plugins/vuetify";

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCircle,
  faSquare,
  faBookOpen,
  faChevronDown,
  faChevronUp,
  faGear,
  faLocationPin,
  faClock,
  faPause,
  faPlay,
  faTimes,
  faVideo,
  faCameraRetro,
  faImages,
  faRefresh,
  faStar,
  faChartLine,
  faCircleXmark,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

library.add(faCircle);
library.add(faSquare);
library.add(faBookOpen);
library.add(faLocationPin);
library.add(faClock);
library.add(faTimes);
library.add(faVideo);
library.add(faChevronDown);
library.add(faChevronUp);
library.add(faCameraRetro);
library.add(faImages);
library.add(faGear);
library.add(faPause);
library.add(faPlay);
library.add(faRefresh);
library.add(faStar);
library.add(faChartLine);
library.add(faCircleXmark);
library.add(faArrowRight);


import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { faConstellation } from "./assets/constellation_icon";
library.add(faConstellation as IconDefinition);

import { WWTComponent, wwtPinia } from "@wwtelescope/engine-pinia";

import Notifications from '@kyvg/vue3-notification';

import "leaflet/dist/leaflet.css";

/** v-hide directive taken from https://www.ryansouthgate.com/2020/01/30/vue-js-v-hide-element-whilst-keeping-occupied-space/ */
// Extract the function out, up here, so I'm not writing it twice
const update = (el: HTMLElement, binding: Vue.DirectiveBinding) => el.style.visibility = (binding.value) ? "hidden" : "";

createApp(M101SN, {
  wwtNamespace: "wwt-minids-m101-supernova",
  wtml: { // images are listed in chronological order earliest to latest
    imageCollection: "https://raw.githubusercontent.com/johnarban/wwt_interactives/main/images/m101/m101_all.wtml",
  },
  url: "https://cosmicds.github.io/minids/pinwheel-supernova/",
  thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/M101_hires_STScI-PRC2006-10a.jpg/307px-M101_hires_STScI-PRC2006-10a.jpg",
  bgWtml: "",
  bgName: ""
})

  // Plugins
  .use(wwtPinia)
  .use(vuetify)
  .use(Notifications)

  // Directives
  .directive(
    /**
    * Hides an HTML element, keeping the space it would have used if it were visible (css: Visibility)
    */
    "hide", {
      // Run on initialisation (first render) of the directive on the element
      beforeMount(el, binding, _vnode, _prevVnode) {
        update(el, binding);
      },
      // Run on subsequent updates to the value supplied to the directive
      updated(el, binding, _vnode, _prevVnode) {
        update(el, binding);
      }
    })

  // Components
  .component("WorldWideTelescope", WWTComponent)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('font-awesome-layers', FontAwesomeLayers)
  .component('folder-view', FolderView)
  .component('mini-credits', Credits)
  .component('vue-slider', VueSlider)
  .component('transition-expand', TransitionExpand)
  .component('date-picker', Datepicker)
  .component('toggle', Toggle)
  .component('chartjs-scatter', chartjsScatter)
  .component('d3-scatter', d3Scatter)
  // .component('plot-plotly', PlotDataPlotly)
  .component('constellation-icon', ConstellationIcon)
  .component('gallery', Gallery)
  .component('icon-button', IconButton)
  .component('funding-acknowledgment', FundingAcknowledgment)

  // Mount
  .mount("#app");
