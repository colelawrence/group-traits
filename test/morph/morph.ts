let clonedeep = require('lodash.clonedeep')

import { readFileSync } from 'fs'

import { TestCase, TestWorld, TestOptions } from '../TestWorld'
import { Identifiable, Trait, Person } from '../../src/models'

import { MorphStorage } from './morph-storage'
import * as Morphs from './morph-base'
import * as Models from './morph-models'

type MorphPerson = {
    name: string
    traits: string[]
}

// Declarations & definitions for function interfaces
// Parsing

/**
 * Split the file into parts and return the promise of a split test file for morphing
 * @param {string} filepath Path to file that will be read in. Must be a markdown (`.md`) file
 */
export
let parseFile: Morphs.Parse<Models.File> =
(filepath: string): Models.File => {
    // read the file in as the raw contents
    let currentFile: Models.File = {
        filename: filepath,
        rawcontents: readFileSync(filepath, 'utf8')
    }
    // split the raw contents
    let parsedContents: string[] =
        currentFile.rawcontents.split(/\s*\r?\n======+\r?\n\s*/g)
    // run the contents through additional parsers
    let contents: Models.FileContents = {
        description: parsedContents[0],
        options: parseOptions(parsedContents[1]),
        people: parsePeople(parsedContents[2]),
        expected: parsedContents[3]
    }
    // set the file's parsed contents
    currentFile.parsedcontents = contents
    // get the file's used traits
    currentFile.usedtraits = MorphStorage.getUsedTraits(currentFile)
    return currentFile
}

/**
 * Parses the options for a given test case.
 * @param {string} options A string containing the test case options, comma-separated in the form 'op: val'
 * @returns A JSON object of the test case options
 */
export
let parseOptions: Morphs.Parse<TestOptions> =
(options: string): TestOptions => {
    const testoptions: TestOptions = eval(`({${options}})`)
    return testoptions
}

/**
 * Parse the people from the given test case. Does not check for duplicate names.
 * @param {string} contents A string of the test cases themselves, separated by either newlines or carriage returns
 * @returns An array of objects, each of which contains a name and the list of traits associated with that name
 */
export
let parsePeople: Morphs.Parse<Models.People> =
(contents: string): Models.People => {
    let res: Models.People = new Models.People()
    // split the contents, removing blank lines
    let contentSplit = contents
        .split(/\s*\r?\n\/*/g)
        .filter(ln => ln.length > 0)

    // fill in the return array
    let length = contentSplit.length
    for (let i = 0; i < length; ++i) {
        let ln = contentSplit[i]
        let pArr = ln.split(':')
        let name = pArr[0]
        let traits = pArr[1].trim()
        let p: Models.Person = {
            name: name,
            traits: traits.split(/\s*,\s*/g)
        }
        res[name] = p
    }

    return res
}

// Adding

/**
 * Add one or more traits to a single person.
 * @param {Morphs.TData} trait Information on what will be added to the test data.
 * * `trait.primary` specifies a list of traits (can be one or more)
 * * (optional) `trait.secondary` specifies the name of the person to be transformed. Removes additional names passed to secondary.
 * * (optional) `trait.startIndex` specifies the index at which the trait will be added.
 * * **NOTE:** If both `secondary` and `startIndex` are specified, then only `secondary` will be used.
 * @param {Models.FileContents} content The data to be modified. Must be parsed prior to sending to this function.
 * @returns {Models.FileContents}
 */
export
let addTrait: Morphs.Transform<Models.FileContents> =
(trait: Morphs.TData, content: Models.FileContents): Models.FileContents => {
    if (trait.secondary != undefined && trait.secondary.length > 1) {
        // slice off all others
        trait.secondary = trait.secondary.slice(0,0)
    }
    // add a trait to one of the people
    return addTraits(trait, content, 1)
}

/**
 * Adds one or more traits to one or more people.
 * @param {Morphs.TData} traits Information on what will be added to the test data.
 * * `trait.primary` specifies a list of traits (can be one or more).
 * * (optional) `trait.secondary` specifies the name of the person to be transformed. The length of this list **must** be equal to count; otherwise, it will use default behavior (traits will be added starting at the first person).
 * * (optional) `trait.startIndex` specifies the index at which the trait will be added.
 * * **NOTE:** If both `secondary` and `startIndex` are specified, then only `secondary` will be used.
 * @param {Models.FileContents} content The data to be modified. Must be parsed prior to sending to this function.
 * @param {number} count The total number of people to add the traits to.
 * @returns {Models.FileContents}
 */
export
let addTraits: Morphs.Transform<Models.FileContents> =
(traits: Morphs.TData, content: Models.FileContents, count: number): Models.FileContents => {
    // check if traits specifies anything in `secondary`
    //  if anything is specifed, this implies that the dev knows what they want to attach the `text` to
    //  alternatively, if `startIndex` is specified, start adding `primary` at `startIndex` for the next `count` people
    //      this will wrap around to the first person and continues if the last person is reached and `count`
    //      has not been reached
    //  otherwise, if nothing is specified, then select the first `count` people
    let newContent: Models.FileContents = clonedeep(content)

    // guarantee that count is not larger than the total number of people
    count = Math.min(count, Object.keys(newContent.people).length)

    if (traits.secondary != undefined && traits.secondary.length >= count) {
        for (let name in traits.secondary) {
            // find the person in `newContent.people`
            let person = findPerson(newContent.people, name)
            // throw an error if they're not found
            if (typeof person === 'boolean') {
                throw 'Person not found'
            }
            // add the trait to the person
            person = insertTraits(person, traits.primary)

            let index = getIndex(newContent.people, person.name)
            newContent.people[index] = person
        }
    }
    else if (traits.startIndex != (null || undefined)) {
        let current = 0
        // get the index for the start
        while (current < traits.startIndex) {
            ++current
        }
        // modify a total of count people
        for (let i = 0; i < count; ++i, ++current) {
            if (current >= newContent.people.getLength()) {
                // went past the end of the list- reset to 0
                current = 0
            }
            newContent.people[current] =
                insertTraits(newContent.people[current], traits.primary)
        }
    }
    else {
        // modify a total of count people
        for (let i = 0; i < count; ++i) {
            let name = Object.keys(newContent.people)[i]
            newContent.people[name] =
                insertTraits(newContent.people[name], traits.primary)
        }
    }

    return newContent
}

export
let addPerson: Morphs.Transform<Models.FileContents>
export
let addPeople: Morphs.Transform<Models.FileContents>

// Removing
export
let rmTrait: Morphs.Transform<Models.FileContents>
export
let rmTraits: Morphs.Transform<Models.FileContents>
export
let rmPerson: Morphs.Transform<Models.FileContents>
export
let rmPeople: Morphs.Transform<Models.FileContents>

// helper functions

function findPerson(obj: Models.People, index: string): MorphPerson | boolean {
    for (let i = 0; i < obj.getLength(); ++i) {
        let a = obj[i]
        if (a.name == index) {
            return a
        }
        return false
    }
}

function getIndex(obj: Models.People, name: string): number {
    let i: number
    for (let name in obj) {
        if (obj[name].name == name) return i
    }
}

function insertTraits(person: Models.Person, traits: string[]): Models.Person {
    for (let trait in traits) {
        person.traits.push(traits[trait])
    }
    return person
}
