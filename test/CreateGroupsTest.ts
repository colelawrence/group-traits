import * as assert from 'assert'

import { Person, Trait } from '../src/models'
import { GroupOrganizer } from '../src/group-organizer'
import { GroupResult } from '../src/group-result'

import { TestWorld, TestCase, printTestCase } from './TestWorld'

import { diffGroupResults } from './helpers'
import { readdirSync } from 'fs'

import * as Morphs from './morph'

describe('createGroups', () => {

	const defaultGroupMin = 3
	const defaultGroupMax = 7
    const casesdir = './test/cases/'

    Morphs.MorphStorage.setCasesDir(casesdir)
    Morphs.MorphStorage.getTestFiles()

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

                    let file: Morphs.File = Morphs.MorphStorage.getOriginalTestCase(filename)

                    // modify the test case


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
                // get a copy of the Morphs.File object of the original test case
                let file: Morphs.File = Morphs.parseFile(casesdir + filename)
                // make sure the file gets stored
                Morphs.MorphStorage.store(file)

                it(`should not change the output in ${filename}`, () => {
                    // get the last trait
                    let keys = Object.keys(file.usedtraits).sort()
                    // console.log(keys.length)
                    let lastTrait = keys[keys.length - 1]
                    // console.log(lastTrait)
                    // set the primary data as the first unused trait
                    let morph: Morphs.TData = {
                        primary: [(parseInt(lastTrait) + 1).toString()]
                    }
                    // console.log('Morph:', morph)
                    // morph the test data
                    let morphed: Morphs.FileContents =
                            Morphs.MorphStorage.morphTestFile(file, morph, file.parsedcontents, 1, Morphs.addTrait)

                    morphed.description += "\nOne trait added to one person"

                    file.parsedcontents = morphed
                    // console.log(file.parsedcontents.people)

                    let morphedfile = Morphs.MorphStorage.fileToString(file)

                    // console.log(morphedfile)
                    let morphed_test: TestWorld =
                            TestWorld.fromString(morphedfile)

                    let morphed_testcase: TestCase = morphed_test.getTestCase()

                    const peoples = morphed_testcase.people
                    const traits = morphed_testcase.traits

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
})
