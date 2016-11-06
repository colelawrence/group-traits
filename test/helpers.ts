
import { Person, Trait } from '../src/models'
import { GroupResult } from '../src/group-result'

import { TestWorld, TestCase, printTestCase } from './TestWorld'

export
function compareGroupResults (a: GroupResult, b: GroupResult): number {
    return a.toShortString().localeCompare(b.toShortString())
}

// Returns `null` if the same, otherwise returns descriptive error
export
function diffGroupResults (a: GroupResult[], b: GroupResult[]): string | null {

    if (a.length !== b.length)
    return `Different lengths of results:
        A (${a.length}):
${ [a, b] // for each list
.map(gs => gs
    .map(g => `          <${g.toShortString()}>`)
    .join('\n'))
.join(`\n        B (${b.length}):\n`)}
`
    const asort = a.sort(compareGroupResults)
    const bsort = b.sort(compareGroupResults)
    const differentGroups = asort
        .map((ga, i) => [ga, bsort[i]])
        .filter(([ga, gb]) => !ga.isEqual(gb))

    if (differentGroups.length)
    return `Different groups <expected | found>:
${differentGroups
            .map(([ga, gb]) => `          <${ga.toShortString()} | ${gb.toShortString()}>`)
            .join('\n') }`
    
    return null
}