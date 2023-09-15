import { Color, Colors, Coordinates, PointList, LineList, TriangleFanList, TriangleList, Tessellator } from "@wwtelescope/engine";

export function Annotation2() {
    this.addedToPrimitives = false;
    this.annotationDirty = true;
    this._opacity = 1;
    this._showHoverLabel = false;
}

Annotation2.pointList = null;
Annotation2.lineList = null;
Annotation2.triangleFanPointList = null;
Annotation2.triangleList = null;
Annotation2.batchDirty = true;

Annotation2.prepBatch = function (renderContext) {
    if (Annotation2.pointList == null || Annotation2.batchDirty) {
        Annotation2.pointList = new PointList(renderContext);
        Annotation2.lineList = new LineList();
        Annotation2.triangleFanPointList = new TriangleFanList();
        Annotation2.triangleList = new TriangleList();
        Annotation2.lineList.set_depthBuffered(false);
        Annotation2.triangleList.depthBuffered = false;
    }
};

Annotation2.drawBatch = function (renderContext) {
    Annotation2.batchDirty = false;
    if (renderContext.gl == null) {
        return;
    }
    if (Annotation2.pointList != null) {
        Annotation2.pointList.draw(renderContext, 1, false);
    }
    if (Annotation2.lineList != null) {
        Annotation2.lineList.drawLines(renderContext, 1);
    }
    if (Annotation2.triangleFanPointList != null) {
        Annotation2.triangleFanPointList.draw(renderContext, 1);
    }
    if (Annotation2.triangleList != null) {
        Annotation2.triangleList.draw(renderContext, 1, 0);
    }
};

Annotation2.separation = function (Alpha1, Delta1, Alpha2, Delta2) {
    Delta1 = Delta1 / 180 * Math.PI;
    Delta2 = Delta2 / 180 * Math.PI;
    Alpha1 = Alpha1 / 12 * Math.PI;
    Alpha2 = Alpha2 / 12 * Math.PI;
    var x = Math.cos(Delta1) * Math.sin(Delta2) - Math.sin(Delta1) * Math.cos(Delta2) * Math.cos(Alpha2 - Alpha1);
    var y = Math.cos(Delta2) * Math.sin(Alpha2 - Alpha1);
    var z = Math.sin(Delta1) * Math.sin(Delta2) + Math.cos(Delta1) * Math.cos(Delta2) * Math.cos(Alpha2 - Alpha1);
    var vvalue = Math.atan2(Math.sqrt(x * x + y * y), z);
    vvalue = vvalue / Math.PI * 180;
    if (vvalue < 0) {
        vvalue += 180;
    }
    return vvalue;
};

Annotation2.colorToUint = function (col) {
    return (col.a) << 24 | (col.r << 16) | (col.g) << 8 | col.b;
};

Annotation2.colorToUintAlpha = function (col, opacity) {
    return opacity << 24 | col.r << 16 | col.g << 8 | col.b;
};

var Annotation2$ = {
    draw: function (renderContext) { },

    get_opacity: function () {
        return this._opacity;
    },

    set_opacity: function (value) {
        Annotation2.batchDirty = true;
        this._opacity = value;
        return value;
    },

    get_id: function () {
        return this._id;
    },

    set_id: function (value) {
        this._id = value;
        return value;
    },

    get_tag: function () {
        return this._tag;
    },

    set_tag: function (value) {
        this._tag = value;
        return value;
    },

    get_label: function () {
        return this._label;
    },

    set_label: function (value) {
        this._label = value;
        return value;
    },

    get_showHoverLabel: function () {
        return this._showHoverLabel;
    },

    set_showHoverLabel: function (value) {
        this._showHoverLabel = value;
        return value;
    },

    hitTest: function (renderContext, RA, dec, x, y) {
        return false;
    },

    get_center: function () {
        return this.center;
    },

    set_center: function (value) {
        this.center = value;
        return value;
    }
};


export function Poly2() {
    this._points$1 = [];
    this._fill$1 = false;
    this._strokeWidth$1 = 1;
    this._lineColor$1 = Colors.get_white();
    this._fillColor$1 = Colors.get_white();
    Annotation2.call(this);
}

var Poly2$ = {
    addPoint: function (x, y) {
        Annotation2.batchDirty = true;
        this._points$1.push(Coordinates.raDecTo3d(x / 15, y));
    },

    get_fill: function () {
        return this._fill$1;
    },

    set_fill: function (value) {
        Annotation2.batchDirty = true;
        this._fill$1 = value;
        return value;
    },

    get_lineWidth: function () {
        return this._strokeWidth$1;
    },

    set_lineWidth: function (value) {
        Annotation2.batchDirty = true;
        this._strokeWidth$1 = value;
        return value;
    },

    get_lineColor: function () {
        return this._lineColor$1.toString();
    },

    set_lineColor: function (value) {
        Annotation2.batchDirty = true;
        this._lineColor$1 = Color.fromName(value);
        return value;
    },

    get_fillColor: function () {
        return this._fillColor$1.toString();
    },

    set_fillColor: function (value) {
        Annotation2.batchDirty = true;
        this._fillColor$1 = Color.fromName(value);
        return value;
    },

    draw: function (renderContext) {
        if (renderContext.gl != null) {
            if (Annotation2.batchDirty || this.annotationDirty) {
                //todo can we save this work for later?
                var vertexList = this._points$1;

                if (this._strokeWidth$1 > 0 && this._points$1.length > 1) {
                    var lineColorWithOpacity = this._lineColor$1._clone();
                    lineColorWithOpacity.a = Math.round(lineColorWithOpacity.a * this.get_opacity());
                    for (var i = 0; i < (this._points$1.length - 1); i++) {
                        Annotation2.lineList.addLine(vertexList[i], vertexList[i + 1], lineColorWithOpacity, new Dates(0, 1));
                    }
                    Annotation2.lineList.addLine(vertexList[this._points$1.length - 1], vertexList[0], lineColorWithOpacity, new Dates(0, 1));
                }
                if (this._fill$1) {
                    var fillColorWithOpacity = this._fillColor$1._clone();
                    fillColorWithOpacity.a = Math.round(fillColorWithOpacity.a * this.get_opacity());
                    var indexes = Tessellator.tesselateSimplePoly(vertexList);
                    for (var i = 0; i < indexes.length; i += 3) {
                        Annotation2.triangleList.addSubdividedTriangles(vertexList[indexes[i]], vertexList[indexes[i + 1]], vertexList[indexes[i + 2]], fillColorWithOpacity, new Dates(0, 1), 2);
                    }
                }
                this.annotationDirty = false;
            }
        } else {
            var ctx = renderContext.device;
            ctx.save();
            ctx.globalAlpha = this.get_opacity();
            ctx.beginPath();
            var first = true;
            for (const pnt of this._points$1) {
                var screenSpacePnt = renderContext.WVP.transform(pnt);
                if (screenSpacePnt.z < 0) {
                    ctx.restore();
                    return;
                }
                if (Vector3d.dot(renderContext.get_viewPoint(), pnt) < 0.75) {
                    ctx.restore();
                    return;
                }
                if (first) {
                    first = false;
                    ctx.moveTo(screenSpacePnt.x, screenSpacePnt.y);
                }
                else {
                    ctx.lineTo(screenSpacePnt.x, screenSpacePnt.y);
                }
            }
            ctx.closePath();
            ctx.lineWidth = this._strokeWidth$1;
            if (this._fill$1) {
                ctx.fillStyle = this._fillColor$1.toString();
                ctx.fill();
            }
            ctx.strokeStyle = this._lineColor$1.toString();
            ctx.globalAlpha = 1;
            ctx.stroke();
            ctx.restore();
        }
    }
};
