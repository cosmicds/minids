import Vue, { createApp } from "vue";

import C2022E3 from "./C2022E3.vue";
import FolderView from "./FolderView.vue";

import VueSlider from "vue-slider-component";
import 'vue-slider-component/theme/default.css'

import vuetify from "../plugins/vuetify"

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faAdjust,
  faBookOpen,
  faCompress,
  faHeart,
  faExpand,
  faFileAlt,
  faMountain,
  faQuestion,
  faPlay,
  faPause,
  faRedo,
  faSearchMinus,
  faSearchPlus,
  faSlidersH,
  faStar,
  faTextHeight,
  faTimes,
  faUndoAlt,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faTwitter
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faAdjust);
library.add(faCompress);
library.add(faExpand);
library.add(faHeart);
library.add(faMountain);
library.add(faPlay);
library.add(faPause);
library.add(faRedo);
library.add(faSearchMinus);
library.add(faSearchPlus);
library.add(faSlidersH);
library.add(faStar);
library.add(faUndoAlt);
library.add(faFacebook);
library.add(faTwitter);
library.add(faVideo);
library.add(faTextHeight);
library.add(faTimes);
library.add(faFileAlt);
library.add(faBookOpen);
library.add(faQuestion);

import { WWTComponent, wwtPinia } from "@wwtelescope/engine-pinia";

/** v-hide directive taken from https://www.ryansouthgate.com/2020/01/30/vue-js-v-hide-element-whilst-keeping-occupied-space/ */
// Extract the function out, up here, so I'm not writing it twice
const update = (el: HTMLElement, binding: Vue.DirectiveBinding) => el.style.visibility = (binding.value) ? "hidden" : "";

createApp(C2022E3, {
  wwtNamespace: "wwt-minids-c2022e3",
  wtml: {
    jwst: "https://web.wwtassets.org/specials/2023/cosmicds-carina/collection/jwst_carina.wtml",
    hubble: "https://web.wwtassets.org/specials/2023/cosmicds-carina/collection/carina_nebula.wtml",
  },
  url: "https://web.wwtassets.org/specials/2023/cosmicds-carina/",
  thumbnailUrl: "https://cdn.worldwidetelescope.org/thumbnails/jwst.jpg",
  bgWtml: "https://data1.wwtassets.org/packages/2022/07_jwst/smacs0723/jwst_smacs0723.wtml",
  bgName: "unwise"
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
