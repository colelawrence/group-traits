
import * as TCO from './TestCaseObject'

import fs = require('fs')
import path = require('path')

export
function writeMorphTestCases(
    	cases: { filename: string, object: TCO.TestCaseObject }[],
        directory_out ) {
	cases.forEach(tc => {
		// TODO send the object to a transformer
		// which recieves multiple labeled TestCaseObjects
		// createMorphs(tco) => { morphdesc: string, morphedobject: TestCaseObject }[]

		// let morphed: { morphdesc: string, morphedobject: TCO.TestCaseObject }[] = createMorphs(tc.object) 

		// then loop through those prefixing the path with it
		fs.writeFileSync(
			path.resolve(directory_out, tc.filename),
			// tc.object will be replaced by morphed.morphedobject
			TCO.toString(tc.object)
		)
    })
}

/**
 * This will eventually call the morphing functions on each file to prepare for writing out
 */
function createMorphs(tco: TCO.TestCaseObject): {morphdesc: string, morphedobject: TCO.TestCaseObject}[] {
	let morph_desc: string = tco.description,
		morphed_obj: TCO.TestCaseObject = tco,
		morphed: {morphdesc: string, morphedobject: TCO.TestCaseObject}[]
	return morphed
}