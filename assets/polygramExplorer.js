window.addEventListener("load", () => {
    const canvas = document.getElementById("trip");
    const startNSlider = document.getElementById("startN")
    const startOffsetSlider = document.getElementById("startOffset")
    const sizeSlider = document.getElementById("size");
    const lineWidthSlider = document.getElementById("lineWidth");
    const nameBox = document.getElementById("shapeName");
    const descBox = document.getElementById("shapeDescription");
    const shapeCanv = document.getElementById("shapeConstruction");
    const rainbowToggle = document.getElementById("rainbow");
    const copySvgButton = document.getElementById("copySVG");

    for(let i=0;i<1000;i++) {
        console.log(i, getNumberPrefix(i)+"gon")
    }

    /**
     * @type {CanvasRenderingContext2D}
     */
    let ctx = canvas.getContext("2d");

    /**
     * @type {CanvasRenderingContext2D}
     */
     let sctx = shapeCanv.getContext("2d");

    let size, offset, n, lineWidth = 3, debugColors = true;
    let selN, selOffset, selShanpes ;
    change();

    //drawPointArray(ctx, getPointCircle(0, 0, size, size, 5))
    //drawPolygram(ctx, 0, 0, 100, 15);
    //polygramTest(ctx, 18, 6);

    function ResizeCanvas(canvas) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        return { w: canvas.width, h: canvas.height };
    }

    function change() {
        size = Number.parseFloat(sizeSlider.value);
        offset = Number.parseFloat(startOffsetSlider.value);
        n =  Number.parseFloat(startNSlider.value);

        rerender()
    }

    //MAIN CANVAS
    function rerender() {
        let dim = ResizeCanvas(canvas)
        ctx.clearRect(0,0,dim.w,dim.h);
        let h = ctx.canvas.height;
        let w = ctx.canvas.width;

        //eeee
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(lineWidth, 1);
        ctx.strokeStyle = window.matchMedia("(prefers-color-scheme: dark)").matches ? "white" : "black";

        polygramTest(ctx, n, offset, size, debugColors);

        //SELECTION OVERLAY
        ctx.strokeStyle = "magenta";
        ctx.lineWidth= 2;
        //ctx.strokeRect((selN-n)*size, (selOffset-offset)*size, size, size);
        ctx.strokeRect((selN-n)*size-4, (selOffset-offset)*size-4, size+8, size+8);

        // diagonal
        ctx.beginPath();
        let dX = selN/selShanpes;
        let dY = selOffset/selShanpes;
        console.log(dY/dX)

        for(let qn= n/dX; qn< (n+w/size)/dX ; qn++) {
            let param = Math.round(qn)
            
            //console.log("recto", qn);
            if(param>0)
                ctx.strokeRect((dX*param-n)*size, (dY*param-offset)*size, size, size);
        }
        

        ctx.moveTo(0, ( dY/dX * (n         -1) -offset) *size )
        ctx.lineTo(w, ( dY/dX * (n+w/size  -1) -offset) *size ) 
        ctx.moveTo(0, ( dY/dX * (n       ) +1  -offset) *size )
        ctx.lineTo(w, ( dY/dX * (n+w/size) +1  -offset) *size ) 

        ctx.stroke();
    }
    let animationFrame = null;
    function requestRerender() {
        if(!animationFrame){
            animationFrame = requestAnimationFrame(() => {
                rerender();
                animationFrame = null;
            });
        }
    }

    let animTimer=0;
    const shapeTime = 120; const edgeTime = 240; //in frames
    const animWait = 2000; const intermissionTime = 500; // in ms
    let animationHandle;
    let animWaitHandle;
    let animatingEdges = true;

    //SHAPE CANVAS
    function shapeAnim() {
        let h = sctx.canvas.height;
        let w = sctx.canvas.width;
        let demosize = Math.min(h,w)-20;
        let demolineWidth = (demosize/size) * lineWidth;
        sctx.lineWidth = Math.max(demolineWidth,1);
        sctx.lineJoin = "round";
        sctx.lineCap = "round";
        sctx.strokeStyle = window.matchMedia("(prefers-color-scheme: dark)").matches ? "white" : "black";

        if(selOffset < Math.ceil(selN/2) && selOffset>=1 && selN>=2 ) {
            animTimer++;
            if(animatingEdges && animTimer>edgeTime) {
                animatingEdges = false;
                animTimer = 0;
                clearTimeout(animWaitHandle);
                animWaitHandle = setTimeout(() => { cancelAnimationFrame(animationHandle); animationHandle = requestAnimationFrame(shapeAnim)}, intermissionTime);
                return;
            } else if(!animatingEdges && animTimer>shapeTime) { //Animation end
                clearTimeout(animWaitHandle);
                animWaitHandle = setTimeout(() => {resetShapeAnim();  animationHandle = requestAnimationFrame(shapeAnim)}, animWait)
                return;
            }

            sctx.clearRect(0,0,w,h);
            //console.log("actual render");
            drawPolygram(sctx,(w-demosize)/2, (h-demosize)/2, demosize, selN, selOffset, debugColors, !animatingEdges ? (animTimer/shapeTime)*selShanpes : 1, animatingEdges ? (animTimer/edgeTime)*(selN/selShanpes) : undefined );

            cancelAnimationFrame(animationHandle);
            animationHandle = requestAnimationFrame(shapeAnim);
        } else {
            sctx.clearRect(0,0,w,h);
            sctx.strokeStyle = "#e00000";
            drawPolygram(sctx,(w-demosize)/2, (h-demosize)/2, demosize, 5, 2, false);
            sctx.fillText("JAIL", h/2, w/2, 300);
        }
    }

    function resetShapeAnim() {
        let shapeCanvBounds = shapeCanv.parentElement.getBoundingClientRect();
        shapeCanv.height = shapeCanvBounds.width;
        shapeCanv.width = shapeCanvBounds.width;

        animTimer=0;
        animatingEdges = true;
        clearTimeout(animWaitHandle);
        cancelAnimationFrame(animationHandle);
        requestAnimationFrame(shapeAnim);
    }

    startNSlider.addEventListener("change", change);
    startOffsetSlider.addEventListener("change", change);
    sizeSlider.addEventListener("change", change);
    lineWidthSlider.addEventListener("change", () => {
        lineWidth =  Number.parseFloat(lineWidthSlider.value); rerender();
    })
    rainbowToggle.addEventListener("change", () => {debugColors = !!rainbowToggle.checked; requestRerender();})
    copySvgButton.addEventListener("click", () => {
        navigator.clipboard.writeText(svgPolygram(selN, selOffset, debugColors, (1000/size) * lineWidth, "black")).then(() => {
            copySvgButton.textContent = "Copied! <3"
            setTimeout(() => {
                copySvgButton.textContent = "Copy SVG"
            }, 2000)
        }, () => {
            // nothing
            console.log("clipboard gnomed");
        })
    })


    // ZOOM, PAN, SELECT
    function select(offsetX, offsetY) {
        selN = Math.floor(n + offsetX/size);
        selOffset =  Math.floor(offset + offsetY/size);
        selShanpes = hfc(selN, selOffset);
        resetShapeAnim();

        console.log("select ", selN, selOffset);

        if(selOffset < Math.ceil(selN/2) && selOffset>=1 && selN>=2 ) { 
            let shanpes = hfc(selN, selOffset);

            nameBox.innerHTML = getShapeName(selN, selOffset) 

            descBox.innerHTML =( 
`Vertices: ${selN}
Each Vertex is connected to its ${selOffset}${selOffset===1?"st":selOffset===2?"nd":selOffset===3?"rd":"th"} Neighbour
`+ (shanpes>1?`Drawn using ${shanpes} rotated ${getShapeName(selN/shanpes, selOffset/shanpes)}s`:`Drawn with one continuous line`)
);         
            copySvgButton.removeAttribute("disabled");
        } else {
            nameBox.innerHTML = "FBI"
            descBox.innerHTML =("Illegal Shape.\nGo to Jail.");         
            selN = undefined;
            selOffset = undefined;
            selShanpes = undefined;
            copySvgButton.setAttribute("disabled", "true");
        }
    }
    function zoom(x, y, zoomAmount) {
        n += x/size
        offset += y/size

        let prevSize = size;
        size = Math.max(size - zoomAmount, 20);
        lineWidth *= size/prevSize;
        sizeSlider.value = size;

        n-= x/size;
        offset -= y/size
    }
    function pan(dx, dy) {
        n -= dx/size;
        offset -= dy/size;
        startOffsetSlider.value = offset;
        startNSlider.value = n;
    }

    
    let down = false;
    let drag = false;
    
    canvas.addEventListener("mousedown", () => {
        down = true;
    });
    document.addEventListener("mousemove", (e ) => {
        if(down) {
            drag=true;
            pan(e.movementX, e.movementY)
            requestRerender();
        }
    });
    document.addEventListener("mouseup", (ev) => {
        if(!drag && ev.target === canvas) {
            //CLICK
            
            select(ev.offsetX, ev.offsetY);


            requestRerender();
        }

        drag=false;
        down=false;
    });
    canvas.addEventListener("wheel", (ev) => {
        zoom(ev.offsetX, ev.offsetY, ev.deltaY);

        requestRerender();
        ev.stopPropagation();
        ev.preventDefault();
    })

    let touchPoints = {};
    let touchAmount = 0;
    canvas.addEventListener("touchstart", (ev) => {
        for (let i=0; i<ev.changedTouches.length; i++) {
            let touch = ev.changedTouches[i];
            touchPoints[touch.identifier] = [touch.screenX, touch.screenY];
            touchAmount++;
        }
        ev.stopPropagation();
        //ev.preventDefault();
    });
    
    canvas.addEventListener("touchmove", (ev) => {
        
        let touch = ev.targetTouches[0];
             
            
        if(touchAmount==2) {
            let bounding = canvas.getBoundingClientRect();
            let offsetX = touch.clientX -bounding.x;
            let offsetY = touch.clientY -bounding.y;

            let touch2 = ev.targetTouches[1];

            //let d2X = touch2.screenX - touchPoints[touch2.identifier][0];
            //let d2Y = touch2.screenY - touchPoints[touch2.identifier][1];

            let tdX = touch.screenX - touch2.screenX;
            let tdY = touch.screenY - touch2.screenY;

            let mX = offsetX - tdX/2;
            let mY = offsetY - tdY/2;

            //ctx.fillStyle="red";
            //ctx.fillRect(mX, mY, 1000, 1000);

            let distance = Math.sqrt(tdX*tdX + tdY*tdY);
            let lastDistance = Math.sqrt( 
                Math.pow(touchPoints[touch.identifier][0] - touchPoints[touch2.identifier][0], 2) 
                + Math.pow(touchPoints[touch.identifier][1] - touchPoints[touch2.identifier][1], 2)
            );
            //descBox.innerHTML = "distance ="+distance + "\nlastDistance ="+lastDistance;

            zoom(mX, mY, lastDistance-distance );
            lastDistance = distance;

            touchPoints[touch2.identifier] = [touch2.screenX, touch2.screenY];
        }

        if( touchAmount == 1) {
            let dX = touch.screenX - touchPoints[touch.identifier][0];
            let dY = touch.screenY - touchPoints[touch.identifier][1];

            pan(dX, dY);

            
        }

        touchPoints[touch.identifier] = [touch.screenX, touch.screenY];

        requestRerender();

        ev.stopPropagation();
        ev.preventDefault();
    });

    canvas.addEventListener("touchcancel", (ev) => {
        forgetTouches(ev);
        ev.stopPropagation();
        ev.preventDefault();
    });

    canvas.addEventListener("touchend", (ev) => {
        forgetTouches(ev);
        ev.stopPropagation();
    });

    function forgetTouches(ev) {
        for (let i=0; i<ev.changedTouches.length; i++) {
            let touch = ev.changedTouches[i];
            delete touchPoints[touch.identifier];
            touchAmount--;
        }
        if(touchAmount === 1) {
            lastDistance = false;
        }
    }


    requestAnimationFrame(shapeAnim);
});


/**
 * @param {CanvasRenderingContext2D} ctx 
 */
function polygramTest( ctx, startNf=5, startOffsetf=2, size = 100, debugColors=true ) {
    let h = ctx.canvas.height;
    let w = ctx.canvas.width;

    let startN = Math.floor(startNf);
    let startOffset = Math.floor(startOffsetf);

    for(let n = startN; n< (w/size)+startN+1; n++) {
        ctx.fillStyle= "magenta"
        
        for(let offset = startOffset; offset< (h/size)+startOffset+1; offset++) {
            

            //console.log(n+" -- "+offset)
            if(offset < Math.ceil(n/2) && offset>=1 && n>=2)
                drawPolygram(ctx, size*(n-startNf), size*(offset-startOffsetf), size, n, offset,debugColors);
            
            if(n===startN){
                ctx.fillStyle= "magenta"
                ctx.fillText(offset, size*(n-startN), size*(offset-startOffsetf)+20, 30)
            }
        }

        ctx.fillText(n, size*(n-startNf), 10, 30)
    }
}

function getShapeName(n, offset) {
    let name = getNumberPrefix(n)+ (offset>1?"gram":"gon");
    switch(n) {
        case 3: name="triangle"; break;
        case 4: name="square"; break;
    }
    return name;
}

function getNumberPrefix(n) {
    let stringNumber = n+"";
    let digits = stringNumber.split("").map(Number);

    return digits.reduce((prev, current, index) => {
        if(current === 0) return prev;

        switch(-index+digits.length-1) {
            case 0: // 1, 2, 3, 4, 5
                return prev+simpleNumberPrefix(current);
            case 1: // 10, 20, 30, 40
                switch(current) {
                    case 1:
                        return prev+"deca-";
                    case 2:
                        //console.log(digits[index+1]);
                        return prev+(digits[index+1]==0?"icosa-":"icosi-");
                    default:
                        return prev+simpleNumberPrefix(current)+"conta-"
                }
            case 2: // 100, 200 ,300
                return prev+simpleNumberPrefix(current, true)+"hecta-";
        }
    }, "");
}

function simpleNumberPrefix(n , multiply=false) {
    switch(n) {
        case 1:
            return multiply ? "" : "mono" //hena
        case 2:
            return "bi" //di
        case 3:
            return "tri"
        case 4:
            return "tetra"
        case 5:
            return "penta"
        case 6:
            return "hexa"
        case 7:
            return "septa" //hepta
        case 8:
            return "octa"
        case 9:
            return "nona" //ennea
    }
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Number} repetitions 
 */
function drawSpiral(ctx, repetitions) {
    let h = ctx.canvas.height;
    let w = ctx.canvas.width;
    ctx.resetTransform();
    ctx.globalCompositeOperation = "source-over";

    for(let i=0; i<repetitions; i++) {
        let br = 255*(i+1)/repetitions;

        ctx.fillStyle = `rgb(${br},${br},${br})`
        //ctx.fillStyle= `hsla(${br}, 100%, 50%, ${(5/repetitions)*100}%)`
        ctx.fillRect(w/2, h/2, w, w);
        ctx.translate(w/2, h/2)
        ctx.rotate( (360/repetitions)*(Math.PI/180) );
        ctx.translate(-w/2, -h/2)
    }
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Number} n 
 */
function getPointCircle(x, y, w, h, n, angleOffset=0) {
    let circle = [];
    for(let i=0; i<n; i++) {
        let point = getEllipsePoint(360*(i/n)*(Math.PI/180), x, y, w, h, angleOffset);
        circle.push(point);
    }
    return circle;
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Array} arr 
 */
function drawPointArray(ctx, arr ) {
    ctx.fillStyle="#000000";

    console.log(arr);

    for (let i in arr) {
        let point = arr[i];
        ctx.fillRect(point[0]-1, point[1]-1, 3, 3)
    }
}

function getEllipsePoint(angle, x, y, w, h, angleOffset=0) {
    angle = angle+angleOffset % 360;
    return [(Math.sin(angle)+1)/2*w+x,( Math.cos(angle)+1)/2*h+y]
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Number} n 
 */
function drawPolygram(ctx, x, y, size, n, noffset=2, setDBGcolor=false, shanpeLimit=Infinity, edgeLimit=Infinity) {
    let lineWidth = Math.min( ctx.lineWidth, size/2);
    ctx.lineWidth = lineWidth;

    let points = getPointCircle(x+lineWidth/2,y+lineWidth/2,size-lineWidth,size-lineWidth, n);
    //console.log(points);
    //drawPointArray(ctx, points);

    let shanpes = hfc(n,noffset);

    for(let i=0; i< Math.min(shanpes, shanpeLimit); i++) {
        let startIdx = i;
        let currentIdx = i;

        if(setDBGcolor) {
            ctx.strokeStyle= "#4000ff";
            ctx.strokeStyle = `hsl( ${(i/(shanpes-1))*255}, 100%, 50% )`;
            if(ctx.svgMock)
                ctx.strokeStyle = hslToHex((i/(shanpes-1))*255, 100, 50 );
        }

        ctx.beginPath();
        ctx.moveTo(...points[currentIdx]);

        let j=0;
        do {
            j++;
            ctx.lineTo(...points[currentIdx]);
            currentIdx = (currentIdx +noffset) % points.length;
        } while (currentIdx!= startIdx && j<edgeLimit);

        ctx.lineTo(...points[currentIdx]);
        ctx.stroke();

    }
}

function svgPolygram( n, noffset, dbgColor=false, strokeWidth, strokeStyle, fillStyle="transparent") {
    let pathElements = [];
    let currentPath = "";

    

    let svgCtx = {
        svgMock: true,
        beginPath: () => {
        },
        moveTo: (x, y) => {
            currentPath+= `M${x} ${y}`;
        }, 
        lineTo: (x, y) => {
            currentPath+= `L${x} ${y}`;
        },
        strokeStyle,
        lineWidth: strokeWidth,
    };

    let strokeFunction = () => {
        console.log(this);
        if(currentPath) pathElements.push(
            `   <path d="${currentPath}" stroke="${svgCtx.strokeStyle}" stroke-width="${Math.max(strokeWidth, 1)}" stroke-linecap="round" stroke-linejoin="round" fill="${fillStyle}"/>`
        );
        currentPath="";
    };
    svgCtx.stroke = strokeFunction.bind(svgCtx);


    drawPolygram(svgCtx, 0, 0, 1000, n, noffset, dbgColor)

    return `<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"> 
${pathElements.reduce((prev, current) => prev+"\n"+current, "")}
    </svg>`
}

function hfc(x, y) {
    let highest = 1;

    for(let i=2; i<=Math.min(x,y); i++) {
        if(x%i===0 && y%i===0) {
            highest = i;
        }
    }

    return highest;
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }