const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Votings", function () {
  let myContract;
  let Votings;
  let owner;
  let user1;
  let user2;
  let user3;
  let user4;
  let user5;

  beforeEach(async () => {
    Votings = await ethers.getContractFactory("Votings");
    myContract = await Votings.deploy();
    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myContract.owner()).to.equal(owner.address);
    });
  });

  describe("Create campaign", function () {
    it("Should emit event 'newCampaignCreated'", async function () {
      expect(
        myContract.createCampaign([user1.address, user2.address, user3.address])
      ).to.emit(myContract, "newCampaignCreated");
    });

    it("Should create campaigns with correct campaignId", async function () {
      expect(
        myContract.createCampaign([user1.address, user2.address, user3.address])
      )
        .to.emit(myContract, "newCampaignCreated")
        .withArgs(0);

      expect(
        myContract.createCampaign([user4.address, user2.address, user3.address])
      )
        .to.emit(myContract, "newCampaignCreated")
        .withArgs(1);
    });

    it("Should create campaign from any account", async function () {
      expect(
        myContract
          .connect(user1)
          .createCampaign([user1.address, user2.address, user3.address])
      ).to.emit(myContract, "newCampaignCreated");

      expect(
        myContract
          .connect(user4)
          .createCampaign([user1.address, user2.address, user3.address])
      ).to.emit(myContract, "newCampaignCreated");
    });

    it("Should be at least one candidate", async function () {
      await expect(myContract.createCampaign([])).to.be.revertedWith(
        "Add more candidates"
      );
    });

    it("There should be no duplicates on the list of candidates", async function () {
      const camp = await myContract.createCampaign([
        user1.address,
        user1.address,
        user1.address,
      ]);
      const [, , arr, ,] = await myContract.getCampaignInformation(0);
      const len = arr.length;
      expect(len).to.equal(1);
    });
  });

  describe("Vote", function () {
    it("Everyone has the opportunity to vote", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const bid = await myContract.getBid();
      const options = { value: bid };

      await myContract.vote(0, user1.address, options);
      await myContract.connect(user1).vote(0, user1.address, options);
      await myContract.connect(user2).vote(0, user1.address, options);
      await myContract.connect(user4).vote(0, user1.address, options);
      const [, , , val] = await myContract.getCampaignInformation(0);
      expect(val).to.equal(4);
    });

    it("It is forbidden to vote after the end of voting time ", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const duration = await myContract.getDuration();
      await ethers.provider.send("evm_increaseTime", [Number(duration)]);
      await ethers.provider.send("evm_mine");
      await expect(myContract.vote(0, user1.address)).to.be.revertedWith(
        "Voting time is up"
      );
    });

    it("Schould can vote only for existing candidate ", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      await expect(myContract.vote(0, user4.address)).to.be.revertedWith(
        "Unknown candidate"
      );
    });

    it("Everyone can vote only once", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const bid = await myContract.getBid();
      const options = { value: bid };
      await myContract.connect(user1).vote(0, user2.address, options);
      await expect(
        myContract.connect(user1).vote(0, user2.address, options)
      ).to.be.revertedWith("You have already voted");
      await expect(
        myContract.connect(user1).vote(0, user3.address, options)
      ).to.be.revertedWith("You have already voted");
    });

    it("The cost of voting is equal to the bid", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const bid = await myContract.getBid();
      const options = { value: bid + 1 }; //каак передать имененный bid?
      await expect(
        myContract.connect(user1).vote(0, user2.address, options)
      ).to.be.revertedWith("Wrong bid");
    });

    it("Voting increases campaign funds", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const bid = await myContract.getBid();
      const options = { value: bid };
      const [, , , , founded] = await myContract.getCampaignInformation(0);
      expect(founded).to.equal(0);
      await myContract.connect(user1).vote(0, user2.address, options);
      const [, , , , founded1] = await myContract.getCampaignInformation(0);
      expect(founded1).to.equal(bid);
    });

    it("Voting increases vote count for the candidate", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const bid = await myContract.getBid();
      const options = { value: bid };
      const counter1 = await myContract.getVoteCounterOfCandidate(
        0,
        user2.address
      );
      expect(counter1).to.equal(0);
      await myContract.connect(user1).vote(0, user2.address, options);
      const counter2 = await myContract.getVoteCounterOfCandidate(
        0,
        user2.address
      );
      expect(counter2).to.equal(1);
    });

    it("Voting increases commonVoteCount ", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const bid = await myContract.getBid();
      const options = { value: bid };
      const counter1 = await myContract.getVotesCount(0);
      expect(counter1).to.equal(0);
      await myContract.connect(user1).vote(0, user2.address, options);
      const counter2 = await myContract.getVotesCount(0);
      expect(counter2).to.equal(1);
    });

    it("Several campaigns must work at the same time  ", async function () {
      const campaign1 = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const campaign2 = await myContract.createCampaign([
        user4.address,
        user5.address,
      ]);
      const bid = await myContract.getBid();
      const options = { value: bid };
      await myContract.connect(user1).vote(0, user2.address, options);
      await myContract.connect(user1).vote(1, user4.address, options);
      const counter1 = await myContract.getVotesCount(0);
      expect(counter1).to.equal(1);
      const counter2 = await myContract.getVotesCount(1);
      expect(counter2).to.equal(1);
    });
  });

  describe("Finish campaign", function () {
    it("Anyone can stop campaign", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const duration = await myContract.getDuration();
      await ethers.provider.send("evm_increaseTime", [Number(duration)]);
      await ethers.provider.send("evm_mine");
      await myContract.connect(user1).finishCampaign(0);
      const [ended, , , ,] = await myContract.getCampaignInformation(0);
      expect(ended).to.equal(true);
    });

    it("Forbidden to stop campaign before the end of voting time ", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      await expect(
        myContract.connect(user1).finishCampaign(0)
      ).to.be.revertedWith("Time is not up yet.");
    });

    it("Forbidden to stop campaign twice", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const duration = await myContract.getDuration();
      await ethers.provider.send("evm_increaseTime", [Number(duration)]);
      await ethers.provider.send("evm_mine");
      await myContract.connect(user1).finishCampaign(0);
      await expect(
        myContract.connect(user1).finishCampaign(0)
      ).to.be.revertedWith("Voting already ended");
    });

    it("Should deposit owner's commission", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const bid = await myContract.getBid();
      const options = { value: bid };
      await myContract.connect(user1).vote(0, user3.address, options);
      await myContract.connect(user2).vote(0, user3.address, options);
      const duration = await myContract.getDuration();
      await ethers.provider.send("evm_increaseTime", [Number(duration)]);
      await ethers.provider.send("evm_mine");
      await myContract.connect(user1).finishCampaign(0);
      const val = await myContract.getOwnerBalance();
      const [, , , , founded] = await myContract.getCampaignInformation(0);
      const comissionPercent = await myContract.getComissionPercent();
      const expectedComission = founded.mul(comissionPercent).div(100);
      expect(val).to.equal(expectedComission);
    });

    it("Should deposite correct prize sum(1 winner)", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);

      const bid = await myContract.getBid();
      const options = { value: bid };

      await myContract.vote(0, user3.address, options);
      await myContract.connect(user1).vote(0, user3.address, options);
      await myContract.connect(user2).vote(0, user3.address, options);
      await myContract.connect(user3).vote(0, user3.address, options);
      await myContract.connect(user4).vote(0, user1.address, options);

      const percent = await myContract.getComissionPercent();
      const expectedPrizeSum = (bid * 5 * (100 - percent)) / 100;

      const duration = await myContract.getDuration();
      await ethers.provider.send("evm_increaseTime", [Number(duration)]);
      await ethers.provider.send("evm_mine");

      await expect(
        await myContract.connect(user1).finishCampaign(0)
      ).to.changeEtherBalance(user3, expectedPrizeSum);
    });
    
    it("Should deposite correct prize sum (>1 winner)", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);

      const bid = await myContract.getBid();
      const options = { value: bid };

      await myContract.vote(0, user2.address, options);
      await myContract.connect(user1).vote(0, user3.address, options);
      await myContract.connect(user2).vote(0, user2.address, options);
      await myContract.connect(user3).vote(0, user3.address, options);

      const percent = await myContract.getComissionPercent();
      const expectedPrizeSum = (bid * 4 * (100 - percent)) / 100 / 2;

      const duration = await myContract.getDuration();
      await ethers.provider.send("evm_increaseTime", [Number(duration)]);
      await ethers.provider.send("evm_mine");

      await expect(
        await myContract.connect(user1).finishCampaign(0)
      ).to.changeEtherBalance(user3, expectedPrizeSum);
    });

    it("Should emit a event 'campaingnFinished'", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const duration = await myContract.getDuration();
      await ethers.provider.send("evm_increaseTime", [Number(duration)]);
      await ethers.provider.send("evm_mine");
      await expect(myContract.connect(user1).finishCampaign(0)).to.emit(
        myContract,
        "campaingnFinished"
      );
    });
  });

  describe("Withdraw", function () {
    it("Only owner can withdraw comission", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      const bid = await myContract.getBid();
      const options = { value: bid };
      await myContract.connect(user1).vote(0, user1.address, options);
      await myContract.connect(user2).vote(0, user2.address, options);
      const duration = await myContract.getDuration();
      await ethers.provider.send("evm_increaseTime", [Number(duration)]);
      await ethers.provider.send("evm_mine");
      await myContract.connect(user1).finishCampaign(0);
      const val = await myContract.getOwnerBalance();
      await expect(myContract.connect(user1).comissionWithdraw(val)).to.be
        .reverted;
      await expect(myContract.comissionWithdraw(val.mul(2))).to.be.reverted;
      const withdraw = await myContract.comissionWithdraw(val);
      const val2 = await myContract.getOwnerBalance();
      expect(val2).to.equal(0);
    });
  });

  describe("Setters", function () {
    it("setComissionPercent onlyOwner", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      await myContract.setComissionPercent(50);
      expect(await myContract.getComissionPercent()).to.equal(50);
      await expect(
        myContract.connect(user1).setComissionPercent(1)
      ).to.be.revertedWith("Not an owner");
    });

    it("setDuration onlyOwner", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      await myContract.setDuration(3600);
      expect(await myContract.getDuration()).to.equal(3600);
      await expect(myContract.connect(user1).setDuration(1)).to.be.revertedWith(
        "Not an owner"
      );
    });

    it("setComissionPercent onlyOwner", async function () {
      const campaign = await myContract.createCampaign([
        user1.address,
        user2.address,
        user3.address,
      ]);
      await myContract.setBid(3);
      expect(await myContract.getBid()).to.equal(3);
      await expect(myContract.connect(user1).setBid(1)).to.be.revertedWith(
        "Not an owner"
      );
    });
  });
});
