
import { Set, Stack, Queue, PriorityQueue, Dictionary as Dict } from 'typescript-collections'

import { Person, Trait, Identifiable, GroupFinal, Collection } from './models'
import { GroupResult } from './group-result'

import util = require('util')

interface Peep { p: Person, i: number, g: Trait[] }

// Dictionary with entries function
class Dictionary<K, V> extends Dict<K,V> {
    constructor () { super() }
    /**
     * Returns an array of all key, value pairs in this dictionary.
     * @return {Array} an array containing all of the key, value pairs in this dictionary.
     */
    entries(): [K, V][] {
        const array: [K, V][] = [];
        for (const name in this.table) {
            const pair = this.table[name];
            array.push([pair.key, pair.value]);
        }
        return array;
    }
}

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
        this.updateUngrouped()

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
            .entries()
            // Use [Trait, Peep[]] pairs
            .filter(([t, p]) => p.length > this.groupSizeMin)
            .map(([t, p]) => {
                let len = p.length

                let out: {ans: number[]} = {ans:null}
                let acceptableLoss = 0
                while (out.ans == null && acceptableLoss < this.groupSizeMin) {
                    this.subset_sum(len - acceptableLoss, groupSizes, out)
                    acceptableLoss++
                }

                // take first answer
                let division = out.ans
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

    debug() {
        console.log('debug')
        console.log("this.ungrouped")
        let opts: util.InspectOptions = {
            depth: 4, showHidden: false, colors: true
        }
        util.debug(util.inspect(this.ungrouped, opts))
        console.log("this.proposed.entries()")
        util.debug(util.inspect(this.proposed.entries(), opts))
    }

    private subset_sum(target: number, nums: number[], out: {ans: number[]}, partial: number[] = []) {
        if (out.ans) return
        let s = partial.reduce((l, r) => l + r, 0)

        let next_ns = nums.filter((n) => s + n <= target)
        
        let exact = next_ns.filter(n => s + n === target)
        if (exact.length === 1) return out.ans = [...partial, exact[0]]

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


