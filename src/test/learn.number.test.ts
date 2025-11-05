import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { LearnNumber } from "../../typechain-types"
import { ContractTransactionResponse } from "ethers"
import { expect } from "chai"

describe('LearnNumber', () => {
    let owner: SignerWithAddress
    let sender: SignerWithAddress
    let contract: LearnNumber & {
        deploymentTransaction(): ContractTransactionResponse;
    }

    beforeEach(async () => {
        [owner, sender] = await ethers.getSigners()

        const contractFactory = await ethers.getContractFactory("LearnNumber")
        contract = await contractFactory.deploy()
    })

    describe('test sc', () => {
        it("test init data", async () => {
            const plantId = await contract.plantId()
            const waterLevel = await contract.waterLevel()

            expect(plantId).to.equal(1)
            expect(waterLevel).to.equal(100)
        })

        it("change plant id", async() => {
            const newPlantId = 10
            await contract.changePlatId(newPlantId)

            const plantId = await contract.plantId()
            expect(plantId).to.equal(newPlantId)
        })

        it("add water level", async () => {
            const newWaterLevel = 2000
            await contract.addWater(newWaterLevel)

            const waterLevel = await contract.waterLevel()
            expect(waterLevel).to.equal(newWaterLevel)
        })
    })
})