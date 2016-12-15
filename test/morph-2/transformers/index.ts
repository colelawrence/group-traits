import { Clay } from './clay'
import * as TCO from '../TestCaseObject'
import * as M2 from '../writeMorphTestCases.function'
import * as Helpers from '../../helpers'

type ClayTransformer = (input: Clay) => Clay
type TCOTransformer = (input: TCO.TestCaseObject) => TCO.TestCaseObject

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

const clay_transformers: { name: string, fn: ClayTransformer }[] = [
    { name: "unused-1",     fn: AddUnusedTraits(1) },
	{ name: "unused-2",     fn: AddUnusedTraits(2) },
	{ name: "unused-200",   fn: AddUnusedTraits(200) },
    { name: "remove-1",     fn: RemoveUsedTraits(1) },
	{ name: "remove-2",     fn: RemoveUsedTraits(2) },
	{ name: "remove-200",   fn: RemoveUsedTraits(200) },
]

// Create TCO transformers out of the ClayTransformers
export
const TRANSFORMERS: { name: string, fn: TCOTransformer }[]
    = clay_transformers
    .map(ctfmr => {
        return {
            name: ctfmr.name,
            fn: (tco) => ctfmr.fn(new Clay(tco)).toTCO()
        }
    })
