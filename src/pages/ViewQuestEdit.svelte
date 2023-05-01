<script lang="ts">
  import type { Question, QuestionJson } from '../js/questModel';
  import Markdown from '../js/Markdown';
  import { arrayToString, stringToArray } from '../js/utils';
  import { repoGetJson, repoWriteJson } from '../js/repo';
  import { errorStore } from '../stores/errorStore';
  import { topicGet } from '../js/topicModel';
  import { questLoad } from '../js/questModel';

  const md = new Markdown();

  export let question: Question;
  export let goBackFct: () => void;

  let questHtml = '';
  let answerHtml = '';

  let questStr = arrayToString(question.quest);
  let answerStr = arrayToString(question.answer);

  $: questHtml = md.toHtml(stringToArray(questStr));
  $: answerHtml = md.toHtml(stringToArray(answerStr));

  let comment = `Update question: '${question.id}' in: '${question.file}'`;

  /**
   * Do the update
   */
  const handleSubmit = async () => {
    const readResult = await repoGetJson<QuestionJson[]>(question.file);
    if (readResult.hasError()) {
      errorStore.addError(readResult.getMessage());
      return;
    }

    const value = readResult.getValue();

    for (let i = 0; i < value.json.length; i++) {
      const qa = value.json[i];
      if (qa.id === question.id) {
        qa.quest = stringToArray(questStr);
        qa.answer = stringToArray(answerStr);
        break;
      }
    }

    const writeResult = await repoWriteJson(
      question.file,
      value.json,
      value.hash,
      comment
    );
    if (writeResult.hasError()) {
      errorStore.addError(writeResult.getMessage());
      return;
    }

    await questLoad(question.file);
    await topicGet(question.file);

    goBackFct();
  };
</script>

<div class="card card-shadow content">
  <form on:submit|preventDefault={handleSubmit}>
    <div class="block">
      <h5>Question: {question.id}</h5>
      <div class="grid grid-2">
        <textarea rows="10" id="quest" bind:value={questStr} class="input" />
        <div class="card content is-primary">
          <p>{@html questHtml}</p>
        </div>
      </div>

      <h5>Answer</h5>
      <div class="grid grid-2">
        <textarea rows="10" id="answer" bind:value={answerStr} class="input" />
        <div class="card content is-primary">
          <p>{@html answerHtml}</p>
        </div>
      </div>

      <h5>Comment</h5>
      <input type="input" bind:value={comment} class="input" />
    </div>

    <div class="is-floating">
      <button class="button" on:click={goBackFct}>Back</button>
      <button class="button">Save</button>
    </div>
  </form>
</div>
