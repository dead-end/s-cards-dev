<script lang="ts">
  import { viewStore } from '../stores/viewStore';
  import { errorStore } from '../stores/errorStore';

  let srcLabel = 'German';
  let dstLabel = 'Russian';

  let srcLang = 'de';
  let dstLang = 'ru';

  let srcValue: string = '';
  let dstValue: string = '';

  /**
   * The function calls the translation api.
   */
  const onTranslate = () => {
    if (!srcValue) {
      return;
    }

    fetch('https://libretranslate.de/translate', {
      method: 'POST',
      body: JSON.stringify({
        q: srcValue,
        source: srcLang,
        target: dstLang,
        format: 'text'
      }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then((res) => {
        if (!res.ok) {
          errorStore.addError(`Unable to get JSON: ${res.statusText}`);
        }
        return res.json();
      })
      .then((json) => {
        dstValue = json['translatedText'];
      });
  };

  /**
   * The function switches the
   */
  const onSwitch = () => {
    if (srcLang === 'de') {
      srcLabel = 'Russian';
      dstLabel = 'German';

      srcLang = 'ru';
      dstLang = 'de';
    } else {
      srcLabel = 'German';
      dstLabel = 'Russian';

      srcLang = 'de';
      dstLang = 'ru';
    }

    srcValue = dstValue;

    onTranslate();
  };

  /**
   * The function resets the translation values.
   */
  const onReset = () => {
    srcValue = '';
    dstValue = '';
  };

  /**
   * The function selets the back view.
   */
  const onBack = () => {
    viewStore.setView('ViewTopicList');
  };
</script>

<h4>Translate</h4>

<label for="src">{srcLabel}</label>
<textarea id="src" bind:value={srcValue} />

<label for="dst">{dstLabel}</label>
<textarea id="dst" readonly value={dstValue} />

<div class="is-floating">
  <button class="button" on:click={() => onBack()}>Back</button>
  <button class="button" on:click={() => onTranslate()}>Translate</button>
  <button class="button" on:click={() => onReset()}>Reset</button>
  <button class="button" on:click={() => onSwitch()}>Switch</button>
</div>

<p>
  The translation is done with <a href="https://libretranslate.de/"
    >LibreTranslate</a
  >
</p>
