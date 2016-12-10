
/**
 * TestCaseObject is an extremely logic agnostic way to represent test cases.
 * It does not have circular references, and shall have parser for TestCase
 * file syntax, and writer to file syntax.
 */

export
interface TestCaseObject {
    description: string
    groupMax: number
    groupMin: number
    traits: string[]
    people: Array<{
		id: string
        traits: string[]
    }>
    expected: Array<{
        trait: string
		people: string[]
    }>
}
