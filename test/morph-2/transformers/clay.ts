
import * as TCO from '../TestCaseObject'

/**
 * This is the base class that can help us modify our testcase
 * objects quickly and program once information.
 */
export
class Clay {
	constructor(private obj: TCO.TestCaseObject) {}

    toTCO(): TCO.TestCaseObject {
        return this.obj
    }
}