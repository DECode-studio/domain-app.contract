import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { LearnEnum } from "../../typechain-types"
import { ContractTransactionResponse } from "ethers"
import { expect } from "chai"

describe('LearnEnum', () => {
    let owner: SignerWithAddress
    let sender: SignerWithAddress
    let contract: LearnEnum & {
        deploymentTransaction(): ContractTransactionResponse;
    }

    beforeEach(async () => {
        [owner, sender] = await ethers.getSigners()

        const contractFactory = await ethers.getContractFactory('LearnEnum')
        contract = await contractFactory.deploy()
    })

    describe('test sc', () => {
        it('test initial value', async () => {
            const stage = await contract.currentStage()
            expect(stage).to.equal(0)
        })

        it('test frow', async () => {
            let stage = await contract.currentStage()
            expect(stage).to.equal(0)

            await contract.grow()
            stage = await contract.currentStage()
            expect(stage).to.equal(1)

            await contract.grow()
            stage = await contract.currentStage()
            expect(stage).to.equal(2)

            await contract.grow()
            stage = await contract.currentStage()
            expect(stage).to.equal(3)
        })
    })

})
