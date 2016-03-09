var Game = function(init)
{
  var default_init =
  {
    width:640,
    height:320,
    container:"stage_container"
  }

  var self = this;
  doMapInitDefaults(init,init,default_init);

  var stage = new Stage({width:init.width,height:init.height,container:init.container});
  var scenes = [new NullScene(self, stage), new LoadingScene(self, stage), /*new TestScene(self, stage),*/ new GamePlayScene(self, stage)];
  var currentScene = 0;

  self.begin = function()
  {
    self.nextScene();
    tick();
  };

  var known_global_bg_alpha = -99999;
  var known_global_blurb_up = false;
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
    if(currentScene == 2)
    {
      if(known_global_bg_alpha != global_bg_alpha)
      {
        known_global_bg_alpha = global_bg_alpha;
        document.getElementById("side_a").style.backgroundColor = "rgba(118,218,227,"+global_bg_alpha+")";
        document.getElementById("side_b").style.backgroundColor = "rgba(118,218,227,"+global_bg_alpha+")";
        document.getElementById("side_c").style.backgroundColor = "rgba(118,218,227,"+global_bg_alpha+")";
      }
      if(known_global_blurb_up != global_blurb_up)
      {
        known_global_blurb_up = global_blurb_up;
        if(global_blurb_up) document.getElementById('blurb_bg').style.visibility = 'visible';
        else                document.getElementById('blurb_bg').style.visibility = 'hidden';
      }
    }
  };

  self.nextScene = function()
  {
    scenes[currentScene].cleanup();
    currentScene++;
    scenes[currentScene].ready();
  };
};

