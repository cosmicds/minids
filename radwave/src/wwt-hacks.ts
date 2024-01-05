// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable */

import { Settings } from "@wwtelescope/engine";

export function zoom(factor: number) {
  this.renderContext.targetCamera.zoom *= factor;
  if (this.renderContext.targetCamera.zoom > this.get_zoomMax()) {
    this.renderContext.targetCamera.zoom = this.get_zoomMax();
  }
  if (this.renderContext.targetCamera.zoom < this.get_zoomMin()) {
    this.renderContext.targetCamera.zoom = this.get_zoomMin();
  }

  if (!Settings.get_globalSettings().get_smoothPan()) {
    this.renderContext.viewCamera = this.renderContext.targetCamera.copy();
  }
}
