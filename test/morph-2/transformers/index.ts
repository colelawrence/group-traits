import { Clay } from './clay'
import * as TCO from '../TestCaseObject'
import * as M2 from '../writeMorphTestCases.function'
import * as Helpers from '../../helpers'

interface ClayTransformer {
    (input: Clay): Clay
}

/**
 * Searches through the <<Clay>>'s traits to determine which traits are unused, then writes `count` unused traits to people.
 */
function AddUnusedTraits(count: number): ClayTransformer {
    return (testcase) => {
        // testcase.people.filterKeys((p) => p.name === "A")
        // testcase.people.findAndUpdate(
        //     (p) => p.name === "A",
        //     (p) => { p.name = "B"; return p }
        // )
		// look at contents
        // find `count` of unused traits
        // add them
		return testcase
    }
}

/**
 * Searches through the <<Clay>>'s traits to determine which traits- up to `count` number- should be removed.
 * The implementation in this function should find traits that have fewer than `GroupMin` total traits.
 */
function RemoveUsedTraits(countOfTraitsToRemove: number): ClayTransformer {
    return (testcase) => {
		// look at contents
        // find `count` of used traits
        // remove them
		return testcase
    }
}

const newTestCases: {name:string,fn:ClayTransformer}[] = [
    {name: "unused-1", fn: AddUnusedTraits(1)},
	{name: "unused-2", fn: AddUnusedTraits(2)},
	{name: "unused-200", fn: AddUnusedTraits(200)},
    {name: "remove-1", fn: RemoveUsedTraits(1)},
	{name: "remove-2", fn: RemoveUsedTraits(2)},
	{name: "remove-200", fn: RemoveUsedTraits(200)},
]

export
function morphTestCase(filename: string) {
    // loop through test case transformers and write them to files
    let testnum = 0
    let newcases = newTestCases.map((tc) => {
        // for every other case, we want to use a real object for this
        // here, we're going to make a (bad) mock object for use
        let tcobj: TCO.TestCaseObject = {
                description: '',
                groupMax: 7,
                groupMin: 3,
                traits: ['A'],
                people: Array(
                    {id: '1', traits: ['A']},
                    {id: '2', traits: ['A']},
                    {id: '3', traits: ['A']},
                    {id: '4', traits: ['A']}
                ),
                expected: Array(
                    {trait: 'A', people: ['1','2','3','4']}
                )
            }
        return {
            // naming the files is pretty straightforward
            filename: `${tc.name}-${filename}.md`,
            // the following line is an example of how to use the function attached to each test case
            // object: tc.fn(...).toTCO() // supply <<Clay>> object as parameter to `tc.fn()` (replace the ellipsis)
            // for this, however, we're just going to use the mock object
            object: tcobj
        }
    })
    // save the modified test cases to file
    M2.writeMorphTestCases(newcases, './test/morphed_cases')
    // console.log(newcases)
}
// test them...
