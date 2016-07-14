var ComicScene = function(game, stage)
{
  var self = this;

  var dc = stage.drawCanv;
  var ctx = stage.drawCanv.context;

  var clicker;

  var imgs;
  var nodes;
  var cur_img;
  var delta;
  var delta_goal;
  var prev_btn;
  var next_btn;
  var hit_ui;

  var slots;

  var node_y;
  var node_s;
  var btn_s;

  var blue;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

    imgs = [];
    for(var i = 0; i < 1; i++)
    {
      imgs[i] = new Image();
      imgs[i].src = "assets/comic/comic_"+i+".png";
    }

    node_y = dc.height-50;
    node_s = 10;
    btn_s = 40;

    blue = "#15A9CB";

    slots = [];
    var x = dc.width/2;
    var y = dc.height/2;
    var w = dc.width;
    var h = dc.height;
    slots[0] = { x:-w/2,         y:y-h/4,     w:w/2,   h:h/2   }; //off
    slots[1] = { x:-w/3 ,        y:y-h/3,     w:2*w/3, h:2*h/3 }; //visible
    slots[2] = { x:x-(3*w/8),    y:y-(3*h/8), w:3*w/4, h:3*h/4 }; //center
    slots[3] = { x:dc.width-w/3, y:y-h/3,     w:2*w/3, h:2*h/3 }; //visible
    slots[4] = { x:dc.width,     y:y-h/4,     w:w/2,   h:h/2   }; //off

    prev_btn = new ButtonBox(         10      ,dc.height/2-btn_s/2,btn_s,btn_s,
      function(evt)
      {
        if(hit_ui)return;hit_ui = true;
        if(cur_img == 0 || cur_img == 1 && delta_goal < 0) return;
        if(delta_goal) cur_img+=delta_goal;
        delta = 0;
        delta_goal = -1;
      });
    next_btn = new ButtonBox(dc.width-10-btn_s,dc.height/2-btn_s/2,btn_s,btn_s,
      function(evt)
      {
        if(hit_ui)return;hit_ui = true;
        if(cur_img == imgs.length-1 && delta_goal > 0) { cur_img=imgs.length; return; }
        if(delta_goal) cur_img+=delta_goal;
        delta = 0;
        delta_goal = 1;
      });
    skip_btn = new ButtonBox(dc.width-btn_s*2,dc.height-btn_s, btn_s*2,btn_s,
      function(evt)
      {
        if(hit_ui)return;hit_ui = true;
        cur_img=imgs.length;
      });
    full_btn = new ButtonBox(0,0,dc.width,dc.height,function(evt){if(!hit_ui)next_btn.click(evt);});
    nodes = [];
    for(var i = 0; i < imgs.length; i++)
    {
      (function(i){
        var x = (i+10)*(dc.width/(imgs.length+19));
        nodes[i] = new ButtonBox(x-node_s/2,node_y-btn_s/2,btn_s,btn_s,function(evt){if(hit_ui) return;cur_img = i;hit_ui = true;});
        clicker.register(nodes[i]);
      })(i);
    }
    clicker.register(prev_btn);
    clicker.register(next_btn);
    clicker.register(skip_btn);
    clicker.register(full_btn);

    cur_img = 0;
    delta = 0;
    delta_goal = 0;
  };


  var duh = 0;
  var abs = Math.abs;
  self.tick = function()
  {
    if(cur_img >= imgs.length) { game.nextScene(); }
    else clicker.flush();
    if(cur_img < 0) cur_img = 0;

    delta = lerp(delta,delta_goal,0.2);
    if(abs(delta-delta_goal) < 0.001)
    {
      cur_img += delta_goal;
      delta = 0;
      delta_goal = 0;
    }
    hit_ui = false;
  };

  self.draw = function()
  {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,dc.width,dc.height);
    if(cur_img < imgs.length)
    {
      var slot;
      var lerp_slot;
      if(cur_img-2 >= 0)                        { slot = slots[0]; lerp_slot = slot; if(delta_goal < 0) lerp_slot = slots[1]; ctx.drawImage(imgs[cur_img-2],lerp(slot.x,lerp_slot.x,abs(delta)),lerp(slot.y,lerp_slot.y,abs(delta)),lerp(slot.w,lerp_slot.w,abs(delta)),lerp(slot.h,lerp_slot.h,abs(delta))); }
      if(cur_img+2 < imgs.length)               { slot = slots[4]; lerp_slot = slot; if(delta_goal > 0) lerp_slot = slots[3]; ctx.drawImage(imgs[cur_img+2],lerp(slot.x,lerp_slot.x,abs(delta)),lerp(slot.y,lerp_slot.y,abs(delta)),lerp(slot.w,lerp_slot.w,abs(delta)),lerp(slot.h,lerp_slot.h,abs(delta))); }
      if(delta_goal == 0)
      {
        if(cur_img-1 >= 0)                        { slot = slots[1]; lerp_slot = slot; ctx.drawImage(imgs[cur_img-1],lerp(slot.x,lerp_slot.x,abs(delta)),lerp(slot.y,lerp_slot.y,abs(delta)),lerp(slot.w,lerp_slot.w,abs(delta)),lerp(slot.h,lerp_slot.h,abs(delta))); }
        if(cur_img+1 < imgs.length)               { slot = slots[3]; lerp_slot = slot; ctx.drawImage(imgs[cur_img+1],lerp(slot.x,lerp_slot.x,abs(delta)),lerp(slot.y,lerp_slot.y,abs(delta)),lerp(slot.w,lerp_slot.w,abs(delta)),lerp(slot.h,lerp_slot.h,abs(delta))); }
        if(cur_img >= 0 && cur_img < imgs.length) { slot = slots[2]; lerp_slot = slot; ctx.drawImage(imgs[cur_img  ],lerp(slot.x,lerp_slot.x,abs(delta)),lerp(slot.y,lerp_slot.y,abs(delta)),lerp(slot.w,lerp_slot.w,abs(delta)),lerp(slot.h,lerp_slot.h,abs(delta))); }
      }
      else if(delta_goal < 0)
      {
        if(cur_img+1 < imgs.length)               { slot = slots[3]; lerp_slot = slots[4]; ctx.drawImage(imgs[cur_img+1],lerp(slot.x,lerp_slot.x,abs(delta)),lerp(slot.y,lerp_slot.y,abs(delta)),lerp(slot.w,lerp_slot.w,abs(delta)),lerp(slot.h,lerp_slot.h,abs(delta))); }
        if(cur_img >= 0 && cur_img < imgs.length) { slot = slots[2]; lerp_slot = slots[3]; ctx.drawImage(imgs[cur_img  ],lerp(slot.x,lerp_slot.x,abs(delta)),lerp(slot.y,lerp_slot.y,abs(delta)),lerp(slot.w,lerp_slot.w,abs(delta)),lerp(slot.h,lerp_slot.h,abs(delta))); }
        if(cur_img-1 >= 0)                        { slot = slots[1]; lerp_slot = slots[2]; ctx.drawImage(imgs[cur_img-1],lerp(slot.x,lerp_slot.x,abs(delta)),lerp(slot.y,lerp_slot.y,abs(delta)),lerp(slot.w,lerp_slot.w,abs(delta)),lerp(slot.h,lerp_slot.h,abs(delta))); }
      }
      else if(delta_goal > 0)
      {
        if(cur_img-1 >= 0)                        { slot = slots[1]; lerp_slot = slots[0]; ctx.drawImage(imgs[cur_img-1],lerp(slot.x,lerp_slot.x,abs(delta)),lerp(slot.y,lerp_slot.y,abs(delta)),lerp(slot.w,lerp_slot.w,abs(delta)),lerp(slot.h,lerp_slot.h,abs(delta))); }
        if(cur_img >= 0 && cur_img < imgs.length) { slot = slots[2]; lerp_slot = slots[1]; ctx.drawImage(imgs[cur_img  ],lerp(slot.x,lerp_slot.x,abs(delta)),lerp(slot.y,lerp_slot.y,abs(delta)),lerp(slot.w,lerp_slot.w,abs(delta)),lerp(slot.h,lerp_slot.h,abs(delta))); }
        if(cur_img+1 < imgs.length)               { slot = slots[3]; lerp_slot = slots[2]; ctx.drawImage(imgs[cur_img+1],lerp(slot.x,lerp_slot.x,abs(delta)),lerp(slot.y,lerp_slot.y,abs(delta)),lerp(slot.w,lerp_slot.w,abs(delta)),lerp(slot.h,lerp_slot.h,abs(delta))); }
      }

      var x;
      var y;
      ctx.fillStyle = blue;
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 4;

      if(cur_img != 0)
      {
      x = prev_btn.x+prev_btn.w/2;
      y = prev_btn.y+prev_btn.h/2;
      ctx.beginPath();
      ctx.arc(x,y,btn_s/2,0,2*Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x+btn_s/6,y-btn_s/4);
      ctx.lineTo(x-btn_s/6,y);
      ctx.lineTo(x+btn_s/6,y+btn_s/4);
      ctx.stroke();
      }

      x = next_btn.x+next_btn.w/2;
      y = next_btn.y+next_btn.h/2;
      ctx.beginPath();
      ctx.arc(x,y,btn_s/2,0,2*Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x-btn_s/6,y-btn_s/4);
      ctx.lineTo(x+btn_s/6,y);
      ctx.lineTo(x-btn_s/6,y+btn_s/4);
      ctx.stroke();


      //ctx.fillRect(skip_btn.x,skip_btn.y,skip_btn.w,skip_btn.h);
      ctx.fillStyle = "#000000";
      ctx.textAlign = "right";
      ctx.font = "18px Open Sans";
      ctx.fillText("SKIP",skip_btn.x+skip_btn.w-2,skip_btn.y+skip_btn.h-2);
      var x;
      for(var i = 0; i < imgs.length; i++)
      {
        ctx.fillStyle = blue;
        ctx.beginPath();
        ctx.arc(nodes[i].x+nodes[i].w/2,nodes[i].y+nodes[i].h/2,node_s/2,0,2*Math.PI);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(nodes[i].x+nodes[i].w/2,nodes[i].y+nodes[i].h/2,node_s/3,0,2*Math.PI);
        ctx.fill();
      }
      var node = nodes[cur_img];
      var lerp_node = node;
      if(delta_goal < 0 && cur_img-1 >= 0)          lerp_node = nodes[cur_img-1];
      if(delta_goal > 0 && cur_img+1 < imgs.length) lerp_node = nodes[cur_img+1];
      ctx.fillStyle = blue;
      ctx.beginPath();
      ctx.arc(lerp(node.x,lerp_node.x,abs(delta))+node.w/2,node.y+node.h/2,node_s/3,0,2*Math.PI);
      ctx.fill();

      if(delta_goal > 0 && cur_img+1 >= imgs.length)
      {
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = delta;
        ctx.fillRect(0,0,dc.width,dc.height);
        ctx.globalAlpha = 1;
      }
    }
  };

  self.cleanup = function()
  {
    clicker.detach();
    clicker = undefined;
  };
};
