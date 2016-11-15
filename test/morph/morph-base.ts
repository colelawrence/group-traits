/**
 * Exports a set of functions to be used for morphing test input.
 * Specifically, the goal is to create a few interface functions that can be used to morph the test cases for metamorphic testing.
 * @author James Hibben
 */

/**
 * Interface for adding data of type T to the test data. Note that you will have to handle adding to the test data within the function.
 * @param name The "name" of the data to add; multiple names may be added.
 * @param data The data (of type T) to be added to the test case.
 * @param count Optional; The total number of instances that the data should be added.
 */
export
interface Add<T> {
    (names: string[], data: T, count?: number): void
}


/**
 * Interface for removing data of type T from the test data. Note that you will have to handle removing items from the test data within the function.
 * @param name The "name" of the data to remove; multiple names may be added.
 * @param data The data (of type T) to be removed from the test case.
 * @param count Optional; The total number of instances that the data should be removed.
 */
export
interface Remove<T> {
    (names: string[], data: T, count?: number): void
}

/**
 * Interface for parsing raw data (string) to type T.
 * @param contents The string contents of to be parsed.
 * @returns An object of type T.
 */
export
interface Parse<T> {
    (contents: string): T
}
