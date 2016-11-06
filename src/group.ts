
import { Person, Trait, Identifiable } from './models'

const compareIdentifiable = (a: Identifiable, b: Identifiable) => a.getId().localeCompare(b.getId())

export
class GroupResult {

    constructor(
            public trait: Trait,
            public members: Person[],
            public score?: number
    ) {}

    toShortString() {
        const memberList = this.members.map(m => m.getId()).join(', ')
        const traitId = this.trait.getId()
        return `${traitId}: ${memberList}`
    }

    isEqual(gr: GroupResult): boolean {
        if (this.members.length !== gr.members.length)
        return false
        if (!this.trait.isEqual(gr.trait))
        return false
        const members = this.members.sort(compareIdentifiable)
        const gmembers = gr.members.sort(compareIdentifiable)
        const differentMembers = members.filter((p, i) => !p.isEqual(gmembers[i]))

        if (differentMembers.length) return false

        return true
    }
}

export
function createGroups(
        people: Person[],
        traits: Trait[],
        [groupSizeMin, groupSizeMax]: [number, number]
    ): GroupResult[] {
    
    

    return  []
}
