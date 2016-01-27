//Wrapper for canvas, auto inits BS and adds useful utils
var Canv = function(init)
{
  var default_init =
  {
    width:640,
    height:320,
    dpr_to_bspr:1,
    fillStyle:"#000000",
    strokeStyle:"#000000",
    lineWidth:2,
    font:"12px vg_font",
    smoothing:false
  }

  var self = this;
  doMapInitDefaults(init,init,default_init);

  self.width = init.width;
  self.height = init.height;
  self.dpr_to_bspr = init.dpr_to_bspr;
  self.scale = 1; //must manually update if changed!
  self.canvas = document.createElement('canvas');
  self.canvas.setAttribute('width', self.width*self.dpr_to_bspr);
  self.canvas.setAttribute('height',self.height*self.dpr_to_bspr);
  self.canvas.addEventListener('mousedown',function(evt){ evt.preventDefault(); },false);
  self.canvas.addEventListener('touchstart',function(evt){ evt.preventDefault(); },false);

  self.context = self.canvas.getContext('2d');

  self.context.fillStyle   = init.fillStyle;
  self.context.strokeStyle = init.strokeStyle;
  self.context.lineWidth   = init.lineWidth;
  self.context.font        = init.font;

  self.context.imageSmoothingEnabled = true;//init.smoothing;
};
Canv.prototype.clear = function()
{
  var self = this;
  self.context.clearRect(0, 0, self.canvas.width/self.scale, self.canvas.height/self.scale);
};
Canv.prototype.blitTo = function(canv)
{
  var self = this;
  //drawImage(source, sourcex, sourcey, sourcew, sourceh, destx, desty, destw, desth);
  canv.context.drawImage(self.canvas, 0, 0, self.canvas.width, self.canvas.height, 0, 0, canv.canvas.width/canv.scale, canv.canvas.height/canv.scale);
};
Canv.prototype.drawLine = function(ax,ay,bx,by)
{
  var self = this;
  var ca = self.canvas;
  var cx = self.context;

  cx.beginPath();
  cx.moveTo(ax,ay);
  cx.lineTo(bx,by);
  cx.stroke();
}
Canv.prototype.drawGrid = function(center_x, center_y, unit_x, unit_y)
{
  var self = this;
  var ca = self.canvas;
  var cx = self.context;

  var t;
  var x;
  var y;

  t = center_x;
  x = lerp(0,ca.width,t);
  while(t < 1)
  {
    self.drawLine(x,0,x,ca.height);
    x += unit_x;
    t = invlerp(0,ca.width,x);
  }
  t = center_x;
  x = lerp(0,ca.width,t);
  while(t > 0)
  {
    self.drawLine(x,0,x,ca.height);
    x -= unit_x;
    t = invlerp(0,ca.width,x);
  }

  t = center_y;
  y = lerp(0,ca.height,t);
  while(t < 1)
  {
    self.drawLine(0,y,ca.width,y);
    y += unit_y;
    t = invlerp(0,ca.height,y);
  }
  t = center_y;
  y = lerp(0,ca.height,t);
  while(t > 0)
  {
    self.drawLine(0,y,ca.width,y);
    y -= unit_y;
    t = invlerp(0,ca.height,y);
  }
}
Canv.prototype.outlineText = function(text,x,y,color_in,color_out,max_w)
{
  var self = this;
  if(!color_in)  color_in =  "#FFFFFF";
  if(!color_out) color_out = "#000000";
  if(max_w)
  {
    self.context.fillStyle = color_out;
    self.context.fillText(text,x-1,y-1,max_w);
    self.context.fillText(text,x+1,y-1,max_w);
    self.context.fillText(text,x-1,y+1,max_w);
    self.context.fillText(text,x+1,y+1,max_w);
    self.context.fillStyle = color_in;
    self.context.fillText(text,x  ,y  ,max_w);
  }
  else
  {
    self.context.fillStyle = color_out;
    self.context.fillText(text,x-1,y-1);
    self.context.fillText(text,x+1,y-1);
    self.context.fillText(text,x-1,y+1);
    self.context.fillText(text,x+1,y+1);
    self.context.fillStyle = color_in;
    self.context.fillText(text,x  ,y  );
  }
}

