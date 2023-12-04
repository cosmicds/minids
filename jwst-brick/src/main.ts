import Vue, { createApp } from "vue";

import { FundingAcknowledgment, IconButton } from "@minids/common";
import JwstBrick from "./JwstBrick.vue";
import CreditLogos from "./CreditLogos.vue";
import PlacesGallery from "./PlacesGallery.vue";

import vuetify from "../plugins/vuetify";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { WWTComponent, wwtPinia } from "@wwtelescope/engine-pinia";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBookOpen,
  faTimes,
  faVideo,
  faLocationCrosshairs,
} from "@fortawesome/free-solid-svg-icons";

library.add(faBookOpen);
library.add(faTimes);
library.add(faVideo);
library.add(faLocationCrosshairs);

/** v-hide directive taken from https://www.ryansouthgate.com/2020/01/30/vue-js-v-hide-element-whilst-keeping-occupied-space/ */
// Extract the function out, up here, so I'm not writing it twice
const update = (el: HTMLElement, binding: Vue.DirectiveBinding) => el.style.visibility = (binding.value) ? "hidden" : "";

createApp(JwstBrick, {
  wwtNamespace: "wwt-minids-jwst-brick",
  wtml: {
    nostars: "https://cosmicds.github.io/cds-website/wwt-content/JWST-Brick-wostars/index.wtml",
    stars: "https://cosmicds.github.io/cds-website/wwt-content/JWST-Brick-wstars/index.wtml",
    // glimpse: "https://cosmicds.github.io/cds-website/wwt-content/glimpse_original.wtml",
    zannotation: "https://raw.githubusercontent.com/johnarban/wwt_interactives/main/images/adam/annotation/index.wtml",
  },
  bgWtml: "https://cosmicds.github.io/cds-website/wwt-content/glimpse_original.wtml",
  bgName: "GLIMPSE Original"
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
  .component('places-gallery', PlacesGallery)

  // Mount
  .mount("#app");
