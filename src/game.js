var Game = function(init)
{
  window.mySlog = new slog("WAVES",3);
  var default_init =
  {
    width:640,
    height:320,
    container:"stage_container"
  }

  var self = this;
  doMapInitDefaults(init,init,default_init);

  var stage = new Stage({width:init.width,height:init.height,container:init.container});
  var scenes = [
    new NullScene(self, stage),
    new LoadingScene(self, stage),
    new ComicScene(self, stage, 0),
    new GamePlayScene(self, stage, 0),
    new ComicScene(self, stage, 1),
    new GamePlayScene(self, stage, 1)
  ];
  var currentScene = 0;

  self.begin = function()
  {
    self.nextScene();
    tick();
  };

  var tick = function()
  {
    requestAnimFrame(tick,stage.dispCanv.canvas);
    stage.clear();
    var old_cur_scene = currentScene;
    scenes[currentScene].tick();
    if(old_cur_scene == currentScene) //still in same scene- draw
    {
      scenes[currentScene].draw();
      stage.draw(); //blits from offscreen canvas to on screen one
    }
  };

  self.nextScene = function()
  {
    scenes[currentScene].cleanup();
    currentScene++;
    scenes[currentScene].ready();
  };
};

