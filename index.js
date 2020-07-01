const fs = require('fs')
const node_ssh = require('node-ssh');
const ssh = new node_ssh();
const open = require('open');

class sshNginx {
  constructor (options = {}) {
    this.options = Object.assign({ 
      username: 'root', 
      port: 22, 
      local: '',
      tryKeyboard: true,
      extendNgConf: '',
      extendNgLinenum: 85,
      ergStr: '',
      isDockerNginx: false,
      serverPath: '',
      serverFile: 'default.conf',
      reloadNginxShell: 'nginx -s reload'
    }, 
      options
    )
  }
  // 将本地编译文件上传到nginx --> 下载nginx的conf文件到本地 --> 修改本地conf文件 -->  上传本地的conf文件到nginx --> 检查并重启nginx
  init() {
    const { host,  password, username, tryKeyboard, port, local, serverPath, serverFile, extendNgConf, extendNgLinenum, ergStr } = this.options
    ssh.connect({
      host,
      password,
      username,
      tryKeyboard,
      port
    }).then(() => {
      // Local, Remote
      ssh.getFile(local, `${serverPath}/${serverFile}`).then(function(Contents) {
        console.log('The File\'s contents were successfully downloaded');
        open(local);
        writeFileToLine(local, extendNgConf, extendNgLinenum, ergStr)
      }, function(error) {
        console.log('Something\'s wrong');
        console.log(error);
      });
    }).catch((err)=>{
      console.error(err);
    });
  }

  writeFileToLine(filePath, value, line, ergStr){
    const _fileCon = fs.readFileSync(filePath, 'utf8')
    if (ergStr && _fileCon.includes(ergStr)) {
      process.exit();
    }
  
    let data = _fileCon.split(/\r\n|\n|\r/gm); //readFileSync的第一个参数是文件名
    data.splice(line, 0, value);
    fs.writeFileSync(filePath, data.join('\r\n'))
    handleNginx()
  }

  handleNginx() {
    const { local, serverPath, serverFile, reloadNginxShell } = this.options
    ssh.putFile(local, `${serverPath}/${serverFile}`).then(function() {
      ssh.execCommand('nginx -t', { cwd: serverPath}).then(result => {
        if(result.stderr && !result.stderr.includes('successful')){
          console.error(new Date().getTime(), result.stderr);
          return;
        }
          ssh.execCommand(reloadNginxShell, { cwd: serverPath}).finally(() =>{
            process.exit();
          }).catch((error)=>{
            console.log(error)
            process.exit();
          });
      }).catch(error => console.log(error));
    }, function(error) {
      console.log(error)
      process.exit();
    })
  }
}

module.exports = sshNginx