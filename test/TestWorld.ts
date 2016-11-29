import { Trait, Person } from '../src/models'
import { GroupResult } from '../src/group-result'
import { readFileSync } from 'fs'
import { writeFileSync } from 'fs'

export interface TestOptions { groupMax: number, groupMin: number }
export type TestCase = { people: Person[], traits: Trait[], groups: GroupResult[], options: TestOptions }

/**
 * The TestWorld is used to quickly populate a world of people.
 */
export class TestWorld {
    private traits: {[id: string]: Trait} = {}
    private people: {[name: string]: Person} = {}

    private testcase: TestCase = { people: [], groups: [], traits: [], options: null }

    getTrait(name: string): Trait {
        if (this.traits[name] == null) {
            const trait = new Trait(name)
            this.traits[name] = trait
            this.testcase.traits.push(trait)
        }
        return this.traits[name]
    }

    getPerson(name: string, traitNames: string[] = null): Person {
        if (this.people[name] == null && traitNames != null) {
            const traits = traitNames.map(n => this.getTrait(n))
            const person = new Person(name, traits)
            this.testcase.people.push(person)
            this.people[name] = person
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

    getTestCase(): TestCase {
        return this.testcase
    }

    static addTestCaseFromFile(filepath: string)
    : TestCase {
        return this.fromFile(filepath).getTestCase()
    }

    static fromFile(filepath: string)
    : TestWorld {
        const fileContents = readFileSync(filepath, 'utf8')
        let tw = this.fromString(fileContents)
        return tw
    }

    static fromString(contents)
    : TestWorld {
        const tw = new TestWorld()
        tw.parseTestCase(contents)
        return tw
    }

    static writeTestCaseToFile(testcase: TestCase, filepath: string, description = "")
    : boolean {
        const contents = TestWorld.testCaseToString(testcase, description)
        writeFileSync(filepath, contents, 'utf8')
        return true
    }

    static testCaseToString(testcase: TestCase, description = ""): string {
        const optionsString = JSON.stringify(testcase.options)
            .replace(/^\s*\{/, '')
            .replace(/\}\s*$/, '')
            .replace(/"([^" -]+)":/g, '$1:')
            .replace(/,\s*/g, ', ')
        const populationString = testcase.people
            .map(p =>
                `${p.getId()}: ${
                    p.getTraits().map(t => t.getId()).join(', ')
                }`)
            .join('\n')
        const groupString = testcase.groups
            .map(g =>
                `${g.trait.getId()}: ${
                    g.members.map(p => p.getId()).join(', ')
                }`)
            .join('\n')
        return [description, optionsString, populationString, groupString].join('\n\n===========\n')
    }

	// Parse test case and populate world
    private parseTestCase(contents: string) {
        contents
            .split(/\s*\r?\n======+\r?\n\s*/g)
            .slice(1) // Remove descriptions
            .forEach((content, index) => {
                if (index === 0) this.parseOptions(content)
                else if (index === 1) this.parsePeople(content)
                else this.parseGroupResults(content)
            })
        this.testcase.traits = this.getTraits()
    }
    private parseOptions(contents: string)
    : TestOptions {
        const options = eval(`({${contents}})`)
        this.testcase.options = options
        return options
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
        const groupResults = contents
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
        this.testcase.groups = groupResults
        return groupResults
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
