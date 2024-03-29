import type { BackupEntry, JsonHash } from './interfaces'
import Result from './result'
import { hashGet, hashPut, hashDel } from './hash'
import { githubReadContent, githubWriteContent, githubGetHash } from './github'
import { adminStore } from '../stores/adminStore';

/**
 * The function reads the restore json from github.
 */
export const repoReadBackup = async () => {
    const result = new Result<BackupEntry[]>()
    try {
        const admin = adminStore.get()
        const url = admin.backupUrl + admin.file
        const readResult = await githubReadContent(url, admin.token)
        if (readResult.hasError()) {
            return result.setError(`repoReadBackup - unable to read data: ${readResult.getMessage()}`)
        }

        const value: BackupEntry[] = JSON.parse(readResult.getValue().content)
        return result.setOk(value)

    } catch (e) { // JSON.parse
        return result.setError(`repoReadBackup - unable to restore data: ${e}`)
    }
}

/**
 * The function writes the restore json to github.
 */
export const repoWriteBackup = async (json: BackupEntry[]) => {

    const admin = adminStore.get()
    if (!admin.token) {
        return new Result<void>().setError(`repoWriteBackup - file: ${admin.backupUrl} Token required`)
    }

    const url = admin.backupUrl + admin.file
    const hashResult = await githubGetHash(url, admin.token)
    const comment = 'backup'
    const content = JSON.stringify(json)

    return githubWriteContent(url, content, hashResult.getValue(), comment, admin.token)
}

/**
 * The function writes a json file to github.
 */
export const repoWriteJson = async (file: string, json: any, hash: string | void, comment: string) => {
    const result = new Result<void>()

    const admin = adminStore.get()
    if (!admin.token) {
        return result.setError(`repoWriteContent - file: ${file} Token required`)
    }

    const url = admin.langUrl + file
    const content = JSON.stringify(json, null, 2);

    const writeResult = await githubWriteContent(url, content, hash, comment, admin.token)
    if (writeResult.hasError()) {
        return result.setError(`repoWriteJson - unable to write: ${writeResult.getMessage()}`)
    }

    await hashDel(file);
    return result.setOk()
}

/**
 * The function reads a json from github.
 */
export const repoGetJson = async <T>(file: string) => {
    const result = new Result<JsonHash<T>>()
    try {
        const admin = adminStore.get()
        const url = admin.langUrl + file

        const readResult = await githubReadContent(url, admin.token)

        if (readResult.hasError()) {
            return result.setError(`repoGetJson - unable to read data: ${readResult.getMessage()}`)
        }

        return result.setOk({
            json: JSON.parse(readResult.getValue().content) as T,
            hash: readResult.getValue().hash
        })

    } catch (e) { // JSON.parse
        return result.setError(`repoGetJson - unable get json: ${e}`)
    }
}

/**
 * The function gets a json file from github.
 */
export const repoGetJsonCache = async <T>(file: string) => {
    const result = new Result<T | void>()
    try {
        const admin = adminStore.get()
        const url = admin.langUrl + file

        //
        // Get etag if present
        //
        let hashDb = await hashGet(file)
        if (hashDb && hashDb.value) {

            const hashResult = await githubGetHash(url, admin.token)
            if (hashResult.hasError()) {
                return result.setError(`repoGetJsonCache - file: ${file} - ${hashResult.getMessage()}`)
            }
            if (hashResult.getValue() && hashResult.getValue() === hashDb.value) {
                console.log('repoGetJsonCache - cache ok', file, 'hash:', hashDb.value)
                return result.setOk()
            }
        }

        const readResult = await githubReadContent(url, admin.token)
        if (readResult.hasError()) {
            return result.setError(`repoGetJsonCache - file: ${file} - ${readResult.getMessage()}`)
        }

        const json = JSON.parse(readResult.getValue().content) as T

        //
        // Update the hash in the store
        //
        await hashPut({
            file: file,
            value: readResult.getValue().hash,
            lastLoaded: new Date()
        })

        console.log('repoGetJsonCache', file, json, 'hash:', readResult.getValue().hash)
        return result.setOk(json)

    } catch (e) { // JSON.parse
        return result.setError(`repoGetJsonCache - file: ${file} - ${e}`)
    }
}
