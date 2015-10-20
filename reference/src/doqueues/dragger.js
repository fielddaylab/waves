var Dragger = function(init)
{
  var default_init =
  {
    source:document.createElement('div')
  }

  var self = this;
  doMapInitDefaults(self,init,default_init);

  var draggables = [];
  var dragging = [];
  var callbackQueue = [];
  var evtQueue = [];
  self.register = function(draggable) { draggables.push(draggable); }
  self.unregister = function(draggable) { var i = draggables.indexOf(draggable); if(i != -1) draggables.splice(i,1); }
  self.clear = function() { draggables = []; }
  self.attach = function() //will get auto-called on create
  {
    if(platform == "PC")
    {
      self.source.addEventListener('mousedown', begin, false);
      self.source.addEventListener('mousemove', drag,  false);
      self.source.addEventListener('mouseup',   end,   false);
    }
    else if(platform == "MOBILE")
    {
      self.source.addEventListener('touchstart', begin, false);
      self.source.addEventListener('touchmove',  drag,  false);
      self.source.addEventListener('touchend',   end,   false);
    }
  }
  self.detach = function()
  {
    if(platform == "PC")
    {
      self.source.removeEventListener('mousedown', begin);
      self.source.removeEventListener('mousemove', drag);
      self.source.removeEventListener('mouseup',   end);
    }
    else if(platform == "MOBILE")
    {
      self.source.removeEventListener('touchstart', begin);
      self.source.removeEventListener('touchmove',  drag);
      self.source.removeEventListener('touchend',   end);
    }
  }

  function begin(evt)
  {
    doSetPosOnEvent(evt);
    for(var i = 0; i < draggables.length; i++)
    {
      if(
        evt.doX >= draggables[i].x &&
        evt.doX <= draggables[i].x+draggables[i].w &&
        evt.doY >= draggables[i].y &&
        evt.doY <= draggables[i].y+draggables[i].h
      )
      {
        dragging.push(draggables[i]);
        callbackQueue.push(draggables[i].dragStart);
        evtQueue.push(evt);
      }
    }
  }
  function drag(evt)
  {
    doSetPosOnEvent(evt);
    for(var i = 0; i < dragging.length; i++)
    {
      callbackQueue.push(dragging[i].drag);
      evtQueue.push(evt);
    }
  }
  function end(evt)
  {
    doSetPosOnEvent(evt);
    for(var i = 0; i < dragging.length; i++)
    {
      callbackQueue.push(dragging[i].dragFinish);
      evtQueue.push(evt);
    }
    dragging = [];
  }
  self.flush = function()
  {
    for(var i = 0; i < callbackQueue.length; i++)
      callbackQueue[i](evtQueue[i]);
    callbackQueue = [];
    evtQueue = [];
  }

  self.attach();
}

//example draggable- just needs x,y,w,h and dragStart, drag, and dragFinish callback
var Draggable = function(args)
{
  var self = this;

  //nice in smooth dragging
  self.offX = 0;
  self.offY = 0;

  self.x = args.x ? args.x : 0;
  self.y = args.y ? args.y : 0;
  self.w = args.w ? args.w : 0;
  self.h = args.h ? args.h : 0;
  self.dragStart  = args.dragStart  ? args.dragStart  : function(evt){ self.offX = self.x+(self.w/2)-evt.doX; self.offY = self.y+(self.h/2)-evt.doY; };
  self.drag       = args.drag       ? args.drag       : function(evt){ self.x = evt.doX-(self.w/2)+self.offX; self.y = evt.doY-(self.h/2)+self.offY; };
  self.dragFinish = args.dragFinish ? args.dragFinish : function(){};

  //nice for debugging purposes
  self.draw = function(canv)
  {
    canv.context.strokeStyle = "#00FF00";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }
}

