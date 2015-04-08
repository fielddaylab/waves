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
  var MOD_TYPE_SLOPE    = ENUM; ENUM++;
  var MOD_TYPE_EXP      = ENUM; ENUM++;
  var MOD_TYPE_SIN      = ENUM; ENUM++;
  var MOD_TYPE_TRIANGLE = ENUM; ENUM++;
  var MOD_TYPE_SAW      = ENUM; ENUM++;
  var MOD_TYPE_SQUARE   = ENUM; ENUM++;
  var Module = function()
  {
    var self = this;
    self.type = 0;
    //type-specific vars
    //MOD_TYPE_SLOPE
    self.y = 0;
    self.slope = 1;
    //MOD_TYPE_EXP
    self.exp = 2;
    //MOD_TYPE_SIN
    //MOD_TYPE_TRIANGLE
    //MOD_TYPE_SAW
    //MOD_TYPE_SQUARE
    self.wavelength = 1;
    self.amplitude = 1;

    //modifyers of everything
    self.xoffset = 0;
    self.yoffset = 0;
    self.abs = false;

    self.dirty = true;
    self.highestAmp = 1; //cached value

    self.f = function(x)
    {
      x += self.xoffset;
      var y = 0;

      switch(self.type)
      {
        case MOD_TYPE_SLOPE:
          y = x * self.slope + self.y;
          break;
        case MOD_TYPE_EXP:
          y = Math.pow(x,self.exp);
          break;
        case MOD_TYPE_SIN:
          x /= self.wavelength;
          y = Math.sin(x*(2*Math.PI));
          y *= self.amplitude;
          break;
        case MOD_TYPE_TRIANGLE:
          x /= self.wavelength;
          x *= 2;
          if((Math.floor(x)+100000)%2) //going up
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
        case MOD_TYPE_SAW:
          x /= self.wavelength;
          y = (x - Math.floor(x));
          y *= self.amplitude;
          break;
        case MOD_TYPE_SQUARE:
          x /= self.wavelength;
          x *= 2;
          if(Math.floor(x+10000000)%2) y = -1;
          else                         y = 1;
          y *= self.amplitude;
          break;
        default:
          break;
      }

      y += self.yoffset;
      if(self.abs) y = Math.abs(y);
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

  var GraphDrawer = function(modules, samples, x, y, w, h)
  {
    var self = this;
    self.modules = modules;
    self.samples = samples; if(self.samples < 2) self.samples = 2; //left and right side of graph at minimum

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

    self.dirty = true;
    self.highestAmp = 1;

    self.draw = function(canv)
    {
      for(var i = 0; i < self.modules.length; i++)
      {
        if(self.modules[i].dirty)
        {
          self.modules[i].findHighestAmp(-0.5,0.5,self.samples);
          self.dirty = true;
        }
      }

      if(self.dirty)
      {
        self.findHighestAmp(-0.5,0.5,self.samples);

        self.canv.clear();
        self.canv.context.strokeRect(0,0,self.w,self.h);

        self.canv.context.beginPath();
        self.canv.context.moveTo(0,0);

        var sample;
        var t;
        for(var i = 0; i < self.samples; i++)
        {
          sample = 0;
          t = i*(1/(self.samples-1));
          for(var j = 0; j < self.modules.length; j++)
            sample += self.modules[j].f(t-0.5);
          self.canv.context.lineTo(t*self.w,(self.h/2)-((sample*(h/2))/2)/self.highestAmp);
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
        for(var j = 0; j < self.modules.length; j++)
          y += self.modules[j].f(sx+((ex-sx)*(i/s)));
        y = Math.abs(y);
        if(y > amp) amp = y;
      }
      self.highestAmp = amp;
      return self.highestAmp;
    }
  }

  var CompositionDrawer = function(samples, x, y, w, h)
  {
    var self = this;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.components = [];
    self.componentDrawers = [];

    self.samples = samples;
    self.compositionDrawer = new GraphDrawer(self.components, self.samples, self.x, self.y, self.w-(self.w/10)-10, self.h);

    self.addComponent = function(component)
    {
      self.components.push(component);
      self.componentDrawers.push(new ModuleDrawer(self.components[self.components.length-1],self.samples/10,self.x+self.w-(self.w/10),self.y+(self.components.length-1)*(10+self.h/10),self.w/10,self.h/10));
      self.compositionDrawer.modules = self.components;
      self.compositionDrawer.dirty = true;
    }

    self.draw = function(canv)
    {
      for(var i = 0; i <self.components.length; i++)
        self.componentDrawers[i].draw(canv);
      self.compositionDrawer.draw(canv);
    }
  }

  var ModuleDrawer = function(module, samples, x, y, w, h)
  {
    var self = this;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.samples = samples;
    self.graphDrawer = new GraphDrawer([module],self.samples,self.x,self.y,self.w/2,self.h);

    self.draw = function(canv)
    {
      self.graphDrawer.draw(canv);
    }
  }

  var module_select_slope;
  var module_select_exp;
  var module_select_sin;
  var module_select_triangle;
  var module_select_saw;
  var module_select_square;

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
    var w = 100;
    var h = 30;
    var x = stage.drawCanv.canvas.width-w-10;
    var y = 10;

    var module = new Module(); module.type = MOD_TYPE_SLOPE;
    module_select_slope = new GraphDrawer([module],samples_per,x,y,w,h);
    module_select_slope.click = function(evt) { var module = new Module(); module.type = MOD_TYPE_SLOPE; composition.addComponent(module); }
    clicker.register(module_select_slope);
    y += h+10;

    var module = new Module(); module.type = MOD_TYPE_EXP;
    module_select_exp = new GraphDrawer([module],samples_per,x,y,w,h);
    module_select_exp.click = function(evt) { var module = new Module(); module.type = MOD_TYPE_EXP; composition.addComponent(module); }
    clicker.register(module_select_exp);
    y += h+10;

    var module = new Module(); module.type = MOD_TYPE_SIN;
    module_select_sin = new GraphDrawer([module],samples_per,x,y,w,h);
    module_select_sin.click = function(evt) { var module = new Module(); module.type = MOD_TYPE_SIN; composition.addComponent(module); }
    clicker.register(module_select_sin);
    y += h+10;

    var module = new Module(); module.type = MOD_TYPE_TRIANGLE;
    module_select_triangle = new GraphDrawer([module],samples_per,x,y,w,h);
    module_select_triangle.click = function(evt) { var module = new Module(); module.type = MOD_TYPE_TRIANGLE; composition.addComponent(module); }
    clicker.register(module_select_triangle);
    y += h+10;

    var module = new Module(); module.type = MOD_TYPE_SAW;
    module_select_saw = new GraphDrawer([module],samples_per,x,y,w,h);
    module_select_saw.click = function(evt) { var module = new Module(); module.type = MOD_TYPE_SAW; composition.addComponent(module); }
    clicker.register(module_select_saw);
    y += h+10;

    var module = new Module(); module.type = MOD_TYPE_SQUARE;
    module_select_square = new GraphDrawer([module],samples_per,x,y,w,h);
    module_select_square.click = function(evt) { var module = new Module(); module.type = MOD_TYPE_SQUARE; composition.addComponent(module); }
    clicker.register(module_select_square);

    composition = new CompositionDrawer(samples_per*10, 10, 10, stage.drawCanv.canvas.width-w-30, stage.drawCanv.canvas.height-20);
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

    module_select_slope.draw(stage.drawCanv);
    module_select_exp.draw(stage.drawCanv);
    module_select_sin.draw(stage.drawCanv);
    module_select_triangle.draw(stage.drawCanv);
    module_select_saw.draw(stage.drawCanv);
    module_select_square.draw(stage.drawCanv);

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

