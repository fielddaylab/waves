var GamePlayScene = function(game, stage)
{
  var self = this;

  var assetter;
  var dbugger; //'debugger' is a keyword... (why.)
  var drawer;
  var ticker;
  var clicker;
  var hoverer;
  var dragger;
  var presser;
  var particler;

  var ENUM = 0;
  var COMP_TYPE_SLOPE    = ENUM; ENUM++;
  var COMP_TYPE_EXP      = ENUM; ENUM++;
  var COMP_TYPE_SIN      = ENUM; ENUM++;
  var COMP_TYPE_TRIANGLE = ENUM; ENUM++;
  var COMP_TYPE_SAW      = ENUM; ENUM++;
  var COMP_TYPE_SQUARE   = ENUM; ENUM++;
  var Component = function()
  {
    var self = this;
    self.type = 0;
    //type-specific vars
    //COMP_TYPE_SLOPE
    self.slope = 1;
    //COMP_TYPE_EXP
    self.exp = 2;
    //COMP_TYPE_SIN
    //COMP_TYPE_TRIANGLE
    //COMP_TYPE_SAW
    //COMP_TYPE_SQUARE
    self.wavelength = 1;
    self.amplitude = 1;

    //modifyers of everything
    self.off_x = 0;
    self.off_y = 0;
    self.abs = false;
    self.neg = false;

    self.dirty = true;
    self.highestAmp = 1; //cached value

    self.f = function(x)
    {
      x += self.off_x;
      var y = 0;

      switch(self.type)
      {
        case COMP_TYPE_SLOPE:
          y = x * self.slope;
          break;
        case COMP_TYPE_EXP:
          x /= self.wavelength;
          y = Math.pow(x,self.exp);
          break;
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

      y += self.off_y;
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
  }

  var GraphDrawer = function(components, samples, x, y, w, h)
  {
    var self = this;
    self.components = components;
    self.samples = samples; if(self.samples < 2) self.samples = 2; //left and right side of graph at minimum

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.canv; //gets initialized in position

    self.dirty = true;
    self.highestAmp = 1;

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
    }
    self.position(self.x,self.y,self.w,self.h);

    self.draw = function(canv)
    {
      for(var i = 0; i < self.components.length; i++)
        if(self.components[i].dirty) self.dirty = true;

      if(self.dirty)
      {
        self.findHighestAmp(-1,1,self.samples);
        if(self.highestAmp < 1) self.highestAmp = 1;
        if(self.highestAmp > 10) self.highestAmp = 10;
        //self.highestAmp = 1;

        self.canv.clear();

        self.canv.context.strokeStyle = "#AAAAAA";
        for(var i = -2*Math.floor(self.highestAmp); i <= 2*Math.floor(self.highestAmp); i++)
        {
          self.canv.context.beginPath();
          self.canv.context.moveTo(0,     (self.h/2)-((i/self.highestAmp)*((self.h/2)*(3/4))));
          self.canv.context.lineTo(self.w,(self.h/2)-((i/self.highestAmp)*((self.h/2)*(3/4))));
          self.canv.context.stroke();
        }

        self.canv.context.strokeStyle = "#000000";
        self.canv.context.strokeRect(0,0,self.w,self.h);

        var sample;
        var t;
        self.canv.context.beginPath();
        self.canv.context.moveTo(0,0);
        for(var i = 0; i < self.samples; i++)
        {
          sample = 0;
          t = i*(1/(self.samples-1));
          for(var j = 0; j < self.components.length; j++)
            sample += self.components[j].f(t*2-1);
          self.canv.context.lineTo(t*self.w,(self.h/2)-((sample/self.highestAmp)*((self.h/2)*(3/4))));
        }
        self.canv.context.stroke();

        self.dirty = false;
      }

      canv.context.drawImage(self.canv.canvas, 0, 0, self.w, self.h, self.x, self.y, self.w, self.h);
    }

    self.findHighestAmp = function(sx, ex, s)
    {
      var amp = 0;
      var y = 0;
      for(var i = 0; i < s; i++)
      {
        y = 0;
        for(var j = 0; j < self.components.length; j++)
          y += self.components[j].f(sx+((ex-sx)*(i/s)));
        y = Math.abs(y);
        if(y > amp) amp = y;
      }
      self.highestAmp = amp;
      return self.highestAmp;
    }
  }

  var ComponentEditorDrawer = function(component, samples, x, y, w, h)
  {
    var self = this;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.samples = samples;
    self.component = component;
    self.should_destroy = false;

    var knob_w = 10;

    var graphDrawer = new GraphDrawer([self.component],self.samples,0,0,0,0);
    graphDrawer.click = function(evt) { self.should_destroy = true; }
    clicker.register(graphDrawer);

    var off_x_knob;
    var off_y_knob;
    var slope_knob;
    var exp_knob;
    var wavelength_knob;
    var amplitude_knob;
    var neg_knob;
    var abs_knob;

    switch(self.component.type)
    {
      case COMP_TYPE_SLOPE:
        off_x_knob = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
        //off_y_knob = new Knob(0,0,0,0,0.05,true); off_y_knob.val = component.off_y;
        slope_knob = new Knob(0,0,0,0,0.05,true); slope_knob.val = component.slope;
        dragger.register(off_x_knob);
        //dragger.register(off_y_knob);
        dragger.register(slope_knob);
        break;
      case COMP_TYPE_EXP:
        off_x_knob = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
        //off_y_knob = new Knob(0,0,0,0,0.05,true); off_y_knob.val = component.off_y;
        wavelength_knob = new Knob(0,0,0,0,0.05,false); wavelength_knob.val = component.wavelength;
        exp_knob   = new Knob(0,0,0,0,0.5,false); exp_knob.val = component.exp;
        dragger.register(off_x_knob);
        //dragger.register(off_y_knob);
        dragger.register(wavelength_knob);
        dragger.register(exp_knob);
        break;
      case COMP_TYPE_SIN:
        off_x_knob      = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
        //off_y_knob      = new Knob(0,0,0,0,0.05,true); off_y_knob.val = component.off_y;
        wavelength_knob = new Knob(0,0,0,0,0.05,false); wavelength_knob.val = component.wavelength;
        amplitude_knob  = new Knob(0,0,0,0,0.05,false); amplitude_knob.val = component.amplitude;
        dragger.register(off_x_knob);
        //dragger.register(off_y_knob);
        dragger.register(wavelength_knob);
        dragger.register(amplitude_knob);
        break;
      case COMP_TYPE_TRIANGLE:
        off_x_knob      = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
        //off_y_knob      = new Knob(0,0,0,0,0.05,true); off_y_knob.val = component.off_y;
        wavelength_knob = new Knob(0,0,0,0,0.05,false); wavelength_knob.val = component.wavelength;
        amplitude_knob  = new Knob(0,0,0,0,0.05,false); amplitude_knob.val = component.amplitude;
        dragger.register(off_x_knob);
        //dragger.register(off_y_knob);
        dragger.register(wavelength_knob);
        dragger.register(amplitude_knob);
        break;
      case COMP_TYPE_SAW:
        off_x_knob      = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
        //off_y_knob      = new Knob(0,0,0,0,0.05,true); off_y_knob.val = component.off_y;
        wavelength_knob = new Knob(0,0,0,0,0.05,false); wavelength_knob.val = component.wavelength;
        amplitude_knob  = new Knob(0,0,0,0,0.05,false); amplitude_knob.val = component.amplitude;
        dragger.register(off_x_knob);
        //dragger.register(off_y_knob);
        dragger.register(wavelength_knob);
        dragger.register(amplitude_knob);
        break;
      case COMP_TYPE_SQUARE:
        off_x_knob      = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
        //off_y_knob      = new Knob(0,0,0,0,0.05,true); off_y_knob.val = component.off_y;
        wavelength_knob = new Knob(0,0,0,0,0.05,false); wavelength_knob.val = component.wavelength;
        amplitude_knob  = new Knob(0,0,0,0,0.05,false); amplitude_knob.val = component.amplitude;
        dragger.register(off_x_knob);
        //dragger.register(off_y_knob);
        dragger.register(wavelength_knob);
        dragger.register(amplitude_knob);
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
        case COMP_TYPE_SLOPE:
          off_x_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          //off_y_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          slope_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          break;
        case COMP_TYPE_EXP:
          off_x_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          //off_y_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          wavelength_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          exp_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          break;
        case COMP_TYPE_SIN:
          off_x_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          //off_y_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          wavelength_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          amplitude_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          break;
        case COMP_TYPE_TRIANGLE:
          off_x_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          //off_y_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          wavelength_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          amplitude_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          break;
        case COMP_TYPE_SAW:
          off_x_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          //off_y_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          wavelength_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          amplitude_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          break;
        case COMP_TYPE_SQUARE:
          off_x_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          //off_y_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          wavelength_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          amplitude_knob.position(self.x+self.w-knob_w,self.y+yoff,knob_w,knob_w); yoff += knob_w+10;
          break;
        default:
          break;
      }
    }
    self.position(self.x,self.y,self.w,self.h);

    self.draw = function(canv)
    {
      graphDrawer.draw(canv);

      switch(self.component.type)
      {
        case COMP_TYPE_SLOPE:
          off_x_knob.draw(canv); if(off_x_knob.dirty) { off_x_knob.dirty = false; component.off_x = off_x_knob.val; component.dirty = true; }
          //off_y_knob.draw(canv); if(off_y_knob.dirty) { off_y_knob.dirty = false; component.off_y = off_y_knob.val; component.dirty = true; }
          slope_knob.draw(canv); if(slope_knob.dirty) { slope_knob.dirty = false; component.slope = slope_knob.val; component.dirty = true; }
          break;
        case COMP_TYPE_EXP:
          off_x_knob.draw(canv); if(off_x_knob.dirty) { off_x_knob.dirty = false; component.off_x = off_x_knob.val; component.dirty = true; }
          //off_y_knob.draw(canv); if(off_y_knob.dirty) { off_y_knob.dirty = false; component.off_y = off_y_knob.val; component.dirty = true; }
          wavelength_knob.draw(canv); if(wavelength_knob.dirty) { wavelength_knob.dirty = false; component.wavelength = wavelength_knob.val; component.dirty = true; }
          exp_knob.draw(canv); if(exp_knob.dirty) { exp_knob.dirty = false; component.exp = Math.floor(exp_knob.val); component.dirty = true; }
          break;
        case COMP_TYPE_SIN:
          off_x_knob.draw(canv); if(off_x_knob.dirty) { off_x_knob.dirty = false; component.off_x = off_x_knob.val; component.dirty = true; }
          //off_y_knob.draw(canv); if(off_y_knob.dirty) { off_y_knob.dirty = false; component.off_y = off_y_knob.val; component.dirty = true; }
          wavelength_knob.draw(canv); if(wavelength_knob.dirty) { wavelength_knob.dirty = false; component.wavelength = wavelength_knob.val; component.dirty = true; }
          amplitude_knob.draw(canv); if(amplitude_knob.dirty) { amplitude_knob.dirty = false; component.amplitude = amplitude_knob.val; component.dirty = true; }
          break;
        case COMP_TYPE_TRIANGLE:
          off_x_knob.draw(canv); if(off_x_knob.dirty) { off_x_knob.dirty = false; component.off_x = off_x_knob.val; component.dirty = true; }
          //off_y_knob.draw(canv); if(off_y_knob.dirty) { off_y_knob.dirty = false; component.off_y = off_y_knob.val; component.dirty = true; }
          wavelength_knob.draw(canv); if(wavelength_knob.dirty) { wavelength_knob.dirty = false; component.wavelength = wavelength_knob.val; component.dirty = true; }
          amplitude_knob.draw(canv); if(amplitude_knob.dirty) { amplitude_knob.dirty = false; component.amplitude = amplitude_knob.val; component.dirty = true; }
          break;
        case COMP_TYPE_SAW:
          off_x_knob.draw(canv); if(off_x_knob.dirty) { off_x_knob.dirty = false; component.off_x = off_x_knob.val; component.dirty = true; }
          //off_y_knob.draw(canv); if(off_y_knob.dirty) { off_y_knob.dirty = false; component.off_y = off_y_knob.val; component.dirty = true; }
          wavelength_knob.draw(canv); if(wavelength_knob.dirty) { wavelength_knob.dirty = false; component.wavelength = wavelength_knob.val; component.dirty = true; }
          amplitude_knob.draw(canv); if(amplitude_knob.dirty) { amplitude_knob.dirty = false; component.amplitude = amplitude_knob.val; component.dirty = true; }
          break;
        case COMP_TYPE_SQUARE:
          off_x_knob.draw(canv); if(off_x_knob.dirty) { off_x_knob.dirty = false; component.off_x = off_x_knob.val; component.dirty = true; }
          //off_y_knob.draw(canv); if(off_y_knob.dirty) { off_y_knob.dirty = false; component.off_y = off_y_knob.val; component.dirty = true; }
          wavelength_knob.draw(canv); if(wavelength_knob.dirty) { wavelength_knob.dirty = false; component.wavelength = wavelength_knob.val; component.dirty = true; }
          amplitude_knob.draw(canv); if(amplitude_knob.dirty) { amplitude_knob.dirty = false; component.amplitude = amplitude_knob.val; component.dirty = true; }
          break;
        default:
          break;
      }
    }

    //to handle unregistering
    self.destroy = function()
    {
      clicker.unregister(graphDrawer);
      switch(self.component.type)
      {
        case COMP_TYPE_SLOPE:
          dragger.unregister(off_x_knob);
          dragger.unregister(off_y_knob);
          dragger.unregister(slope_knob);
          break;
        case COMP_TYPE_EXP:
          dragger.unregister(off_x_knob);
          dragger.unregister(off_y_knob);
          dragger.unregister(wavelength_knob);
          dragger.unregister(exp_knob);
          break;
        case COMP_TYPE_SIN:
          dragger.unregister(off_x_knob);
          dragger.unregister(off_y_knob);
          dragger.unregister(wavelength_knob);
          dragger.unregister(amplitude_knob);
          break;
        case COMP_TYPE_TRIANGLE:
          dragger.unregister(off_x_knob);
          dragger.unregister(off_y_knob);
          dragger.unregister(wavelength_knob);
          dragger.unregister(amplitude_knob);
          break;
        case COMP_TYPE_SAW:
          dragger.unregister(off_x_knob);
          dragger.unregister(off_y_knob);
          dragger.unregister(wavelength_knob);
          dragger.unregister(amplitude_knob);
          break;
        case COMP_TYPE_SQUARE:
          dragger.unregister(off_x_knob);
          dragger.unregister(off_y_knob);
          dragger.unregister(wavelength_knob);
          dragger.unregister(amplitude_knob);
          break;
        default:
          break;
      }
    }
  }

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
    self.rot = 0;
    self.dirty = true;

    self.position = function(x,y,w,h)
    {
      self.x = x;
      self.y = y;
      self.w = w;
      self.h = h;
      self.r = self.w/2;
    }
    self.position(self.x,self.y,self.w,self.h);

    self.draw = function(canv)
    {
      //canv.context.save();
      //canv.context.translate(self.x+self.w/2, self.y+self.h/2);
      //canv.context.rotate(self.rot);

      canv.context.strokeStyle = "#000000";
      canv.context.beginPath();
      canv.context.arc(self.x+self.w/2, self.y+self.h/2, self.r, 0, Math.PI*2, true);
      canv.context.stroke();
      canv.context.closePath();

      //canv.context.drawImage(self.img, -self.w/2, -self.h/2, self.w, self.h);

      //canv.context.restore();

      if(self.dragging)
      {
        canv.context.beginPath();
        canv.context.moveTo(self.x+self.w/2,self.y+self.h/2);
        canv.context.lineTo(self.x+self.w/2+self.offX,self.y+self.h/2+self.offY);
        canv.context.stroke();
      }
    }

    function len(x,y)
    {
      return Math.sqrt((x*x)+(y*y));
    }
    self.dragStart = function(evt)
    {
      self.offX = evt.doX-(self.x+(self.w/2));
      self.offY = evt.doY-(self.y+(self.h/2));
      self.dragging = true;
    };
    self.drag = function(evt)
    {
      self.deltaX = (evt.doX-self.x+(self.w/2))-self.offX;
      self.deltaY = (evt.doY-self.y+(self.h/2))-self.offY;

      self.newOffX = evt.doX-(self.x+(self.w/2));
      self.newOffY = evt.doY-(self.y+(self.h/2));

      var x = self.offX/len(self.offX,self.offY);
      var y = self.offY/len(self.offX,self.offY);
      self.oldT = ((-Math.atan2(x,y))+(Math.PI/2)+(2*Math.PI))%(2*Math.PI); //why terrible coordinate spaces...
      var x = self.newOffX/len(self.newOffX,self.newOffY);
      var y = self.newOffY/len(self.newOffX,self.newOffY);
      self.newT = ((-Math.atan2(x,y))+(Math.PI/2)+(2*Math.PI))%(2*Math.PI); //why terrible coordinate spaces...

      var a = self.oldT-self.newT;

      if(Math.abs(a) > Math.PI)
      {
        if(a > 0) a =  2*Math.PI - a;
        else      a = -2*Math.PI - a;
      }

      if(self.cw) self.val +=self.d*a;
      else        self.val -=self.d*a;

      self.rot -= a;

      self.offX = self.newOffX;
      self.offY = self.newOffY;

      self.dirty = true;
    };
    self.dragFinish = function()
    {
      self.dragging = false;
    };
  }

  var CompositionDrawer = function(samples, x, y, w, h)
  {
    var self = this;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;
    self.samples = samples;

    self.components = [];
    self.componentEditorDrawers = [];
    var component_width = 200;
    var component_height = 70;

    self.graphDrawer = new GraphDrawer(self.components, self.samples, self.x, self.y, self.w-component_width-10, self.h);

    self.addComponent = function(component)
    {
      self.components.push(component);
      self.componentEditorDrawers.push(new ComponentEditorDrawer(self.components[self.components.length-1],self.samples/10,self.x+self.w-component_width,self.y+(self.components.length-1)*(10+component_height),component_width,component_height));
      self.graphDrawer.components = self.components;
      self.graphDrawer.dirty = true;
    }

    self.removeComponent = function(component)
    {
      for(var i = 0; i < self.components.length; i++)
      {
        if(self.components[i] == component)
        {
          self.componentEditorDrawers[i].destroy;
          self.components.splice(i,1);
          self.componentEditorDrawers.splice(i,1);
          self.graphDrawer.components = self.components;
          self.graphDrawer.dirty = true;
        }
      }
      for(var i = 0; i < self.components.length; i++)
      {
        self.componentEditorDrawers[i].position(self.x+self.w-component_width,self.y+i*(10+component_height),component_width,component_height);
      }
    }

    self.draw = function(canv)
    {
      for(var i = 0; i < self.componentEditorDrawers.length; i++)
      {
        if(self.componentEditorDrawers[i].should_destroy)
        {
          self.removeComponent(self.componentEditorDrawers[i].component);
          i--;
        }
        else
          self.componentEditorDrawers[i].draw(canv);
      }
      self.graphDrawer.draw(canv);
    }

    //cascade any unregistering
    self.destroy = function()
    {
      for(var i = 0; i < self.componentEditorDrawers.length; i++)
        self.componentEditorDrawers[i].destroy();
    }
  }

  var component_select_slope;
  var component_select_exp;
  var component_select_sin;
  var component_select_triangle;
  var component_select_saw;
  var component_select_square;

  var composition;

  self.ready = function()
  {
    assetter = new Assetter({});
    dbugger = new Debugger({source:document.getElementById("debug_div")});
    ticker = new Ticker({});
    drawer = new Drawer({source:stage.drawCanv});
    clicker = new Clicker({source:stage.dispCanv.canvas});
    hoverer = new Hoverer({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
    presser = new Presser({source:stage.dispCanv.canvas});
    particler = new Particler({});
    drawer.register(particler);
    ticker.register(particler);

    var samples_per = 100;
    var w = 50;
    var h = 30;
    var x = stage.drawCanv.canvas.width-w-10;
    var y = 10;

    var component = new Component(); component.type = COMP_TYPE_SLOPE;
    component_select_slope = new GraphDrawer([component],samples_per,x,y,w,h);
    component_select_slope.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_SLOPE; composition.addComponent(component); }
    clicker.register(component_select_slope);
    y += h+10;

    var component = new Component(); component.type = COMP_TYPE_EXP;
    component_select_exp = new GraphDrawer([component],samples_per,x,y,w,h);
    component_select_exp.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_EXP; composition.addComponent(component); }
    clicker.register(component_select_exp);
    y += h+10;

    var component = new Component(); component.type = COMP_TYPE_SIN;
    component_select_sin = new GraphDrawer([component],samples_per,x,y,w,h);
    component_select_sin.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_SIN; composition.addComponent(component); }
    clicker.register(component_select_sin);
    y += h+10;

    var component = new Component(); component.type = COMP_TYPE_TRIANGLE;
    component_select_triangle = new GraphDrawer([component],samples_per,x,y,w,h);
    component_select_triangle.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_TRIANGLE; composition.addComponent(component); }
    clicker.register(component_select_triangle);
    y += h+10;

    var component = new Component(); component.type = COMP_TYPE_SAW;
    component_select_saw = new GraphDrawer([component],samples_per,x,y,w,h);
    component_select_saw.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_SAW; composition.addComponent(component); }
    clicker.register(component_select_saw);
    y += h+10;

    var component = new Component(); component.type = COMP_TYPE_SQUARE;
    component_select_square = new GraphDrawer([component],samples_per,x,y,w,h);
    component_select_square.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_SQUARE; composition.addComponent(component); }
    clicker.register(component_select_square);

    composition = new CompositionDrawer(10000, 10, 10, stage.drawCanv.canvas.width-w-30, stage.drawCanv.canvas.height-20);
  };

  self.tick = function()
  {
    clicker.flush();
    hoverer.flush();
    dragger.flush();
    presser.flush();
    ticker.flush();
  };

  self.draw = function()
  {
    drawer.flush();

    component_select_slope.draw(stage.drawCanv);
    component_select_exp.draw(stage.drawCanv);
    component_select_sin.draw(stage.drawCanv);
    component_select_triangle.draw(stage.drawCanv);
    component_select_saw.draw(stage.drawCanv);
    component_select_square.draw(stage.drawCanv);

    composition.draw(stage.drawCanv);
  };

  self.cleanup = function()
  {
    assetter.detach();
    dbugger.detach();
    ticker.detach();
    drawer.detach();
    clicker.detach();
    hoverer.detach();
    dragger.detach();
    presser.detach();
    particler.detach();

    assetter.clear();
    dbugger.clear();
    ticker.clear();
    drawer.clear();
    clicker.clear();
    hoverer.clear();
    dragger.clear();
    presser.clear();
    particler.clear();
  };
};

