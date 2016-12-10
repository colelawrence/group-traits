import * as assert from 'assert'

import * as TCO from './'

describe('testcase.seriallizers', () => {

    describe('fromString toString', () => {
        it('parses and stringifys properly', () => {
            const str =
`F an G will not get their first choice

===========================
groupMin: 3, groupMax: 5

===========================
A: 1
B: 1
C: 1
D: 1
E: 1
F: 3, 1
G: 3, 1
H: 2, 1
I: 2, 3
J: 2, 1
K: 2, 1
L: 2, 1
M: 1
N: 1
O: 1
P: 1

===========================
1: A, B, C
1: D, E, M
1: F, G, N, O, P
2: H, I, J, K, L
`
			// Normallize newlines following and preceding sections
			const originalNorm = str.replace(/\s*\n\s*/g, '\n')
            const result = TCO.toString(TCO.fromString(str))
			const resultNorm = result.replace(/\s*\n\s*/g, '\n')
            assert.equal(originalNorm, resultNorm)
        })
    })

    describe('toString fromString', () => {
        it('stringifys and parses properly', () => {
			const input: TCO.TestCaseObject = {
                description: 'Testing toString',
                traits: ['1', '2', '3', '200', '9000'],
                people: [
                    { id: 'A', traits: ['1', '2', '3'] },
                    { id: 'B', traits: ['1', '2', '3'] },
                    { id: 'C', traits: ['1', '200', '9000'] },
                ],
                groupMin: 3,
                groupMax: 7,
                expected: [{ people: ['A', 'B', 'C'], trait: '1' }]
            }

            assert.deepEqual(input, TCO.fromString(TCO.toString(input)))
        })
    })
})
