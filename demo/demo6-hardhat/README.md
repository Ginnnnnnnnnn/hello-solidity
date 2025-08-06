# npm 指令

// 安装
npm install xxx --save-dev

# hardhat 指令

// 部署
npx hardhat run scripts/deployFundMe.js --network sepolia
// 验证合约
npx hardhat verify --network sepolia 0x8b354301e048D6c48A4b63281D9F74807b8a3C39 "参数"
// 加密 env
npx env-enc set-pw