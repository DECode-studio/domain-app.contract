import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { LearnBoolean } from "../../typechain-types"
import { ContractTransactionResponse } from "ethers"
import { expect } from "chai"

describe('learnBoolean', () => {
    let owner: SignerWithAddress
    let sender: SignerWithAddress
    let contract: LearnBoolean & {
        deploymentTransaction(): ContractTransactionResponse;
    }

    beforeEach(async () => {
        [owner, sender] = await ethers.getSigners()

        const contractFactory = await ethers.getContractFactory('LearnBoolean')
        contract = await contractFactory.deploy()
    })

    describe('test sc', () => {
        it("test init data", async () => {
            const isAlive = await contract.isAlive()
            const isBlooming = await contract.isBlooming()

            expect(isAlive).to.equal(true)
            expect(isBlooming).to.equal(false)
        })

        it("change status", async () => {
            let status = false
            await contract.changeStatus(status)

            let isAlive = await contract.isAlive()
            expect(isAlive).to.equal(status)

            status = true
            await contract.changeStatus(status)

            isAlive = await contract.isAlive()
            expect(isAlive).to.equal(status)
        })

        it("bloom", async () => {
            await contract.bloom()
            const isBlooming = await contract.isBlooming()
            expect(isBlooming).to.equal(true)
        })
    })
})