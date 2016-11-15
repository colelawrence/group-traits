
import { Person, Trait } from '../src/models'
import { GroupOrganizer } from '../src/group-organizer'
import { GroupResult } from '../src/group-result'

import { TestWorld, TestCase, printTestCase } from './TestWorld'

import { diffGroupResults } from './helpers'
import { readdirSync } from 'fs'

describe('createGroups', () => {

	const defaultGroupMin = 3
	const defaultGroupMax = 7
    const casesdir = './test/cases/'

	var cases: { testcase: TestCase, filename: string }[]
	= readdirSync(casesdir)
        .filter(fn => /\.md$/i.test(fn)) // only case markdown files
        .sort()
        .map((filename) => {
            let testcase = TestWorld.addTestCaseFromFile(casesdir + filename)
            return { filename, testcase }
        })

    describe('Verify that each test case', () => {
        cases
            .forEach(({ testcase, filename }) => {
                it(`should match oracle in ${ filename }`, () => {
                    // printTestCase(testcase)

                    const peoples = testcase.people
                    const traits = testcase.traits

                    const organizer = new GroupOrganizer(peoples, traits, [testcase.options.groupMin || defaultGroupMin, testcase.options.groupMax || defaultGroupMax])
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
        cases
            .forEach(({ testcase, filename }) => {
                it(`should not change the output in ${filename}`, () => {
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
                    let person = peoples[0]
                    let newPeoples: Person[] = []
                    newPeoples.push(person)
                    for (let i = 1; i < peoples.length; i++) {
                        let p: Person = peoples[i]
                        newPeoples.push(p)
                    }

                    const organizer = new GroupOrganizer(newPeoples, traits, [testcase.options.groupMin || defaultGroupMin, testcase.options.groupMax || defaultGroupMax])
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
