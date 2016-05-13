var resCount = 2;

var img = new Image();
img.onload = launchMe;
img.src = 'http://ccrgeek.files.wordpress.com/2012/11/a2-tiles-with-overlays_2.png?w=512&h=384';

window.onload = launchMe;

function launchMe() {
    if (--resCount == 0) main();
}

function main() {
    hookKeys();
    setupMouse();
    // ----------------------------------------
    //     Canvas Setup
    // ----------------------------------------
    var canvas = document.getElementById('canvas');
    var c = canvas.getContext('2d');
    c.fillStyle = 'hsl(23, 75%, 75%)';
    console.log(c.fillStyle);
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    c.textBaseline = 'top';
    c.font = '10px sans-serif';
    c.fillStyle = '#00FFFF';

    // ----------------------------------------
    // checkboxes
    var cb3D = document.getElementById('cb3D');
    var textured = document.getElementById('textured');
    cb3D.onchange = function () {
        enable3dEffect = !enable3dEffect;
        if (enable3dEffect) resetTransform();
        else setWorldTransform();
    };
    textured.onchange = function () {
        experimental_useBitmapTiles = !experimental_useBitmapTiles;
    };


    // ----------------------------------------
    //     Tiles Setup
    // ----------------------------------------
    var tiles_dimension = 50;

    var tileCount = 0;
    var tileMap = new Array();
    for (x = 0; x < tiles_dimension; x++) {
        var row = new Array();
        for (y = 0; y < tiles_dimension; y++) {
            row[y] = x * 20 + y * 30 + 0 | (Math.random() * 20);
            tileCount++;
        }
        tileMap[x] = row;
    }

    var hslMap = [];
    for (var i = 0; i < 360; i++) {
        c.fillStyle = 'hsl(' + i + ',75%,75%)';
        hslMap[i] = c.fillStyle;
    }

    // ----------------------------------------
    //     Display parameters
    // ----------------------------------------
    // center of the display on screen
    var displayCenter = [ 1 * canvas.width / 3, 2 * canvas.height / 3];

    // center of the current view (camera) in world coordinates
    var viewCenter = [25, 25];

    // angle of the x axis. Should be in [0, PI/2]
    var angleX = Math.PI / 6;
    // angle of the y axis. Should be in [PI/2, PI[
    var angleY = 2.8;
    // scale for the tiles
    var scale = 60.0;

    // 
    // how many tiles do we show in the back ?
    var viewBackDepth = 7; //12
    // how many tiles do we show in the front ?
    var viewFrontDepth = 8; //7
    // how many tiles do 7e show on the left ?
    var viewLeftDepth = 7; //9
    // how many tiles do we show on the right ?
    var viewRightDepth = 10; //11

    // tile offset from 0,0 at which we start shadowing.
    var shadowStart = 6; //8
    // at shadowStart + shadowLength, tiles are black.
    var shadowLength = 5; //5

    // 3D Parameters
    // ...
    var enable3dEffect = false;
    // zShift : bigger means less influence for z
    var zShift = 1.0; // 1
    // zStrength bigger means more influence for z
    var zStrength = 3 / 12; // 4/12

    var experimental_useBitmapTiles = false;

    var cos = Math.cos,
        sin = Math.sin;
    // ----------------------------------------
    //     Transforms
    // ----------------------------------------
    // projection matrix (world relative to center => screen)
    var transfMatrix = [cos(angleX), sin(angleX),
    cos(angleY), sin(angleY)];
    transfMatrix[0] *= scale;
    transfMatrix[1] *= scale;
    transfMatrix[2] *= scale;
    transfMatrix[3] *= scale;
    transfMatrix[4] = displayCenter[0];
    transfMatrix[5] = displayCenter[1];

    // transform invert ( Screen => World relative to center)
    var transfMatrixRev = [transfMatrix[3], -transfMatrix[1], -transfMatrix[2], transfMatrix[0]];
    var determinant = transfMatrix[0] * transfMatrix[3] - transfMatrix[2] * transfMatrix[1];
    transfMatrixRev[0] /= determinant;
    transfMatrixRev[1] /= determinant;
    transfMatrixRev[2] /= determinant;
    transfMatrixRev[3] /= determinant;
    var centerPoint = [-displayCenter[0], -displayCenter[1]];
    projectVector(transfMatrixRev, centerPoint);
    transfMatrixRev[4] = centerPoint[0];
    transfMatrixRev[5] = centerPoint[1];

    // project on place the point using provided matrix
    function project(matrix, point) {
        var x = point[0];
        var y = point[1];
        point[0] = matrix[0] * x + matrix[2] * y + matrix[4];
        point[1] = matrix[1] * x + matrix[3] * y + matrix[5];
    }

    var screenBBox = [];

    function getBBox() {
        var pt = [0, 0];
        project(transfMatrixRev, pt);
        var xmin, xmax, ymin, ymax;
        xmin = xmax = pt[0];
        ymin = ymax = pt[1];
        updateBBox(canvasWidth, 0);
        updateBBox(canvasWidth, canvasHeight);
        updateBBox(0, canvasHeight);

        function updateBBox(x, y) {
            pt[0] = x;
            pt[1] = y;
            project(transfMatrixRev, pt);
            x = pt[0];
            y = pt[1];
            if (x < xmin) xmin = x;
            if (x > xmax) xmax = x;
            if (y < ymin) ymin = y;
            if (y > ymax) ymax = y;
        }
        screenBBox = [xmin, ymin, xmax - xmin, ymax - ymin];
    }
    getBBox();

    // project on place vector using provided matrix
    function projectVector(matrix, v) {
        var x = v[0];
        var y = v[1];
        v[0] = (matrix[0] * x + matrix[2] * y);
        v[1] = (matrix[1] * x + matrix[3] * y);
    }

    // project on place vector from world to screen coordinates
    function projectVector_W2S(v) {
        return projectVector(transfMatrix, v);
    }

    // project on place vector from screen to world coordinates
    // not 3D-compliant
    function revertVector_S2W(v) {
        return projectVector(transfMatrixRev, v);
    }

    // revert on place the screen point into absolute world coordinates
    //   center is the center of the view (camera) in world coordinates.
    function revertPoint(v, center) {
        // if handling 3D
        if (enable3dEffect) return revertPoint3D(v, center);
        // if not handling 3D
        // just project Screen -> relative World coordinates
        project(transfMatrixRev, v);
        // relative world coordinates => absolute world coordinates.
        v[0] += center[0];
        v[1] += center[1];
    }

    // project centered world coordinates (col, row) into screen coordinates
    //  Rq : col and row do not have to be rounded.
    function projectFromCenter(col, row, pt) {
        if (enable3dEffect) return projectFromCenter3D(col, row, pt);
        pt[0] = col;
        pt[1] = row;
        return project(transfMatrix, pt);
    }

    function revertPoint3D(v, center) {
        // 3D case : do computations by hand.
        v[0] -= transfMatrix[4];
        v[1] -= transfMatrix[5];
        var unScaledV1 = v[1] / scale;
        var drawBaseY = unScaledV1 / (zShift + unScaledV1 * zStrength);
        // compute zEffect
        v[2] = 1 / (zShift - zStrength * drawBaseY);
        v[0] /= v[2];
        v[1] /= v[2];
        revertVector_S2W(v);
        v[0] += center[0];
        v[1] += center[1];
    }

    function projectFromCenter3D(col, row, pt) {
        var drawBaseX = (transfMatrix[0] * col + transfMatrix[2] * row);
        var drawBaseY = (transfMatrix[1] * col + transfMatrix[3] * row);
        //  fun, not so nice :   
        // var dist=Math.sqrt(sq(drawBaseX) + sq(drawBaseY) );
        //  or :   
        // var dist=Math.sqrt(sq(col) + sq(row) );
        // use with :   zEffect *= 1 / (zShift  + zStrength * dist / scale);
        var zEffect = pt[2] = 1 / (zShift - zStrength * drawBaseY / scale);
        drawBaseX *= zEffect;
        drawBaseY *= zEffect;
        pt[0] = transfMatrix[4] + drawBaseX;
        pt[1] = transfMatrix[5] + drawBaseY;
    }

    // ----------------------------------------
    //     Rendering
    // ----------------------------------------

    function setWorldTransform() {
        c.setTransform.apply(c, transfMatrix);
    }
    //    equivalent to :
    //        c.setTransform( transfMatrix[0], transfMatrix[1],
    //        transfMatrix[2], transfMatrix[3],
    //        transfMatrix[4], transfMatrix[5]);

    function resetTransform() {
        c.setTransform(1, 0, 0, 1, 0, 0);
    }

    // draw at tree at point coord. 
    // if 3d, third coord is understood as scale.
    function drawTree(pt, alpha) {
        c.save();
        c.translate(pt[0], pt[1]);
        if (enable3dEffect) {
            c.scale(pt[2], pt[2]);
        }
        if (alpha < 1.0) c.globalAlpha = alpha;
        c.fillStyle = 'hsl(19,56%,40%);';
        c.fillRect(-4, -6, 8, 6);
        c.fillStyle = 'hsl(90,100%,47%);';
        c.fillRect(-8, -22, 16, 18);
        c.restore();
    }

    function drawFilledTile(colOffset, rowOffset, tileValue) {
        tileValue = tileValue % 16;
        var pt = [colOffset - 0.5, rowOffset - 0.5];
        // where is the tile ?
        var tileBitmapX = (0 | (tileValue / 4)) * 32 * 2;
        var tileBitmapY = (tileValue % 4) * 32 * 3;
        c.drawImage(img, tileBitmapX, tileBitmapY, 32, 32,
        colOffset - 0.5, rowOffset - 0.5, 1, 1);
    }

    function drawTile(colOffset, rowOffset, tileValue) {
        if (enable3dEffect) return drawTile3D(colOffset, rowOffset, tileValue);
        c.fillStyle = hslMap[tileValue % 360]; // == 'hsl(' + (tileValue) + ',75%,75%)';
        c.fillRect(colOffset - 0.5, rowOffset - 0.5, 1, 1);
    }

    // draw a tile at (colOffset, rowOffset ) centered world coordinates.
    function drawTile3D(colOffset, rowOffset, tileValue) {
        var pt = [0, 0];
        c.beginPath();
        c.fillStyle = 'hsl(' + (tileValue) + ',75%,75%)';
        projectFromCenter(colOffset - 0.5, rowOffset - 0.5, pt);
        if (pt[1] > canvasHeight) return;
        c.moveTo(pt[0], pt[1]);
        projectFromCenter(colOffset + 0.5, rowOffset - 0.5, pt);
        c.lineTo(pt[0], pt[1]);
        projectFromCenter(colOffset + 0.5, rowOffset + 0.5, pt);
        c.lineTo(pt[0], pt[1]);
        projectFromCenter(colOffset - 0.5, rowOffset + 0.5, pt);
        c.lineTo(pt[0], pt[1]);
        if (pt[1] < displayCenter[1]) {
            var dist = Math.max(Math.abs(colOffset), Math.abs(rowOffset));
            var alpha = 1.0;
            if (dist >= shadowStart) alpha = 1 - Math.pow((dist - shadowStart) / shadowLength, 0.8);
            c.globalAlpha = alpha;
        }
        c.fill();
        c.closePath();
        c.fillStyle = '#000';
        c.globalAlpha = 1.0;
        projectFromCenter(colOffset, rowOffset, pt);
        if (!(tileValue % 17) || ((tileValue + 1) % 17) == 0) drawTree(pt, alpha + 0.05);
        c.fillText((0 |colOffset) + ',' + (0|rowOffset),pt[0]-3,pt[1]);
    }

    // draw all tiles of the tileMap, with a view centered on
    // newCenterPoint
    //    function drawTiles(newCenterPoint) {
    var drawTiles = (function () {
        var _centerPoint = [0, 0];
        var _remains = [0, 0];
        var _colRange = [0, 0];
        var _rowRange = [0, 0];
        var _pt = [0, 0];

        function _drawTiles(newCenterPoint) {
            // 
            var centerPoint = _centerPoint;
            var remains = _remains;
            var colRange = _colRange;
            var rowRange = _rowRange;
            var pt = _pt;
            // get rounded coordinates ... 
            centerPoint[0] = Math.floor(newCenterPoint[0]);
            centerPoint[1] = Math.floor(newCenterPoint[1]);
            // ... and floating part.
            remains[0] = newCenterPoint[0] - centerPoint[0];
            remains[1] = newCenterPoint[1] - centerPoint[1];
            // compute start/end for loops on col/row
            colRange[0] = centerPoint[0] - viewBackDepth;
            colRange[1] = centerPoint[0] + viewFrontDepth;
            rowRange[0] = centerPoint[1] - viewRightDepth;
            rowRange[1] = centerPoint[1] + viewLeftDepth;
            // clamp start/end values
            if (!clampRange(colRange, tiles_dimension)) return;
            if (!clampRange(rowRange, tiles_dimension)) return;
            //
            var drawTileMethod = (experimental_useBitmapTiles) ? drawFilledTile : drawTile;
            if (enable3dEffect) drawTileMethod = drawTile3D;
            // iterate on col/rows
            var colEnd = colRange[1];
            var rowStart = rowRange[0],
                rowEnd = rowRange[1];
            var remainX = remains[0],
                remainY = remains[1];
            var _tileMap = tileMap;
            var centerPointX = centerPoint[0],
                centerPointY = centerPoint[1];
            for (var colIndex = colRange[0]; colIndex < colEnd; colIndex++) {
                var colOffset = colIndex - centerPointX;
                for (var rowIndex = rowStart; rowIndex < rowEnd; rowIndex++) {
                    var rowOffset = rowIndex - centerPointY;
                    var thisTile = _tileMap[colIndex][rowIndex];
                    drawTileMethod(colOffset - remainX,
                    rowOffset - remainY, thisTile);
                }
            }
        }
        return _drawTiles;
    })();


    function clampRange(rg, length) {
        if ((rg[1] < 0) || (rg[0] >= length)) return 0;
        if (rg[0] < 0) rg[0] = 0;
        if (rg[1] >= length) rg[1] = length - 1;
        return 1;
    }

    // ----------------------------------------
    //     Animation
    // ----------------------------------------
    var landMoveSpeed = 0.07;

    if (enable3dEffect) resetTransform();
    else setWorldTransform();


    function animate() {
        requestAnimationFrame(animate);
        if (mouseDown) {
            // move depending on mouse.
            var pt = [0, 0];
            pt[0] = mousePos[0] - displayCenter[0];
            pt[1] = mousePos[1] - displayCenter[1];
            var norm = Math.sqrt(sq(pt[0]) + sq(pt[1]));
            pt[0] /= norm;
            pt[1] /= norm;
            revertVector_S2W(pt);
            viewCenter[0] += landMoveSpeed * pt[0] * scale;
            viewCenter[1] += landMoveSpeed * pt[1] * scale;
        }
        // draw the tiles

        c.fillStyle = '#000';
        if (enable3dEffect) {
            c.fillRect(0, 0, canvasWidth, canvasHeight);
        } else {
            c.fillRect(screenBBox[0], screenBBox[1], screenBBox[2], screenBBox[3]);
        }

        drawTiles(viewCenter);
        // draw the tile hovered
        var origPt = [mousePos[0], mousePos[1]];
        revertPoint(origPt, viewCenter);
        drawTile(origPt[0] - viewCenter[0], origPt[1] - viewCenter[1], 20.0);
    }
    animate();


}

// utils

function sq(x) {
    return x * x
};

// ----------------------------------------
//     Mouse handling
// ----------------------------------------
var mousePos;
var mouseDown;

function setupMouse() {

    mousePos = [0, 0];

    mouseDown = false;
    var rect;
    updateRect();

    function updateRect() {
        rect = canvas.getBoundingClientRect();
    }

    window.addEventListener('scroll', updateRect);

    var hook = canvas.addEventListener.bind(canvas);

    function getMousePos(canvas, evt) {
        mousePos[0] = evt.clientX - rect.left;
        mousePos[1] = evt.clientY - rect.top;
    }

    hook('mousedown', function (evt) {
        mouseDown = true;
        getMousePos(canvas, evt);
    }, false);

    hook('mouseup', function (evt) {
        mouseDown = false;
        getMousePos(canvas, evt);
    }, false);

    hook('mouseout', function (evt) {
        mouseDown = false;
    }, false);

    hook('mousemove', function (evt) {
        getMousePos(canvas, evt);
    }, false);

}


// ----------------------------------------
//     Keyboard handling
// ----------------------------------------

var keys = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
};

function hookKeys() {
    window.addEventListener('keydown', function (evt) {
        switch (evt.keyCode) {
            case keys.UP:
                center[1] += 0.1;
                break;
            case keys.DOWN:
                center[1] -= 0.1;
                break;
            case keys.LEFT:
                center[0] -= 0.1;
                break;
            case keys.RIGHT:
                center[0] += 0.1;
                break;
        };
    }, false);
}