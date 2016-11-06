
import { Set, Stack, Queue, PriorityQueue, Dictionary } from 'typescript-collections'

import { Person, Trait, Identifiable, GroupFinal, Collection } from './models'
import { GroupResult } from './group-result'

interface Peep { p: Person, i: number, g: Trait[] }

export
class GroupOrganizer {
    private groupSizeMin: number
    private groupSizeMax: number
    private peepsByTrait: Dictionary<Trait, Peep[]>

    constructor(
            private people: Person[],
            private traits: Trait[],
            [groupSizeMin, groupSizeMax]: [number, number]) {
        this.groupSizeMin = groupSizeMin
        this.groupSizeMax = groupSizeMax

        this.peepsByTrait = new Dictionary<Trait, Peep[]>()
        traits.forEach(t => this.peepsByTrait.setValue(t, []))
        this.proposed = new Dictionary<Trait, Peep[]>()
        traits.forEach(t => this.proposed.setValue(t, []))

        this.ungrouped = []
        this.peeps = new Dictionary<Person, Peep>()
        people
            .slice()
            .map((p, i) => {
                return { p, i, g: p.getTraits() }
            })
            .forEach((peep: Peep) => {
                this.ungrouped.push(peep)
                const person = peep.p
                this.peeps.setValue(person, peep)
                // populate traits to peeps
                person.getTraits()
                    .forEach(t => {
                        let peeps = this.peepsByTrait.getValue(t)
                        this.peepsByTrait.setValue(t, [...peeps, peep])
                    })
            })
    }

    getResults(): GroupResult[] {
        let p = this.newPeopleIterator()

        let { value: person, done } = p.next()

        this.updateUngrouped()

        let preferredTrait = person.getTraits().shift()

        // Start groups with people who have one preference
        this.ungrouped
            .filter(p => p.g.length === 1)
            .map(p => { return { p, t: p.p.getTraits().reduce(p => p) } })
            .forEach(({p, t}) => {
                // Peep now has no other groups
                p.g = []
                this.proposed.getValue(t).push(p)
            })

        this.updateUngrouped()
        
        let groupSizes = (new Array(this.groupSizeMax + 1 - this.groupSizeMin)).fill(0)
            .map((_,i) => this.groupSizeMin + i)

        // Divide up proposed groups
        const results = this.proposed
            // Essentially just entries()
            .keys().map((trait): [Trait, Peep[]] => [trait, this.proposed.getValue(trait)])
            // Use [Trait, Peep[]] pairs
            .filter(([t, p]) => p.length > this.groupSizeMin)
            .map(([t, p]) => {
                let len = p.length

                let answers: number[][] = []
                let acceptableLoss = 0
                while (answers.length === 0 && acceptableLoss < this.groupSizeMin) {
                    this.subset_sum(len - acceptableLoss, groupSizes, (ans) => answers.push(ans))
                    acceptableLoss++
                }

                // take first answer
                let division = answers.reduceRight((prev, curr) => curr, [])
                let mark = 0
                return division
                    .map(size => {
                        let start = mark
                        let end = mark + size
                        mark = end
                        return { start, end }
                    })
                    .map(({ start, end }) => {
                        let peeps = p.slice(start, end)
                        let people = peeps.map(p => p.p)
                        return new GroupResult(t, people)
                    })
            })
            .reduce((prev, curr: GroupResult[]) => prev.concat(curr), [])

        return results
    }

    private subset_sum(target: number, nums: number[], out: (ans: number[]) => any, partial: number[] = []) {
        let s = partial.reduce((l, r) => l + r, 0)

        let next_ns = nums.filter((n) => s + n <= target)
        
        let exact = next_ns.filter(n => s + n === target)
        if (exact.length === 1) return out([...partial, exact[0]])

        next_ns.map(n => this.subset_sum(target, nums, out, [...partial, n]))
    }

    newPeopleIterator() {
        return function* (ps) {
            while(ps.length) { yield ps.shift() }
        }(this.people.slice())
    }

    // State of problem

    private peeps: Dictionary<Person, Peep>
    private ungrouped: Array<Peep>
    private proposed: Dictionary<Trait, Peep[]>

    private gupgt1(trait: Trait): Peep[] {
        const peepsWithTrait = this.peepsByTrait.getValue(trait)
        return peepsWithTrait.filter(p => p.g.length > 1)
    }

    private updateUngrouped(){
        this.ungrouped = this.ungrouped.filter(p => p.g.length > 0)
    }
}


