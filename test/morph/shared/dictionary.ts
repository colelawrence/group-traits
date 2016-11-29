
const clonedeep = require('lodash.clonedeep')

// Helper collection for filtering and finding easily
export
class Dictionary<V> {
    /**
     * @property {table} Implementation of <<Vs>> for actual storage.
     */
    protected table: {[key: string]: V} = {}
    private length: number = 0

	get(key) {
        return this.table[key] || null
    }

    set(key, value: V) {
        this.table[key] = value
    }

    delete(key) {
        const removed = this.get(key)

        delete this.table[key]
        return removed
    }

    keys() {
		return Object.keys(this.table)
    }

    values() {
		return this.key_values().map(([,value]) => value)
    }

    stringify(replacer?: (key: string, value: any) => any, space?: number | string): string {
        return JSON.stringify(this.table, replacer, space)
    }

    protected key_values(): [string, V][] {
		return this.keys().map(key => <[string, V]> [key, this.get(key)])
    }

	// Find first key value pair which matches testFn
    private find(testFn: (value: V, key: string) => boolean): [string, V] {
        return this.key_values().find(([k,v]) => testFn(v, k))
    }
	// Filter all key value pairs with people matching testFn
    private filter(testFn: (value: V, key: number | string) => boolean): [string, V][] {
        return this.key_values().filter(([k,v]) => testFn(v, k))
    }

    findKey(testFn: (value: V, key:  string) => boolean): string {
        return (this.find(testFn) || [null])[0]
    }

    findValue(testFn: (value: V, key:  string) => boolean): V {
        return (this.find(testFn) || [,null])[1]
    }
	findAndUpdate(testFn: (value: V, key:  string) => boolean,
    		updateFn: (value: V, key:  string) => V): boolean {
        const kv_pair = this.find(testFn)
        if (!kv_pair) return false
        const [k, v] = kv_pair
        this.set(k, updateFn(v, k))

        return true
    }

	// Find all keys with people matching
    filterKeys(testFn: (value: V, key: number | string) => boolean)
    : string[] {
        return this.filter(testFn).map(([k]) => k)
    }

	// Find all keys with people matching
    filterValues(testFn: (value: V, key: number | string) => boolean)
    : V[] {
        return this.filter(testFn).map(([,v]) => v)
    }

    getLength(): number {
        this.length = this.keys().length
        return this.length
    }
}