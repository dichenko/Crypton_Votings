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


task("createСampaign", "Create new campaign").addParam('contractaddr', "Conrtact address")
  .addParam("addresslist", "Array of the candidates addresses").addParam("bid", "Bid for voting (in wei)").addParam("duration", "duration of campaign in seconds")
  .setAction(async ({contractaddr, addressList, bid, duration}, { ethers: { getSigners }, runsuper }) => {
    const Votings = await ethers.getContractFactory("Votings");
    const myContract = Votings.attach(contractaddr);
    const [user0] = await ethers.getSigners();
    const id = await myContract.connect(user0).createCampaign(addressList, bid, duration);
    console.log("Campaign created with id ${id}");
    return id;
});

task("vote", "vote").addParam('contractaddr', "Conrtact address")
  .addParam("signerid", "Signer index (0-9)").addParam("campaign", "Campaign index")
  .addParam("candidate", "Candidate address")
  .setAction(async ({contractaddr, candidate, campaign, signerid}, { ethers: { getSigners }, runsuper }) => {
    const Votings = await ethers.getContractFactory("Votings");
    const myContract = Votings.attach(contractaddr);
    const [user0, user1, user2, user3, user4, user5, user6, user7, user8, user9] = hre.ethers.getSigners();
    const userArray = [user0, user1, user2, user3, user4, user5, user6, user7, user8, user9];
    const [, , , bid, , ,] = await myContract.getCampaignInformation(0);
    const options = { value: bid };
    const id = await myContract.connect(userArray[signerid]).vote(campaign, candidate, options);
    console.log("User ${userArray[signerid]} vote for candidate ${candidate}");
    return id;
});

task("getcomissionpercent", "Get comission percent").addParam('contractaddr', "Conrtact address")
.setAction(async ({contractaddr}) => {
  Votings = await ethers.getContractFactory("Votings");
  const myContract = Votings.attach(contractaddr);
  const comissionPercent = await myContract.getComissinPercent;
  console.log(comissionPercent)
  return comissionPercent;
});



module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: process.env.STAGING_ALCHEMY_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan:{
    apiKey: process.env.API_KEY
  }
};


