// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Color, Constellations, Grids, Settings, URLHelpers, WWTControl } from "@wwtelescope/engine";

export default function drawSkyOverlays() {
  if (Settings.get_active().get_showConstellationBoundries()) {
    if (WWTControl.constellationsBoundries == null) {
      WWTControl.constellationsBoundries = Constellations.create('Constellations', URLHelpers.singleton.engineAssetUrl('constellations.txt'), true, false, false);
    }
    WWTControl.constellationsBoundries.draw(this.renderContext, Settings.get_active().get_showConstellationSelection(), this.constellation, false);
  }
  if (Settings.get_active().get_showAltAzGrid()) {
    Grids.drawAltAzGrid(this.renderContext, 1, Color.fromArgb(1, 126, 42, 99));
  }
}
