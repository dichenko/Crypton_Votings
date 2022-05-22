const { task } = require("hardhat/config");

require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("dotenv").config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

task("startcampaign", "Create new campaign")
  .addParam("addressList", "Array of the candidates addresses")
  .addParam("bid", "Bid for voting (in wei)").addParam("duration", "duration of campaign in seconds")
  .setAction(async (taskArgs) => {
    Votings = await ethers.getContractFactory("Votings");
    myContract = await Votings.deploy();
    const id = await myContract.createCampaign(taskArgs.addressList, taskArgs.bid, taskArgs.duration);
});



module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: process.env.STAGING_ALCHEMY_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};


