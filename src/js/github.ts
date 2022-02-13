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
 */
export const githubGetJson = async (file: string) => {
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
    })

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
