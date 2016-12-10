import { Clay } from './clay'

interface ClayTransformer {
    (input: Clay): Clay
}

function AddUnusedTraits(count: number): ClayTransformer {
    return (testcase) => {
        testcase.people.filterKeys((p) => p.name === "A")
        testcase.people.findAndUpdate(
            (p) => p.name === "A",
            (p) => { p.name = "B"; return p }
        )
		// look at contents
        // find `count` of unused traits
        // add them
		return testcase
    }
}

function RemoveUsedTraits(countOfTraitsToRemove: number): ClayTransformer {
    return (testcase) => {
		// look at contents
        // find `count` of unused traits
        // add them
		return testcase
    }
}

function ReorderInsignificants(priority: number, groupMin_reset: number): ClayTransformer {
    return (testcase) => {
		// look at contents
        // find `count` of unused traits
        // add them
		return testcase
    }
}

const newTestCases: ClayTransformer[] = [
	AddUnusedTraits(1),
	AddUnusedTraits(2),
	AddUnusedTraits(200),
	RemoveUsedTraits(1),
	RemoveUsedTraits(2),
	RemoveUsedTraits(200),
	ReorderInsignificants(1, 2),
	ReorderInsignificants(2, 2),
	ReorderInsignificants(200, 2),
]

// loop through test case transformers and write them to files

// test them...
