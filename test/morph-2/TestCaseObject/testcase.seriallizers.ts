import { TestCaseObject } from './testcase.interface'

import { Set } from 'typescript-collections'

export
function fromString(source: string): TestCaseObject {
    const [descPart, optionsPart, peoplePart, expectedPart]
    	= source.split(/======+/g)

	const { groupMin, groupMax } = eval(`({${optionsPart}})`)

	const traitsSet = new Set<string>()

	const people = peoplePart
        .trim()
        .split(/[\n\r]+/g)
        .filter(n => /\w/.test(n))
        .map(line => {
            const [, id, traitIds] = /^([^:]+):(.+)$/.exec(line)
            const traits = traitIds.trim().split(/[,\s]+/g)

			// add each found trait to set of traits
            traits.forEach(t => traitsSet.add(t))

            return { id, traits }
        })

    const expected = expectedPart
        .trim()
        .split(/[\n\r]+/g)
        .filter(n => /\w/.test(n))
        .map(line => {
            const [, trait, peopleIds] = /^([^:]+):(.+)$/.exec(line)
            const people = peopleIds.trim().split(/[,\s]+/g)
            return { trait, people }
        })

    const result: TestCaseObject = {
		description: descPart.trim(),
        
        groupMin,
        groupMax,

        traits: traitsSet.toArray(),

		people,

        expected
    }

    return result 
}

export
function toString(obj: TestCaseObject): string {
	const optionsStr = `groupMin: ${obj.groupMin}, groupMax: ${obj.groupMax}`
	
    const peopleStr = obj.people.map(exp => exp.id + ': ' + exp.traits.join(', '))

    const expectedStr = obj.expected.map(exp => exp.trait + ': ' + exp.people.join(', '))

	return `${obj.description}

===========================
${optionsStr}

===========================
${peopleStr.join('\n')}

===========================
${expectedStr.join('\n')}
`
}
