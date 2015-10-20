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

  self.drawCanv = new Canv({width:self.width,height:self.height});
  self.dispCanv = new Canv({width:self.width,height:self.height});
  self.dispCanv.canvas.style.border = "1px solid black";

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

