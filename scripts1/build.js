//monorepo格式 将多个package放在一个repo中的代码管理模式 workspace+lerna来管理项目
//进行打包 monerepo
const fs = require("fs");
const execa  = require("execa");
const dirs = fs.readdirSync("packages").filter((p) => {
  if (!fs.statSync(`packages/${p}`).isDirectory()) {
    //只获取package下面的所以文件夹
    return false;
  }
  return true;
});

async function build(target) {
  // execa子进程插件 -c执行rollup配置， 环境变量 -env
  await execa("rollup", ["-c", "--environment", `TARGET:${target}`], {stdio:'inherit'});
}
async function runParaller(dirs, itemFn) {
  let result = [];
  for (let item of dirs) {
    result.push(itemFn(item));
  }
  return Promise.all(result); //存放打包的promise
}

runParaller(dirs, build).then(() => {
  console.log("success");
});

console.log(dirs);
