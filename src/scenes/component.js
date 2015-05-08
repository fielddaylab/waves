var COMP_TYPE_COUNT = 0;
var COMP_TYPE_SIN      = COMP_TYPE_COUNT; COMP_TYPE_COUNT++;
var COMP_TYPE_TRIANGLE = COMP_TYPE_COUNT; COMP_TYPE_COUNT++;
var COMP_TYPE_SAW      = COMP_TYPE_COUNT; COMP_TYPE_COUNT++;
var COMP_TYPE_SQUARE   = COMP_TYPE_COUNT; COMP_TYPE_COUNT++;
var Component = function()
{
  var self = this;
  self.type = 0;

  self.wavelength = 1;
  self.amplitude = 1;
  self.off_x = 0;

  self.abs = false;
  self.neg = false;

  self.highestAmp = 1; //cached value
  self._dirty = true;

  self.f = function(x)
  {
    x += self.off_x;
    var y = 0;

    switch(self.type)
    {
      case COMP_TYPE_SIN:
        x /= self.wavelength;
        y = Math.sin(x*(2*Math.PI));
        y *= self.amplitude;
        break;
      case COMP_TYPE_TRIANGLE:
        x /= self.wavelength;
        x *= 2;
        if(Math.floor(x)%2) //going up
        {
          x = x - Math.floor(x);
          y = (-1+(2*x));
          y *= self.amplitude;
        }
        else //going down
        {
          x = x - Math.floor(x);
          y = (1-(2*x));
          y *= self.amplitude;
        }
        break;
      case COMP_TYPE_SAW:
        x /= self.wavelength;
        y = (x - Math.floor(x));
        y *= self.amplitude;
        break;
      case COMP_TYPE_SQUARE:
        x /= self.wavelength;
        x *= 2;
        if(Math.floor(x)%2) y = -1;
        else                y = 1;
        y *= self.amplitude;
        break;
      default:
        break;
    }

    if(self.abs) y = Math.abs(y);
    if(self.neg) y = -y;
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

  self.dirty   = function() { self._dirty = true; }
  self.cleanse = function() { self._dirty = false; }
  self.isDirty = function() { return self._dirty; }
}

