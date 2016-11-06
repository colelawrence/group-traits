
import { Person, Trait, Identifiable } from './models'
import { GroupResult } from './group-result'

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
        return  []
    }
}
