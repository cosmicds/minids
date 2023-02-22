import { defineComponent } from "vue";
import { WWTAwareComponent } from "@wwtelescope/engine-pinia";
import { KeyboardControlSettings } from "../keyboard";
import screenfull from "screenfull";


type Shape = { width: number; height: number };
const defaultWindowShape: Shape = { width: 1200, height: 900 };


export default defineComponent({
  extends: WWTAwareComponent,

  props: {
    kcs: { type: KeyboardControlSettings, default: new KeyboardControlSettings({}) }
  },

  data() {
    return {
      fullscreenModeActive: false,
      resizeObserver: null as ResizeObserver | null,
      touchscreen: false,
      windowShape: defaultWindowShape,
    }
  },

  created() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.touchscreen = ('ontouchstart' in window) || ('ontouchstart' in document.documentElement) || window.navigator.msPointerEnabled;
  },

  mounted() {

    if (screenfull.isEnabled) {
      screenfull.on("change", this.onFullscreenEvent);
    }

    // ResizeObserver not yet in TypeScript but we should start using it when
    // available. If we're in an iframe, our shape might change spontaneously.
    this.resizeObserver = new ResizeObserver(_entries => this.onResizeEvent());
    this.resizeObserver.observe(this.$el);
    this.onResizeEvent();

    // Handling key presses
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("zoomIn", () => this.doZoom(true))
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("zoomOut", () => this.doZoom(false))
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("moveUp", () =>
        this.doMove(0, this.kcs.moveAmount)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("moveDown", () =>
        this.doMove(0, -this.kcs.moveAmount)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("moveLeft", () =>
        this.doMove(this.kcs.moveAmount, 0)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("moveRight", () =>
        this.doMove(-this.kcs.moveAmount, 0)
      )
    );
  },

  destroyed() {
    if (screenfull.isEnabled) {
      screenfull.off("change", this.onFullscreenEvent);
    }

    this.resizeObserver?.unobserve(this.$el);
  },

  methods: {
    doZoom(zoomIn: boolean) {
      if (zoomIn) {
        this.zoom(1 / 1.3);
      } else {
        this.zoom(1.3);
      }
    },

    doMove(x: number, y: number) {
      this.move({ x: x, y: y });
    },

    onFullscreenEvent() {
      // NB: we need the isEnabled check to make TypeScript happy even though it
      // is not necessary in practice here.
      if (screenfull.isEnabled) {
        this.fullscreenModeActive = screenfull.isFullscreen;
      }
    },

    onResizeEvent() {
      const width = this.$el.clientWidth;
      const height = this.$el.clientHeight;

      if (width > 0 && height > 0) {
        this.windowShape = { width, height };
      } else {
        this.windowShape = defaultWindowShape;
      }
    },

    blurActiveElement() {
      const active = document.activeElement;
      if (active instanceof HTMLElement) {
        active.blur();
      }
    }
  },

  computed: {
    fullscreenAvailable(): boolean {
      return screenfull.isEnabled;
    }
  }
});
