// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Color, Colors, Constellations, Grids, Settings, URLHelpers, WWTControl } from "@wwtelescope/engine";

export default function drawSkyOverlays() {
  if (Settings.get_active().get_showConstellationLabels()) {
    Constellations.drawConstellationNames(this.renderContext, 1, Colors.get_yellow());
  }
  if (Settings.get_active().get_showConstellationFigures()) {
    if (WWTControl.constellationsFigures == null) {
      WWTControl.constellationsFigures = Constellations.create('Constellations', URLHelpers.singleton.engineAssetUrl('figures.txt'), false, false, false);
    }
    WWTControl.constellationsFigures.draw(this.renderContext, false, 'UMA', false);
  }
  if (Settings.get_active().get_showAltAzGrid()) {
    Grids.drawAltAzGrid(this.renderContext, 1, Color.fromArgb(1, 126, 42, 99));
  }
}
