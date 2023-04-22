/**
 * The backup is an array of BackupEntry's with:
 * 
 * - string: id
 * - number: failed
 * - number: total
 */
export type BackupEntry = [string, number, number]

/**
 * The interface for a json file with its hash value.
 */
export interface JsonHash<T> {
    json: T,
    hash: string
}

/**
 * The interface for the content of a file with its hash value.
 */
export interface ContentHash {
    content: string,
    hash: string
}