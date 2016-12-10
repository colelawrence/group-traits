
import * as TCO from './TestCaseObject'

export
interface TestCaseTransformer {
    (input: TCO.TestCaseObject): TCO.TestCaseObject
}
