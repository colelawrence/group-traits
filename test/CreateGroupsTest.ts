
import { Person, Trait, Group } from '../src/models'
import { createGroups, GroupResult } from '../src/group'

import { TestWorld, TestCase, printTestCase } from './TestWorld'

import { diffGroupResults } from './helpers'

describe('createGroups', () => {
    var subject : TestWorld

    beforeEach(() => {
        subject = new TestWorld()
    })

    describe('test-1', () => {
        it('should organize four similar people in same group', async () => {
            const testcase = await subject.addTestCaseFromFile('cases/4-same-single-trait.case.md')
            
            printTestCase(testcase)

            const peoples = subject.getPeople()
            const traits = subject.getTraits()

            const results = createGroups(peoples, traits, [3, 7])

            const diff: string = diffGroupResults(testcase.groups, results)

            if (diff != null) {
                throw Error(diff)
            }
        })

    })
})
