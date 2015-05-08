var ComponentEditorDrawer = function(scene, samples, x, y, w, h)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.component = false;
  self.samples = samples;
  self._dirty = true;

  var graphDrawer;
  var knob_w = 10;

  var off_x_knob;
  var wavelength_knob;
  var amplitude_knob;
  var neg_knob;
  var abs_knob;

  self.setComponent = function(component)
  {
    self.destroy();
    self.component = component;
    if(component)
    {
      graphDrawer = new GraphDrawer(new Components([component]),self.samples,702,234,240,117,{lineWidth:2});
      wavelength_knob = new Knob(709,394,61,61,0.05,true); wavelength_knob.val = component.wavelength;
      amplitude_knob  = new Knob(797,394,61,61,0.05,false); amplitude_knob.val = component.amplitude;
      off_x_knob      = new Knob(886,394,61,61,0.05,true);  off_x_knob.val = component.off_x;
      scene.dragger.register(off_x_knob);
      scene.dragger.register(wavelength_knob);
      scene.dragger.register(amplitude_knob);
    }
    self.dirty();
  }

  self.draw = function(canv)
  {
    if(self.component)
    {
      if(self.isDirty()) graphDrawer.dirty();

      off_x_knob.draw(canv);
      wavelength_knob.draw(canv);
      amplitude_knob.draw(canv);

      if(off_x_knob.isDirty())
      {
        self.component.off_x = off_x_knob.val;
        self.component.dirty();
        off_x_knob.cleanse();
      }
      if(wavelength_knob.isDirty())
      {
        self.component.wavelength = wavelength_knob.val;
        self.component.dirty();
        wavelength_knob.cleanse();
      }
      if(amplitude_knob.isDirty())
      {
        self.component.amplitude = amplitude_knob.val;
        self.component.dirty();
        amplitude_knob.cleanse();
      }
      if(Math.abs(self.component.wavelength) < Math.abs(self.component.off_x))
      {
        self.component.off_x = self.component.off_x%self.component.wavelength;
        off_x_knob.val = self.component.off_x;
      }

      graphDrawer.draw(canv);
      self._dirty = false;
    }
  }

  //to handle unregistering
  self.destroy = function()
  {
    if(off_x_knob)      scene.dragger.unregister(off_x_knob);
    if(wavelength_knob) scene.dragger.unregister(wavelength_knob);
    if(amplitude_knob)  scene.dragger.unregister(amplitude_knob);
  }

  self.isDirty = function()
  {
    var d = self._dirty;
    self._dirty = self._dirty || graphDrawer.isDirty();
    self._dirty = d;
    return self._dirty;
  }
  self.dirty = function() { self._dirty = true; }
  self.cleanse = function()
  {
    self._dirty = false;
    if(graphDrawer) graphDrawer.cleanse();
  }
}

