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
  var COMP_TYPE_SIN      = ENUM; ENUM++;
  var COMP_TYPE_TRIANGLE = ENUM; ENUM++;
  var COMP_TYPE_SAW      = ENUM; ENUM++;
  var COMP_TYPE_SQUARE   = ENUM; ENUM++;
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

    self.color = "#000000";
    self.drawGrid = true;
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

        self.canv.context.fillStyle = "rgba(255,255,255,0.5)";
        self.canv.context.fillRect(0,0,self.w,self.h);

        if(self.drawGrid)
        {
          self.canv.context.strokeStyle = "#AAAAAA";
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
        self.canv.context.strokeStyle = self.color;
        self.canv.context.strokeRect(0,0,self.w,self.h);
        self.canv.context.beginPath();
        self.canv.context.moveTo(0,0);
        for(var i = 0; i < self.samples; i++)
        {
          t = i*(1/(self.samples-1));
          sample = self.components.f(t*2-1);
          self.canv.context.lineTo(t*self.w,(self.h/2)-((sample/self.highestAmp)*((self.h/2)*(3/4))));
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
    self._dirty = true;

    var knob_w = 10;

    var graphDrawer = new GraphDrawer(new Components([self.component]),self.samples,0,0,0,0);
    graphDrawer.click = function(evt) { self.should_destroy = true; }
    clicker.register(graphDrawer);

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
        dragger.register(off_x_knob);
        dragger.register(wavelength_knob);
        dragger.register(amplitude_knob);
        break;
      case COMP_TYPE_TRIANGLE:
        off_x_knob      = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
        wavelength_knob = new Knob(0,0,0,0,0.05,false); wavelength_knob.val = component.wavelength;
        amplitude_knob  = new Knob(0,0,0,0,0.05,false); amplitude_knob.val = component.amplitude;
        dragger.register(off_x_knob);
        dragger.register(wavelength_knob);
        dragger.register(amplitude_knob);
        break;
      case COMP_TYPE_SAW:
        off_x_knob      = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
        wavelength_knob = new Knob(0,0,0,0,0.05,false); wavelength_knob.val = component.wavelength;
        amplitude_knob  = new Knob(0,0,0,0,0.05,false); amplitude_knob.val = component.amplitude;
        dragger.register(off_x_knob);
        dragger.register(wavelength_knob);
        dragger.register(amplitude_knob);
        break;
      case COMP_TYPE_SQUARE:
        off_x_knob      = new Knob(0,0,0,0,0.05,true); off_x_knob.val = component.off_x;
        wavelength_knob = new Knob(0,0,0,0,0.05,false); wavelength_knob.val = component.wavelength;
        amplitude_knob  = new Knob(0,0,0,0,0.05,false); amplitude_knob.val = component.amplitude;
        dragger.register(off_x_knob);
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
      clicker.unregister(graphDrawer);
      if(off_x_knob) dragger.unregister(off_x_knob);
      if(wavelength_knob) dragger.unregister(wavelength_knob);
      if(amplitude_knob) dragger.unregister(amplitude_knob);
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
      graphDrawer.cleanse();
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
    self._dirty = true;

    self.position = function(x,y,w,h)
    {
      self.x = x;
      self.y = y;
      self.w = w;
      self.h = h;
      self.r = self.w/2;

      self._dirty = true;
    }
    self.position(self.x,self.y,self.w,self.h);

    self.draw = function(canv)
    {
      canv.context.strokeStyle = "#000000";
      canv.context.beginPath();
      canv.context.arc(self.x+self.w/2, self.y+self.h/2, self.r, 0, Math.PI*2, true);
      canv.context.stroke();
      canv.context.closePath();

      if(self.dragging)
      {
        canv.context.beginPath();
        canv.context.moveTo(self.x+self.w/2,self.y+self.h/2);
        canv.context.lineTo(self.x+self.w/2+self.offX,self.y+self.h/2+self.offY);
        canv.context.stroke();

        var off = self.offX;
        if(self.offX > 100) off = 100;
        if(self.offX < -100) off = -100;
        if(self.cw) self.val -= self.d*off/200;
        else        self.val += self.d*off/200;
        self._dirty = true;
      }
    }

    function len(x,y)
    {
      return math.sqrt((x*x)+(y*y));
    }
    self.dragStart = function(evt)
    {
      self.offX = evt.doX-(self.x+(self.w/2));
      self.offY = evt.doY-(self.y+(self.h/2));
      self.dragging = true;
    };
    self.drag = function(evt)
    {
      self.deltaX = (evt.doX-(self.x+(self.w/2)))-self.offX;
      self.deltaY = (evt.doY-(self.y+(self.h/2)))-self.offY;

      self.newoffX = evt.doX-(self.x+(self.w/2));
      self.newoffY = evt.doY-(self.y+(self.h/2));

      self.offX = self.newoffX;
      self.offY = self.newoffY;

      self._dirty = true;
    };
    self.dragFinish = function()
    {
      self.dragging = false;
    };

    self.isDirty = function() { return self._dirty; }
    self.dirty   = function() { self._dirty = true; }
    self.cleanse = function() { self._dirty = false; }
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
    self.score = 1000000; //bad
    self._dirty = true;

    self.graphDrawer = new GraphDrawer(new Components(self.components), self.samples, self.x+68, self.y+140, 490, 333);
    self.goalGraphDrawer;

    self.randomizeGraphDrawer = function()
    {
      var components = [];

      var n = Math.floor(1+Math.random()*2);
      for(var i = 0; i < n; i++)
      {
        //var t = Math.floor(Math.random()*6);
        var t = 2+Math.floor(Math.random()*4);
        var component = new Component();
        component.type = t;
        switch(t)
        {
          case COMP_TYPE_SIN:
            component.off_x = Math.random()*10-5;
            component.wavelength = Math.random()*10-5;
            component.amplitude = Math.random()*10-5;
            break;
          case COMP_TYPE_TRIANGLE:
            component.off_x = Math.random()*10-5;
            component.wavelength = Math.random()*10-5;
            component.amplitude = Math.random()*10-5;
            break;
          case COMP_TYPE_SAW:
            component.off_x = Math.random()*10-5;
            component.wavelength = Math.random()*10-5;
            component.amplitude = Math.random()*10-5;
            break;
          case COMP_TYPE_SQUARE:
            component.off_x = Math.random()*10-5;
            component.wavelength = Math.random()*10-5;
            component.amplitude = Math.random()*10-5;
            break;
        }
        components.push(component);
      }
      self.goalGraphDrawer = new GraphDrawer(new Components(components), self.samples, self.graphDrawer.x, self.graphDrawer.y, self.graphDrawer.w, self.graphDrawer.h);
      self.goalGraphDrawer.color = "#33FF33";
      self.goalGraphDrawer.drawGrid = false;
    }
    self.randomizeGraphDrawer();

    self.addComponent = function(component)
    {
      self.components.push(component);
      self.componentEditorDrawers.push(new ComponentEditorDrawer(self.components[self.components.length-1],self.samples/10,self.x+self.w-component_width,self.y+(self.components.length-1)*(10+component_height),component_width,component_height));
      self.graphDrawer.components = new Components(self.components);
      self.graphDrawer.dirty();
    }

    self.removeComponent = function(component)
    {
      for(var i = 0; i < self.components.length; i++)
      {
        if(self.components[i] == component)
        {
          self.componentEditorDrawers[i].destroy();
          self.components.splice(i,1);
          self.componentEditorDrawers.splice(i,1);
          self.graphDrawer.components = new Components(self.components);
          self.graphDrawer.dirty();
        }
      }
      for(var i = 0; i < self.components.length; i++)
        self.componentEditorDrawers[i].position(self.x+self.w-component_width,self.y+i*(10+component_height),component_width,component_height);
    }

    self.calculateScore = function(samples)
    {
      if(samples < 2) samples = 2;
      var score = 0;
      var x;
      for(var i = 0; i < samples; i++)
      {
        x = (i/(samples-1)*2)-1;
        y = Math.abs(self.graphDrawer.components.f(x)-self.goalGraphDrawer.components.f(x));
        if(y > 100) y = 100;
        score += y;
      }
      return score/self.graphDrawer.highestAmp;
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
      if(self.graphDrawer.isDirty() || self.goalGraphDrawer.isDirty())
      {
        var a = self.graphDrawer.components.findHighestAmp(-1,1,self.graphDrawer.samples);
        var b = self.goalGraphDrawer.components.findHighestAmp(-1,1,self.goalGraphDrawer.samples);
        if(b > a) a = b;
        if(a < 1) a = 1;
        if(a > 10) a = 10;
        self.graphDrawer.highestAmp = a;
        self.goalGraphDrawer.highestAmp = a;
        self.graphDrawer.dirty();
        self.goalGraphDrawer.dirty();

        self.score = self.calculateScore(100);
      }
      self.graphDrawer.draw(canv);
      self.goalGraphDrawer.draw(canv);

      canv.context.fillStyle = "#000000";
      canv.context.fillRect(self.x,self.y+self.h-20,self.w,20);
      if(self.score < 200)
      {
        canv.context.fillStyle = "#00FF00";
        canv.context.fillRect(self.x,self.y+self.h-20,self.w*((200-self.score)/200),20);
      }
      if(self.score < 5)
      {
        self.randomizeGraphDrawer();
        self.score = 100000;
      }
      canv.context.drawImage(assetter.asset("composition_cover.png"),67,134,498,366);

      self._dirty = false;
    }

    //cascade any unregistering
    self.destroy = function()
    {
      for(var i = 0; i < self.componentEditorDrawers.length; i++)
        self.componentEditorDrawers[i].destroy();
    }

    self.isDirty = function()
    {
      var d = self._dirty;
      d = d || graphDrawer.isDirty() || goalGraphDrawer.isDirty();
      for(var i = 0; i < self.components.length; i++)
        d = d || self.components[i].isDirty();
      self._dirty = d;
      return self._dirty;
    }
    self.dirty = function() { self._dirty = true; }
    self.cleanse = function()
    {
      for(var i = 0; i < self.components.length; i++)
        self.components[i].cleanse();
      for(var i = 0; i < self.componentEditorDrawers.length; i++)
        self.componentEditorDrawers[i].cleanse();
      self.graphDrawer.cleanse();
      self.goalGraphDrawer.cleanse();
    }
  }

  var Img = function(src, x,y,w,h)
  {
    var self = this;

    self.asset = assetter.asset(src);
    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;
    self.draw = function(canv)
    {
      canv.context.drawImage(self.asset,self.x,self.y,self.w,self.h);
    }
  }

  var Placer = function(src, x,y,w,h)
  {
    var self = this;

    self.stroke = false;
    self.dragging = false;
    self.resizing = false;
    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;
    self.offX = 0;
    self.offY = 0;
    self.deltaX = 0;
    self.deltaY = 0;

    self.draw = function(canv)
    {
      canv.context.save();
      canv.context.globalAlpha = 0.8;
      canv.context.drawImage(assetter.asset(src), self.x,self.y,self.w,self.h);
      if(self.stroke) canv.context.strokeRect(self.x,self.y,self.w,self.h);
      canv.context.restore();
    }

    function len(x,y)
    {
      return math.sqrt((x*x)+(y*y));
    }
    self.dragStart = function(evt)
    {
      self.dragging = false;
      self.resizing = false;

      self.offX = evt.doX-(self.x+(self.w/2));
      self.offY = evt.doY-(self.y+(self.h/2));

      if(self.offX > 0.4*self.w && self.offY > 0.4*self.h)
        self.resizing = true
      else
        self.dragging = true;
    };
    self.drag = function(evt)
    {
      self.deltaX = (evt.doX-(self.x+(self.w/2)))-self.offX;
      self.deltaY = (evt.doY-(self.y+(self.h/2)))-self.offY;

      if(self.dragging)
      {
        self.x += self.deltaX;
        self.y += self.deltaY;
      }
      else if(self.resizing)
      {
        self.w += self.deltaX;
        self.h += self.deltaY;
      }

      self.offX = evt.doX-(self.x+(self.w/2));
      self.offY = evt.doY-(self.y+(self.h/2));

      self._dirty = true;
    };
    self.dragFinish = function()
    {
      self.dragging = false;
      self.resizing = false;
    };

    self.click = function(evt)
    {
      console.log(self.x+","+self.y+","+self.w+","+self.h);
      self.stroke = !self.stroke;
    }
  }

  var bg;
  var placer;

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

    bg = new Img("bg.jpg",0,0,stage.drawCanv.canvas.width,stage.drawCanv.canvas.height);
    //placer = new Placer("composition_cover.png",0,0,100,100);
    if(placer)clicker.register(placer);
    if(placer)dragger.register(placer);

    var samples_per = 100;
    var w = 50;
    var h = 30;
    var x = stage.drawCanv.canvas.width-w-10;
    var y = 10;

    var component = new Component(); component.type = COMP_TYPE_SIN;
    component_select_sin = new GraphDrawer(new Components([component]),samples_per,x,y,w,h);
    component_select_sin.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_SIN; composition.addComponent(component); }
    clicker.register(component_select_sin);
    component_select_sin.draw(stage.drawCanv); //draw once,
    component_select_sin.cleanse(); //mark clean
    y += h+10;

    var component = new Component(); component.type = COMP_TYPE_TRIANGLE;
    component_select_triangle = new GraphDrawer(new Components([component]),samples_per,x,y,w,h);
    component_select_triangle.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_TRIANGLE; composition.addComponent(component); }
    clicker.register(component_select_triangle);
    component_select_triangle.draw(stage.drawCanv); //draw once,
    component_select_triangle.cleanse(); //mark clean
    y += h+10;

    var component = new Component(); component.type = COMP_TYPE_SAW;
    component_select_saw = new GraphDrawer(new Components([component]),samples_per,x,y,w,h);
    component_select_saw.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_SAW; composition.addComponent(component); }
    clicker.register(component_select_saw);
    component_select_saw.draw(stage.drawCanv); //draw once,
    component_select_saw.cleanse(); //mark clean
    y += h+10;

    var component = new Component(); component.type = COMP_TYPE_SQUARE;
    component_select_square = new GraphDrawer(new Components([component]),samples_per,x,y,w,h);
    component_select_square.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_SQUARE; composition.addComponent(component); }
    clicker.register(component_select_square);
    component_select_square.draw(stage.drawCanv); //draw once,
    component_select_square.cleanse(); //mark clean

    composition = new CompositionDrawer(10000, 0, 0, stage.drawCanv.canvas.width, stage.drawCanv.canvas.height);
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

    bg.draw(stage.drawCanv);
    if(placer)placer.draw(stage.drawCanv);

    component_select_sin.draw(stage.drawCanv);
    component_select_triangle.draw(stage.drawCanv);
    component_select_saw.draw(stage.drawCanv);
    component_select_square.draw(stage.drawCanv);

    composition.draw(stage.drawCanv);
    composition.cleanse();
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

