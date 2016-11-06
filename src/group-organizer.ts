
import { Person, Trait, Identifiable, GroupFinal, Collection } from './models'
import { GroupResult } from './group-result'

interface GroupData {}

export
class GroupOrganizer {
    private groupSizeMin: number
    private groupSizeMax: number

    constructor(
            private people: Person[],
            private traits: Trait[],
            [groupSizeMin, groupSizeMax]: [number, number]) {
        this.groupSizeMin = groupSizeMin
        this.groupSizeMax = groupSizeMax
    }



    getResults(): GroupResult[] {
        let p = this.newPeopleIterator()

        let DidntImmediatelyMatch = new Collection<Person, GroupData>()
        let groups = new Collection<GroupFinal<Person, GroupData>, Trait>()

        let person = p.next()

        return []
    }

    newPeopleIterator() {
        return function* (ps) {
            while(ps.length) { yield ps.shift() }
        }(this.people.slice())
    }
}
