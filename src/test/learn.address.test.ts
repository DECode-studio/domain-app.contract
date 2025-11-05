import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { LearnAddress } from "../../typechain-types"
import { ContractTransactionResponse } from "ethers"
import { expect } from "chai"

describe('LearnAddress', () => {
    let owner: SignerWithAddress
    let sender: SignerWithAddress
    let contract: LearnAddress & {
        deploymentTransaction(): ContractTransactionResponse;
    }

    beforeEach(async () => {
        [owner, sender] = await ethers.getSigners()

        const contractFactory = await ethers.getContractFactory('LearnAddress')
        contract = await contractFactory.deploy()
    })

    describe('test sc', () => {
        it("test init data", async () => {
            const ownerAddress = await contract.owner()
            expect(ownerAddress).to.equal(owner.address)
        })

        it("set gardener", async () => {
            await contract.setGardener(sender.address)
            const gardenerAddress = await contract.gardener()
            expect(gardenerAddress).to.equal(sender.address)
        })
    })

})
