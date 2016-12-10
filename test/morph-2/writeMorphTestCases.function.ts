
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
		// createMorphs(tco) => { morphdesc: string, morphedobject: TestCaseObject }

		// then loop through those prefixing the path with it
		fs.writeFileSync(
			path.resolve(directory_out, 'm0-' + tc.filename),
			TCO.toString(tc.object)
		)
    })
}