var GraphDrawer = function(components, samples, x, y, w, h, info)
{
  var self = this;
  self.components = components;
  self.samples = samples; if(self.samples < 2) self.samples = 2; //left and right side of graph at minimum

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.canv; //gets initialized in position

  self.lineColor = "#000000";             if(info.lineColor) self.lineColor = info.lineColor;
  self.bgColor = "rgba(255,255,255,0.5)"; if(info.bgColor) self.bgColor = info.bgColor;
  self.gridColor = "#AAAAAA";             if(info.gridColor) self.gridColor = info.gridColor;
  self.shadowColor = "#777777";           if(info.shadowColor) self.shadowColor = info.shadowColor;
  self.lineWidth = 1;                     if(info.lineWidth) self.lineWidth = info.lineWidth;
  self.shadowWidth = 0;                   if(info.shadowWidth) self.shadowWidth = info.shadowWidth;
  self.shadowOffX = 0;                    if(info.shadowOffX) self.shadowOffX = info.shadowOffX;
  self.shadowOffY = 0;                    if(info.shadowOffY) self.shadowOffY = info.shadowOffY;
  self.gridWidth = 0;                     if(info.gridWidth) self.gridWidth = info.gridWidth;
  self.drawBG = false;                    if(info.drawBG) self.drawBG = info.drawBG;
  self.drawOffY = 0;                      if(info.drawOffY) self.drawOffY = info.drawOffY;

  self.highestAmp = 1;
  self._dirty = true;

  self.position = function(x,y,w,h)
  {
    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.canv = new Canv(
      {
        width:self.w,
        height:self.h,
        fillStyle:"#000000",
        strokeStyle:"#000000",
        smoothing:true
      }
    );
    self._dirty = true;
  }
  self.position(self.x,self.y,self.w,self.h);

  self.draw = function(canv)
  {
    if(self.isDirty())
    {
      self.canv.clear();

      if(self.drawBG)
      {
        self.canv.context.fillStyle = self.bgColor;
        self.canv.context.fillRect(0,0,self.w,self.h);
      }

      if(self.gridWidth > 0)
      {
        self.canv.context.lineWidth = self.gridWidth;
        self.canv.context.strokeStyle = self.gridColor;
        for(var i = -2*Math.floor(self.highestAmp); i <= 2*Math.floor(self.highestAmp); i++)
        {
          self.canv.context.beginPath();
          self.canv.context.moveTo(0,     (self.h/2)-((i/self.highestAmp)*((self.h/2)*(3/4))));
          self.canv.context.lineTo(self.w,(self.h/2)-((i/self.highestAmp)*((self.h/2)*(3/4))));
          self.canv.context.stroke();
        }
      }

      var sample;
      var t;

      if(self.shadowWidth > 0)
      {
        self.canv.context.lineWidth = self.shadowWidth;
        self.canv.context.strokeStyle = self.shadowColor;
        self.canv.context.strokeRect(0,0,self.w,self.h);
        self.canv.context.beginPath();
        self.canv.context.moveTo(0,0);
        for(var i = 0; i < self.samples; i++)
        {
          t = i*(1/(self.samples-1));
          sample = self.components.f(t*2-1);
          self.canv.context.lineTo(t*self.w+self.shadowOffX,(self.h/2)-((sample/self.highestAmp)*((self.h/2)*(3/4)))+self.shadowOffY+self.drawOffY);
        }
        self.canv.context.stroke();
      }

      self.canv.context.lineWidth = self.lineWidth;
      self.canv.context.strokeStyle = self.lineColor;
      self.canv.context.strokeRect(0,0,self.w,self.h);
      self.canv.context.beginPath();
      self.canv.context.moveTo(0,0);
      for(var i = 0; i < self.samples; i++)
      {
        t = i*(1/(self.samples-1));
        sample = self.components.f(t*2-1);
        self.canv.context.lineTo(t*self.w,(self.h/2)-((sample/self.highestAmp)*((self.h/2)*(3/4)))+self.drawOffY);
      }
      self.canv.context.stroke();

      self._dirty = false;
    }

    canv.context.drawImage(self.canv.canvas, 0, 0, self.w, self.h, self.x, self.y, self.w, self.h);
  }

  self.dirty = function()
  {
    self._dirty = true;
  }
  self.cleanse = function()
  {
    self._dirty = false;
    self.components.cleanse();
  }
  self.isDirty = function()
  {
    var d = self._dirty;
    d = d || self.components.isDirty();
    self._dirty = d;
    return self._dirty;
  }
}

