
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
