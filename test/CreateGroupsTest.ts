
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

    describe('Verify that each test case', () => {

        const casesdir = './test/cases/'
        readdirSync(casesdir)
            .filter(fn => /\.md$/i.test(fn)) // only case markdown files
            .sort()
            .forEach((casefilename) => {
                it(`should match oracle in ${casefilename}`, async () => {
                    const testcase = await TestWorld.addTestCaseFromFile(casesdir + casefilename)

                    // printTestCase(testcase)

                    const peoples = testcase.people
                    const traits = testcase.traits

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
                    const testcase = await TestWorld.addTestCaseFromFile(casesdir + casefilename)

                    const peoples = testcase.people
                    const traits = testcase.traits

                    let useTrait: string

                    for (let i = 0; i < 10; i++) {
                        if (traits[i] === null || traits[i] === undefined) {
                            useTrait = `${i+1}`
                            break
                        }
                    }

                    // add a trait to one of the people
                    // currently throws an error when a person is modified
                    let person = peoples[0]
                    person.addTrait(new Trait(`${useTrait}`))
                    let newPeoples: Person[] = []
                    newPeoples.push(person)
                    for (let i = 1; i < peoples.length; i++) {
                        let p: Person = peoples[i]
                        newPeoples.push(p)
                    }

                    const organizer = new GroupOrganizer(newPeoples, traits, [testcase.options.groupMin || 3, testcase.options.groupMax || 7])
                    const results = organizer.getResults()

                    const diff: string = diffGroupResults(testcase.groups, results)

                    if (diff != null) {
                        organizer.debug()
                        throw Error(diff)
                    }
                })
            })
    })
})
