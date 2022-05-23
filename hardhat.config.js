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
//https://doc.aurora.dev/interact/hardhat/
task("createСampaign", "Create new campaign").addParam('contractaddr', "Conrtact address")
  .addParam("addresslist", "Array of the candidates addresses")
  .addParam("bid", "Bid for voting (in wei)").addParam("duration", "duration of campaign in seconds")
  .setAction(async ({contractaddr, addressList, bid, duration}, { ethers: { getSigners }, runsuper }) => {
    console.log(contractaddr, addressList,bid,duration );
    const Votings = await ethers.getContractFactory("Votings");
    console.log("-1");
    const myContract = Votings.attach(contractaddr);
    console.log("--2");
    const [user0, user1] = ethers.getSigners();
    console.log("---3");
    const id = await myContract.connect(user0).createCampaign(addressList, bid, duration);
    console.log("Campaign created with id ${id}");
    return id;
});

task("vote", "vote").addParam('contractaddr', "Conrtact address")
  .addParam("campaign", "Campaign index")
  .addParam("bid", "Bid for voting (in wei)").addParam("duration", "duration of campaign in seconds")
  .setAction(async ({contractAddr, addressList, bid, duration}, { ethers: { getSigners }, runsuper }) => {
    const Votings = await ethers.getContractFactory("Votings");
    const myContract = Votings.attach(contractAddr);
    const [user0] = hre.ethers.getSigners();
    const id = await myContract.connect(user0).createCampaign(taskArgs.addressList, taskArgs.bid, taskArgs.duration);
    console.log("Campaign created with id ${id}");
    return id;
});

task("getcomissionpercent", "Get comission percent").addParam('contractaddr', "Conrtact address")
.setAction(async ({contractaddr},{ ethers: { getSigners }, runsuper }) => {

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


