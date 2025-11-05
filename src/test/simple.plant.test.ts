import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { SimplePlant } from "../../typechain-types"
import { ContractTransactionResponse } from "ethers"
import { expect } from "chai"

describe('SimplePlant', () => {
    let owner: SignerWithAddress
    let sender: SignerWithAddress
    let contract: SimplePlant & {
        deploymentTransaction(): ContractTransactionResponse;
    }

    beforeEach(async () => {
        [owner, sender] = await ethers.getSigners()

        const contractFactory = await ethers.getContractFactory('SimplePlant')
        contract = await contractFactory.deploy()
    })

    describe('test sc', () => {
        it("test init data", async () => {
            const ownerAddress = await contract.owner()
            const plantName = await contract.plantName()
            const waterLevel = await contract.waterLevel()
            const isAlive = await contract.isAlive()

            expect(ownerAddress).to.equal(owner.address)
            expect(plantName).to.equal("The Tormentor")
            expect(waterLevel).to.equal(0)
            expect(isAlive).to.equal(true)
        })

        it("test water plant", async () => {
            let waterLevel =  await contract.waterLevel()
            expect(waterLevel).to.equal(0)

            await contract.water()
            waterLevel =  await contract.waterLevel()
            expect(waterLevel).to.equal(100)

            await contract.water()
            waterLevel =  await contract.waterLevel()
            expect(waterLevel).to.equal(200)
        })

        it('test get age', async () => {
            const age = await contract.getAge()
            expect(age).to.be.a('bigint')
        })
    })
})
