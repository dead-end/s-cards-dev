import { errorStore } from '../stores/errorStore'
import { hashGet, hashPut, Hash } from './hash'

// https://api.github.com/repos/dead-end/cards-russian/contents/data/misc.json

const githubUrl = 'https://api.github.com/repos/dead-end/cards-russian/contents/'

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
 * The file returns the default headers for a github api request.
 */
const githubGetHeaders = () => {
    return {
        Accept: 'application/vnd.github.v3+json'
    }
}

/**
 * The function gets a json file from github.
 * 
 * ERROR the fetch api adds a Pragma header, which is not allowed due to cors.
 */
// TODO: does not work
const githubGetJson2 = async (file: string) => {
    const headers = githubGetHeaders()

    //
    // Get etag if present
    //
    let hash = await hashGet(file)
    if (hash.value) {
        headers['If-None-Match'] = '"' + hash.value + '"'
    }

    const url = githubUrl + file
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

/**
 * The function does a head request and checks a etag possible header with a 
 * given value.
 */
const githubCheckEtag = async (url: string, hash: string) => {

    const response = await fetch(url, { method: 'HEAD' }).catch(e => {
        errorStore.addError(`githubCheckEtag - url: ${url} error: ${e}`)
    })

    if (!response) {
        return false
    }

    if (!response.ok) {
        errorStore.addError(`githubCheckEtag - url: ${url} status: ${response.statusText}`)
        return false
    }

    const etag = response.headers.get('ETag')
    if (!etag) {
        console.log('url :', url, 'no ETag found')
        return false
    }

    const result = etag.endsWith('"' + hash + '"')
    console.log('url :', url, 'ETag', etag, 'matches', result)
    return result
}

/**
 * The function does a get request to a github url and returns the json.
 */
const githubGetJsonContent = async (url: string) => {

    const response = await fetch(url).catch(e => {
        errorStore.addError(`githubGetJsonContent - url: ${url} error: ${e}`)
    })

    if (!response) {
        return
    }

    if (!response.ok) {
        errorStore.addError(`githubGetJsonContent - url: ${url} error: ${response.statusText}`)
        return
    }

    //
    // Get the json data
    //
    return response.json()
}

/**
 * The function gets a json file from github.
 */
export const githubGetJson = async (file: string) => {
    const url = githubUrl + file
    //
    // Get etag if present
    //
    let hash = await hashGet(file)
    if (hash.value) {
        const etagCheck = await githubCheckEtag(url, hash.value)
        if (etagCheck) {
            return
        }
    }

    const json = await githubGetJsonContent(url)
    if (!json) {
        return
    }

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