/**
 * @Author: zc
 * @Date: 2020-06-17 17:07:38
 * @LastEditors: zc
 * @LastEditTime: 2020-06-22 16:21:19
*/
const path = require('path');
const fs = require('fs');
const node_ssh = require('node-ssh');
const ssh = new node_ssh();

class NodeSftp {
  /**
   * "host": "部署服务器Ip",
   * "password": "服务器密码，可选",
   * "username": "用户名",
   * "port": "端口，默认22",
   * "privateKey": "本地公钥地址，可选",
   * "tryKeyboard": true,
   * "extendNgConf": "要添加的nginx配置",
   * "extendNgLinenum": 0, "插入nginx文件的行号",
   * "SNCPath": "服务器nginx配置文件目录",
   * "reloadNginxShell": 'nginx -s reload', "重启nginx的shell命令"
   */
  constructor(options = {}) {
    this.options = Object.assign({
      host: '',
      password: '',
      username: 'root',
      port: 22,
      // privateKey: '',
      tryKeyboard: true,
      extendNgConf: '',
      extendNgLinenum: 85,
      SNCPath: '',
      reloadNginxShell: 'nginx -s reload'
    }, options)
  }

  getConnect() {
    const { host, password, username, tryKeyboard, port } = this.options
    return new Promise(resolve => {
      ssh.connect({ host, password, username, tryKeyboard, port }).then(() => {
        resolve(this.options)
      })
    })
  }

  getFile() {
    this.getConnect().then(res => {
      const localPath = path.resolve(__dirname, res.LNCPath)
      // Local, Remote
      return new Promise((resolve, reject) => {
        ssh.getFile(localPath, res.SNCPath).then(() => {
          console.log(colors.rainbow('The File\'s contents were successfully downloaded'));
          open(localPath);
          resolve({ localPath, res })
          process.exit();
        }, error => reject(error))
      })
    })
    .catch(error => console.log(colors.red(error)));
  }
  
  // 重启nginx
  reloadNginx() {
    this.getConnect().then(res => {
      const { reloadNginxShell, SNCPath  } = res
      ssh.execCommand('nginx -t', { cwd: SNCPath}).then(result => {
        if(result.stderr){
          console.error(result.stderr);
          return;
        }
        return new Promise((resolve, rejects) => {
          ssh.execCommand(reloadNginxShell, { cwd: SNCPath}).finally(() =>{
            resolve()
            process.exit();
          }).catch((error)=>{
            rejects(error)
            process.exit();
          });
        })
      }).catch(error => console.log(colors.red(error)));
    })
  }
}

module.exports = NodeSftp