import * as assert from 'assert'

import { Person, Trait } from '../src/models'
import { GroupOrganizer } from '../src/group-organizer'
import { GroupResult } from '../src/group-result'

import { TestWorld, TestCase, printTestCase } from './TestWorld'

import * as Helpers from './Helpers'
import { readdirSync, readFileSync } from 'fs'
import * as M2 from './morph-2'

import * as Morphs from './morph'
import * as TCO from './morph-2/TestCaseObject'

type testcases = { testcase: TestCase, filename: string, contents: string }[]

const defaultGroupMin = 3
const defaultGroupMax = 7

describe('createGroups', () => {

    const casesdir = './test/cases/'
    const morphed_casesdir = './test/morphed_cases/'

	const cases: testcases
	= readCasesFromDirectory(casesdir)

    // TODO Generate morphed test case files here
    const tco_testcases = cases
    	.map(tc1 => {
            return {
                object: TCO.fromString(tc1.contents),
                filename: tc1.filename
            }
        })
	
    Helpers.deleteFiles(morphed_casesdir, /\.md$/i)
	M2.writeMorphTestCases(tco_testcases, morphed_casesdir)

    // then use 1 single testing loop below to parse them all.

    // read in created test cases
    const morphed_cases: testcases
	= readCasesFromDirectory(morphed_casesdir)


    describe('Base test cases', () => {
        cases.forEach(testTestCase)
    })

    describe('Morphed test cases', () => {
        morphed_cases.forEach(testTestCase)
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