
export
class Identifiable {
    constructor(private type: string, private id: string) {}
    isEqual(i: Identifiable) { return i.id === this.id }
    getId() { return this.id }
    toString() { return `#${this.type}{${this.id}}` }
}

export
class Group<M extends Identifiable, D> extends Identifiable {
    static GROUP_COUNT: {[traitName: string]: number} = {}
    static newId(t: Trait): string {
        const traitName = t.getName()
        const currentId = (Group.GROUP_COUNT[traitName] || 0) + 1
        Group.GROUP_COUNT[traitName] = currentId
        return `${traitName} ${currentId}`
    }

    private members: [M, D][] = [] 
    constructor(trait: Trait) { super('Group', Group.newId(trait)) }

    addMember(t: M, data: D): boolean {
        if (this.isMember(t)) return false

        this.members.push([t, data])
    }

    isMember(member: M): boolean {
        return this.members.filter(([m,]) => member.isEqual(m)).length > 0
    }

    getMember(t: M): D {
        // returns the last added member's data
        return this.members
            .filter(([t,]) => t.isEqual(t))
            .map(([,d]) => d)
            .reduce((_, last) => last)
    }

    filter(fn: (D) => boolean): M[] {
        return this.members
            .filter(([,d]) => fn(d))
            .map(([m,]) => m)
    }
}

export
class Trait extends Identifiable {
    constructor(private name: string){ super('Trait', name) }
    getName(){ return this.name }
}

export
class Person extends Identifiable {
    constructor(name: string, private traits: Trait[]){ super('Person', name) }

    toString(){
        return `#Person{${this.getId()}, [${
            this.traits.map(t => t.getId()).join(' ')
        }]}`
    }

    createIterator() {
        return (function* (t: Trait[]) {
            while (t.length) {
                yield t.shift()
            }
        })([...this.traits])
    }
}


