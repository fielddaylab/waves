var CompositionDrawer = function(scene, samples, x, y, w, h)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;
  self.samples = samples;

  var MODE_COUNT = 0;
  var MODE_NORMAL   = MODE_COUNT; MODE_COUNT++;
  var MODE_PICKER   = MODE_COUNT; MODE_COUNT++;
  var MODE_COMPLETE = MODE_COUNT; MODE_COUNT++;
  var mode = MODE_NORMAL;

  var level = 0;

  var selected_type = -1;
  var comp;
  comp = new Component();
  comp.type = COMP_TYPE_SIN;
  var sinGraphDrawer = new GraphDrawer(new Components([comp]), self.samples/10, 180,304,173,112,{
    lineWidth:2,
    lineColor:"#FF3333"
  });
  comp = new Component();
  comp.type = COMP_TYPE_TRIANGLE;
  var triangleGraphDrawer = new GraphDrawer(new Components([comp]), self.samples/10, 180,304,173,112,{
    lineWidth:2,
    lineColor:"#FF3333"
  });
  comp = new Component();
  comp.type = COMP_TYPE_SAW;
  var sawGraphDrawer = new GraphDrawer(new Components([comp]), self.samples/10, 180,304,173,112,{
    lineWidth:2,
    lineColor:"#FF3333"
  });
  comp = new Component();
  comp.type = COMP_TYPE_SQUARE;
  var squareGraphDrawer = new GraphDrawer(new Components([comp]), self.samples/10, 180,304,173,112,{
    lineWidth:2,
    lineColor:"#FF3333"
  });

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

  self.component_place_x = [];
  self.component_place_rect = {};
  self.component_place_rect.x = 397;
  self.component_place_rect.y = 598;
  self.component_place_rect.w = 233;
  self.component_place_rect.h = 45;
  self.component_place_x[0] = 106;
  self.component_place_x[1] = 397;
  self.component_place_x[2] = 687;

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

  self.bg = new Img(scene.assetter.asset("bg.jpg"),self.x,self.y,self.w,self.h);
  self.picker_bg = new Img(scene.assetter.asset("selector_bg.jpg"),self.x,self.y,self.w,self.h);
  self.complete_bg = new Img(scene.assetter.asset("blank_selector_bg.jpg"),self.x,self.y,self.w,self.h);

  self.graphDrawer = new GraphDrawer(new Components(self.components), self.samples, self.x+68, self.y+140, 490, 333,
  {
    drawBG:false,
    gridWidth:0,
    drawOffY:23,
    lineColor:"#FF3333",
    lineWidth:3,
    shadowWidth:0,
    shadowColor:"rgba(95,05,04,0.2)",
    shadowOffX:10,
    shadowOffY:10
  });
  self.goalGraphDrawer;

  self.randomizeGraphDrawer = function(lvl)
  {
    var components = [];

    var n = Math.floor(1+Math.floor(lvl/3));
    if(n > 3) n = 3;
    for(var i = 0; i < n; i++)
    {
      var t = Math.floor(Math.random()*COMP_TYPE_COUNT);
      var component = new Component();
      component.type = t;
      component.off_x = Math.random()*10-5;
      component.wavelength = 0.5+Math.random()*2;
      if(Math.random() > 0.75) component.wavelength = -component.wavelength;
      component.amplitude = 0.2+Math.random()*2;
      if(Math.random() > 0.75) component.amplitude = -component.amplitude;
      components.push(component);
    }
    self.goalGraphDrawer = new GraphDrawer(new Components(components), self.samples, self.graphDrawer.x, self.graphDrawer.y, self.graphDrawer.w, self.graphDrawer.h, {
      drawBG:false,
      drawOffY:23,
      lineWidth:2,
      lineColor:"#33FF33",
      gridWidth:0
    });
  }
  self.randomizeGraphDrawer(level);

  self.addComponent = function(component)
  {
    if(self.components.length > 2) return;
    self.components.push(component);
    self.componentGraphDrawers.push(new GraphDrawer(new Components([self.components[self.components.length-1]]), self.samples/10, self.component_graph_x[self.components.length-1], self.component_graph_rect.y, self.component_graph_rect.w, self.component_graph_rect.h, {
      lineWidth:2,
      lineColor:"#FF3333"
    }));
    self.graphDrawer.components = new Components(self.components);
    self.graphDrawer.dirty();
    self.selectComponent(self.components.length-1);
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
    if(mode == MODE_NORMAL)
    {
      self.bg.draw(canv);
      self.componentEditorDrawer.draw(canv);
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
        window.storedAmplitude = a;

        self.score = self.calculateScore(100);
      }
      // draw the individual components on the graph
      for (var i = 0; i < self.graphDrawer.components.components.length; i++)
      {
        var drawer = new GraphDrawer(new Components([self.graphDrawer.components.components[i]]), self.samples, self.x+68, self.y+140, 490, 333,
        {
          drawBG:false,
          gridWidth:0,
          drawOffY:23,
          lineColor: i == self.selected ? "rgb(51, 51, 255)" : "rgba(51, 51, 255, 0.15)",
          lineWidth:3,
          shadowWidth:0,
          shadowColor:"rgba(95,05,04,0.2)",
          shadowOffX:10,
          shadowOffY:10
        });
        drawer.highestAmp = window.storedAmplitude;
        if(self.graphDrawer.isDirty())
          drawer.dirty();
        drawer.draw(canv);
      }
      self.graphDrawer.draw(canv);
      self.goalGraphDrawer.draw(canv);

      if(self.score < 200)
      {
        canv.context.fillStyle = "#E8A32D";
        canv.context.fillRect(622,256+(162*(self.score/200)),8,162*((200-self.score)/200));
      }

      if(self.score < 8)
      {
        level++;
        self.randomizeGraphDrawer(level);
        self.score = 100000;
        mode = MODE_COMPLETE;
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
        canv.context.drawImage(scene.assetter.asset("place_wave_btn.png"),self.component_place_x[i],self.component_place_rect.y,self.component_place_rect.w,self.component_place_rect.h);

      self._dirty = false;
    }
    else if(mode == MODE_PICKER)
    {
      self.picker_bg.draw(canv);
      if(selected_type == COMP_TYPE_SIN) { sinGraphDrawer.draw(canv); }
      if(selected_type == COMP_TYPE_TRIANGLE) { triangleGraphDrawer.draw(canv); }
      if(selected_type == COMP_TYPE_SAW) { sawGraphDrawer.draw(canv); }
      if(selected_type == COMP_TYPE_SQUARE) { squareGraphDrawer.draw(canv); }
    }
    else if(mode == MODE_COMPLETE)
    {
      self.complete_bg.draw(canv);
      canv.context.fillStyle = "black";
      canv.context.font = "35px Arial Black";
      canv.context.fillText('LEVEL ' + level + ' COMPLETE!', 335, 375);
      canv.context.font = "18px Arial Black";
      canv.context.fillText('NEXT LEVEL', 455, 599);
    }
  }

  self.click = function(evt)
  {
    if(mode == MODE_NORMAL)
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
      if(i < 3)
      {
        self.component_bg_rect.x = self.component_bg_x[i];
        if(clicked(self.component_bg_rect, evt))
        {
          mode = MODE_PICKER;
          return;
        }
      }
    }
    else if(mode == MODE_PICKER)
    {
      if(ptWithin(evt.doX,evt.doY,404,564,228,53))
      {
        if(selected_type != -1)
        {
          var component = new Component();
          component.type = selected_type;
          self.addComponent(component);
        }
        mode = MODE_NORMAL;
        selected_type = -1;
      }
      else if(ptWithin(evt.doX,evt.doY,406,285,230,81))
      {
        if(selected_type == COMP_TYPE_SIN) selected_type = -1;
        else selected_type = COMP_TYPE_SIN;
      }
      else if(ptWithin(evt.doX,evt.doY,404,374,230,81))
      {
        if(selected_type == COMP_TYPE_TRIANGLE) selected_type = -1;
        else selected_type = COMP_TYPE_TRIANGLE;
      }
      else if(ptWithin(evt.doX,evt.doY,658,374,230,81))
      {
        if(selected_type == COMP_TYPE_SAW) selected_type = -1;
        else selected_type = COMP_TYPE_SAW;
      }
      else if(ptWithin(evt.doX,evt.doY,661,285,230,81))
      {
        if(selected_type == COMP_TYPE_SQUARE) selected_type = -1;
        else selected_type = COMP_TYPE_SQUARE;
      }
    }
    else if(mode == MODE_COMPLETE)
    {
      if(ptWithin(evt.doX,evt.doY,404,564,228,53))
      {
        mode = MODE_NORMAL;
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

