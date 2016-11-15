import { TestOptions } from '../TestWorld'

export interface TraitCount { [name:string]: number }

export
interface FileContents {
    description: string
    options: TestOptions
    people: { [name: string]: {name: string, traits: string[]} }
    expected: string
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
    subcases: { [filename: string]: File }
}
