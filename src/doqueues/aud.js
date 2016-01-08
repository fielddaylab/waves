var all_auds = [];
var aud_listener_init = false;
var stopAllAuds = function()
{
  for(var i = 0; i < all_auds.length; i++)
    all_auds[i].stop();
  all_auds = [];
}
var initAudListener = function()
{
  if(aud_listener_init) return;
  aud_listener_init = true;
  document.addEventListener("pause", stopAllAuds, false);
}
var Aud = function(source)
{
  var PLAT="IOS";
  //var PLAT="ANDROID";

  var self = this;
  initAudListener();
  all_auds.push(self);
  self.stopped = false;

  if(PLAT == "IOS")
  {
    self.audio = new Audio(source);
    self.audio.controls = false;
    self.audio.loop = false;

    self.load = function()
    {
      self.audio.load();
    }

    self.play = function()
    {
      self.audio.play();
    }

    self.stop = function()
    {
      self.stopped = true;
      self.audio.pause();
      var index = all_auds.indexOf(self);
      if(index != -1) all_auds.splice(index,1);
    }
  }

  if(PLAT == "ANDROID")
  {
    function getPhoneGapPath() {
      var path = window.location.pathname;
      path = path.substr( path, path.length - 10 );
      return 'file://' + path;
    };

    self.audio = new Media(getPhoneGapPath()+source,null,null,
      function(status)
      {
        if(!self.stopped && status == Media.MEDIA_STOPPED)
          self.audio.play();
      }
    );

    self.load = function()
    {
    }

    self.play = function()
    {
      self.audio.play();
    }

    self.stop = function()
    {
      self.stopped = true;
      self.audio.pause();
      self.audio.release();
      var index = all_auds.indexOf(self);
      if(index != -1) all_auds.splice(index,1);
    }
  }
}
