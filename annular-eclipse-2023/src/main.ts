import Vue, { createApp } from "vue";

import { IconButton } from "@minids/common";
import { LocationSelector } from "@minids/common";
import { FundingAcknowledgment } from "@minids/common";
import AnnularEclipse2023 from "./AnnularEclipse2023.vue";
import TransitionExpand from "./TransitionExpand.vue";
import GifPlayPause from "./GifPlayPause.vue";
import CreditLogos from "./CreditLogos.vue";
import MCRadiogroup from "./MCRadiogroup.vue";
import FlipTransition from "./FlipTransition.vue";
import ImageLabel from "./ImageLabel.vue";
import GeolocationButton from "./GeolocationButton.vue";
import HoverTooltip from "./HoverTooltip.vue";

import "./polyfills";

import VueSlider from "vue-slider-component";
import 'vue-slider-component/theme/default.css';

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import Notifications from "@kyvg/vue3-notification";

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
  faMapLocationDot,
  faSun,
  faRocket,
  faPuzzlePiece,
  faLocationDot,
  faChevronUp,
  faQuestion,
  faAngleDoubleDown,
  faAngleDoubleUp,
  faArrowsRotate,
  faMountainSun,
  faShareNodes,
  faSquareXmark,
  faToolbox,
  faCircleInfo,
  faRotate,
  faCircleChevronDown,
  faStreetView,

} from "@fortawesome/free-solid-svg-icons";

library.add(faBookOpen);
library.add(faTimes);
library.add(faVideo);
library.add(faGear);
library.add(faChevronDown);
library.add(faClock);
library.add(faPlay);
library.add(faPause);
library.add(faMapLocationDot);
library.add(faSun);
library.add(faRocket);
library.add(faPuzzlePiece);
library.add(faLocationDot);
library.add(faChevronUp);
library.add(faQuestion);
library.add(faAngleDoubleDown);
library.add(faAngleDoubleUp);
library.add(faArrowsRotate);
library.add(faMountainSun);
library.add(faShareNodes);
library.add(faSquareXmark);
library.add(faToolbox);
library.add(faCircleInfo);
library.add(faRotate);
library.add(faCircleChevronDown);
library.add(faStreetView);

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
  .component('icon-button', IconButton)
  .component('location-selector', LocationSelector)
  .component('vue-slider', VueSlider)  
  .component('transition-expand', TransitionExpand)
  .component('gif-play-pause', GifPlayPause)
  .component('credit-logos', CreditLogos)
  .component('date-picker', Datepicker)
  .component('mc-radiogroup', MCRadiogroup)
  .component('flip-transition', FlipTransition)
  .component('image-label', ImageLabel)
  .component('funding-acknowledgment', FundingAcknowledgment)
  .component('geolocation-button', GeolocationButton)
  .component('hover-tooltip', HoverTooltip)

  // Mount
  .mount("#app");
