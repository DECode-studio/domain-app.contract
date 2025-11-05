import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { MultiplePlants } from "../../typechain-types";
import { ContractTransactionResponse } from "ethers";
import { expect } from "chai";

describe('MultiplePlants', () => {
    let owner: SignerWithAddress;
    let sender: SignerWithAddress;
    let contract: MultiplePlants & {
        deploymentTransaction(): ContractTransactionResponse;
    }

    beforeEach(async () => {
        [owner, sender] = await ethers.getSigners();

        const contractFactory = await ethers.getContractFactory("MultiplePlants");
        contract = await contractFactory.deploy();
    });

    describe('test sc', () => {
        it('test add plant', async () => {
            const tx = await contract.addPlant();
            await tx.wait();

            const counter = await contract.plantCounter();
            expect(counter).to.equal(1);
        })

        it('get plant by id', async () => {
            const tx = await contract.addPlant();
            await tx.wait();

            const plant = await contract.getPlant(1);
            expect(plant.id).to.equal(1);
            expect(plant.owner).to.equal(owner.address);
        })
    });
})
