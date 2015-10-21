var graph_n_samples = 500;
var graph_min_x = -50;
var graph_max_x =  50;
var graph_min_y = -50;
var graph_max_y =  50;

var ENUM = 0;
var COMP_TYPE_NONE   = ENUM; ENUM++;
var COMP_TYPE_SIN    = ENUM; ENUM++;
var COMP_TYPE_SQUARE = ENUM; ENUM++;
var Component = function(type, offset, wavelength, amplitude)
{
  var self = this;
  self.type = type;
  self.offset = offset;
  self.wavelength = wavelength;
  self.amplitude = amplitude;

  self.set = function(type, offset, wavelength, amplitude)
  {
    self.type = type;
    self.offset = offset;
    self.wavelength = wavelength;
    self.amplitude = amplitude;
  }

  self._dirty = true;

  self.f = function(x)
  {
    x += self.offset;
    var y = 0;

    switch(self.type)
    {
      case COMP_TYPE_NONE:
        break;
      case COMP_TYPE_SIN:
        x /= self.wavelength;
        y = Math.sin(x*(2*Math.PI));
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
    return y;
  }

  self.dirty   = function() { self._dirty = true; }
  self.cleanse = function() { self._dirty = false; }
  self.isDirty = function() { return self._dirty; }
}

var Composition = function(c0, c1)
{
  var self = this;
  self.c0 = c0;
  self.c1 = c1;

  self.f = function(x)
  {
    var y = 0;
    y += self.c0.f(x);
    y += self.c1.f(x);
    return y;
  }

  self.dirty = function()
  {
    self.c0.dirty();
    self.c1.dirty();
  }
  self.cleanse = function()
  {
    self.c0.cleanse();
    self.c1.cleanse();
  }
  self.isDirty = function()
  {
    return self.c0.isDirty() || self.c1.isDirty();
  }
}

var GraphDrawer = function(composition, n_samples, min_x, max_x, min_y, max_y, x, y, w, h)
{
  var self = this;
  self.composition = composition;
  self.n_samples = n_samples; if(self.n_samples < 2) self.n_samples = 2; //left and right side of graph at minimum

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.min_x = min_x;
  self.max_x = max_x;
  self.min_y = min_y;
  self.max_y = max_y;

  self.canv; //gets initialized in position

  self.color = "#000000";
  self.drawGrid = true;
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

      if(self.drawGrid)
      {
        self.canv.context.strokeStyle = "#AAAAAA";
        for(var i = self.min_y; i <= self.max_y; i++)
        {
          //self.canv.context.beginPath();
          //self.canv.context.moveTo(0,);
          //self.canv.context.lineTo(self.w,(self.h/2)-((i/self.highestAmp)*((self.h/2)*(3/4))));
          //self.canv.context.stroke();
        }
      }

      var sample;
      var t;
      self.canv.context.strokeStyle = self.color;
      self.canv.context.strokeRect(0,0,self.w,self.h);
      self.canv.context.beginPath();


      sample = self.composition.f(self.min_x);
      self.canv.context.moveTo(0,(self.h/2)-((sample/self.max_y)*((self.h/2)*(3/4))));
      for(var i = 1; i < self.n_samples; i++)
      {
        t = i/(self.n_samples-1);
        sample = self.composition.f(lerp(self.min_x,self.max_x,t));
        self.canv.context.lineTo(t*self.w,mapRange(self.min_y,self.max_y,sample,self.h,0));
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
  }
  self.isDirty = function()
  {
    return self._dirty || self.composition.isDirty();
  }
}

var ComponentEditor = function(component, n_samples, min_x, max_x, min_y, max_y, x,y,w,h)
{
  var self = this;
  self.component = component;
  self.n_samples = n_samples; if(self.n_samples < 2) self.n_samples = 2; //left and right side of graph at minimum

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.default_offset = (min_x+max_x)/2;
  self.default_wavelength = (2+(max_x*2))/2;
  self.default_amplitude = max_y/4;

  self.graph = new GraphDrawer(self.component, self.n_samples, min_x, max_x, min_y, max_y, self.x+10, self.y+10, self.w-20, (self.h-20)/2);
  self.reset_button = new ButtonBox(self.x+10, self.y+10, 20, 20, function(on) { console.log("reset:"+on); });
  self.offset_slider     = new SliderBox(self.x+10, self.y+self.h/2+10,          self.w-20, 20, min_x,   max_x,     self.default_offset, function(n) { self.component.offset = n; self.component.dirty(); });
  self.wavelength_slider = new SliderBox(self.x+10, self.y+self.h/2+self.h/4-10, self.w-20, 20,     2, max_x*2, self.default_wavelength, function(n) { self.component.wavelength = n; self.component.dirty(); });
  self.amplitude_slider  = new SliderBox(self.x+10, self.y+self.h-10-20,         self.w-20, 20,     0, max_y/2,  self.default_amplitude, function(n) { self.component.amplitude = n; self.component.dirty(); });

  self.register = function(presser, dragger)
  {
    presser.register(self.reset_button);
    dragger.register(self.offset_slider);
    dragger.register(self.wavelength_slider);
    dragger.register(self.amplitude_slider);
  }

  self.setDefaults = function(offset, wavelength, amplitude)
  {
    self.default_offset = offset;
    self.default_wavelength = wavelength;
    self.default_amplitude = amplitude;
  }

  self.reset = function()
  {
    self.offset_slider.set(self.default_offset);
    self.wavelength_slider.set(self.default_wavelength);
    self.amplitude_slider.set(self.default_amplitude);
  }

  self.draw = function(canv)
  {
    self.graph.draw(canv);
    self.reset_button.draw(canv);
    self.offset_slider.draw(canv);
    self.wavelength_slider.draw(canv);
    self.amplitude_slider.draw(canv);
    canv.context.strokeStyle = "#000000";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }
}

var GamePlayScene = function(game, stage)
{
  var self = this;
  self.dc = stage.drawCanv;
  self.c = self.dc.canvas;

  var dragger;
  var presser;

  var C0;
  var C1;
  var Comp;
  var Display;
  var E0;
  var E1;

  self.ready = function()
  {
    dragger = new Dragger({source:stage.dispCanv.canvas});
    presser = new Presser({source:stage.dispCanv.canvas});

    C0 = new Component(COMP_TYPE_SIN, 0, 5, 5);
    C1 = new Component(COMP_TYPE_NONE, 0, 0, 0);
    Comp = new Composition(C0, C1);
    Display = new GraphDrawer(Comp,   graph_n_samples, graph_min_x, graph_max_x, graph_min_y, graph_max_y,                  10,                 10,     self.c.width-20, ((self.c.height-20)/2));
    E0      = new ComponentEditor(C0, graph_n_samples, graph_min_x, graph_max_x, graph_min_y, graph_max_y,                  10, self.c.height/2+10, (self.c.width/2)-20,   (self.c.height/2)-20);
    E1      = new ComponentEditor(C1, graph_n_samples, graph_min_x, graph_max_x, graph_min_y, graph_max_y, (self.c.width/2)+10, self.c.height/2+10, (self.c.width/2)-20,   (self.c.height/2)-20);

    E0.register(presser, dragger);
    E1.register(presser, dragger);
  };

  self.tick = function()
  {
    presser.flush();
    dragger.flush();
  };

  self.draw = function()
  {
    Display.draw(self.dc);
    E0.draw(self.dc);
    E1.draw(self.dc);

    Comp.cleanse();
    Display.cleanse();
  };

  self.cleanup = function()
  {
  };
};

