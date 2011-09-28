var domainsDir = 'domains/'
var sslDir = '/root/ssl-cert/'

var http = require('http')
  , https = require('https')
  , url = require('url')
  , path = require('path')
  , fs = require('fs')
 
var ssl =
  { ca:fs.readFileSync(sslDir +'sub.class1.server.ca.pem')
  , key:fs.readFileSync(sslDir +'ssl.key')
  , cert:fs.readFileSync(sslDir +'ssl.crt')
  }
function serve(req, res) {
  var uri = url.parse(req.url).pathname
    .replace(new RegExp('/$', 'g'), '/index.html')
    .replace(new RegExp('([a-f0-9]+)\.apptorrent\.net', 'g'), 'apptorrent.net')//wildcard hosting
  var filename = path.join(domainsDir, req.headers.host, uri)
  if(filename.substring(0, domainsDir.length) != domainsDir) {
    res.writeHead(403, {'Content-Type': 'text/plain'})
    res.write('403 Naughty!\n'+filename)
    res.end()
    return
  }

  path.exists(filename, function(exists) { 
    if(!exists) { 
      res.writeHead(404, {'Content-Type': 'text/plain'})
      res.write('404 Not Found\n'+filename)
      res.end()
      return
    } 
 
    fs.readFile(filename, 'binary', function(err, file) {
      if(err) {
        res.writeHead(500, {'Content-Type': 'text/plain'})
        res.end(err + '\n')
        return
      }

      res.writeHead(200, {'Access-Control-Allow-Origin': '*'})
      res.write(file, 'binary')
      res.end()
    })
  })
}

http.createServer(serve).listen(80)
https.createServer(ssl, serve).listen(443)
console.log('Server running at ports 80 and 443') 
//console.log('Server running at port 80') 