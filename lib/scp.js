/**
 * @Author: zc
 * @Date: 2020-06-19 10:46:29
 * @LastEditors: zc
 * @LastEditTime: 2020-06-19 17:56:57
*/
const path = require('path')
const colors = require('colors')
const Client = require('scp2')

class NodeScp {
  /**
   * host: '',
   * username: 'root',
   * password: '',
   * local: '',  上传的本地文件、文件夹
   * path: '', // 要复制的远程文件或文件夹
   * download: '' // 文件下载到本地地址
   */
  constructor(options = {}) {
    this.options = Object.assign({ username: 'root', port: 22, local: 'build' }, options)
    this.startTime = null
  }

  /**
   * opts
   */
  upload(local, path) {
    const local = path.join(this.options.local)
    this.creattime('\nStart upload, please wait...')
    return new Promise(resolve => {
      Client.scp(local, {
        ...this.options,
        path
      }, err => {
        if (err) throw err
        this.writeConsole('green', `Uploaded ${local} successfully in ${Date.now() - this.startTime}ms`)
        resolve()
      })
    })
  }

  download() {
    this.creattime('\nStart download, please wait...')
    const { download, local } = this.options
    return new Promise(resolve => {
      Client.scp(this.options, download || path.join(local), err => {
        if (err) throw err
        this.writeConsole('green', `Download ${path} successfully in ${Date.now() - this.startTime}ms`)
        resolve()
      })
    })
  }

  writeConsole(method, msg) {
    console.log(colors[method](msg))
  }

  creattime(mag) { 
    this.startTime = Date.now()
    this.writeConsole('rainbow', mag)
  }
}

module.exports = NodeScp
