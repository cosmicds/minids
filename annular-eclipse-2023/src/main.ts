import Vue, { createApp } from "vue";

import { IconButton } from "@minids/common";
import { LocationSelector } from "@minids/common";
import AnnularEclipse2023 from "./AnnularEclipse2023.vue";
import TransitionExpand from "./TransitionExpand.vue";

import "./polyfills";

import VueSlider from "vue-slider-component";
import 'vue-slider-component/theme/default.css';

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import vuetify from "../plugins/vuetify";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { WWTComponent, wwtPinia } from "@wwtelescope/engine-pinia";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBookOpen,
  faTimes,
  faVideo,
  faGear,
  faChevronDown,
  faClock,
  faPlay,
  faPause,
} from "@fortawesome/free-solid-svg-icons";

library.add(faBookOpen);
library.add(faTimes);
library.add(faVideo);
library.add(faGear);
library.add(faChevronDown);
library.add(faClock);
library.add(faPlay);
library.add(faPause);

/** v-hide directive taken from https://www.ryansouthgate.com/2020/01/30/vue-js-v-hide-element-whilst-keeping-occupied-space/ */
// Extract the function out, up here, so I'm not writing it twice
const update = (el: HTMLElement, binding: Vue.DirectiveBinding) => el.style.visibility = (binding.value) ? "hidden" : "";

createApp(AnnularEclipse2023, {
  wwtNamespace: "wwt-minids-annular-eclipse-2023",
  // wtml: { // use this just as a test for the sun
  //   eclipse: "https://raw.githubusercontent.com/patudom/star-life-cycle/master/content/BUACStellarLifeCycles.wtml",
  // },
})
 
  // Plugins
  .use(wwtPinia)
  .use(vuetify)

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
  .component('icon-button', IconButton)
  .component('location-selector', LocationSelector)
  .component('vue-slider', VueSlider)  
  .component('transition-expand', TransitionExpand)
  .component('date-picker', Datepicker)

  // Mount
  .mount("#app");
