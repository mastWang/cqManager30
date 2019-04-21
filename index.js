// 导入模块
const express = require('express')
const dbHelper = require('./libs/dbHelper')
// 导入文件上传中间件
const multer = require('multer')
// 设置保存的地址
const upload = multer({ dest: 'views/imgs/' })
// 导入path模块
const path = require('path')
// 导入body-parser中间件
const bodyParser = require('body-parser')

// 导入验证码模块
const svgCaptcha = require('svg-captcha');

// 实例化服务器对象
const app = express()
// 托管静态资源
app.use(express.static('views'))
// 注册中间件 body-parser
app.use(bodyParser.urlencoded({ extended: false }))

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
    // 数组倒序
    result = result.reverse()
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
app.get('/heroDetail', (req, res) => {
  // 获取id
  const id = req.query.id
  // 根据id查询数据
  dbHelper.find('cqlist', { _id: dbHelper.ObjectId(id) }, result => {
    // 返回查询的数据
    res.send(result[0])
  })
})

// 路由3 英雄新增 文件上传
app.post('/heroAdd', upload.single('heroIcon'), (req, res) => {
  // 打印数据
  // 文件信息
  // console.log(req.file)
  // 文本信息
  // console.log(req.body)
  // 获取数据
  const heroName = req.body.heroName
  const skillName = req.body.skillName
  // 图片本地地址 托管静态资源的时候 views已经设置 访问时不需要
  const heroIcon = path.join('imgs', req.file.filename)

  // 保存到数据库中
  dbHelper.insertOne(
    'cqlist',
    {
      heroName,
      heroIcon,
      skillName
    },
    result => {
      // res.send(result)
      res.send({
        code: 200,
        msg: '添加成功'
      })
    }
  )
})

// 路由4 英雄修改
app.post('/heroUpdate', upload.single('heroIcon'), (req, res) => {
  // 获取数据
  const heroName = req.body.heroName
  const skillName = req.body.skillName
  // 英雄id
  const id = req.body.id
  // console.log(req.file)
  // 修改的数据
  let updateData = {
    heroName,
    skillName
  }
  // 是否需要修改图片
  if (req.file) {
    // 图片本地地址 托管静态资源的时候 views已经设置 访问时不需要
    const heroIcon = path.join('imgs', req.file.filename)
    // 增加头像属性
    updateData.heroIcon = heroIcon
  }

  // 保存到数据库中
  dbHelper.updateOne(
    'cqlist',
    { _id: dbHelper.ObjectId(id) },
    updateData,
    result => {
      // res.send(result)
      res.send({
        msg: '修改成功',
        code: 200
      })
    }
  )
})

// 路由5 英雄删除
app.get('/heroDelete', (req, res) => {
  // 接收数据
  const id = req.query.id
  // 删除数据（真删除，工作中后台一般是 软删除）
  dbHelper.deleteOne(
    'cqlist',
    {
      _id: dbHelper.ObjectId(id)
    },
    result => {
      // res.send(result)
      res.send({
        msg: '删除成功',
        code: 200
      })
    }
  )
})

// 路由6 用户注册 不需要文件上传 只是 post数据获取
app.post('/register', (req, res) => {
  // post数据 通过body
  // res.send(req.body)
  // 查询
  dbHelper.find(
    'userlist',
    {
      username: req.body.username
    },
    result => {
      // res.send(result)
      if (result.length === 0) {
        // 可以注册
        // 保存
        dbHelper.insertOne('userlist', req.body, result => {
          // res.send(result)
          res.send({
            msg: '恭喜你，加入我们',
            code: 200
          })
        })
      } else {
        // 已被注册
        res.send({
          msg: '哥们，这个名字已被注册,换个吧',
          code: 400
        })
      }
    }
  )
})

// 路由7 返回验证码
app.get('/captcha', function (req, res) {
  // 创建验证码
	var captcha = svgCaptcha.create();
  // req.session.captcha = captcha.text;
  console.log(captcha.text)
  // 设置响应类型
  res.type('svg');
  // 返回数据
	res.status(200).send(captcha.data);
});

// 开启监听
app.listen(8848)
