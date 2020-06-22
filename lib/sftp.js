/**
 * @Author: zc
 * @Date: 2020-06-17 17:07:38
 * @LastEditors: zc
 * @LastEditTime: 2020-06-19 17:30:03
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

  // 重启nginx
  reloadNginx() {
    this.getConnect.then(res => {
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