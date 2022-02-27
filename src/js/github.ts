import { errorStore } from '../stores/errorStore'
import { hashGet, hashPut, Hash } from './hash'
import { adminStore, Admin } from '../stores/adminStore'
import { get } from 'svelte/store'

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
const githubParseJson = (content: any) => {
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
    const admin = get(adminStore)
    const url = admin.langUrl + file
    const headers = githubGetHeader(admin)
    //
    // Get etag if present
    //
    let hash = await hashGet(file)
    if (hash.value) {
        const etagCheck = await githubCheckEtag(url, headers, hash.value)
        if (etagCheck) {
            return
        }
    }

    const json = await githubGetJsonContent(url, headers)
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

    const admin = get(adminStore)
    const url = admin.backupUrl + admin.file + '.json'
    const headers = githubGetHeader(admin)

    const sha = await githubGetEtag(url, headers)
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

    const response = await fetch(url, data).catch(e => {
        errorStore.addError(`githubBackup - url: ${url} error: ${e}`)
    })

    if (!response) {
        return
    }

    if (!response.ok) {
        errorStore.addError(`githubBackup - url: ${url} error: ${response.statusText}`)
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

    const admin = get(adminStore)
    const url = admin.backupUrl + admin.file + '.json'
    const headers = githubGetHeader(admin)

    const json = await githubGetJsonContent(url, headers)
    if (!json) {
        return
    }

    return githubParseJson(json.content)
}

// ----------------------------------------------------------------------------

/**
 * The function gets a json file from github.
 * 
 * ERROR the fetch api adds a Pragma header, which is not allowed due to cors.
 */
// TODO: does not work
const githubGetJson2 = async (file: string) => {
    const headers = githubGetHeader()

    //
    // Get etag if present
    //
    let hash = await hashGet(file)
    if (hash.value) {
        headers['If-None-Match'] = '"' + hash.value + '"'
    }

    const url = get(adminStore).langUrl + file
    const response = await fetch(url, {
        headers: headers
    }).catch(e => {
        errorStore.addError(`githubGetJson - url: ${url} error: ${e}`)
    })

    if (!response) {
        return
    }

    if (response.status === 304) {
        console.log('File is up to date:', file)
        return
    }

    if (!response.ok) {
        errorStore.addError(`githubGetJson - url: ${url} error: ${response.statusText}`)
        return
    }

    //
    // Get the json data
    //
    const json = await response.json()

    let result: any
    try {
        result = JSON.parse(b64_to_utf8(json.content))
    } catch (e) {
        errorStore.addError(`githubGetJson - url: ${url} unable to parse data: ${e}`)
        return
    }

    //
    // Update the hash in the store
    //
    hash.value = json.sha
    hash.lastLoaded = new Date()
    await hashPut(hash)

    console.log('githubGetJson', result)
    return result
}