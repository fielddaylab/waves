var CompositionDrawer = function(scene, samples, x, y, w, h)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;
  self.samples = samples;

  self.selected = -1;

  self.components = [];
  self.componentGraphDrawers = [];
  self.componentEditorDrawer = new ComponentEditorDrawer(scene, self.samples/10, 701,234,243,237)
  var component_width = 200;
  var component_height = 70;
  self.score = 1000000; //bad
  self._dirty = true;

  self.component_bg_x = [];
  self.component_bg_rect = {};
  self.component_bg_rect.x = 92;
  self.component_bg_rect.y = 590;
  self.component_bg_rect.w = 253;
  self.component_bg_rect.h = 65;
  self.component_bg_x[0] = 92;
  self.component_bg_x[1] = 384;
  self.component_bg_x[2] = 674;

  self.component_x_x = [];
  self.component_x_rect = {};
  self.component_x_rect.x = 92;
  self.component_x_rect.y = 592;
  self.component_x_rect.w = 59;
  self.component_x_rect.h = 59;
  self.component_x_x[0] = 92;
  self.component_x_x[1] = 384;
  self.component_x_x[2] = 674;

  self.component_graph_x = [];
  self.component_graph_rect = {};
  self.component_graph_rect.x = 162;
  self.component_graph_rect.y = 593;
  self.component_graph_rect.w = 143;
  self.component_graph_rect.h = 54;
  self.component_graph_x[0] = 162;
  self.component_graph_x[1] = 453;
  self.component_graph_x[2] = 742;

  self.graphDrawer = new GraphDrawer(new Components(self.components), self.samples, self.x+68, self.y+140, 490, 333, 
  {
    drawBG:false,
    lineWidth:2,
    gridWidth:0,
    shadowWidth:2,
    shadowColor:"#5D1413",
    shadowOffX:10,
    shadowOffY:10
  });
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
    self.goalGraphDrawer = new GraphDrawer(new Components(components), self.samples, self.graphDrawer.x, self.graphDrawer.y, self.graphDrawer.w, self.graphDrawer.h, {
      drawBG:false,
      lineWidth:2,
      lineColor:"#33FF33",
      gridWidth:0
    });
  }
  self.randomizeGraphDrawer();

  self.addComponent = function(component)
  {
    if(self.components.length > 2) return;
    self.components.push(component);
    self.componentGraphDrawers.push(new GraphDrawer(new Components([self.components[self.components.length-1]]), self.samples/10, self.component_graph_x[self.components.length-1], self.component_graph_rect.y, self.component_graph_rect.w, self.component_graph_rect.h, {lineWidth:2}));
    self.graphDrawer.components = new Components(self.components);
    self.graphDrawer.dirty();
  }

  self.removeComponent = function(i)
  {
    self.components.splice(i,1);
    self.componentGraphDrawers.splice(i,1);
    self.graphDrawer.components = new Components(self.components);
    self.graphDrawer.dirty();

    if(self.selected == i) self.selectComponent(i);
    if(self.selected > i) self.selectComponent(self.selected-1);

    for(var i = 0; i < self.components.length; i++)
    {
      self.componentGraphDrawers[i].position(self.component_graph_x[i], self.component_graph_rect.y, self.component_graph_rect.w, self.component_graph_rect.h);
      self.componentGraphDrawers[i].dirty();
    }
  }

  self.selectComponent = function(i)
  {
    if(self.selected == i)
    {
      self.selected = -1;
      self.componentEditorDrawer.setComponent(false);
    }
    else
    {
      self.selected = i;
      self.componentEditorDrawer.setComponent(self.components[i]);
    }
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
    canv.context.drawImage(scene.assetter.asset("composition_cover.png"),67,134,498,366);

    var i = 0;
    for(i = 0; i < self.componentGraphDrawers.length; i++)
    {
      if(i == self.selected)
        canv.context.drawImage(scene.assetter.asset("component_bg_select.png"),self.component_bg_x[i],self.component_bg_rect.y,self.component_bg_rect.w,self.component_bg_rect.h);
      else
        canv.context.drawImage(scene.assetter.asset("component_bg.png"),      self.component_bg_x[i],self.component_bg_rect.y,self.component_bg_rect.w,self.component_bg_rect.h);
      self.componentGraphDrawers[i].draw(canv);
    }
    if(i < 3)
      ; //draw "place here"

    self.componentEditorDrawer.draw(canv);

    self._dirty = false;
  }

  self.click = function(evt)
  {
    var i;
    for(i = 0; i < self.components.length; i++)
    {
      self.component_x_rect.x = self.component_x_x[i];
      if(clicked(self.component_x_rect, evt))
      {
        self.removeComponent(i);
        return;
      }
      else
      {
        self.component_bg_rect.x = self.component_bg_x[i];
        if(clicked(self.component_bg_rect, evt))
        {
          self.selectComponent(i);
          return;
        }
      }
    }
  }

  //cascade any unregistering
  self.destroy = function()
  {
    for(var i = 0; i < self.components.length; i++)
      self.componentGraphDrawers[i].destroy();
    self.componentEditorDrawer.destroy();
    scene.clicker.unregister(self);
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
    {
      self.components[i].cleanse();
      self.componentGraphDrawers[i].cleanse();
    }
    self.componentEditorDrawer.cleanse();
    self.graphDrawer.cleanse();
    self.goalGraphDrawer.cleanse();
  }
}

