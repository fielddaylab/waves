var GamePlayScene = function(game, stage)
{
  var self = this;

  self.assetter;
  self.clicker;
  self.dragger;

  var placer;

  var composition;

  self.ready = function()
  {
    self.assetter = new Assetter({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas});
    self.dragger = new Dragger({source:stage.dispCanv.canvas});

    //placer = new Placer(self.assetter.asset("place_wave_btn.png"),0,0,100,100);
    if(placer)self.clicker.register(placer);
    if(placer)self.dragger.register(placer);

    composition = new CompositionDrawer(self, 1000, 0, 0, stage.drawCanv.canvas.width, stage.drawCanv.canvas.height);
    self.clicker.register(composition);
  };

  self.tick = function()
  {
    self.clicker.flush();
    self.dragger.flush();
  };

  self.draw = function()
  {
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

