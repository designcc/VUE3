//进行打包 monerepo

const execa  = require("execa");

async function build(target) {
  // execa子进程插件 -c执行rollup配置 w热更新， 环境变量 -env 
  await execa("rollup", ["-cw", "--environment", `TARGET:${target}`], {stdio:'inherit'});
}

build('reactivity')
