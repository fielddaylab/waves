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
var dbugger;
function doSetPosOnEvent(evt)
{
  if(!dbugger) dbugger = new Debugger({source:document.getElementById('debug_div')});

  if(evt.offsetX != undefined)
  {
    evt.doX = evt.offsetX;
    evt.doY = evt.offsetY;
  }
  else if(evt.touches != undefined && evt.touches[0] != undefined)
  {
    var r = evt.touches[0].target.getBoundingClientRect();
    evt.doX = evt.touches[0].pageX-r.left;
    evt.doY = evt.touches[0].pageY-r.top;
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

function mapRange(from_min,from_max,from_pt,to_min,to_max)
{
  return ((from_pt-from_min)/(from_max-from_min))*(to_max-to_min)+to_min;
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

