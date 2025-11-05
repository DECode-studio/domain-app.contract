import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { LearnString } from "../../typechain-types";
import { ContractTransactionResponse } from "ethers";
import { expect } from "chai";

describe('LearnString', () => {
    let owner: SignerWithAddress;
    let sender: SignerWithAddress;
    let contract: LearnString & {
        deploymentTransaction(): ContractTransactionResponse;
    }

    beforeEach(async () => {
        [owner, sender] = await ethers.getSigners();

        const contractFactory = await ethers.getContractFactory("LearnString");
        contract = await contractFactory.deploy();
    });

    describe('test sc', () => {
        it('it should give rose value', async () => {
            const value = await contract.getName();
            expect(value).to.equal("Rose");
        });

        it('it should set new name', async () => {
            const tx = await contract.changeName("Lily");
            await tx.wait();

            const value = await contract.getName();
            expect(value).to.equal("Lily");
        })
    });
})