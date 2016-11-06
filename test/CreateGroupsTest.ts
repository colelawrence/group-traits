
import { Person, Trait } from '../src/models'
import { GroupOrganizer } from '../src/group-organizer'
import { GroupResult } from '../src/group-result'

import { TestWorld, TestCase, printTestCase } from './TestWorld'

import { diffGroupResults } from './helpers'
import { readdirSync } from 'fs'

describe('createGroups', () => {
    var subject : TestWorld

    beforeEach(() => {
        subject = new TestWorld()
    })

    describe('test-1', () => {
        
        const casesdir = './test/cases/'
        readdirSync(casesdir)
            .filter(fn => /\.md$/i.test(fn)) // only case markdown files
            .sort()
            .forEach((casefilename) => {
                it(`should match oracle in ${casefilename}`, async () => {
                    const testcase = await subject.addTestCaseFromFile(casesdir + casefilename)

                    // printTestCase(testcase)

                    const peoples = subject.getPeople()
                    const traits = subject.getTraits()

                    const organizer = new GroupOrganizer(peoples, traits, [testcase.options.groupMin || 3, testcase.options.groupMax || 7])
                    const results = organizer.getResults()

                    const diff: string = diffGroupResults(testcase.groups, results)

                    if (diff != null) {
                        throw Error(diff)
                    }
                })
            })
    })
})
