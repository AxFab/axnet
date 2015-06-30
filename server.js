#!/usr/bin/env node

console.log('Initializing...')

var axnet = require('axnet'),
    markup = require('html-markup')
    Server = axnet.WebServer, 
    app = new Server(),
    exec = require('child_process').exec



markup.directory = __dirname + '/views/'
markup.debug = false // Enable/Disable extra logs

var auth = { 
  auth: 'Basic realm="axFab.net"',
  users:[
    { name:'admin', password:'alpine' }
  ]
}

// Public static directories
app.use('/favicon.ico', Server.static(__dirname + '/dist'))
app.use('/dist', Server.static(__dirname + '/dist'))
app.use('/node_modules', Server.static(__dirname + '/node_modules'))

// app.get('/data', Server.static(__dirname + '/data'))
// app.post('/data', Server.basicAuth(auth))
// app.post('/data', Server.store(__dirname + '/data'))
app.post('/app', Server.service(axnet.MailService))
app.post('/service/update', function (req, res) {
  console.log ('UPDATE SERVER')
  res.writeHead(200, { })
  res.end('ACK')
  exec('/srv/axnet/axnetd.sh update', function (error, stdout, stderr) {
    if (error != null) {
      console.error('exec error: ' + error);
      console.log(stdout);
      console.error(stderr);
    }
  })
})

// *.html pages (also handle directories)
app.use('/admin', Server.basicAuth(auth))
app.use('/', markup.renderer(__dirname + '/views/'))

var port = process.env.PORT || 80
app.listen(port, function () {
  console.log('Server listening on port ' + port)
})


// TODO Add Job

var jobs = [
  'cd bootstrap-3.3.1 && grunt watch'
]

//  openssl genrsa -out axfab.net.key 2048
//  openssl req -new -x509 -key axfab.net.key -out axfab.net.cert -days 3650 -subj /CN=axfab.net
