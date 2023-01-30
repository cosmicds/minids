import Vue, { createApp } from "vue";

import C2022E3 from "./C2022E3.vue";
import FolderView from "./FolderView.vue";

import VueSlider from "vue-slider-component";
import 'vue-slider-component/theme/default.css'

import vuetify from "../plugins/vuetify"

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBookOpen,
  faLocationPin,
  faTimes,
  faVideo
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faBookOpen);
library.add(faLocationPin);
library.add(faTimes);
library.add(faVideo);

import { WWTComponent, wwtPinia } from "@wwtelescope/engine-pinia";

import Notifications from '@kyvg/vue3-notification';

import "leaflet/dist/leaflet.css";

/** v-hide directive taken from https://www.ryansouthgate.com/2020/01/30/vue-js-v-hide-element-whilst-keeping-occupied-space/ */
// Extract the function out, up here, so I'm not writing it twice
const update = (el: HTMLElement, binding: Vue.DirectiveBinding) => el.style.visibility = (binding.value) ? "hidden" : "";

createApp(C2022E3, {
  wwtNamespace: "wwt-minids-c2022e3",
  wtml: {
    comet0: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/688_2022E3_27_12.wtml",
    comet1: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/696_2022E3_20_01_23_2.wtml",
    comet2: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/693_2022E3_11_01_23.wtml",
    comet3: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/692_2022E3_02_01_23.wtml",
    comet4: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/698_2022E3_20_01_23_4.wtml",
    comet5: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/695_2022E3_20_01_23_1.wtml",
    comet6: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/691_2022E3_01_01_23.wtml",
    comet7: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/697_2022E3_20_01_23_3.wtml",
    comet8: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/690_2022E3_29_12.wtml",
    comet9: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/687_2022E3_18_12.wtml",
    comet10: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/700_2022E3_20_01_23_6.wtml",
    comet11: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/689_2022E3_28_12.wtml",
    comet12: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/694_2022E3_14_01_23.wtml",
    comet13: "https://raw.githubusercontent.com/johnarban/minids/main/c2022-e3/assets/699_2022E3_20_01_23_5.wtml",
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
    update(el, binding)
  },
  // Run on subsequent updates to the value supplied to the directive
  updated(el, binding, _vnode, _prevVnode) {
    update(el, binding)
  }
})

// Components
.component("WorldWideTelescope", WWTComponent)
.component('font-awesome-icon', FontAwesomeIcon)
.component('folder-view', FolderView)
.component('vue-slider', VueSlider)

// Mount
.mount("#app");
