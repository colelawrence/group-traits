
import * as Models from './morph-models'

// helper functions
export
function findPersonByName(people: Models.People, index: string): Models.Person {
    for (let i = 0; i < people.getLength(); ++i) {
        let a = people.get(i)
        if (a.name == index) {
            return a
        }
        return null
    }
}

export
function insertTraits(person: Models.Person, traits: string[]): Models.Person {
    person.traits.push(...traits)
    return person
}

// This is useful for flattening arrays of arrays
//		const r = [ [1, 2, 3], [], [4, 5] ]
//
//		r.reduce(Helpers.concat<string>(), [])
//		// => [1,2,3,4,5]
export
function concat<T>(): (prev: T[], curr: T[]) => T[] {
    return (prev: T[], curr: T[]) => prev.concat(curr)
}