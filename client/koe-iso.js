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
    // ----------------------------------------
    //     Canvas Setup
    // ----------------------------------------
    var canvas = document.getElementById('canvas');
    var c = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    c.textBaseline = 'top';
    c.font = '10px sans-serif';
    c.fillStyle = '#00FFFF';

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

    // ----------------------------------------
    //     Display parameters
    // ----------------------------------------
    // center of the display on screen
    var displayCenterX = 1*canvas.width / 3;
    var displayCenterY = 2 * canvas.height / 3;

    // angle of the x axis. Should be in [0, PI/2]
    var angleX = Math.PI / 6;
    // angle of the y axis. Should be in [PI/2, PI[
    var angleY = 2.8;

    // scale for the tiles
    var scale = 60.0;
    // relative scale for the x of the tile. use it to stretch tiles.
    var relScaleX = 1;
    
    var experimental_useBitmapTiles = false;

    // how many tiles do we show in the back ?
    var viewBackDepth = 12;  //12
    // how many tiles do we show in the front ?
    var viewFrontDepth = 9;  //7
    // how many tiles do we show on the left ?
    var viewLeftDepth = 9;  //9
    // how many tiles do we show on the right ?
    var viewRightDepth = 13; //11

    // tile offset from 0,0 at which we start shadowing.
    var shadowStart = 9; //8
    // at shadowStart + shadowLength, tiles are black.
    var shadowLength = 5; //5

    // ...
    var enable3dEffect = true;
    // zShift : bigger means less influence for z
    var zShift = 1.0; // 1
    // zStrength bigger means more influence for z
    var zStrength = 3 / 12; // 4/12


    // ----------------------------------------
    //     Transforms
    // ----------------------------------------
    var transfMatrix = [Math.cos(angleX), Math.sin(angleX),
    Math.cos(angleY), Math.sin(angleY)];
    var _norm = relScaleX + 1;
    relScaleX /= _norm;
    transfMatrix[0] *= scale * relScaleX;
    transfMatrix[1] *= scale  * relScaleX;
    transfMatrix[2] *= scale / _norm;
    transfMatrix[3] *= scale / _norm;
    var determinant = transfMatrix[0] * transfMatrix[3] - transfMatrix[2] * transfMatrix[1];
    var transfMatrixRev = [transfMatrix[3], -transfMatrix[1], -transfMatrix[2], transfMatrix[0]];
    transfMatrixRev[0] /= determinant;
    transfMatrixRev[1] /= determinant;
    transfMatrixRev[2] /= determinant;
    transfMatrixRev[3] /= determinant;  
    
    // project on place vector from world to screen coordinates
    // not 3D-compliant
    function projectVector(v) {
        var col = v[0],
            row = v[1];
        v[0] = (transfMatrix[0] * col + transfMatrix[2] * row);
        v[1] = (transfMatrix[1] * col + transfMatrix[3] * row);
    }

    // project on place vector from screen to world coordinates
    // not 3D-compliant
    function revertVector(v) {
        var col = v[0],
            row = v[1];
        v[0] = (transfMatrixRev[0] * col + transfMatrixRev[2] * row);
        v[1] = (transfMatrixRev[1] * col + transfMatrixRev[3] * row);
    }

    // project on place the screen point into world coordinates
    function revertPoint(v, center) {
        v[0] -= displayCenterX;
        v[1] -= displayCenterY;
        // if handling 3D
        if (enable3dEffect) {
                var unScaledV1 = v[1] / scale;
                var drawBaseY = unScaledV1 / (zShift + unScaledV1 * zStrength);
                // compute zEffect
                v[2] = 1 / (zShift - zStrength * drawBaseY);
                v[0] /= v[2];
                v[1] /= v[2];
        }
        revertVector(v);
        v[0] += center[0];
        v[1] += center[1];
    }
    

    // project centered world coordinates (col, row) into screen coordinates
    //  col and row do not have to be rounded.
    function projectFromCenter(col, row, pt) {
        var drawBaseX = (transfMatrix[0] * col + transfMatrix[2] * row);
        var drawBaseY = (transfMatrix[1] * col + transfMatrix[3] * row);
        if (enable3dEffect) {
        //  fun, not so nice :   
        // var dist=Math.sqrt(sq(drawBaseX) + sq(drawBaseY) );
        //  or :   
        // var dist=Math.sqrt(sq(col) + sq(row) );
        // use with :   zEffect *= 1 / (zShift  + zStrength * dist / scale);
              var zEffect = pt[2] = 1 / (zShift - zStrength * drawBaseY / scale);
              drawBaseX *= zEffect;
              drawBaseY *= zEffect;
        }
        pt[0] = displayCenterX + drawBaseX;
        pt[1] = displayCenterY + drawBaseY;
    }

    // ----------------------------------------
    //     Rendering
    // ----------------------------------------

    function setWorldTransform() {
         c.setTransform(transfMatrix[0],transfMatrix[1],
                         transfMatrix[2],transfMatrix[3],
                         displayCenterX, displayCenterY);
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
        tileValue = tileValue  % 16;
        var pt = [colOffset - 0.5, rowOffset - 0.5];
        // where is the tile ?
        var tileBitmapX =  (0 | (tileValue / 4))*32*2;
        var tileBitmapY = (tileValue %4)*32*3;
        c.drawImage(img, tileBitmapX,tileBitmapY, 32,32, 
                colOffset - 0.5, rowOffset - 0.5, 1, 1);
//                c.drawImage(img, 0, 0, 32,32, 
//                colOffset - 0.5, rowOffset - 0.5, 1, 1);
    }

    // draw a tile at (colOffset, rowOffset ) centered world coordinates.
    function drawTile(colOffset, rowOffset, tileValue) {
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
        if (pt[1] < displayCenterY) {
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
            c.fillText((0 |colOffset) + ',' + (0|rowOffset),pt[0]-6,pt[1]);
    }

    // draw all tiles of the tileMap, with a view centered on
    // newCenterPoint
    function drawTiles(newCenterPoint) {
        // get rounded coordinates and floating part.
        var centerPoint = [0, 0];
        centerPoint[0] = Math.floor(newCenterPoint[0]);
        centerPoint[1] = Math.floor(newCenterPoint[1]);
        var remains = [newCenterPoint[0] - centerPoint[0],
        newCenterPoint[1] - centerPoint[1]];
        // compute start/end for loops on col/row
        var colStart = centerPoint[0] - viewBackDepth;
        var colEnd = centerPoint[0] + viewFrontDepth;
        var rowStart = centerPoint[1] - viewRightDepth;
        var rowEnd = centerPoint[1] + viewLeftDepth;
        // clamp start/end values
        if ((colEnd < 0) || (colStart >= tiles_dimension)) return;
        if (colStart < 0) colStart = 0;
        if (colEnd >= tiles_dimension) colEnd = tiles_dimension;
        if ((rowEnd < 0) || (rowStart >= tiles_dimension)) return;
        if (rowStart < 0) rowStart = 0;
        if (rowEnd >= tiles_dimension) rowEnd = tiles_dimension;
        
        if (experimental_useBitmapTiles) {
            c.save();
            setWorldTransform();
        }
        var drawTileMethod = (experimental_useBitmapTiles) ? drawFilledTile : drawTile ;
        // iterate on col/rows
        var pt = [0, 0];
        for (var colIndex = colStart; colIndex < colEnd; colIndex++) {
            var colOffset = colIndex - centerPoint[0];
            for (rowIndex = rowStart; rowIndex < rowEnd; rowIndex++) {
                var rowOffset = rowIndex - centerPoint[1];
                var thisTile = tileMap[colIndex][rowIndex];
                drawTileMethod(colOffset - remains[0], rowOffset - remains[1], thisTile);
            }
        }
        if (experimental_useBitmapTiles) c.restore();

    }

    var center = [25, 25];
    drawTiles(center);

    // ----------------------------------------
    //     Mouse handling
    // ----------------------------------------
    var mousePos = [0, 0];
    var mouseDown = false;

    var rect = canvas.getBoundingClientRect();

    function getMousePos(canvas, evt) {
        mousePos[0] = evt.clientX - rect.left;
        mousePos[1] = evt.clientY - rect.top;
    }

    canvas.addEventListener('mousedown', function (evt) {
        mouseDown = true;
        getMousePos(canvas, evt);
    }, false);

    canvas.addEventListener('mouseup', function (evt) {
        mouseDown = false;
        getMousePos(canvas, evt);
    }, false);

    canvas.addEventListener('mouseout', function (evt) {
        mouseDown = false;
    }, false);

    canvas.addEventListener('mousemove', function (evt) {
        getMousePos(canvas, evt);
    }, false);

    // ----------------------------------------
    //     Animation
    // ----------------------------------------
    var landMoveSpeed = 0.09;

    function animate() {
        requestAnimationFrame(animate);
        if (mouseDown) {
            var pt = [0, 0];
            pt[0] = mousePos[0] - displayCenterX;
            pt[1] = mousePos[1] - displayCenterY;
            var origPt = [mousePos[0], mousePos[1]];
            var norm = Math.sqrt(sq(pt[0]) + sq(pt[1]));
            pt[0] /= norm;
            pt[1] /= norm;
            revertVector(pt);
            center[0] += landMoveSpeed * pt[0] *scale;
            center[1] += landMoveSpeed * pt[1] *scale;
            c.clearRect(0, 0, canvasWidth, canvasHeight);
            drawTiles(center);
            revertPoint(origPt, center);
            drawTile(origPt[0] - center[0], origPt[1] - center[1], 20.0);
            console.log(origPt);
        }
    }
    animate();


}

// utils

function sq(x) {
    return x * x
};

// 
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
