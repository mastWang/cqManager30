// 导入模块
const express = require('express')
const dbHelper = require('./libs/dbHelper')

// 实例化服务器对象
const app = express()
// 托管静态资源
app.use(express.static('views'))

// 路由1 英雄列表 带分页 带查询
app.get('/heroList', (req, res) => {
  // 接收数据 页码
  const pagenum = parseInt(req.query.pagenum)
  // 接收数据 页容量
  const pagesize = parseInt(req.query.pagesize)

  // 接收数据 查询条件
  const query = req.query.query

  // 获取所有数据
  dbHelper.find('cqlist', {}, result => {
    // 检索出符合查询条件的数据
    const temArr = result.filter(v => {
      if (v.heroName.indexOf(query) != -1 || v.skillName.indexOf(query) != -1) {
        return true
      }
    })
    // 返回的数据
    let list = []
    // 计算起始索引
    const startIndex = (pagenum - 1) * pagesize
    // 计算结束索引
    const endIndex = startIndex + pagesize
    // 获取当前这一页的数据
    for (let i = startIndex; i < endIndex; i++) {
      if (temArr[i]) {
        list.push(temArr[i])
      }
    }
    // 获取总页数
    const totalPage = Math.ceil(temArr.length / pagesize)
    // 返回数据
    res.send({
      totalPage,
      list
    })
  })
})

// 路由2 英雄详情
app.get('/heroDetail',(req,res)=>{
  // 获取id
  const id = req.query.id
  // 根据id查询数据
  dbHelper.find('cqlist',{_id:dbHelper.ObjectId(id)},result=>{
    // 返回查询的数据
    res.send(result)
  })
})

// 开启监听
app.listen(8848)
