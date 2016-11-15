let clonedeep = require('lodash.clonedeep')

import { readFile } from 'fs'

import { TestCase, TestWorld, TestOptions } from '../TestWorld'
import { Identifiable, Trait, Person } from '../../src/models'

import * as Morph from './morph-base'
import * as Models from './morph-models'

interface MorphTestCase {
    people: string[]
    options: TestOptions
}

interface MorphPerson {
    name: string
    traits: string[]
}

// Declarations & definitions for function interfaces
// Parsing

/**
 * Split the file into parts and return the promise of a split test file for morphing
 */
export
let parseFile: Morph.Parse<Promise<MorphTestCase>> =
(filepath: string): Promise<MorphTestCase> => {
    let currentFile: File
    return new Promise<MorphTestCase>
    ((resolve, reject) => {
        readFile(filepath, 'utf8', (err, data) => {
            if (err) return reject(err)
        })
    })
}

export
let parseOptions: Morph.Parse<TestOptions> =
(options: string): TestOptions => {
    return eval(`{${options}}`)
}

export
let parsePeople: Morph.Parse<MorphPerson[]> =
(contents: string): MorphPerson[] => {
    return contents
        .split(/\s*\r?\n\s*/g)
        .filter(ln => ln.length > 0)
        .map((ln) => /^([^:]+):\s*(.+)$/.exec(ln))
        .map(([,name,traits]) => {
            return { name, traits: traits.split(/\s*,\s*/g) }
        })
}
// Adding
export
let addTrait: Morph.Add<Trait>
export
let addTraits: Morph.Add<Trait[]>
export
let addPerson: Morph.Add<Person>
export
let addPeople: Morph.Add<Person[]>
// Removing
export
let rmTrait: Morph.Remove<Trait>
export
let rmTraits: Morph.Remove<Trait[]>
export
let rmPerson: Morph.Remove<Person>
export
let rmPeople: Morph.Remove<Person[]>

/**
 * Used to generate additional test cases based upon the supplied tests.
 * @author James Hibben
 */
export class Morpher {
    private files: File[]

    /**
     * Read the file and copy it to internal memory for parsing.
     * @param filepath The full path (including extension) to the file being read in.
     * @param encoding The encoding to use.
     * @param cb The callback function to be supplied to `fs.readFile`.
     * @returns Nothing.
     */
    // readFile(filepath: string, encoding: string, cb) {
    //     readFile(
    //         filepath,
    //         encoding,
    //         (err, data) => {
    //             if (!err) {
    //                 this.files.push({
    //                     filename: filepath,
    //                     rawcontents: data
    //                 })
    //             }
    //             cb(err, data)
    //         }
    //     )
    //     this.parseFile(filepath)
    // }

    /**
     * Split the file into parts for further processing.
     * Similar to <TestWorld>, but without converting the contents.
     * @param filepath The full path to the file, including extension.
     */
    // private parseFile(filepath: string) {
    //     let currentFile: File = this.files[filepath]
    //     let fileparts: string[] = currentFile.rawcontents.split(/\s*\r?\n======+\r?\n\s*/g)
    //     currentFile.contents.description = fileparts[0]
    //     currentFile.contents.options = this.parseOptions(fileparts[1])
    //     currentFile.contents.people = this.parsePeople(fileparts[2])
    // }

    // private parseOptions(options: string): Options {
    //     return eval(`({${options}})`)
    // }

    // private parsePeople(people: string): any {
    //     let res: any = {}
    //     let peeplist = people.split(/\s*\r?\n\s*/g)
    //     for (let i = 0; i < peeplist.length; ++i) {
    //         let peep = peeplist[i].split(/\: ?/g)
    //         let name = peep[0]
    //         let traits = peep[1].split(/\, ?/g)
    //         res[name] = { name: name, traits: traits }
    //     }
    //     return res
    // }
}

// helper functions

function toTrait(name: string): Trait {
    return new Trait(name)
}

function toPerson(name: string, traits: Trait[]): Person {
    return new Person(name, traits)
}
