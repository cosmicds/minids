import Vue, { createApp } from "vue";

import C2022E3 from "./C2022E3.vue";
import FolderView from "./FolderView.vue";
import Credits from "./Credits.vue";
import TransitionExpand from "./TransitionExpand.vue";

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
  faImages
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

import { WWTComponent, wwtPinia } from "@wwtelescope/engine-pinia";

import Notifications from '@kyvg/vue3-notification';

import "leaflet/dist/leaflet.css";

/** v-hide directive taken from https://www.ryansouthgate.com/2020/01/30/vue-js-v-hide-element-whilst-keeping-occupied-space/ */
// Extract the function out, up here, so I'm not writing it twice
const update = (el: HTMLElement, binding: Vue.DirectiveBinding) => el.style.visibility = (binding.value) ? "hidden" : "";

createApp(C2022E3, {
  wwtNamespace: "wwt-minids-m101-supernova",
  wtml: { // images are listed in chronological order earliest to latest
    imageCollection: "https://raw.githubusercontent.com/johnarban/wwt_interactives/main/images/m101_all.wtml",
  },
  url: "https://web.wwtassets.org/specials/2023/cosmicds-carina/",
  thumbnailUrl: "https://cdn.worldwidetelescope.org/thumbnails/jwst.jpg",
  bgWtml: "https://data1.wwtassets.org/packages/2022/07_jwst/smacs0723/jwst_smacs0723.wtml",
  bgName: "unwise"
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

  // Mount
  .mount("#app");
