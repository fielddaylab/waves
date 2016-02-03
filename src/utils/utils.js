/*
*
* DISCLAIMER: Javascript is terrible, and these utils are NOT intended for use in the general case
* for JS and all of its terribleness. These functions operate only on the most naively constructed of
* objects. If you're trying to do something fancy and these don't work for you, please take the
* rest of the day off to question your life choices. I wish you the best of luck.
*
*/

//maps attributes found in defaults from init onto obj, falling back to defaults value if not present in init
var doMapInitDefaults = function(obj, init, defaults)
{
  var attribs = Object.keys(defaults);
  for(var i = 0; i < attribs.length; i++)
  {
    var k = attribs[i];
    obj[k] = init.hasOwnProperty(k) ? init[k] : defaults[k];
  }
}

//sets doX and doY as x/y offset into the object listening for the event
function doSetPosOnEvent(evt)
{
  if(evt.offsetX != undefined)
  {
    evt.doX = evt.offsetX;
    evt.doY = evt.offsetY;
  }
  else if(evt.touches != undefined && evt.touches[0] != undefined)
  {
    //unfortunately, seems necessary...
    var t = evt.touches[0].target;

    var box = t.getBoundingClientRect();
    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    evt.doX = evt.touches[0].pageX-left;
    evt.doY = evt.touches[0].pageY-top;

  }
  else if(evt.layerX != undefined && evt.originalTarget != undefined)
  {
    evt.doX = evt.layerX-evt.originalTarget.offsetLeft;
    evt.doY = evt.layerY-evt.originalTarget.offsetTop;
  }
  else //give up because javascript is terrible
  {
    evt.doX = 0;
    evt.doY = 0;
  }
}

function feq(f1,f2,e)
{
  return (f1 < f2+e && f1 > f2-e);
}

function lerp(s,e,t)
{
  return s+((e-s)*t);
}

function invlerp(s,e,v)
{
  return (v-s)/(e-s);
}

function clerp(s,e,t)
{
  while(s < 0) s += Math.PI*2;
  while(e < 0) e += Math.PI*2;

       if(e > s && e-s > s-(e-Math.PI*2)) e -= Math.PI*2;
  else if(s > e && s-e > (e+Math.PI*2)-s) e += Math.PI*2;

  return lerp(s,e,t)%(Math.PI*2);
}

function cdist(a,b)
{
  while(a < 0) a += Math.PI*2;
  while(b < 0) b += Math.PI*2;
  var dist = Math.abs(a-b);
  if(dist > Math.PI) dist = Math.PI*2-dist;

  return dist;
}

function mapVal(from_min, from_max, to_min, to_max, v)
{
  return ((v-from_min)/(from_max-from_min))*(to_max-to_min)+to_min;
}
function mapPt(from,to,pt)
{
  pt.x = ((pt.x-from.x)/from.w)*to.w+to.x;
  pt.y = ((pt.y-from.y)/from.h)*to.h+to.y;
  return pt;
}
function mapRect(from,to,rect)
{
  rect.x = ((rect.x-from.x)/from.w)*to.w+to.x;
  rect.y = ((rect.y-from.y)/from.h)*to.h+to.y;
  rect.w = (rect.w/from.w)*to.w;
  rect.h = (rect.h/from.h)*to.h;
  return rect;
}

var ptWithin = function(ptx, pty, x, y, w, h)
{
  return (ptx >= x && ptx <= x+w && pty >= y && pty <= y+h);
}
var ptWithinObj = function(ptx, pty, obj)
{
  return ptWithin(ptx, pty, obj.x, obj.y, obj.w, obj.h);
}
var objWithinObj = function(obja, objb)
{
  console.log("not done!");
  return false;
}
var ptNear = function(ptx, pty, x, y, r)
{
  var w2 = (ptx-x)*(ptx-x);
  var h2 = (pty-y)*(pty-y);
  var d2 = r*r;
  return w2+h2 < d2;
}

var decToHex = function(dec, dig)
{
  var r = "";
  dig--;
  var mod = Math.pow(16,dig);

  var index = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
  for(; dig >= 0; dig--)
  {
    var v = Math.floor(dec/mod);
    r += index[v];
    dec -= Math.pow(16,dig)*v;
    mod /= 16;
  }

  return r;
}

var RGB2HSL = function(rgb, hsl)
{
  var cmax = Math.max(rgb.r,rgb.g,rgb.b);
  var cmin = Math.min(rgb.r,rgb.g,rgb.b);
  var d = cmax-cmin;
  hsl.l = (cmax+cmin)/2;
  if(hsl.l < 0.5) hsl.s = (cmax-cmin)/(cmax+cmin);
  else            hsl.s = (cmax-cmin)/(2-cmax-cmin);

  if(cmax == rgb.r) hsl.h = (rgb.g-rgb.b)/(cmax-cmin);
  if(cmax == rgb.g) hsl.h = 2 + (rgb.b-rgb.r)/(cmax-cmin);
  if(cmax == rgb.b) hsl.h = 4 + (rgb.r-rgb.g)/(cmax-cmin);

  hsl.h *= 60;

  if(hsl.h < 0) hsl.h += 360;
}

var HSL2RGBHelperConvertTMPValToFinal = function(tmp_1, tmp_2, val)
{
  if(val*6 < 1) return tmp_2 + (tmp_1-tmp_2)*6*val;
  else if(val*2 < 1) return tmp_1;
  else if(val*3 < 2) return tmp_2 + (tmp_1-tmp_2)*(0.666-val)*6;
  else return tmp_2;
}
var HSL2RGB = function(hsl, rgb)
{
  var tmp_1;
  var tmp_2;
  var tmp_3;

  if(hsl.l < 0.5) tmp_1 = hsl.l * (1+hsl.s);
  else            tmp_1 = hsl.l + hsl.s - (hsl.l*hsl.s);

  tmp_2 = (2*hsl.l)-tmp_1;
  tmp_3 = hsl.h/360;

  rgb.r = tmp_3 + 0.333; while(rgb.r > 1) rgb.r -= 1; while(rgb.r < 0) rgb.r += 1;
  rgb.g = tmp_3;         while(rgb.g > 1) rgb.g -= 1; while(rgb.g < 0) rgb.g += 1;
  rgb.b = tmp_3 - 0.333; while(rgb.b > 1) rgb.b -= 1; while(rgb.b < 0) rgb.b += 1;

  rgb.r = HSL2RGBHelperConvertTMPValToFinal(tmp_1, tmp_2, rgb.r);
  rgb.g = HSL2RGBHelperConvertTMPValToFinal(tmp_1, tmp_2, rgb.g);
  rgb.b = HSL2RGBHelperConvertTMPValToFinal(tmp_1, tmp_2, rgb.b);
}

var RGB2Hex = function(rgb)
{
  return "#"+dec2Hex(Math.floor(rgb.r*255))+dec2Hex(Math.floor(rgb.g*255))+dec2Hex(Math.floor(rgb.b*255));
}
var dec2Hex = function(n)
{
  return n.toString(16);
}

//short name- will be used often to place elements by percent, while guaranteeing integer results
var p    = function(percent, of) { return Math.floor(percent * of); }
var invp = function(      n, of) { return n/of; }

