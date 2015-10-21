var graph_n_samples = 500;
var graph_min_x = -50;
var graph_max_x =  50;
var graph_min_y = -50;
var graph_max_y =  50;
var graph_default_offset = (graph_min_x+graph_max_x)/2;
var graph_default_wavelength = (2+(graph_max_x*2))/2;
var graph_default_amplitude = graph_max_y/4;

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
    self.dirty();
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
  self.cleanse = function()
  {
    self._dirty = false;
  }
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

      var sample;
      var t;
      self.canv.context.strokeStyle = self.color;
      self.canv.context.strokeRect(0,0,self.w,self.h);

      //draw 0 line
      self.canv.context.strokeStyle = "#555555";
      self.canv.context.lineWidth = 0.5;
      self.canv.context.beginPath();
      self.canv.context.moveTo(0,self.h/2+0.5);
      self.canv.context.lineTo(self.w,self.h/2+0.5);
      self.canv.context.stroke();

      self.canv.context.strokeStyle = self.color;
      self.canv.context.lineWidth = 2;
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
  self.default_wavelength = max_x;
  self.default_amplitude = max_y/4;

  self.graph = new GraphDrawer(self.component, self.n_samples, min_x, max_x, min_y, max_y, self.x+10, self.y+10, self.w-20, (self.h-20)/2);
  self.reset_button = new ButtonBox(self.x+10, self.y+10, 20, 20, function(on) { self.reset(); });
  self.offset_slider     = new SmoothSliderBox(self.x+10, self.y+self.h/2+10,          self.w-20, 20, min_x,   max_x,     self.default_offset, function(n) { if(!self.enabled) { self.offset_slider.val     = self.component.offset;     } else { self.component.offset     = n; self.component.dirty(); } });
  self.wavelength_slider = new SmoothSliderBox(self.x+10, self.y+self.h/2+self.h/4-10, self.w-20, 20,     2, max_x*2, self.default_wavelength, function(n) { if(!self.enabled) { self.wavelength_slider.val = self.component.wavelength; } else { self.component.wavelength = n; self.component.dirty(); } });
  self.amplitude_slider  = new SmoothSliderBox(self.x+10, self.y+self.h-10-20,         self.w-20, 20,     0, max_y/2,  self.default_amplitude, function(n) { if(!self.enabled) { self.amplitude_slider.val  = self.component.amplitude;  } else { self.component.amplitude  = n; self.component.dirty(); } });

  self.enabled = true;
  self.visible = true;

  self.isDragging = function()
  {
    return self.offset_slider.dragging || self.wavelength_slider.dragging || self.amplitude_slider.dragging;
  }

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

  self.hardReset = function()
  {
    self.offset_slider.val = self.default_offset;
    self.wavelength_slider.val = self.default_wavelength;
    self.amplitude_slider.val = self.default_amplitude;
    self.offset_slider.desired_val = self.default_offset;
    self.wavelength_slider.desired_val = self.default_wavelength;
    self.amplitude_slider.desired_val = self.default_amplitude;
    self.component.offset = self.default_offset;
    self.component.wavelength = self.default_wavelength;
    self.component.amplitude = self.default_amplitude;
    self.component.dirty();
  }

  self.reset = function()
  {
    self.offset_slider.set(self.default_offset);
    self.wavelength_slider.set(self.default_wavelength);
    self.amplitude_slider.set(self.default_amplitude);
  }

  self.tick = function()
  {
    self.offset_slider.tick();
    self.wavelength_slider.tick();
    self.amplitude_slider.tick();
  }

  self.draw = function(canv)
  {
    if(!self.visible) return;

    self.graph.draw(canv);
    self.reset_button.draw(canv);
    self.offset_slider.draw(canv);
    self.wavelength_slider.draw(canv);
    self.amplitude_slider.draw(canv);
    canv.context.strokeStyle = "#000000";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);

    if(!self.enabled)
    {
      canv.context.fillStyle = "rgba(100,100,100,0.5)";
      canv.context.fillRect(self.x,self.y,self.w,self.h);
    }
  }
}

var Validator = function(myC, gC, min_x, max_x, res)
{
  var self = this;

  self.myC = myC;
  self.gC  = gC;

  self.min_x = min_x;
  self.max_x = max_x;

  self.res = res;

  self._dirty = true;

  self.valid = false;

  self.validate = function(wiggle_room)
  {
    if(!self.isDirty() && !self.myC.isDirty() && !self.gC.isDirty()) return self.valid; //last known result

    var delta = 0;
    var t;
    var s0;
    var s1;
    for(var i = 0; i < res; i++)
    {
      t = i/(self.res-1);
      s0 = self.myC.f(lerp(self.min_x,self.max_x,t));
      s1 = self.gC.f( lerp(self.min_x,self.max_x,t));
      delta += Math.abs(s0-s1);
    }
    //console.log(delta);
    self.valid = delta < wiggle_room;
    return self.valid;
  }

  self.dirty   = function() { self._dirty = true; };
  self.cleanse = function() { self._dirty = false; };
  self.isDirty = function() { return self._dirty; };
}

var Level = function()
{
  var self = this;

  self.myC0_type = COMP_TYPE_NONE;
  self.myC0_offset = graph_default_offset;
  self.myC0_wavelength = graph_default_wavelength;
  self.myC0_amplitude = graph_default_amplitude;

  self.myC1_type = COMP_TYPE_NONE;
  self.myC1_offset = graph_default_offset;
  self.myC1_wavelength = graph_default_wavelength;
  self.myC1_amplitude = graph_default_amplitude;

  self.gC0_type = COMP_TYPE_NONE;
  self.gC0_offset = graph_default_offset;
  self.gC0_wavelength = graph_default_wavelength;
  self.gC0_amplitude = graph_default_amplitude;

  self.gC1_type = COMP_TYPE_NONE;
  self.gC1_offset = graph_default_offset;
  self.gC1_wavelength = graph_default_wavelength;
  self.gC1_amplitude = graph_default_amplitude;

  self.myE0_enabled = true;
  self.myE0_visible = true;
  self.myE1_enabled = true;
  self.myE1_visible = true;

  self.allowed_wiggle_room = 0; //make sure you change this- will never be perfect
}

//In creating levels, the goal inputs must be aligned to the integer pixels allowed by the UI (to prevent un-winnable levels)
//Use these to assign valid values to components
var pix2Off = function(e,p) { return e.offset_slider.valAtPixel(p); }
var pix2Wav = function(e,p) { return e.wavelength_slider.valAtPixel(p); }
var pix2Amp = function(e,p) { return e.amplitude_slider.valAtPixel(p); }

var GamePlayScene = function(game, stage)
{
  var self = this;
  self.dc = stage.drawCanv;
  self.c = self.dc.canvas;

  var dragger;
  var presser;

  var myC0;
  var myC1;
  var myComp;
  var myDisplay;
  var myE0;
  var myE1;

  var gC0;
  var gC1;
  var gComp;
  var gDisplay;

  var validator;

  var cur_level;
  var n_levels;
  var levels;

  self.ready = function()
  {
    dragger = new Dragger({source:stage.dispCanv.canvas});
    presser = new Presser({source:stage.dispCanv.canvas});

    myC0 = new Component(COMP_TYPE_SIN, graph_default_offset, graph_default_wavelength, graph_default_amplitude);
    myC1 = new Component(COMP_TYPE_NONE, graph_default_offset, graph_default_wavelength, graph_default_amplitude);
    myComp = new Composition(myC0, myC1);
    myDisplay = new GraphDrawer(myComp,   graph_n_samples, graph_min_x, graph_max_x, graph_min_y, graph_max_y,                  10,                 10,     self.c.width-20, ((self.c.height-20)/2));
    myE0      = new ComponentEditor(myC0, graph_n_samples, graph_min_x, graph_max_x, graph_min_y, graph_max_y,                  10, self.c.height/2+10, (self.c.width/2)-20,   (self.c.height/2)-20);
    myE1      = new ComponentEditor(myC1, graph_n_samples, graph_min_x, graph_max_x, graph_min_y, graph_max_y, (self.c.width/2)+10, self.c.height/2+10, (self.c.width/2)-20,   (self.c.height/2)-20);

    gC0 = new Component(COMP_TYPE_SIN, graph_default_offset, graph_default_wavelength, graph_default_amplitude);
    gC1 = new Component(COMP_TYPE_NONE, graph_default_offset, graph_default_wavelength, graph_default_amplitude);
    gComp = new Composition(gC0, gC1);
    gDisplay = new GraphDrawer(gComp,   graph_n_samples, graph_min_x, graph_max_x, graph_min_y, graph_max_y,                  10,                 10,     self.c.width-20, ((self.c.height-20)/2));
    gDisplay.color = "#00BB00";

    validator = new Validator(myComp, gComp, graph_min_x, graph_max_x, graph_n_samples);

    myE0.register(presser, dragger);
    myE1.register(presser, dragger);

    var level;
    cur_level = 0;
    n_levels = 0;
    levels = [];

    var maxPix = myE0.offset_slider.maxPixel(); //grab arbitrary slider to find max pix len, useful in determining starting vals
    var r = Math.round;

    //lvl0
    n_levels++;
    level = new Level();
    level.myC0_type = COMP_TYPE_SIN;                       level.myC1_type = COMP_TYPE_NONE;
    level.myC0_offset     = pix2Off(myE0,    r(maxPix/2)); level.myC1_offset     = pix2Off(myE1,    r(maxPix/2));
    level.myC0_wavelength = pix2Wav(myE0,    r(maxPix/2)); level.myC1_wavelength = pix2Wav(myE1,    r(maxPix/2));
    level.myC0_amplitude  = pix2Amp(myE0,    r(maxPix/2)); level.myC1_amplitude  = pix2Amp(myE1,    r(maxPix/2));
    level.myE0_enabled = true;                             level.myE1_enabled = false;
    level.myE0_visible = true;                             level.myE1_visible = false;
    level.gC0_type = COMP_TYPE_SIN;                        level.gC1_type = COMP_TYPE_NONE;
    level.gC0_offset      = pix2Off(myE0, r(maxPix/2)+40); level.gC1_offset      = pix2Off(myE1,    r(maxPix/2));
    level.gC0_wavelength  = pix2Wav(myE0,    r(maxPix/2)); level.gC1_wavelength  = pix2Wav(myE1,    r(maxPix/2));
    level.gC0_amplitude   = pix2Amp(myE0,    r(maxPix/2)); level.gC1_amplitude   = pix2Amp(myE1,    r(maxPix/2));
    level.allowed_wiggle_room = 500;
    levels.push(level);

    //lvl1
    n_levels++;
    level = new Level();
    level.myC0_type = COMP_TYPE_SIN;                       level.myC1_type = COMP_TYPE_NONE;
    level.myC0_offset     = pix2Off(myE0,    r(maxPix/2)); level.myC1_offset     = pix2Off(myE1,    r(maxPix/2));
    level.myC0_wavelength = pix2Wav(myE0,    r(maxPix/2)); level.myC1_wavelength = pix2Wav(myE1,    r(maxPix/2));
    level.myC0_amplitude  = pix2Amp(myE0,    r(maxPix/2)); level.myC1_amplitude  = pix2Amp(myE1,    r(maxPix/2));
    level.myE0_enabled = true;                             level.myE1_enabled = false;
    level.myE0_visible = true;                             level.myE1_visible = false;
    level.gC0_type = COMP_TYPE_SIN;                        level.gC1_type = COMP_TYPE_NONE;
    level.gC0_offset      = pix2Off(myE0,    r(maxPix/2)); level.gC1_offset      = pix2Off(myE1,    r(maxPix/2));
    level.gC0_wavelength  = pix2Wav(myE0, r(maxPix/2)-90); level.gC1_wavelength  = pix2Wav(myE1,    r(maxPix/2));
    level.gC0_amplitude   = pix2Amp(myE0,    r(maxPix/2)); level.gC1_amplitude   = pix2Amp(myE1,    r(maxPix/2));
    level.allowed_wiggle_room = 500;
    levels.push(level);

    //lvl2
    n_levels++;
    level = new Level();
    level.myC0_type = COMP_TYPE_SIN;                       level.myC1_type = COMP_TYPE_NONE;
    level.myC0_offset     = pix2Off(myE0,    r(maxPix/2)); level.myC1_offset     = pix2Off(myE1,    r(maxPix/2));
    level.myC0_wavelength = pix2Wav(myE0,    r(maxPix/2)); level.myC1_wavelength = pix2Wav(myE1,    r(maxPix/2));
    level.myC0_amplitude  = pix2Amp(myE0,    r(maxPix/2)); level.myC1_amplitude  = pix2Amp(myE1,    r(maxPix/2));
    level.myE0_enabled = true;                             level.myE1_enabled = false;
    level.myE0_visible = true;                             level.myE1_visible = false;
    level.gC0_type = COMP_TYPE_SIN;                        level.gC1_type = COMP_TYPE_NONE;
    level.gC0_offset      = pix2Off(myE0, r(maxPix/2)+10); level.gC1_offset      = pix2Off(myE1,    r(maxPix/2));
    level.gC0_wavelength  = pix2Wav(myE0,    r(maxPix/2)); level.gC1_wavelength  = pix2Wav(myE1,    r(maxPix/2));
    level.gC0_amplitude   = pix2Amp(myE0,         maxPix); level.gC1_amplitude   = pix2Amp(myE1,    r(maxPix/2));
    level.allowed_wiggle_room = 500;
    levels.push(level);

    //lvl3
    n_levels++;
    level = new Level();
    level.myC0_type = COMP_TYPE_SIN;                       level.myC1_type = COMP_TYPE_SIN;
    level.myC0_offset     = pix2Off(myE0,    r(maxPix/2)); level.myC1_offset     = pix2Off(myE1, r(maxPix/2)+65);
    level.myC0_wavelength = pix2Wav(myE0,    r(maxPix/2)); level.myC1_wavelength = pix2Wav(myE1,         maxPix);
    level.myC0_amplitude  = pix2Amp(myE0,              0); level.myC1_amplitude  = pix2Amp(myE1,    r(maxPix/2));
    level.myE0_enabled = true;                             level.myE1_enabled = false;
    level.myE0_visible = true;                             level.myE1_visible = true;
    level.gC0_type = COMP_TYPE_SIN;                        level.gC1_type = COMP_TYPE_SIN;
    level.gC0_offset      = pix2Off(myE0,    r(maxPix/2)); level.gC1_offset      = pix2Off(myE1, r(maxPix/2)+65);
    level.gC0_wavelength  = pix2Wav(myE0,              0); level.gC1_wavelength  = pix2Wav(myE1,         maxPix);
    level.gC0_amplitude   = pix2Amp(myE0,    r(maxPix/2)); level.gC1_amplitude   = pix2Amp(myE1,    r(maxPix/2));
    level.allowed_wiggle_room = 500;
    levels.push(level);


    self.beginLevel(levels[cur_level]);
  };

  self.beginLevel = function(level)
  {
    myC0.type = level.myC0_type; myC0.dirty();
    myC1.type = level.myC1_type; myC0.dirty();
    myE0.setDefaults(level.myC0_offset, level.myC0_wavelength, level.myC0_amplitude);
    myE1.setDefaults(level.myC1_offset, level.myC1_wavelength, level.myC1_amplitude);
    myE0.hardReset();
    myE1.hardReset();
    myE0.enabled = level.myE0_enabled;
    myE0.visible = level.myE0_visible;
    myE1.enabled = level.myE1_enabled;
    myE1.visible = level.myE1_visible;

    gC0.set(level.gC0_type, level.gC0_offset, level.gC0_wavelength, level.gC0_amplitude);
    gC1.set(level.gC1_type, level.gC1_offset, level.gC1_wavelength, level.gC1_amplitude);
  }

  var t = 0;
  self.tick = function()
  {
    presser.flush();
    dragger.flush();

    myE0.tick();
    myE1.tick();

    if(validator.validate(levels[cur_level].allowed_wiggle_room) && !myE0.isDragging() && !myE1.isDragging()) //valid, and not currently interacting
    {
      validator.dirty();
      cur_level = (cur_level+1)%n_levels;
      self.beginLevel(levels[cur_level]);
    }
    t += 0.05;
    while(t > Math.PI) t-=Math.PI;
  };

  self.draw = function()
  {
    self.dc.context.globalAlpha = (Math.sin(t)+1)/2;
    gDisplay.draw(self.dc);
    self.dc.context.globalAlpha = 1;
    myDisplay.draw(self.dc);
    myE0.draw(self.dc);
    myE1.draw(self.dc);

    myComp.cleanse();
    myDisplay.cleanse();
    gComp.cleanse();
    gDisplay.cleanse();
  };

  self.cleanup = function()
  {
  };
};

