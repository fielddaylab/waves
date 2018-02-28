var slog = function(app_id,app_version)
{
  var self = this;

  self.accrued_log = [];
  self.flushed_to = 0;
  self.flush_index = 0;

  self.app_id = app_id;
  self.app_version = app_version;
  self.session_id = UUIDint();
  self.persistent_session_id = UUIDint();

  self.req_url = "http://www.simplelog.com/log.php?app_id="+encodeURIComponent(self.app_id)+"&app_version="+encodeURIComponent(self.app_version)+"&session_id="+encodeURIComponent(self.session_id)+"&persistent_session_id="+encodeURIComponent(self.persistent_session_id);

  self.log = function(data)
  {
    data.flush_index = self.flush_index;
    data.client_time = (new Date()).toUTCString();
    self.flush_index++;
    self.accrued_log.push(data);
  }
  self.flush = function()
  {
    var xhr = new XMLHttpRequest();
    xhr.flush_index = self.flush_index;
    xhr.onreadystatechange = function()
    {
      if(xhr.readyState == 4 && xhr.status == 200)
      {
        var cutoff = -1;
        for(var i = 0; i < self.accrued_log.length && cutoff < 0; i++) if(self.accrued_log[i].flush_index >= xhr.flush_index) cutoff = i;
        self.accrued_log.splice(0,cutoff);
      }
    }

    var post = "data="+encodeURIComponent(JSON.stringify(self.accrued_log));

    xhr.open("POST", self.req_url+"&req_id="+encodeURIComponent(UUIDint()), true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(post);
  }
}

