
import { Set, Stack, Queue, PriorityQueue, Dictionary as Dict } from 'typescript-collections'

import { Person, Trait, Identifiable, GroupFinal, Collection } from './models'
import { GroupResult } from './group-result'

import util = require('util')

interface Peep { p: Person, i: number, g: Trait[] }

// Dictionary with entries function
class Dictionary<K, V> extends Dict<K,V> {
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

class Buckets<K, V> extends Dictionary<K, V[]> {
    addDrops(key: K, values: V[]) {
        if (!this.containsKey(key)) this.setValue(key, [])
        this.getValue(key).push(...values)
    }

    moveDrops(key: K, values: V[]) {
        let rmd = this.removeDrops(values)
        this.addDrops(key, values)
        return rmd
    }

    // returns removed entries
    removeDrops(values: V[]): [K, V[]][] {
        const removed: [K, V[]][] = []
        const newEntries = this.entries().map(([k, vs]) => {
            let n: V[] = []
            let r: V[] = []
            vs.forEach(v => values.indexOf(v) !== -1 ? r.push(v) : n.push(v))
            removed.push([k, r])
            return <[K, V[]]> [k, n]
        })
        this.clear()
        newEntries.forEach(([k, vs]) => this.setValue(k, vs))
        return removed
    }

    addDrop(key: K, value: V) {
        this.addDrops(key, [value])
    }

    moveDrop(key: K, value: V) {
        this.moveDrops(key, [value])
    }

    // returns entry
    removeDrop(value: V) {
        return this.removeDrops([value])
    }

    static moveDrops<K, V>(key: K, from: Buckets<K, V>, to: Buckets<K, V>, values: V[]) {
        let removed = from.removeDrops(values)
        to.addDrops(key, removed.map(([k,v]) => v).reduce((p, c) => p.concat(c), []))
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
        this.proposed = new Buckets<Trait, Peep>()
        this.stale = new Buckets<Trait, Peep>()
        traits.forEach(t => this.proposed.setValue(t, []))

        this.ungrouped = people.slice()
            .map((p, i) => {
                return { p, i, g: p.getTraits() }
            })
            .map((peep: Peep) => {
                // populate traits to peeps
                peep.g
                    .forEach(t => {
                        let peeps = this.peepsByTrait.getValue(t)
                        this.peepsByTrait.setValue(t, [...peeps, peep])
                    })

                return peep
            })
    }

    getResults(): GroupResult[] {
        const groupSizes = (new Array(this.groupSizeMax + 1 - this.groupSizeMin)).fill(0)
            .map((_,i) => this.groupSizeMin + i)

        // Ensure that every group has enough people
        const MAX_TRIES = 10 // In the worst case,
            // this will be the length of longest getTraits() list
        let tries = 0
        while (++tries < MAX_TRIES) {
            // Remove everyone who does not have any more preferences
            this.ungrouped.filter(p => p.g.length > 0)
                .forEach(p => {
                    // Put peep into next proposed
                    let t = p.g.shift()
                    this.proposed.addDrop(t, p)

                    let staleBucket = this.stale.getValue(t) || []

                    // Our person is already grouped, so how do we get him ungrouped?
                    let priorityStale = staleBucket.filter((sp) => sp.i < p.i)
                    let groupedLowlings = this.proposed.getValue(t).filter((sp) => sp.i < p.i)

                    // Should we take these grouped lowlings and remove them from their current group?
                    // Only if we can safely remove them without breaking apart the group...
                    // removedropifdoenthurt

                    // TODO: move the stale peeps that have lower rank, using filter(sp => sp.i < p.i)
                    // compare the "staleness" ?
                    if (priorityStale && priorityStale.length > 0) {
                        let rmd = this.proposed.moveDrops(t, priorityStale)
                        this.log(rmd, "movingDrops in proposed based on stale")
                    }
                })

            let groupsTooSmall = this.proposed
                .entries()
                // Use [Trait, Peep[]] pairs
                .filter(([t, p]) => p.length < this.groupSizeMin)

            if (groupsTooSmall.length === 0) {
                break
            } else {
                this.log(groupsTooSmall, "groupsTooSmall")
                this.ungrouped =
                    groupsTooSmall
                    .map(([t, p]) => {
                        // Add Trait and Peeps to stale
                        // We use these values later in order to jumpstart the next grouping
                        this.stale.addDrops(t, p)
                        // Remove proposed
                        this.proposed.remove(t)

                        // these peeps go back into ungrouped
                        return p
                    })
                    .reduce((prev, curr) => prev.concat(curr), [])
            }
        }

        if (tries === MAX_TRIES) {
            console.warn(`Max tries (${MAX_TRIES}) reached while getting results!`)
        }

        // Divide up proposed groups
        const results = this.proposed
            .entries()
            // Use [Trait, Peep[]] pairs
            .filter(([t, p]) => p.length >= this.groupSizeMin)
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

        // while (ungrouped.length > 0) {
        //     let peep = ungrouped.shift()
        //     console.log("LOST", peep)
        // }
        
        return results
    }

    debug() {
        console.log("Debugging Group Organizer")
        this.log('debug()')
        this.log(this.ungrouped, "this.ungrouped")
        this.log(this.stale.entries(), "this.stale")
        this.log(this.proposed.entries(), "this.proposed.entries()")
        this.logMessages.forEach(strs => console.log.apply(console, strs))
        this.logMessages = []
    }

    private logMessages: string[][] = []
    private log (aye, title: string = "DEBUG") {
        this.logMessages.push([title, util.inspect(aye, {
            depth: 4, showHidden: false, colors: true
        })])
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
    private ungrouped: Array<Peep>
    private stale: Buckets<Trait, Peep>
    private proposed: Buckets<Trait, Peep>

    private gup(trait: Trait): Peep[] {
        const peepsWithTrait = this.peepsByTrait.getValue(trait)
        return peepsWithTrait.filter(p => p.g.length >= 1)
    }
}


