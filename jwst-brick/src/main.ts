import Vue, { createApp } from "vue";

import { FundingAcknowledgment, IconButton } from "@minids/common";
import JwstBrick from "./JwstBrick.vue";
import CreditLogos from "./CreditLogos.vue";

import vuetify from "../plugins/vuetify";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { WWTComponent, wwtPinia } from "@wwtelescope/engine-pinia";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBookOpen,
  faTimes,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";

library.add(faBookOpen);
library.add(faTimes);
library.add(faVideo);

/** v-hide directive taken from https://www.ryansouthgate.com/2020/01/30/vue-js-v-hide-element-whilst-keeping-occupied-space/ */
// Extract the function out, up here, so I'm not writing it twice
const update = (el: HTMLElement, binding: Vue.DirectiveBinding) => el.style.visibility = (binding.value) ? "hidden" : "";

createApp(JwstBrick, {
  wwtNamespace: "wwt-minids-jwst-brick",
  wtml: {
    nostars: "https://cosmicds.github.io/cds-website/wwt-content/JWST-Brick-wostars/index.wtml",
    stars: "https://cosmicds.github.io/cds-website/wwt-content/JWST-Brick-wstars/index.wtml",
    glimpse: "https://cosmicds.github.io/cds-website/wwt-content/glimpse_original.wtml",
  },
  bgWtml: "https://cosmicds.github.io/cds-website/wwt-content/glimpse_original.wtml",
  bgName: "GLIMPSE"
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
  .component('credit-logos', CreditLogos)
  .component('funding-acknowledgement', FundingAcknowledgment)

  // Mount
  .mount("#app");
