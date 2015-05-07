var Placer = function(asset, x,y,w,h)
{
  var self = this;

  self.asset = asset;
  self.stroke = false;
  self.dragging = false;
  self.resizing = false;
  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;
  self.offX = 0;
  self.offY = 0;
  self.deltaX = 0;
  self.deltaY = 0;

  self.draw = function(canv)
  {
    canv.context.save();
    canv.context.globalAlpha = 0.8;
    canv.context.drawImage(self.asset, self.x,self.y,self.w,self.h);
    if(self.stroke) canv.context.strokeRect(self.x,self.y,self.w,self.h);
    canv.context.restore();
  }

  function len(x,y)
  {
    return math.sqrt((x*x)+(y*y));
  }
  self.dragStart = function(evt)
  {
    self.dragging = false;
    self.resizing = false;

    self.offX = evt.doX-(self.x+(self.w/2));
    self.offY = evt.doY-(self.y+(self.h/2));

    if(self.offX > 0.4*self.w && self.offY > 0.4*self.h)
      self.resizing = true
    else
      self.dragging = true;
  };
  self.drag = function(evt)
  {
    self.deltaX = (evt.doX-(self.x+(self.w/2)))-self.offX;
    self.deltaY = (evt.doY-(self.y+(self.h/2)))-self.offY;

    if(self.dragging)
    {
      self.x += self.deltaX;
      self.y += self.deltaY;
    }
    else if(self.resizing)
    {
      self.w += self.deltaX;
      self.h += self.deltaY;
    }

    self.offX = evt.doX-(self.x+(self.w/2));
    self.offY = evt.doY-(self.y+(self.h/2));

    self._dirty = true;
  };
  self.dragFinish = function()
  {
    self.dragging = false;
    self.resizing = false;
  };

  self.click = function(evt)
  {
    console.log(self.x+","+self.y+","+self.w+","+self.h);
    self.stroke = !self.stroke;
  }
}

