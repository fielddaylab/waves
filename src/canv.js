//Wrapper for canvas, auto inits BS and adds useful utils
var Canv = function(init)
{
  var default_init =
  {
    width:640,
    height:320,
    fillStyle:"#000000",
    strokeStyle:"#000000",
    font:"12px vg_font",
    smoothing:false
  }

  var self = this;
  doMapInitDefaults(init,init,default_init);

  self.canvas = document.createElement('canvas');
  self.canvas.setAttribute('width', init.width);
  self.canvas.setAttribute('height',init.height);

  self.context = self.canvas.getContext('2d');

  self.context.fillStyle   = init.fillStyle;
  self.context.strokeStyle = init.strokeStyle;
  self.context.lineWidth   = init.lineWidth;
  self.context.font        = init.font;

  self.context.imageSmoothingEnabled       = init.smoothing;
  self.context.webkitImageSmoothingEnabled = init.smoothing;
};
Canv.prototype.clear = function()
{
  var self = this;
  self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
};
Canv.prototype.blitTo = function(canv)
{
  var self = this;
  //drawImage(source, sourcex, sourcey, sourcew, sourceh, destx, desty, destw, desth);
  canv.context.drawImage(self.canvas, 0, 0, self.canvas.width, self.canvas.height, 0, 0, canv.canvas.width, canv.canvas.height);
};

