import { mkdirSync, readdirSync, readFile, writeFile } from 'fs'

import * as Models from './morph-models'
export
class MorphStorage {
    private static folders: { [name: string]: Models.Folder }
    private static testfiles: Models.File[]
    private static casesdir: string = '../cases/'

    static getTestFiles() {
        return this.testfiles
    }

    static getFolderNames(): string[] {
        let foldernames: string[] = []
        let foldercount: number = this.getFolderCount()
        for (let i = 0; i < foldercount; ++i) {
            foldernames.push(this.folders[i].name)
        }
        return foldernames
    }

    static getFolderCount(): number {
        let n: number = 0
        for (let f in this.folders) {
            ++n
        }
        return n
    }

    static getFileCount(folder: Models.Folder): number {
        let n: number = 0
        for (let filename in folder.subcases) {
            ++n
        }
        return n
    }

    static getMatchingFiles(name: string): Models.File[] {
        // strip off the file extension from name and search through the subfolders
        let extension = name.slice(-3)
        name = name.slice(0, -3)
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

    static makeSubfolders(): void {
        let foldername: string
        // sorted array of all markdown files in the cases directory
        const files = readdirSync(this.casesdir)
            .filter(fn => /\.md$/i.test(fn)) // only case markdown files
            .sort()
        for (let file in files) {
            const ext = '.md'
            file.replace('.md', '')
            mkdirSync(this.casesdir + '/' + file)
        }
    }
}
