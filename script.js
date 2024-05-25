var blocks = document.querySelectorAll('.block');
var activeBlockIndex = 0;
let typewriterDone = false;

const cursorDot = document.getElementById("cursorDot");
const cursorOutline = document.getElementById("cursorOutline");

// Custom cursor
window.addEventListener("mousemove", (ev) => {
    posX = ev.clientX;
    posY = ev.clientY;

    cursorDot.style.top = `${posY}px`;
    cursorDot.style.left = `${posX}px`;

    cursorOutline.animate(
        {
            left: `${posX}px`,
            top: `${posY}px`
        }, {duration: 500, fill: "forwards"});
});
// Custom cursor END

// Switch blocks
function switchBlock(next) {
    blocks[activeBlockIndex].classList.remove('active');
    activeBlockIndex = next;
    blocks[activeBlockIndex].classList.add('active');
    if (next === 1 && !typewriterDone) { 
        typeWriter(text, speed, 'textArea'); 
        typewriterDone = true;
      }
    if (activeBlockIndex === blocks.length - 1) {
        blocks[activeBlockIndex].style.overflowY = 'auto';
        blocks[activeBlockIndex].style.overflowX = 'hidden'; 
    } else {
        blocks[activeBlockIndex].style.overflow = 'hidden';
    }
}

document.addEventListener('wheel', function(event) {
    var delta = event.deltaY;

    if (activeBlockIndex === blocks.length - 1) {
        var lastBlock = blocks[activeBlockIndex];

        if (delta < 0 && lastBlock.scrollTop === 0) {
            event.preventDefault(); 
            switchBlock(activeBlockIndex - 1); 
            return;
        }

        if (lastBlock.scrollHeight > lastBlock.offsetHeight) {
            event.preventDefault = false;
            return;
        }
    }

    if (delta > 0 && activeBlockIndex < blocks.length - 1) {
        switchBlock(activeBlockIndex + 1);
    } else if (delta < 0 && activeBlockIndex > 0) {
        switchBlock(activeBlockIndex - 1);
    } else {
        event.preventDefault();
    }
}, { passive: false });

var startX, startY, touchEndY, touchEndX; 

document.addEventListener('touchstart', function(event) {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;

    var deltaY = touchEndY - startY;

    if (activeBlockIndex === blocks.length - 1) {
        var lastBlock = blocks[activeBlockIndex];

        if (lastBlock.scrollTop === 0 && deltaY > 0) { 
            switchBlock(activeBlockIndex - 1);
            return;
        }

        if (lastBlock.scrollHeight > lastBlock.offsetHeight) {
            return;
        }
    }

    if (deltaY > 40 && activeBlockIndex > 0) { 
        switchBlock(activeBlockIndex - 1);
    } else if (deltaY < -40 && activeBlockIndex < blocks.length - 1) {
        switchBlock(activeBlockIndex + 1);
    }
}, { passive: false });
// Switch blocks END

// First BG
(function() {

    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

    // Main
    initHeader();
    initAnimation();
    addListeners();

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: width/2, y: height/2};

        largeHeader = document.getElementById('large-header');
        largeHeader.style.height = height+'px';

        canvas = document.getElementById('demo-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // create points
        points = [];
        for(var x = 0; x < width; x = x + width/20) {
            for(var y = 0; y < height; y = y + height/20) {
                var px = x + Math.random()*width/20;
                var py = y + Math.random()*height/20;
                var p = {x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }

        // for each point find the 5 closest points
        for(var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for(var j = 0; j < points.length; j++) {
                var p2 = points[j]
                if(!(p1 == p2)) {
                    var placed = false;
                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(closest[k] == undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }

        // assign a circle to each point
        for(var i in points) {
            var c = new Circle(points[i], 2+Math.random()*2, 'rgba(255,255,255,0.3)');
            points[i].circle = c;
        }
    }

    // Event handling
    function addListeners() {
        if(!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
        }
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }

    function mouseMove(e) {
        var posx = posy = 0;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY)    {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        target.x = posx;
        target.y = posy;
    }

    function scrollCheck() {
        if(document.body.scrollTop > height) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height+'px';
        canvas.width = width;
        canvas.height = height;
    }

    // animation
    function initAnimation() {
        animate();
        for(var i in points) {
            shiftPoint(points[i]);
        }
    }

    function animate() {
        if(animateHeader) {
            ctx.clearRect(0,0,width,height);
            for(var i in points) {
                // detect points in range
                if(Math.abs(getDistance(target, points[i])) < 4000) {
                    points[i].active = 0.3;
                    points[i].circle.active = 0.6;
                } else if(Math.abs(getDistance(target, points[i])) < 20000) {
                    points[i].active = 0.1;
                    points[i].circle.active = 0.3;
                } else if(Math.abs(getDistance(target, points[i])) < 40000) {
                    points[i].active = 0.02;
                    points[i].circle.active = 0.1;
                } else {
                    points[i].active = 0;
                    points[i].circle.active = 0;
                }

                drawLines(points[i]);
                points[i].circle.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
        TweenLite.to(p, 1+1*Math.random(), {x:p.originX-50+Math.random()*100,
            y: p.originY-50+Math.random()*100, ease:Circ.easeInOut,
            onComplete: function() {
                shiftPoint(p);
            }});
    }

    // Canvas manipulation
    function drawLines(p) {
        if(!p.active) return;
        for(var i in p.closest) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            ctx.strokeStyle = 'rgba(255,255,255,'+ p.active+')';
            ctx.stroke();
        }
    }

    function Circle(pos,rad,color) {
        var _this = this;

        // constructor
        (function() {
            _this.pos = pos || null;
            _this.radius = rad || null;
            _this.color = color || null;
        })();

        this.draw = function() {
            if(!_this.active) return;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(255,255,255,'+ _this.active+')';
            ctx.fill();
        };
    }

    // Util
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
    
})();
// First BG END

// Print text
function typeWriter(text, speed, targetId) {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        let char = text[i];
        let nextChar = text[i + 1];
        if (char === ' ' && nextChar === ' ') {
          
          i++;
        } else if (char === '\n') {
         
          document.getElementById(targetId).innerHTML += '<br>';
          i++;
        } else {
          
          document.getElementById(targetId).innerHTML += char;
          i++;
        }
      } else {
        clearInterval(interval);
      }
    }, speed);
  }
  
  const text = "Меня зовут Кирилл, мне 18 лет и я fullstack - разработчик. " +
               "Учусь на 2 курсе в Новосибирском колледже печати и информационных технологий " +
               "на специальности «Информационные системы и программирование».";
  const speed = 40; 

// Print text END

// Projects 
function addHoverClass(element) {
    element.classList.add('hovered');
}

function removeHoverClass(element) {
    element.classList.remove('hovered');
}
// Projects END

// Fixed animation


// Fixed animation END