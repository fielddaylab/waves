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
      var yoff = 0;
      graphDrawer = new GraphDrawer(new Components([component]),self.samples,702,234,240,117,{lineWidth:2});
      off_x_knob      = new Knob(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w,0.05,true);  yoff += knob_w+10; off_x_knob.val = component.off_x;
      wavelength_knob = new Knob(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w,0.05,false); yoff += knob_w+10; wavelength_knob.val = component.wavelength;
      amplitude_knob  = new Knob(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w,0.05,false); yoff += knob_w+10; amplitude_knob.val = component.amplitude;
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

      off_x_knob.draw(canv);      if(off_x_knob.isDirty())      { self.component.off_x      = off_x_knob.val;      self.component.dirty(); off_x_knob.cleanse();      }
      wavelength_knob.draw(canv); if(wavelength_knob.isDirty()) { self.component.wavelength = wavelength_knob.val; self.component.dirty(); wavelength_knob.cleanse(); }
      amplitude_knob.draw(canv);  if(amplitude_knob.isDirty())  { self.component.amplitude  = amplitude_knob.val;  self.component.dirty(); amplitude_knob.cleanse();  }

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

