import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { LearnMapping } from "../../typechain-types"
import { ContractTransactionResponse } from "ethers"
import { expect } from "chai"

describe('LearnMapping', () => {
    let owner: SignerWithAddress
    let sender: SignerWithAddress
    let contract: LearnMapping & {
        deploymentTransaction(): ContractTransactionResponse;
    }

    beforeEach(async () => {
        [owner, sender] = await ethers.getSigners()

        const contractFactory = await ethers.getContractFactory('LearnMapping',)
        contract = await contractFactory.deploy()
    })

    describe('test sc', () => {
        it('test add plant', async () => {
            const id = 1

            await contract.addPlant(id)
            const plant = await contract.getPlant(id)

            expect(plant.id).to.equal(id)
            expect(plant.owner).to.equal(owner.address)
            expect(plant.waterLevel).to.equal(0)
        })

        it('test water plant', async () => {
            const id = 1
            await contract.addPlant(id)
            await contract.waterPlant(id)

            const plant = await contract.getPlant(id)
            expect(plant.waterLevel).to.equal(100)
        })
    })
})
