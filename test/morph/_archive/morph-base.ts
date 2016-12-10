// Exports a set of functions to be used for morphing test input.
// Specifically, the goal is to create a few interface functions that can be used to morph the test cases for metamorphic testing.
// @author James Hibben


/**
 * Object containing fields for storing basic tranform data.
 * @property {string[]} primary Primary data that will be transformed
 * @property {string[]} secondary Optional. Secondary data that will be transformed
 * @property {number} startIndex Optional. Index to start the transforms at (arrays only)
 */
export
interface TData {
    primary: string[]
    secondary?: string[]
    startIndex?: number
}


/**
 * Interface for transforming test data of type T.
 * @param {TData} tranforms Object containing information on what and where to transform within the data
 * @param {T} data The data (of type T) to be transformed
 * @param {number} count Optional; The total number of instances of the data that should be transformed
 * @returns {T}
 */
export
interface Transform<T> {
    (names: TData, data: T, count?: number): T
}

/**
 * Interface for parsing raw data (string) to type T.
 * @param {string} contents The string contents of to be parsed.
 * @returns {T}
 */
export
interface Parse<T> {
    (contents: string): T
}
