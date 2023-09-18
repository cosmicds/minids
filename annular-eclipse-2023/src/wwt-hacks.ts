// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable */

import { Annotation2 } from "./Annotation2";

import {
  Annotation, Color, Colors, Constellations, Coordinates, Grids,
  LayerManager, Planets, PushPin, RenderTriangle, Settings, SpaceTimeController,
  SpreadSheetLayer, Text3d, Text3dBatch, Tile, TileCache, TourPlayer, URLHelpers,
  Vector3d, WWTControl
} from "@wwtelescope/engine";

export function drawSkyOverlays() {
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
    const altAzColor = Color.fromArgb(1, 3, 92, 134);
    Grids.drawAltAzGrid(this.renderContext, 1, altAzColor);
    if (Settings.get_active().get_showAltAzGridText()) {
      Grids.drawAltAzGridText(this.renderContext, 1, altAzColor);
    }
  }
  if (Settings.get_active().get_showEcliptic()) {
    const eclipticColor = Color.fromArgb(1, 255, 165, 0);
    Grids.drawEcliptic(this.renderContext, 1, eclipticColor);
    if (Settings.get_active().get_showEclipticOverviewText()) {
      Grids.drawEclipticText(this.renderContext, 1, eclipticColor);
    }
  }
}

export function initializeConstellationNames() {
  if (Constellations.constellationCentroids == null) {
    return;
  }
  const textSize = 50;
  Constellations._namesBatch = new Text3dBatch(textSize);
  Object.keys(Constellations.constellationCentroids).forEach(key => {
    const centroid = Constellations.constellationCentroids[key];
    const center = Coordinates.raDecTo3dAu(centroid.get_RA(), centroid.get_dec(), 1);
    const up = Vector3d.create(0, 1, 0);
    let name = centroid.get_name();
    if (centroid.get_name() === 'Triangulum Australe') {
      name = name.replace(" ", "\n   ");
    }
    Constellations._namesBatch.add(new Text3d(center, up, name, textSize, 0.000125));
  });
};

export function makeAltAzGridText() {
  if (Grids._altAzTextBatch == null) {
    const glyphHeight = 70;
    Grids._altAzTextBatch = new Text3dBatch(glyphHeight);
    const sign = SpaceTimeController.get_location().get_lat() < 0 ? -1 : 1;
    const alt = 0.03 * sign;
    const up = Vector3d.create(0, sign, 0);
    const directions = [
      [[0, alt, -1], "N"],
      [[-sign, alt, 0], "E"],
      [[0, alt, 1], "S"],
      [[sign, alt,  -0.0095], "V"],
      [[sign, alt,  0.0095], "V"]
    ]
    directions.forEach(([v, text]) => {
      Grids._altAzTextBatch.add(new Text3d(Vector3d.create(...v), up, text, 75, 0.00018));
    });
  }
}

export function drawSpreadSheetLayer(renderContext, opacity, flat) {
  var device = renderContext;
  if (this.version !== this.lastVersion) {
    this.cleanUp();
  }
  this.lastVersion = this.version;
  if (this.bufferIsFlat !== flat) {
    this.cleanUp();
    this.bufferIsFlat = flat;
  }
  if (this.dirty) {
    this.prepVertexBuffer(device, opacity);
  }
  var jNow = SpaceTimeController.get_jNow() - SpaceTimeController.utcToJulian(this.baseDate);
  var adjustedScale = this.scaleFactor * 3;
  if (flat && this.astronomical && (this._markerScale$1 === 1)) {
    adjustedScale = (this.scaleFactor / (renderContext.viewCamera.zoom / 360));
  }
  if (this.triangleList2d != null) {
    this.triangleList2d.decay = this.decay;
    this.triangleList2d.sky = this.get_astronomical();
    this.triangleList2d.timeSeries = this.timeSeries;
    this.triangleList2d.jNow = jNow;
    this.triangleList2d.draw(renderContext, opacity * this.get_opacity(), 1);
  }
  if (this.triangleList != null) {
    this.triangleList.decay = this.decay;
    this.triangleList.sky = this.get_astronomical();
    this.triangleList.timeSeries = this.timeSeries;
    this.triangleList.jNow = jNow;
    this.triangleList.draw(renderContext, opacity * this.get_opacity(), 1);
  }
  if (this.pointList != null) {
    this.pointList.depthBuffered = false;
    this.pointList.showFarSide = this.get_showFarSide();
    this.pointList.decay = (this.timeSeries) ? this.decay : 0;
    this.pointList.sky = this.get_astronomical();
    this.pointList.timeSeries = this.timeSeries;
    this.pointList.jNow = jNow;
    this.pointList.scale = (this._markerScale$1 === 1) ? adjustedScale : -adjustedScale;
    switch (this._plotType$1) {
      case 0:
        this.pointList.draw(renderContext, opacity * this.get_opacity(), false);
        break;
      case 2:
        this.pointList.drawTextured(renderContext, SpreadSheetLayer.get__circleTexture$1().texture2d, opacity * this.get_opacity());
        break;
      case 1:
        this.pointList.drawTextured(renderContext, PushPin.getPushPinTexture(19), opacity * this.get_opacity());
        break;
      case 3:
        this.pointList.drawTextured(renderContext, PushPin.getPushPinTexture(35), opacity * this.get_opacity());
        break;
      case 5:
      case 4:
        this.pointList.drawTextured(renderContext, PushPin.getPushPinTexture(this._markerIndex$1), opacity * this.get_opacity());
        break;
      default:
        break;
    }
  }
  if (this.lineList != null) {
    this.lineList.sky = this.get_astronomical();
    this.lineList.decay = this.decay;
    this.lineList.timeSeries = this.timeSeries;
    this.lineList.jNow = jNow;
    this.lineList.drawLines(renderContext, opacity * this.get_opacity());
  }
  if (this.lineList2d != null) {
    this.lineList2d.sky = this.get_astronomical();
    this.lineList2d.decay = this.decay;
    this.lineList2d.timeSeries = this.timeSeries;
    this.lineList2d.showFarSide = this.get_showFarSide();
    this.lineList2d.jNow = jNow;
    this.lineList2d.drawLines(renderContext, opacity * this.get_opacity());
  }
  return true;
}

export function layerManagerDraw(renderContext, opacity, astronomical, referenceFrame, nested, cosmos) {
  if (!(referenceFrame in LayerManager.get_allMaps())) {
    return;
  }
  var thisMap = LayerManager.get_allMaps()[referenceFrame];
  if (!thisMap.enabled || (!thisMap.layers.length && !(thisMap.frame.showAsPoint || thisMap.frame.showOrbitPath))) {
    return;
  }
  var matOld = renderContext.get_world();
  var matOldNonRotating = renderContext.get_worldBaseNonRotating();
  var oldNominalRadius = renderContext.get_nominalRadius();
  if ((thisMap.frame.reference === 18 | thisMap.frame.reference === 18) === 1) {
    thisMap.computeFrame(renderContext);
    if (thisMap.frame.referenceFrameType !== 1 && thisMap.frame.referenceFrameType !== 2) {
      renderContext.set_world(Matrix3d.multiplyMatrix(thisMap.frame.worldMatrix, renderContext.get_world()));
    }
    else {
      renderContext.set_world(Matrix3d.multiplyMatrix(thisMap.frame.worldMatrix, renderContext.get_worldBaseNonRotating()));
    }
    renderContext.set_nominalRadius(thisMap.frame.meanRadius);
  }
  for (const layer of LayerManager.get_allMaps()[referenceFrame].layers) {
    if (layer.enabled) {
      var layerStart = SpaceTimeController.utcToJulian(layer.get_startTime());
      var layerEnd = SpaceTimeController.utcToJulian(layer.get_endTime());
      var fadeIn = SpaceTimeController.utcToJulian(layer.get_startTime()) - ((layer.get_fadeType() === 1 || layer.get_fadeType() === 3) ? (layer.get_fadeSpan() / 864000000) : 0);
      var fadeOut = SpaceTimeController.utcToJulian(layer.get_endTime()) + ((layer.get_fadeType() === 2 || layer.get_fadeType() === 3) ? (layer.get_fadeSpan() / 864000000) : 0);
      if (SpaceTimeController.get_jNow() > fadeIn && SpaceTimeController.get_jNow() < fadeOut) {
        var fadeOpacity = 1;
        if (SpaceTimeController.get_jNow() < layerStart) {
          fadeOpacity = ((SpaceTimeController.get_jNow() - fadeIn) / (layer.get_fadeSpan() / 864000000));
        }
        if (SpaceTimeController.get_jNow() > layerEnd) {
          fadeOpacity = ((fadeOut - SpaceTimeController.get_jNow()) / (layer.get_fadeSpan() / 864000000));
        }
        layer.set_astronomical(astronomical);
        layer.draw(renderContext, opacity * fadeOpacity, cosmos);
      }
    }
  }
  renderContext.set_nominalRadius(oldNominalRadius);
  renderContext.set_world(matOld);
  renderContext.set_worldBaseNonRotating(matOldNonRotating);
};

// This function is being overwritten to get around the bug(?) described in https://github.com/WorldWideTelescope/wwt-webgl-engine/issues/268
// Since we were patching anyway, I've stripped out some if-else paths that won't ever be visited in this story
export function updateViewParameters() {
  if (this.renderContext.space && this._tracking && this._trackingObject != null) {
     var currentAltAz = Coordinates.equitorialToHorizon(Coordinates.fromRaDec(this._trackingObject.get_RA(), this._trackingObject.get_dec()), SpaceTimeController.get_location(), SpaceTimeController.get_now());
     this.renderContext.targetAlt = this.renderContext.alt = currentAltAz.get_alt();
     this.renderContext.targetAz = this.renderContext.az = currentAltAz.get_az();
   }
   else if (!this.get_solarSystemMode()) {
     this._tracking = false;
     this._trackingObject = null;
   }
   var oneMinusDragCoefficient = 1 - 0.8;
   var dc = 0.8;
   if (!this._tracking) {
     var minDelta = (this.renderContext.viewCamera.zoom / 4000);
     if (this.renderContext.viewCamera.zoom > 360) {
       minDelta = (360 / 40000);
     }
     if ((((Math.abs(this.renderContext.targetAlt - this.renderContext.alt) >= minDelta) | (Math.abs(this.renderContext.targetAz - this.renderContext.az) >= minDelta)) === 1)) {
       this.renderContext.alt += (this.renderContext.targetAlt - this.renderContext.alt) / 10;
       if (Math.abs(this.renderContext.targetAz - this.renderContext.az) > 170) {
         if (this.renderContext.targetAz > this.renderContext.az) {
           this.renderContext.az += (this.renderContext.targetAz - (360 + this.renderContext.az)) / 10;
         }
         else {
           this.renderContext.az += ((360 + this.renderContext.targetAz) - this.renderContext.az) / 10;
         }
       }
       else {
         this.renderContext.az += (this.renderContext.targetAz - this.renderContext.az) / 10;
       }
       this.renderContext.az = ((this.renderContext.az + 720) % 360);
     }
   }
   this.renderContext.viewCamera.zoom = dc * this.renderContext.viewCamera.zoom + oneMinusDragCoefficient * this.renderContext.targetCamera.zoom;
   this.renderContext.viewCamera.rotation = dc * this.renderContext.viewCamera.rotation + oneMinusDragCoefficient * this.renderContext.targetCamera.rotation;
   this.renderContext.viewCamera.angle = dc * this.renderContext.viewCamera.angle + oneMinusDragCoefficient * this.renderContext.targetCamera.angle;
}

export function renderOneFrame() {
  if (this.renderContext.get_backgroundImageset() != null) {
    this.renderType = this.renderContext.get_backgroundImageset().get_dataSetType();
  } else {
    this.renderType = 2;
  }

  var sizeChange = false;
  if (this.canvas.width !== this.canvas.parentNode.clientWidth) {
    this.canvas.width = this.canvas.parentNode.clientWidth;
    sizeChange = true;
  }
  if (this.canvas.height !== this.canvas.parentNode.clientHeight) {
    this.canvas.height = this.canvas.parentNode.clientHeight;
    sizeChange = true;
  }
  if (sizeChange && this.explorer != null) {
    this.explorer.refresh();
  }
  if (this.canvas.width < 1 || this.canvas.height < 1) {
    return;
  }
  if (sizeChange) {
    this._crossHairs = null;
  }
  Tile.lastDeepestLevel = Tile.deepestLevel;
  RenderTriangle.width = this.renderContext.width = this.canvas.width;
  RenderTriangle.height = this.renderContext.height = this.canvas.height;
  Tile.tilesInView = 0;
  Tile.tilesTouched = 0;
  Tile.deepestLevel = 0;
  SpaceTimeController.set_metaNow(Date.now());
  if (this.get__mover() != null) {
    SpaceTimeController.set_now(this.get__mover().get_currentDateTime());
    Planets.updatePlanetLocations(this.get_solarSystemMode());
    if (this.get__mover() != null) {
      const newCam = this.get__mover().get_currentPosition();
      this.renderContext.targetCamera = newCam.copy();
      this.renderContext.viewCamera = newCam.copy();
      if (this.renderContext.space && Settings.get_active().get_galacticMode()) {
        const gPoint = Coordinates.j2000toGalactic(newCam.get_RA() * 15, newCam.get_dec());
        this.renderContext.targetAlt = this.renderContext.alt = gPoint[1];
        this.renderContext.targetAz = this.renderContext.az = gPoint[0];
      }
      else if (this.renderContext.space && Settings.get_active().get_localHorizonMode()) {
        const currentAltAz = Coordinates.equitorialToHorizon(Coordinates.fromRaDec(newCam.get_RA(), newCam.get_dec()), SpaceTimeController.get_location(), SpaceTimeController.get_now());
        this.renderContext.targetAlt = this.renderContext.alt = currentAltAz.get_alt();
        this.renderContext.targetAz = this.renderContext.az = currentAltAz.get_az();
      }
      if (this.get__mover().get_complete()) {
        WWTControl.scriptInterface._fireArrived(this.get__mover().get_currentPosition().get_RA(), this.get__mover().get_currentPosition().get_dec(), WWTControl.singleton.renderContext.viewCamera.zoom);
        this.set__mover(null);
        this._notifyMoveComplete();
      }
    }
  }
  else {
    SpaceTimeController.updateClock();
    Planets.updatePlanetLocations(this.get_solarSystemMode());
    this._updateViewParameters();
  }
  this.renderContext.clear();

  this.renderContext.setupMatricesSpace3d(this.renderContext.width, this.renderContext.height);
  this.renderContext.drawImageSet(this.renderContext.get_backgroundImageset(), 100);
  if (this.renderContext.get_foregroundImageset() != null) {
    if (this.renderContext.get_foregroundImageset().get_dataSetType() !== this.renderContext.get_backgroundImageset().get_dataSetType()) {
      this.renderContext.set_foregroundImageset(null);
    }
    else {
      if (this.renderContext.viewCamera.opacity !== 100 && this.renderContext.gl == null) {
        if (this._foregroundCanvas.width !== this.renderContext.width || this._foregroundCanvas.height !== this.renderContext.height) {
          this._foregroundCanvas.width = this.renderContext.width;
          this._foregroundCanvas.height = this.renderContext.height;
        }
        var saveDevice = this.renderContext.device;
        this._fgDevice.clearRect(0, 0, this.renderContext.width, this.renderContext.height);
        this.renderContext.device = this._fgDevice;
        this.renderContext.drawImageSet(this.renderContext.get_foregroundImageset(), 100);
        this.renderContext.device = saveDevice;
        this.renderContext.device.save();
        this.renderContext.device.globalAlpha = this.renderContext.viewCamera.opacity / 100;
        this.renderContext.device.drawImage(this._foregroundCanvas, 0, 0);
        this.renderContext.device.restore();
      }
      else {
        this.renderContext.drawImageSet(this.renderContext.get_foregroundImageset(), this.renderContext.viewCamera.opacity);
      }
    }
  }
  if (this.uiController != null) {
    this.uiController.render(this.renderContext);
  }
  else {
    const index = 0;
    Annotation.prepBatch(this.renderContext);
    for (const item of this._annotations) {
      item.draw(this.renderContext);
      index++;
    }
    Annotation.drawBatch(this.renderContext);
    if ((Date.now() - this._lastMouseMove) > 400) {
      var raDecDown = this.getCoordinatesForScreenPoint(this._hoverTextPoint.x, this._hoverTextPoint.y);
      this._annotationHover(raDecDown.x, raDecDown.y, this._hoverTextPoint.x, this._hoverTextPoint.y);
      this._lastMouseMove = new Date(2100, 1, 1);
    }
    if (this._hoverText) {
      this._drawHoverText(this.renderContext);
    }
  }

  for (const imageset in this.renderContext.get_catalogHipsImagesets()) {
    if (imageset.get_hipsProperties().get_catalogSpreadSheetLayer().enabled && imageset.get_hipsProperties().get_catalogSpreadSheetLayer().lastVersion === imageset.get_hipsProperties().get_catalogSpreadSheetLayer().get_version()) {
      this.renderContext.drawImageSet(imageset, 100);
    }
  }
  if (Settings.get_active().get_showSolarSystem()) {
    this.constellation = Constellations.containment.findConstellationForPoint(this.renderContext.viewCamera.get_RA(), this.renderContext.viewCamera.get_dec());
    this._drawSkyOverlays();
    Planets.drawPlanets(this.renderContext, 1);
  }

  Annotation2.prepBatch(this.renderContext);
  for (const item of Annotation2.annotations) {
    item.draw(this.renderContext);
  }
  Annotation2.drawBatch(this.renderContext);

  const worldSave = this.renderContext.get_world();
  const viewSave = this.renderContext.get_view();
  const projSave = this.renderContext.get_projection();
  if (Settings.get_current().get_showCrosshairs()) {
    this._drawCrosshairs(this.renderContext);
  }

  const tilesAllLoaded = !TileCache.get_queueCount();
  this.renderContext.setupMatricesOverlays();
  this._fadeFrame();
  this._frameCount++;
  TileCache.decimateQueue();
  TileCache.processQueue(this.renderContext);
  Tile.currentRenderGeneration++;
  if (!TourPlayer.get_playing()) {
    this.set_crossFadeFrame(false);
  }
  this.renderContext.set_world(worldSave);
  this.renderContext.set_view(viewSave);
  this.renderContext.set_projection(projSave);
  const now = Date.now();
  const ms = now - this._lastUpdate;
  if (ms > 1000) {
    this._lastUpdate = now;
    this._frameCount = 0;
    RenderTriangle.trianglesRendered = 0;
    RenderTriangle.trianglesCulled = 0;
  }
  if (this.capturingVideo) {
    if ((this.dumpFrameParams != null) && (!this.dumpFrameParams.waitDownload || tilesAllLoaded)) {
      this.captureFrameForVideo(this._videoBlobReady, this.dumpFrameParams.width, this.dumpFrameParams.height, this.dumpFrameParams.format);
      SpaceTimeController.nextFrame();
    }
    if (SpaceTimeController.get_doneDumping()) {
      SpaceTimeController.frameDumping = false;
      SpaceTimeController.cancelFrameDump = false;
      this.capturingVideo = false;
    }
  }

}
