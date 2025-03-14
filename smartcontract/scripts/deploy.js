const hre = require("hardhat");

async function main() {
  // Lấy signer (tài khoản deploy)
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Kiểm tra balance của tài khoản deploy
  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH");

  // Danh sách ứng cử viên mẫu
  const candidateNames = ["Toàn", "Tuyên", "Tuân"];

  // Lấy contract factory
  const SimpleVoting = await hre.ethers.getContractFactory("SimpleVoting");
  
  // Deploy hợp đồng
  const votingContract = await SimpleVoting.deploy(candidateNames);
  
  // Chờ hợp đồng được deploy
  await votingContract.deployed();

  console.log("SimpleVoting deployed to:", votingContract.address);
}

// Xử lý lỗi
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });