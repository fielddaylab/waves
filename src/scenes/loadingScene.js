var LoadingScene = function(game, stage)
{
  var self = this;
  var pad;
  var barw;
  var progress;
  var canv = stage.drawCanv;

  var imagesloaded = 0;
  var img_srcs = [];
  var images = [];

  var imageLoaded = function()
  {
    imagesloaded++;
  };

  self.ready = function()
  {
    pad = 20;
    barw = (canv.width-(2*pad));
    progress = 0;
    canv.context.font = "12px stump";
    canv.context.fillText(".",0,0);// funky way to encourage any custom font to load
    canv.context.font = "12px Open Sans";
    canv.context.fillText(".",0,0);// funky way to encourage any custom font to load

    //put strings in 'img_srcs' as separate array to get "static" count
    img_srcs.push("assets/left-panel.png");
    img_srcs.push("assets/right-panel.png");
    img_srcs.push("assets/wave-machine.png");
    img_srcs.push("assets/toggle-up-button.png");
    img_srcs.push("assets/toggle-down-button.png");
    img_srcs.push("assets/slider-button.png");
    img_srcs.push("assets/knob-button.png");
    img_srcs.push("assets/level-bg.png");
    img_srcs.push("assets/fade-level-bg.png");
    img_srcs.push("assets/level-bg-outline.png");
    img_srcs.push("assets/icon-locked.png");
    img_srcs.push("assets/icon-check.png");
    img_srcs.push("assets/icon-close.png");
    img_srcs.push("assets/theyard-logo.png");
    img_srcs.push("assets/scout.png");
    img_srcs.push("assets/honey.png");
    img_srcs.push("assets/icon-menu.png");
    img_srcs.push("assets/button-next.png");
    img_srcs.push("assets/button-reroll.png");
    img_srcs.push("assets/button-skip.png");
    for(var i = 0; i < img_srcs.length; i++)
    {
      images[i] = new Image();
      images[i].onload = imageLoaded; 
      images[i].src = img_srcs[i];
    }
    imageLoaded(); //call once to prevent 0/0 != 100% bug
  };

  self.tick = function()
  {
    if(progress <= imagesloaded/(img_srcs.length+1)) progress += 0.03;
    if(progress >= 1.0) game.nextScene();
  };

  self.draw = function()
  {
    canv.context.fillRect(pad,canv.height/2,progress*barw,1);
    canv.context.strokeRect(pad-1,(canv.height/2)-1,barw+2,3);
  };

  self.cleanup = function()
  {
    progress = 0;
    imagesloaded = 0;
    images = [];//just used them to cache assets in browser; let garbage collector handle 'em.
    canv.context.fillStyle = "#FFFFFF";
    canv.context.fillRect(0,0,canv.width,canv.height);
  };
};
