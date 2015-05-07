var Components = function(components)
{
  var self = this;
  self.components = components;

  self.highestAmp = 1;
  self._dirty = true;

  self.f = function(x)
  {
    var y = 1;
    for(var i = 0; i < self.components.length; i++)
      y *= self.components[i].f(x);
    return y;
  }

  self.findHighestAmp = function(sx, ex, s)
  {
    var amp = 0;
    var y = 0;
    for(var i = 0; i < s; i++)
    {
      y = Math.abs(self.f(sx+((ex-sx)*(i/s))));
      if(y > amp) amp = y;
    }
    self.highestAmp = amp;
    return self.highestAmp;
  }

  self.dirty = function()
  {
    self._dirty = true;
    for(var i = 0; i < self.components.length; i++)
      self.components[i].dirty();
  }
  self.cleanse = function()
  {
    self._dirty = false;
    for(var i = 0; i < self.components.length; i++)
      self.components[i].cleanse();
  }
  self.isDirty = function()
  {
    var d = self._dirty;
    for(var i = 0; i < self.components.length; i++)
      d = d || self.components[i].isDirty();
    self._dirty = d;
    return self._dirty;
  }
}

