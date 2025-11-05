import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { LearnArray } from "../../typechain-types"
import { ContractTransactionResponse } from "ethers"
import { expect } from "chai"

describe('LearnArray', () => {
    let owner: SignerWithAddress
    let sender: SignerWithAddress
    let contract: LearnArray & {
        deploymentTransaction(): ContractTransactionResponse;
    }

    beforeEach(async () => {
        [owner, sender] = await ethers.getSigners()

        const contractFactory = await ethers.getContractFactory('LearnArray')
        contract = await contractFactory.deploy()
    })

    describe('test sc', () => {
        it('test add id', async () => {
            let id = 1
            await contract.addPlantId(id)

            let length = await contract.getTotalPlants()
            expect(length).to.equal(id)


            id = 2
            await contract.addPlantId(id)

            length = await contract.getTotalPlants()
            expect(length).to.equal(id)
        })

        it('test get all plant ids', async () => {
            const ids = [1, 2, 3, 4, 5]

            for (const id of ids) {
                await contract.addPlantId(id)
            }

            const allIds = await contract.getAllPlants()
            expect(allIds.map(i => i)).to.deep.equal(ids)
        })
    })

})
