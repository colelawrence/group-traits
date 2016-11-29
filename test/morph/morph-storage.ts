import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs'

import * as Models from './morph-models'
import { TData } from './morph-base'
export
class MorphStorage {
    private static casesdir: string
    private static folders: { [name: string]: Models.Folder } = {}
    private static testfiles: Models.File[] = []

    /**
     * Returns the <Morphs.File> for the given filename. Only searches the original test cases for exact matches.
     * @returns {Models.File} of the original test case.
     */
    static getOriginalTestCase(filename: string): Models.File {
        let file: Models.File = undefined
        for (let i = 0; i < this.testfiles.length; ++i) {
            if (this.testfiles[i].filename === filename) {
                file = this.testfiles[i]
            }
        }

        if (file === undefined) {
            throw `Unable to find ${filename}`
        }

        return file
    }

    static contains(filename: string): boolean {
        let length = this.getCount(this.testfiles)
        for (let file in this.testfiles) {
            if (this.testfiles[file].filename === file) return true
        }
        return false
    }

    static containsMorph(filename: string): boolean {
        // determine the foldername from the original filename
        const foldername: string = filename.replace('.md', '')
        return false
    }

    static store(file: Models.File) {
        if (!this.contains(file.filename)) {
            this.testfiles[file.filename] = file
        }
    }

    static storeMorph(file: Models.File) {
        if (!this.containsMorph(file.filename)) {
            // this.folders[]
        }
    }

    /**
     * Converts all test case files to {Models.File[]} (if necessary) and creates the subfolders.
     * @returns {Models.File[]} containing the original test cases' filenames and raw data.
     */
    static getTestFiles(): Models.File[] {
        if (this.getCount(this.testfiles) === 0) {
            // we need to read in the test files
            this.testfiles = readdirSync(this.casesdir)
                .filter(fn => /\.md$/i.test(fn))
                .sort()
                .map((filename) => {
                    return {
                        filename: filename,
                        rawcontents: readFileSync(this.casesdir + filename, 'utf8')
                    }
            })
            this.makeSubfolders()
        }
        return this.testfiles
    }

    /**
     * Returns the full set of test files, without their paths.
     * The files' paths should be able to be determined by their filename.
     */
    static getAllTestFiles() {
        let folders = this.folders
        let files: Models.File[]
        // cycle through all folders
        for (let foldername in folders) {
            let folder = folders[foldername]
            for(let filename in folder.subcases) {
                files.push(folder.subcases[filename])
            }
        }
        return files
    }

    /**
     * Get a list of all folder names.
     */
    static getFolderNames(): string[] {
        let foldernames: string[] = []
        let foldercount: number = this.getFolderCount()
        for (let i = 0; i < foldercount; ++i) {
            foldernames.push(this.folders[i].name)
        }
        return foldernames
    }

    /**
     * Count items in an array that has no length property.
     * @param {any} arr The array lacking a `length` property.
     * @returns {number} The array's length.
     */
    static getCount(arr: any): number {
        return Object.keys(arr).length;
    }

    /**
     * Returns the number of folders in storage.
     */
    static getFolderCount(): number {
        return this.getCount(this.folders)
    }

    /**
     * Returns the number of test cases within a given folder.
     * @param {Models.Folder} folder The folder to get the subcases from.
     * @returns {number} Total count of files in the subfolder.
     */
    static getFileCount(folder: Models.Folder): number {
        return this.getCount(folder.subcases)
    }

    /**
     * Returns the path to the test case directory
     */
    static getCasesDir(): string {
        return this.casesdir
    }

    /**
     * Set the directory where all test cases are stored
     * @param {string} path The path to the test case directory
     */
    static setCasesDir(path: string): void {
        this.casesdir = path
    }

    /**
     * Get a list of all files that match the given naming criteria
     * @param {string} name The name of the file that we're searching.
     * @returns {Models.File[]} Array of <<Models.File>> objects that match the search string.
     */
    static getMatchingFiles(name: string): Models.File[] {
        // strip off the file extension from name and search through the subfolders
        let extIndex = name.indexOf('.md')
        let extension = name.slice(extIndex)
        name = name.slice(0, extIndex)
        let files: Models.File[] = []
        let count: number = this.getFolderCount()
        // search test files
        for (let i = 0; i < this.testfiles.length; ++i) {
            if (this.testfiles[i].filename.includes(name)) {
                files.push(this.testfiles[i])
            }
        }
        // search folders
        for (let i = 0; i < count; ++i) {
            let subcases = this.folders[i].subcases
            let filecount = this.getFileCount(this.folders[i])
            for (let j = 0; j < filecount; ++j) {
                if(subcases[j].filename.includes(name)) {
                    files.push(subcases[j])
                }
            }
        }
        return files
    }

    /**
     * Create folders to store each primary file's subcases.
     */
    static makeSubfolders(): void {
        let foldername: string
        // sorted array of all markdown files in the cases directory
        const files = this.testfiles,
            length = this.getCount(this.testfiles)
        for (let i = 0; i < length; ++i) {
            // get the foldername from the filename
            foldername = files[i].filename.replace('.md', '')
            if(!existsSync(this.casesdir + foldername)) {
                // only make the folder if it doesn't exist
                // mkdirSync throws an error if the folder already exists
                mkdirSync(this.casesdir + '/' + foldername)
            }
            this.folders[foldername] = { name: foldername }
        }
    }

    /**
     * Get the counts for all traits present in the file.
     * Sets the `usedTraits` property on `file`, and returns the {Models.TraitCount} object.
     * @param {Morphs.File} file The file to inspect for traits.
     * @returns {Morphs.TraitCount} object containing the found traits and their respective counts.
     */
    static getUsedTraits(file: Models.File): Models.TraitCount {
        let people = file.parsedcontents.people
        let traits: string[] = []
        let usedTraits: string[] = []
        let traitCount: Models.TraitCount = {}
        for (let person in people) {
            let personTraits = people[person].traits
            let ptlength = this.getCount(personTraits)
            for (let trait in personTraits) {
                traits.push(personTraits[trait])
            }
        }
        // add the unique traits used in this test case
        usedTraits = traits.filter(
            (name: string, index: number, self) => {
                return index == self.indexOf(name)
            }
        ).sort()
        // get the trait counts
        for (let trait in usedTraits) {
            traitCount[usedTraits[trait]] = 0
        }
        for (let trait in traits) {
            traitCount[traits[trait]] += 1
        }

        file.usedtraits = traitCount

        return traitCount
    }

    /**
     * Morphs the test file using the supplied function. This function automatically adds the newly generated file to the appropriate <Morphs.Folder>.
     * @param {MorphStorage.File} file The file to transform
     * @param {callback} morphFunction The function used to affect the transform. It is recommended to use the <Morph.Transform> function interfaces to implement the function(s) to be used here.
     */
    static morphTestFile(file: Models.File, traits: TData, content: Models.FileContents, count: number,
            morphFunction: (traits: TData,
                            content: Models.FileContents,
                            count?: number) => Models.FileContents): Models.FileContents {
        let fileContents: Models.FileContents = file.parsedcontents
        let morphedContents: Models.FileContents = morphFunction.call(morphFunction, traits, content, count)
        return morphedContents
    }

    static fileToString(file: Models.File): string {
        // convert the parsedcontents to rawcontents
        // TODO: Population string is not showing up!
        const optionsString = JSON.stringify(file.parsedcontents.options)
            .replace(/^\s*\{/, '')
            .replace(/\}\s*$/, '')
            .replace(/"([^" -]+)":/g, '$1:')
            .replace(/,\s*/g, ', ')
        let populationString: string = ''
        for (let person in file.parsedcontents.people) {
            let p = file.parsedcontents.people[person]
            populationString += `${p.name}: ${p.traits.join(', ')}\n`
        }
        return [file.parsedcontents.description, optionsString, populationString.trim(), file.parsedcontents.expected].join('\n\n======\n')
    }
}
