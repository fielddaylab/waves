var GamePlayScene = function(game, stage)
{
  var self = this;

  self.assetter;
  self.clicker;
  self.dragger;

  var bg;
  var placer;

  var component_select_sin;
  var component_select_triangle;
  var component_select_saw;
  var component_select_square;

  var composition;

  self.ready = function()
  {
    self.assetter = new Assetter({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas});
    self.dragger = new Dragger({source:stage.dispCanv.canvas});

    bg = new Img(self.assetter.asset("bg.jpg"),0,0,stage.drawCanv.canvas.width,stage.drawCanv.canvas.height);
    placer = new Placer(self.assetter.asset("component_bg.png"),0,0,100,100);
    if(placer)self.clicker.register(placer);
    if(placer)self.dragger.register(placer);

    var samples_per = 100;
    var w = 50;
    var h = 30;
    var x = stage.drawCanv.canvas.width-w-10;
    var y = 10;

    var component = new Component(); component.type = COMP_TYPE_SIN;
    component_select_sin = new GraphDrawer(new Components([component]),samples_per,x,y,w,h,{});
    component_select_sin.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_SIN; composition.addComponent(component); }
    self.clicker.register(component_select_sin);
    component_select_sin.draw(stage.drawCanv); //draw once,
    component_select_sin.cleanse(); //mark clean
    y += h+10;

    var component = new Component(); component.type = COMP_TYPE_TRIANGLE;
    component_select_triangle = new GraphDrawer(new Components([component]),samples_per,x,y,w,h,{});
    component_select_triangle.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_TRIANGLE; composition.addComponent(component); }
    self.clicker.register(component_select_triangle);
    component_select_triangle.draw(stage.drawCanv); //draw once,
    component_select_triangle.cleanse(); //mark clean
    y += h+10;

    var component = new Component(); component.type = COMP_TYPE_SAW;
    component_select_saw = new GraphDrawer(new Components([component]),samples_per,x,y,w,h,{});
    component_select_saw.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_SAW; composition.addComponent(component); }
    self.clicker.register(component_select_saw);
    component_select_saw.draw(stage.drawCanv); //draw once,
    component_select_saw.cleanse(); //mark clean
    y += h+10;

    var component = new Component(); component.type = COMP_TYPE_SQUARE;
    component_select_square = new GraphDrawer(new Components([component]),samples_per,x,y,w,h,{});
    component_select_square.click = function(evt) { var component = new Component(); component.type = COMP_TYPE_SQUARE; composition.addComponent(component); }
    self.clicker.register(component_select_square);
    component_select_square.draw(stage.drawCanv); //draw once,
    component_select_square.cleanse(); //mark clean

    composition = new CompositionDrawer(self, 10000, 0, 0, stage.drawCanv.canvas.width, stage.drawCanv.canvas.height);
    self.clicker.register(composition);
  };

  self.tick = function()
  {
    self.clicker.flush();
    self.dragger.flush();
  };

  self.draw = function()
  {
    bg.draw(stage.drawCanv);

    component_select_sin.draw(stage.drawCanv);
    component_select_triangle.draw(stage.drawCanv);
    component_select_saw.draw(stage.drawCanv);
    component_select_square.draw(stage.drawCanv);

    composition.draw(stage.drawCanv);
    composition.cleanse();

    if(placer)placer.draw(stage.drawCanv);
  };

  self.cleanup = function()
  {
    self.assetter.detach();
    self.clicker.detach();
    self.dragger.detach();

    self.assetter.clear();
    self.clicker.clear();
    self.dragger.clear();
  };
};

