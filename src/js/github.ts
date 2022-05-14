import { errorStore } from '../stores/errorStore'
import { hashGet, hashPut } from './hash'
import { adminGet } from './admin'
import type { Admin } from './admin'

/**
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Base64
 */
const utf8_to_b64 = (str: string) => {
    return window.btoa(unescape(encodeURIComponent(str)));
}

/**
 * See: https://developer.mozilla.org/en-US/docs/Glossary/Base64
 */
const b64_to_utf8 = (str: string) => {
    return decodeURIComponent(escape(window.atob(str)));
}

/**
 * The function parses json data from github.
 */
const githubParseJson = (content: string) => {
    try {
        return JSON.parse(b64_to_utf8(content))
    } catch (e) {
        errorStore.addError(`githubParseContent - unable to parse json content: ${e}`)
    }
}

/**
 * Adding a token to the headers if present.
 */
const githubGetHeader = (admin: Admin | void) => {
    const result: any = {
        Accept: 'application/vnd.github.v3+json'
    }

    if (admin && admin.token) {
        result.authorization = `token ${admin.token}`
    }

    return result
}

/**
 * Create an object with the backup url and the necessary headers.
 */
const githubGetBackupUrl = async () => {
    const admin = await adminGet()

    return {
        backupUrl: admin.backupUrl + admin.file + '.json',
        headers: githubGetHeader(admin)
    }
}

/**
 * Create an object with the file url and the necessary headers.
 */
const githubGetFileUrl = async (file: string) => {
    const admin = await adminGet()

    return {
        fileUrl: admin.langUrl + file,
        headers: githubGetHeader(admin)
    }
}

/**
 * The function return the sha value for a file. Example:
 * 
 * etag: W/"92cf13a1ecb655679f232302e0535d4ea689fb7f"
 * sha:     92cf13a1ecb655679f232302e0535d4ea689fb7f
 */
const githubGetEtag = async (url: string, headers: any) => {

    const response = await fetch(url, { method: 'HEAD', headers: headers }).catch(e => {
        errorStore.addError(`githubGetEtag - url: ${url} error: ${e}`)
    })

    if (!response || response.status === 404) {
        return
    }

    if (!response.ok) {
        errorStore.addError(`githubGetEtag - url: ${url} error: ${response.statusText}`)
        return
    }

    const etag = response.headers.get('ETag')
    if (!etag) {
        return
    }

    const start = etag.startsWith('W/') ? 3 : 1
    return etag.substring(start, etag.length - 1)
}

/**
 * The function does a head request and checks a etag possible header with a 
 * given value.
 */
const githubCheckEtag = async (url: string, headers: any, hash: string) => {

    const etag = await githubGetEtag(url, headers)
    if (!etag) {
        return false
    }

    const result = etag === hash
    console.log('url :', url, 'ETag', etag, 'hash', hash, 'matches', result)

    return result
}

/**
 * The function does a get request to a github url and returns the json.
 */
const githubGetJsonContent = async (url: string, headers: any) => {

    const response = await fetch(url, headers).catch(e => {
        errorStore.addError(`githubGetJsonContent - url: ${url} error: ${e}`)
    })

    if (!response) {
        return
    }

    if (!response.ok) {
        errorStore.addError(`githubGetJsonContent - url: ${url} error: ${response.statusText}`)
        return
    }

    return response.json()
}

/**
 * The function gets a json file from github.
 */
export const githubGetJson = async (file: string) => {

    const { fileUrl, headers } = await githubGetFileUrl(file)
    //
    // Get etag if present
    //
    let hash = await hashGet(file)
    if (hash.value) {
        const etagCheck = await githubCheckEtag(fileUrl, headers, hash.value)
        if (etagCheck) {
            return
        }
    }

    const json = await githubGetJsonContent(fileUrl, headers)
    if (!json) {
        return
    }

    const content = githubParseJson(json.content)
    if (!content) {
        return
    }

    //
    // Update the hash in the store
    //
    hash.value = json.sha
    hash.lastLoaded = new Date()
    await hashPut(hash)

    console.log('githubGetJson', content)
    return content
}

/**
 * The function commits the json file to github. First we need the sha hash, 
 * which comes from the etag. This is required for the commit if the file 
 * exists. 
 * 
 * It requires a token, the backupUrl and the file. It is assumed that this is 
 * check in the frontend.
 */
export const githubBackup = async (json: any) => {

    const { backupUrl, headers } = await githubGetBackupUrl()
    const sha = await githubGetEtag(backupUrl, headers)
    console.log('sha', sha)

    const data = {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            sha: sha,
            content: utf8_to_b64(JSON.stringify(json)),
            message: 'backup'
        }),
    }

    const response = await fetch(backupUrl, data).catch(e => {
        errorStore.addError(`githubBackup - url: ${backupUrl} error: ${e}`)
    })

    if (!response) {
        return
    }

    if (!response.ok) {
        errorStore.addError(`githubBackup - url: ${backupUrl} error: ${response.statusText}`)
        return
    }
}

/**
 * The function loads the restore file. 
 * 
 * It requires a token, the backupUrl and the file. It is assumed that this is 
 * check in the frontend.
 */
export const githubRestore = async () => {

    const { backupUrl, headers } = await githubGetBackupUrl()

    const json = await githubGetJsonContent(backupUrl, headers)
    if (!json) {
        return
    }

    return githubParseJson(json.content)
}