import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { LearnStruct } from "../../typechain-types"
import { ContractTransactionResponse } from "ethers"
import { expect } from "chai"

describe('LearnStruct', () => {
    let owner: SignerWithAddress
    let sender: SignerWithAddress
    let contract: LearnStruct & {
        deploymentTransaction(): ContractTransactionResponse;
    }

    beforeEach(async () => {
        [owner, sender] = await ethers.getSigners()

        const contracFactory = await ethers.getContractFactory('LearnStruct')
        contract = await contracFactory.deploy()
    })

    describe('test sc', () => {
        it('test init value', async () => {
            const plant = await contract.myPlant()

            expect(plant.id).to.equal(1)
            expect(plant.owner).to.equal(owner.address)
            expect(plant.stage).to.equal(0)
            expect(plant.waterLevel).to.equal(0)
            expect(plant.isLive).to.equal(true)
        })

        it('test water', async () => {
            let plant = await contract.myPlant()
            expect(plant.waterLevel).to.equal(0)

            await contract.water()
            plant = await contract.myPlant()
            expect(plant.waterLevel).to.equal(100)

            await contract.water()
            plant = await contract.myPlant()
            expect(plant.waterLevel).to.equal(200)
        })


        it('test frow', async () => {
            let plant = await contract.myPlant()
            expect(plant.stage).to.equal(0)

            await contract.grow()
            plant = await contract.myPlant()
            expect(plant.stage).to.equal(1)

            await contract.grow()
            plant = await contract.myPlant()
            expect(plant.stage).to.equal(2)

            await contract.grow()
            plant = await contract.myPlant()
            expect(plant.stage).to.equal(3)
        })
    })

})
