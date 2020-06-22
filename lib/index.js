/**
 * @Author: zc
 * @Date: 2020-06-19 16:07:45
 * @LastEditors: zc
 * @LastEditTime: 2020-06-22 15:23:48
*/
const NodeScp = require('./scp')
const NodeSftp = require('./sftp') 
/**
 * "host": "部署服务器Ip",
 * "password": "服务器密码，可选",
 * "username": "用户名",
 * "port": "端口，默认22",
 * "privateKey": "本地公钥地址，可选",
 * "tryKeyboard": true,
 * "packagename": "项目名称",
 * "testbranch": "测试环境目录",
 * "extendNgConf": "要添加的nginx配置",
 * "extendNgLinenum": 0, "插入nginx文件的行号",
 * "SNCPath": "服务器nginx配置文件目录",
 * "LNCPath": "本地nginx配置文件路径",
 * "reloadNginxShell": 'nginx -s reload', "重启nginx的shell命令"
 * local: '',  上传的本地文件、文件夹
 * path: '', // 要复制的远程文件或文件夹
 * download: '' // 文件下载到本地地址
 * handleFile: () => {} // 处理文件的方法
 */
class uploadAndReload {
  constructor (options = {}) {
    this.options = Object.assign({ 
      username: 'root', 
      port: 22, 
      local: 'build',
      tryKeyboard: true,
      extendNgConf: '',
      extendNgLinenum: 85,
      isDockerNginx: false,
      testbranch: '',
      SNCPath: '',
      reloadNginxShell: 'nginx -s reload'
    }, 
      options
    )
  }
  // 将本地编译文件上传到nginx --> 下载nginx的conf文件到本地 --> 修改本地conf文件 -->  上传本地的conf文件到nginx --> 检查并重启nginx
  init() {
    const scp = new NodeScp(this.options)
    const sftp = new NodeSftp(this.options)
    const {local, path} = this.options
    scp.upload(local, path).then(() => {
      scp.download().then(() => {
        this.addFileContent().then(() => {
          console.log('===test===')
          // sftp.reloadNginx()
        })
      })
    })
  }

  addFileContent() {
    if (handleFile) {
      this.options.handleFile()
      return
    }
    const { packagename, testbranch, extendNgConf, extendNgLinenum, LNCPath } = this.options
    const localPath = path.resolve(__dirname, LNCPath)
    const _fileCon = fs.readFileSync(localPath, 'utf8')
    if (_fileCon.includes(testbranch ? `location /${packagename}/${testbranch} {` : `location /${packagename} {`)) return

    return new Promise((resolve, reject) => {
      let data = _fileCon.split(/\r\n|\n|\r/gm); //readFileSync的第一个参数是文件名
      data.splice(extendNgLinenum, 0, extendNgConf);
      fs.writeFileSync(filePath, data.join('\r\n'), err => {
        if(err) reject(err)
        else resolve()
      })
    })
  }
}

module.exports = uploadAndReload