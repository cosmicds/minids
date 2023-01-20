import { defineComponent } from "vue";
import { WWTAwareComponent } from "@wwtelescope/engine-pinia";
import { KeyboardControlSettings } from "../utils/keyboard";

export default defineComponent({
  extends: WWTAwareComponent,

  props: {
    kcs: { type: KeyboardControlSettings, default: new KeyboardControlSettings({}) }
  },

  mounted() {
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
    }
  }
});