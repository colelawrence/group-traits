// Delete this file please... maybe

import { Clay } from './clay'

import * as C from 'typescript-collections'

export
function getStringsNotIn (traits: C.Set<string>, count: number): string[] {
    
}

export
function getStringNotIn (traits: C.Set<string>): string {
    let n = 16
	let str: string
	do {
		str = n.toString(36)
        n++
    }
	while (traits.contains(str))

    return str
}
