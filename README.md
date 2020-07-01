# node-ssh-modify-nginx

`
const sshNginx = require('node-ssh-modify-nginx')

new sshNginx({
  host: '197.0.0.1',
  password: '***',
  extendNgConf: '',
  extendNgLinenum: 72,
  local: path.resolve(__dirname, 'nginx.conf),
  serverPath: '/*/*/conf.d'
}).init()

`
