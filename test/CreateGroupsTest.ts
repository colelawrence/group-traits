
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

    describe('Verify that the each test case', () => {

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
                        organizer.debug()
                        throw Error(diff)
                    }
                })
            })
    })

    describe('Adding an unused trait to a single person', () => {
        const casesdir = './test/cases/'
        readdirSync(casesdir)
            .filter(fn => /\.md$/i.test(fn))
            .sort()
            .forEach((casefilename) => {
                it(`should not change the output in ${casefilename}`, async () => {
                    const testcase = await subject.addTestCaseFromFile(casesdir + casefilename)

                    let peoples = subject.getPeople()
                    let traits = subject.getTraits()

                    for (let i = 0; i < 10; i++) {
                        if (traits[i] === null || traits[i] === undefined) {
                            // get data on the first person
                            let person = peoples[0]
                            let newTraits = person.getTraits()
                            // add the new trait
                            newTraits.push(new Trait(`${i + 1}`))
                            // create a new person
                            let newPerson = new Person(person.getId(), newTraits)
                            // overwrite the original person
                            peoples[0] = newPerson
                            break
                        }
                    }
                })
            })
    })
})
