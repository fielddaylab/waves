var Components = function(components)
{
  var self = this;
  self.components = components;

  self.highestAmp = 1;
  self._dirty = true;

  self.f = function(x)
  {
    var y = 0;
    for(var i = 0; i < self.components.length; i++)
    {
      if(i == 0)
        y += self.components[i].f(x);
      else if(self.components[i-1].comb == COMP_COMB_ADD)
        y += self.components[i].f(x);
      else if(self.components[i-1].comb == COMP_COMB_MUL)
        y *= self.components[i].f(x);
    }
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
      // also include the amplitudes of individual components
      for (var j = 0; j < self.components.length; j++)
      {
        y = Math.abs(self.components[j].f(sx+((ex-sx)*(i/s))));
        if(y > amp) amp = y;
      }
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

