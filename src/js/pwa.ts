/**
 * PWA service worker registration.
 */
export const pwaSerivceWorkerRegister = async () => {

    if ('serviceWorker' in navigator) {
        //
        // Finish registration, before we init app.
        //
        const registration = await navigator.serviceWorker.register(
            'service-worker.js'
        )
        console.log(
            'Registration of serivce worker done - scope:',
            registration.scope
        )
    }
}