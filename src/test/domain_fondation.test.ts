import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

async function deployDomainFoundation() {
    const [owner, otherAccount] = await ethers.getSigners();
    const DomainFoundation = await ethers.getContractFactory(
        "DomainFoundation"
    );
    const domain = await DomainFoundation.deploy();
    await domain.waitForDeployment();

    return { domain, owner, otherAccount };
}

describe("DomainFoundation (domain_fondation.sol)", function () {
    const basePlantFee = ethers.parseEther("0.001");
    const baseWaterFee = ethers.parseEther("0.0001");

    it("reverts when planting with zero quantity", async function () {
        const { domain } = await loadFixture(deployDomainFoundation);

        await expect(domain.plantSeed(0)).to.be.revertedWith(
            "Quantity must be greater than 0"
        );
    });

    it("reverts when deposit is below minimum requirement", async function () {
        const { domain } = await loadFixture(deployDomainFoundation);
        const quantity = 5;
        const insufficient = ethers.parseEther("0.004");

        await expect(
            domain.plantSeed(quantity, { value: insufficient })
        ).to.be.revertedWith("Need 0.005 ETH to plant");
    });

    it("plants a seed and records initial plant data", async function () {
        const { domain, owner } = await loadFixture(deployDomainFoundation);
        const quantity = 5;
        const minDeposit = basePlantFee * BigInt(quantity);

        await expect(
            domain.plantSeed(quantity, { value: minDeposit })
        ).to.emit(domain, "PlantSeeded")
            .withArgs(owner.address, 1n);

        const plant = await domain.getPlant(1);

        expect(plant.owner).to.equal(owner.address);
        expect(Number(plant.id)).to.equal(1);
        expect(Number(plant.stage)).to.equal(0);
        expect(Number(plant.waterLevel)).to.equal(100);
        expect(Number(plant.quantity)).to.equal(quantity);
        expect(plant.exists).to.equal(true);
        expect(plant.isDead).to.equal(false);
    });

    it("enforces watering rules", async function () {
        const { domain, owner, otherAccount } = await loadFixture(
            deployDomainFoundation
        );
        const quantity = 5;
        const plantCost = basePlantFee * BigInt(quantity);
        const waterCost = baseWaterFee * BigInt(quantity);

        await domain
            .connect(owner)
            .plantSeed(quantity, { value: plantCost });

        await expect(
            domain.connect(otherAccount).waterPlant(1, { value: waterCost })
        ).to.be.revertedWith("Not your plant");

        await expect(
            domain.waterPlant(1, { value: waterCost - 1n })
        ).to.be.revertedWith("Need 0.0005 ETH to plant");

        await domain.waterPlant(1, { value: waterCost * 2n });

        const updatedPlant = await domain.getPlant(1);
        expect(Number(updatedPlant.waterLevel)).to.equal(120);
    });

    it("progresses through growth stages and mints NFT at adulthood", async function () {
        const { domain, owner } = await loadFixture(deployDomainFoundation);
        const quantity = 12;
        const plantCost = basePlantFee * BigInt(quantity);
        const waterCost = baseWaterFee * BigInt(quantity);
        const plantId = 1;
        const tokenCid = "QmTokenUri";

        await domain.plantSeed(quantity, { value: plantCost });

        await time.increase(61);
        await expect(domain.updatePlantStage(plantId))
            .to.emit(domain, "StageAdvanced")
            .withArgs(plantId, 1);

        await domain.waterPlant(plantId, { value: waterCost });

        await time.increase(61);
        await expect(domain.updatePlantStage(plantId))
            .to.emit(domain, "StageAdvanced")
            .withArgs(plantId, 2);

        await domain.waterPlant(plantId, { value: waterCost });

        await time.increase(61);

        await expect(
            domain.getNFT(plantId, tokenCid)
        ).to.emit(domain, "StageAdvanced")
            .withArgs(plantId, 3)
            .and.to.emit(domain, "PlantAdult")
            .withArgs(plantId, owner.address, 2);

        expect(await domain.balanceOf(owner.address)).to.equal(1n);
        expect(await domain.ownerOf(plantId)).to.equal(owner.address);
        expect(await domain.tokenURI(plantId)).to.equal(
            "https://gateway.pinata.cloud/ipfs/" + tokenCid
        );

        const plantAfter = await domain.getPlant(plantId);
        expect(plantAfter.exists).to.equal(false);
        expect(await domain.getDonationLevel(plantId)).to.equal(2);
    });

    it("returns donation level tiers based on quantity thresholds", async function () {
        const { domain } = await loadFixture(deployDomainFoundation);

        await domain.plantSeed(3, { value: basePlantFee * 3n });
        await domain.plantSeed(8, { value: basePlantFee * 8n });
        await domain.plantSeed(15, { value: basePlantFee * 15n });

        expect(await domain.getDonationLevel(1)).to.equal(0);
        expect(await domain.getDonationLevel(2)).to.equal(1);
        expect(await domain.getDonationLevel(3)).to.equal(2);
    });

    it("allows only the owner to withdraw accumulated funds", async function () {
        const { domain, owner, otherAccount } = await loadFixture(
            deployDomainFoundation
        );
        const quantity = 3;
        const plantCost = basePlantFee * BigInt(quantity);
        const contractAddress = await domain.getAddress();

        await domain
            .connect(otherAccount)
            .plantSeed(quantity, { value: plantCost });

        await expect(domain.connect(otherAccount).withdraw()).to.be.revertedWith(
            "Not owner"
        );

        const contractBalanceBefore =
            await ethers.provider.getBalance(contractAddress);
        const ownerBalanceBefore = await ethers.provider.getBalance(
            owner.address
        );

        const withdrawTx = await domain.withdraw();
        const withdrawReceipt = await withdrawTx.wait();
        const gasCost = withdrawReceipt.fee ?? 0n;

        const contractBalanceAfter =
            await ethers.provider.getBalance(contractAddress);
        const ownerBalanceAfter = await ethers.provider.getBalance(
            owner.address
        );

        expect(contractBalanceBefore).to.equal(plantCost);
        expect(contractBalanceAfter).to.equal(0n);
        expect(ownerBalanceAfter).to.equal(
            ownerBalanceBefore + contractBalanceBefore - gasCost
        );
    });
});
