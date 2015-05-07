var ComponentEditorDrawer = function(scene, component, samples, x, y, w, h)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;

  self.samples = samples;
  self.component = component;
  self._dirty = true;

  var knob_w = 10;

  var graphDrawer = new GraphDrawer(new Components([self.component]),self.samples,0,0,0,0,{});

  var off_x_knob;
  var wavelength_knob;
  var amplitude_knob;
  var neg_knob;
  var abs_knob;

  switch(self.component.type)
  {
    case COMP_TYPE_SIN:
      off_x_knob      = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
      wavelength_knob = new Knob(0,0,0,0,0.05,false); wavelength_knob.val = component.wavelength;
      amplitude_knob  = new Knob(0,0,0,0,0.05,false); amplitude_knob.val = component.amplitude;
      scene.dragger.register(off_x_knob);
      scene.dragger.register(wavelength_knob);
      scene.dragger.register(amplitude_knob);
      break;
    case COMP_TYPE_TRIANGLE:
      off_x_knob      = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
      wavelength_knob = new Knob(0,0,0,0,0.05,false); wavelength_knob.val = component.wavelength;
      amplitude_knob  = new Knob(0,0,0,0,0.05,false); amplitude_knob.val = component.amplitude;
      scene.dragger.register(off_x_knob);
      scene.dragger.register(wavelength_knob);
      scene.dragger.register(amplitude_knob);
      break;
    case COMP_TYPE_SAW:
      off_x_knob      = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
      wavelength_knob = new Knob(0,0,0,0,0.05,false); wavelength_knob.val = component.wavelength;
      amplitude_knob  = new Knob(0,0,0,0,0.05,false); amplitude_knob.val = component.amplitude;
      scene.dragger.register(off_x_knob);
      scene.dragger.register(wavelength_knob);
      scene.dragger.register(amplitude_knob);
      break;
    case COMP_TYPE_SQUARE:
      off_x_knob      = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
      wavelength_knob = new Knob(0,0,0,0,0.05,false); wavelength_knob.val = component.wavelength;
      amplitude_knob  = new Knob(0,0,0,0,0.05,false); amplitude_knob.val = component.amplitude;
      scene.dragger.register(off_x_knob);
      scene.dragger.register(wavelength_knob);
      scene.dragger.register(amplitude_knob);
      break;
    default:
      break;
  }

  self.position = function(x,y,w,h)
  {
    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    graphDrawer.position(self.x,self.y,self.w-knob_w-10,self.h);

    var yoff = 0;
    switch(self.component.type)
    {
      case COMP_TYPE_SIN:
        off_x_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
        wavelength_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
        amplitude_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
        break;
      case COMP_TYPE_TRIANGLE:
        off_x_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
        wavelength_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
        amplitude_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
        break;
      case COMP_TYPE_SAW:
        off_x_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
        wavelength_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
        amplitude_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
        break;
      case COMP_TYPE_SQUARE:
        off_x_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
        wavelength_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
        amplitude_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
        break;
      default:
        break;
    }

    self._dirty = true;
  }
  self.position(self.x,self.y,self.w,self.h);

  self.draw = function(canv)
  {
    if(self.isDirty()) graphDrawer.dirty();

    if(off_x_knob)      { off_x_knob.draw(canv);      if(off_x_knob.isDirty())      { component.off_x      = off_x_knob.val;           component.dirty(); off_x_knob.cleanse();      } }
    if(wavelength_knob) { wavelength_knob.draw(canv); if(wavelength_knob.isDirty()) { component.wavelength = wavelength_knob.val;      component.dirty(); wavelength_knob.cleanse(); } }
    if(amplitude_knob)  { amplitude_knob.draw(canv);  if(amplitude_knob.isDirty())  { component.amplitude  = amplitude_knob.val;       component.dirty(); amplitude_knob.cleanse();  } }

    graphDrawer.draw(canv);
    self._dirty = false;
  }

  //to handle unregistering
  self.destroy = function()
  {
    if(off_x_knob) scene.dragger.unregister(off_x_knob);
    if(wavelength_knob) scene.dragger.unregister(wavelength_knob);
    if(amplitude_knob) scene.dragger.unregister(amplitude_knob);
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
    //graphDrawer.cleanse();
  }
}

