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
}
