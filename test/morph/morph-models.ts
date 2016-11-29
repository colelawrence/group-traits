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

/**
 * @class Simiple class to store populations of people.
 */
export
class People {
    /**
     * @property {Persons} Implementation of <<Persons>> for actual storage.
     */
    people: Persons
    private length: number

    getLength(): number {
        this.length = Object.keys(this.people).length
        return this.length
    }
}

export
interface FileContents {
    description?: string
    options?: TestOptions
    people?: People
    expected?: string
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
