var Knob = function(x,y,w,h,d,cw)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;
  self.r = self.w/2;
  self.d = d;
  self.cw = cw;

  //used for drag calcs
  self.offX = 0;
  self.offY = 0;
  self.deltaX = 0;
  self.deltaY = 0;
  self.dragging = false;

  self.val = 0;
  self._dirty = true;

  self.position = function(x,y,w,h)
  {
    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;
    self.r = self.w/2;

    self._dirty = true;
  }
  self.position(self.x,self.y,self.w,self.h);

  self.draw = function(canv)
  {
    canv.context.strokeStyle = "#000000";
    canv.context.beginPath();
    canv.context.arc(self.x+self.w/2, self.y+self.h/2, self.r, 0, Math.PI*2, true);
    canv.context.stroke();
    canv.context.closePath();

    if(self.dragging)
    {
      canv.context.beginPath();
      canv.context.moveTo(self.x+self.w/2,self.y+self.h/2);
      canv.context.lineTo(self.x+self.w/2+self.offX,self.y+self.h/2+self.offY);
      canv.context.stroke();

      var off = self.offY;
      if(self.cw) self.val = self.startVal + self.d*off/30;
      else        self.val = self.startVal - self.d*off/30;
      self._dirty = true;
    }
  }

  function len(x,y)
  {
    return math.sqrt((x*x)+(y*y));
  }
  self.dragStart = function(evt)
  {
    self.offX = evt.doX-(self.x+(self.w/2));
    self.offY = evt.doY-(self.y+(self.h/2));
    self.dragging = true;
    self.startVal = self.val;
  };
  self.drag = function(evt)
  {
    self.deltaX = (evt.doX-(self.x+(self.w/2)))-self.offX;
    self.deltaY = (evt.doY-(self.y+(self.h/2)))-self.offY;

    self.newoffX = evt.doX-(self.x+(self.w/2));
    self.newoffY = evt.doY-(self.y+(self.h/2));

    self.offX = self.newoffX;
    self.offY = self.newoffY;

    self._dirty = true;
  };
  self.dragFinish = function()
  {
    self.dragging = false;
  };

  self.isDirty = function() { return self._dirty; }
  self.dirty   = function() { self._dirty = true; }
  self.cleanse = function() { self._dirty = false; }
}

