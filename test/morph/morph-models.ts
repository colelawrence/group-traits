const clonedeep = require('lodash.clonedeep')
import { TestOptions } from '../TestWorld'

/**
 * @interface Stores the count of each trait in a custom array-like object.
 */
export
interface TraitCount { [name: string]: number }

/**
 * @class Simple class for storing morphable people.
 */
export
class Person {
    /**
     * @property {string} The name of the person.
     */
    public name: string
    /**
     * @property {string[]} Array of the person's identified traits.
     */
    public traits: string[]
}

/**
 * @interface A custom array-like interface to store a list of <<Person>> objects.
 */
interface Persons {
    [name: string]: Person
}

import { Dictionary } from './shared/dictionary'

/**
 * @class Simiple class to store populations of people.
 */
export
class People extends Dictionary<Person> {
	// Update each person
    // if void/null returned, then the person will be deleted
    mapInplace(updateFn: (value: Person, key: number | string) => Person | null) {
        this.key_values()
            .map(([k, v]) => <[string, Person]> [k, updateFn(v, k)])
            .forEach(([k, v]) => {
                if (v == null) this.delete(k)
                else this.set(k, v)
            })
        return this
    }

	clone() {
        const clone = new People()
        clone.table = clonedeep(this.table)
        return clone
    }

    toTestCaseString(): string {
        return this.values()
        	.map(p => `${p.name}: ${p.traits.join(', ')}`)
            .join('\n')
    }
}

interface IFileContents {
    description?: string,
    options?: TestOptions,
    people?: People,
    expected?: string
}

export
class FileContents implements IFileContents {
    description: string = ''
    options: TestOptions = {groupMin: 0, groupMax: Infinity}
    people: People = new People()
    expected: string = ''

	constructor(opts: IFileContents){
        for (let key in opts) {
			this[key] = opts[key]
        }
    }

    clone(): FileContents {
        return new FileContents({
            description: clonedeep(this.description),
            expected: clonedeep(this.expected),
            options: clonedeep(this.options),
            people: this.people.clone(),
        })
    }
}

export
interface File {
    filename: string
    rawcontents: string
    parsedcontents?: FileContents
    usedtraits?: TraitCount
}

export
interface Folder {
    name: string
    subcases?: { [filename: string]: File }
}
