const args = require('minimist')(process.argv.slice(2)) // node scripts/dev.js reactivity -f  global

const { build } = require('esbuild')
const {resolve} = require('path')

// minist 用来解析命令行参数
console.log(args)
const target = args._[0] || 'reactivity'
const format = args.f || 'global'

//开发环境只打包某一个
const pkg = require(resolve(__dirname,`../packages/${target}/package.json`))

// iife 立即执行函数
// cjs node中的模块
// esm 浏览器中的esModule模块
const outpuFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'
const outfile = resolve(__dirname,`../packages/${target}/dist/${target}.${format}.js`)
build({
  entryPoints: [resolve(__dirname,`../packages/${target}/src/index.ts`)],
  outfile,
  bundle: true, // 把所以包打包在一起
  sourcemap:true,
  format: outpuFormat,// 输出的格式
  globalName: pkg.buildOptions?.name,
  platform: format === 'cjs' ? 'node' : 'browser',
  watch: {
    onRebuild(error, result) {
      if (error) console.error('watch build failed:', error)
      else console.log('watch build succeeded:', result)
    },
  },
}).then(() => {
  console.log('watching~~~');
})
