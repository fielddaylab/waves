//Wrapper for "high performance" drawing (really, just pseudo double-buffering)
var Stage = function(init)
{
  var default_init =
  {
    width:640,
    height:320,
    container:"stage_container"
  }

  var self = this;
  doMapInitDefaults(self,init,default_init);

  //javascript is terrible
  var dpr = window.devicePixelRatio ||
            1;
  var tmp_canvas = document.createElement('canvas');
  var tmp_context = tmp_canvas.getContext('2d');
  var bspr = tmp_context.webkitBackingStorePixelRatio ||
             tmp_context.mozBackingStorePixelRatio ||
             tmp_context.msBackingStorePixelRatio ||
             tmp_context.oBackingStorePixelRatio ||
             tmp_context.backingStorePixelRatio ||
             1;

  self.drawCanv = new Canv({width:self.width,height:self.height,dpr_to_bspr:dpr/bspr});
  self.drawCanv.context.scale(self.drawCanv.dpr_to_bspr, self.drawCanv.dpr_to_bspr);
  self.drawCanv.scale = self.drawCanv.dpr_to_bspr;
  self.dispCanv = new Canv({width:self.width,height:self.height,dpr_to_bspr:dpr/bspr});

  self.dispCanv.canvas.style.width = self.width+"px";
  self.dispCanv.canvas.style.height = self.height+"px";

  self.draw = function()
  {
    self.drawCanv.blitTo(self.dispCanv);
  };

  self.clear = function()
  {
    self.drawCanv.clear();
    self.dispCanv.clear();
  };

  document.getElementById(self.container).appendChild(self.dispCanv.canvas);
};

