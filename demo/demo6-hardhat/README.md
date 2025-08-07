# npm 指令

// 安装
npm install xxx --save-dev
// 卸载
npm uninstall xxx

# hardhat 指令

// 部署
npx hardhat run scripts/deployFundMe.js --network sepolia
// 验证合约
npx hardhat verify --network sepolia 0x8b354301e048D6c48A4b63281D9F74807b8a3C39 "参数"
// 设置 env-enc 密钥
npx env-enc set-pw
// 设置 env-enc
npx env-enc set