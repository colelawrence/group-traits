import * as assert from 'assert'

import { Person, Trait } from '../src/models'
import { GroupOrganizer } from '../src/group-organizer'
import { GroupResult } from '../src/group-result'

import { TestWorld, TestCase, printTestCase } from './TestWorld'

import * as Helpers from './helpers'
import { readdirSync, readFileSync } from 'fs'
import * as M2 from './morph-2'
import * as M2T from './morph-2/transformers'

import * as Morphs from './morph'
import * as TCO from './morph-2/TestCaseObject'

type testcases = { testcase: TestCase, filename: string, contents: string }[]

const defaultGroupMin = 3
const defaultGroupMax = 7

describe('createGroups', () => {

    const casesdir = './test/cases/'
    const morphed_casesdir = './test/morphed_cases/'

	const ORIGINAL_CASES: testcases
	= readCasesFromDirectory(casesdir)

    Helpers.deleteFiles(morphed_casesdir, /\.md$/i)

    // Write Morphed test cases
    const morphs_to_write
        : { filename: string, object: TCO.TestCaseObject }[]
        = ORIGINAL_CASES
        // create morphed test case objects with each case
        .map(tc => 
            M2T.TRANSFORMERS.map(tfmr => {
                return {
                    filename: `${tfmr.name}-${tc.filename}`,
                    object: tfmr.fn(TCO.fromString(tc.contents))
                }
            })
        )
        .reduce((prev, curr) => prev.concat(curr), [])

    // Write all test cases
    M2.writeMorphTestCases(morphs_to_write, morphed_casesdir)

    // then use 1 single testing loop below to parse them all.

    // read in created test cases
    const MORPHED_CASES
        : testcases
        = readCasesFromDirectory(morphed_casesdir)


    describe('Base test cases', () => {
        ORIGINAL_CASES.forEach(testTestCase)
    })

    describe('Morphed test cases', () => {
        MORPHED_CASES.forEach(testTestCase)
    })
})

function readCasesFromDirectory(dir): testcases {
	return readdirSync(dir)
    .filter(fn => /\.md$/i.test(fn)) // only case markdown files
    .sort()
    .map((filename) => {
        const filepath = dir + filename
        const contents = readFileSync(filepath, 'utf8')
        let testcase = TestWorld.fromString(contents).getTestCase()
        return { filename, testcase, contents }
    })
}

function testTestCase({ testcase, filename }) {
    it(`should match oracle in ${ filename }`, () => {
        const peoples = testcase.people
        const traits = testcase.traits

        const organizer = new GroupOrganizer(peoples, traits, [testcase.options.groupMin || defaultGroupMin, testcase.options.groupMax || defaultGroupMax])
        const results = organizer.getResults()

        const diff: string = Helpers.diffGroupResults(testcase.groups, results)

        if (diff != null) {
            organizer.debug()
            throw Error(diff)
        }
    })
}