import { Trait, Person } from '../src/models'
import { GroupResult } from '../src/group-result'
import { readFile } from 'fs'
import { writeFile } from 'fs'

export interface TestOptions { groupMax: number, groupMin: number }
export type TestCase = { people: Person[], traits: Trait[], groups: GroupResult[], options: TestOptions }

/**
 * The TestWorld is used to quickly populate a world of people.
 */
export class TestWorld {
    private traits: {[id: string]: Trait} = {}
    private people: {[name: string]: Person} = {}

    getTrait(name: string): Trait {
        if (this.traits[name] == null)
            this.traits[name] = new Trait(name)
        return this.traits[name]
    }
    getPerson(name: string, traitNames: string[] = null): Person {
        if (this.people[name] == null && traitNames != null) {
            const traits = traitNames.map(n => this.getTrait(n))
            this.people[name] = new Person(name, traits)
        }
        return this.people[name]
    }

    getPeople(): Person[] {
        return Object.keys(this.people)
            .map(name => this.people[name])
    }

    getTraits(): Trait[] {
        return Object.keys(this.traits)
            .map(name => this.traits[name])
    }

    static addTestCaseFromFile(filepath: string)
    : Promise<TestCase> {
        return new Promise<TestCase>
        ((resolve, reject) => {
            const fileContents = readFile(
                filepath,
                'utf8',
                (err, data) => {
	                if (err) return reject(err)
                    const tw = new TestWorld()
	                const res = tw.parseTestCase(data)
	                resolve(res)
            	})
        })
    }

    static writeTestCaseToFile(testCase: TestCase, filepath: string, description = "")
    : Promise<boolean> {
		return new Promise
        ((resolve, reject) => {
            const contents = TestWorld.testCaseToString(testCase, description)
            const fileContents = writeFile(
                filepath,
                contents,
                'utf8',
                (err) => {
	                if (err) return reject(err)
	                resolve(true)
            	})
        })	
    }

    static testCaseToString(testCase: TestCase, description = ""): string {
        const optionsString = JSON.stringify(testCase.options)
            .replace(/^\s*\{/, '')
            .replace(/\}\s*$/, '')
            .replace(/"([^" -]+)":/g, '$1:')
            .replace(/,\s*/g, ', ')
        const populationString = testCase.people
            .map(p =>
                `${p.getId()}: ${
                    p.getTraits().map(t => t.getId()).join(', ')
                }`)
            .join('\n')
        const groupString = testCase.groups
            .map(g =>
                `${g.trait.getId()}: ${
                    g.members.map(p => p.getId()).join(', ')
                }`)
            .join('\n')
        return [description, optionsString, populationString, groupString].join('\n\n===========\n')
    }

    private parseTestCase(contents: string)
    : TestCase {
        const res = { people: [], groups: [], traits: [], options: null }
        contents
            .split(/\s*\r?\n======+\r?\n\s*/g)
            .slice(1) // Remove descriptions
            .forEach((content, index) => {
                if (index === 0) res.options = this.parseOptions(content)
                else if (index === 1) res.people = this.parsePeople(content)
                else res.groups = this.parseGroupResults(content)
            })
        res.traits = this.getTraits()
        return res
    }
    private parseOptions(contents: string)
    : TestOptions {
        return eval(`({${contents}})`)
    }
    private parsePeople(contents: string)
    : Person[] {
        return contents
            .split(/\s*\r?\n\s*/g)
            .filter(ln => ln.length > 0)
            .map((ln) => /^([^:]+):\s*(.+)$/.exec(ln))
            .map(([,name,traits]) => {
                    return { name, traits: traits.split(/\s*,\s*/g) }
                })
            .map(({name, traits}) => this.getPerson(name, traits))
    }

    private parseGroupResults(contents: string)
    : GroupResult[] {
        return contents
            .split(/\s*\r?\n\s*/g)
            .filter(ln => ln.length > 0)
            .map((ln) => /^([^:]+):\s*(.+)$/.exec(ln))
            .map(([,trait, people]) => {
                    return { trait, people: people.split(/\s*,\s*/g) }
                })
            .map(({trait, people}) => {
                return new GroupResult(
                    this.getTrait(trait),
                    people.map(pn => this.getPerson(pn))
                )
            })
    }
}

// for fun function
const indent = (spaces: number, ch = ' ') => {
    const pad = (new Array(spaces + 1)).join(ch)
    return (ln: string) => pad + ln
}

export
function printTestCase(testcase: TestCase) {
    console.log("People in world:")
    console.log(testcase.people
            .map(m => m.toString())
            .map(indent(3))
            .join('\n'))
    console.log("Expecting Groups:")
    console.log(testcase.groups
            .map(gr => gr.toShortString())
            .map(indent(3))
            .join('\n'))
}