const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');
const { pipeline, QuestionAnsweringPipeline } = require('@huggingface/node-tensorflow');
const { Tokenizer } = require('@huggingface/tokenizers');
const { TFAutoModelForQuestionAnswering } = require('@huggingface/node-tensorflow/dist/models');
const { Nlp } = require('@huggingface/nlp');
const path = require('path');

async function loadModel() {
  const model = await QuestionAnsweringPipeline.fromOptions({
    model: 'bert-large-uncased-whole-word-masking-finetuned-squad',
    tokenizer: { do_lower_case: true },
    framework: 'tfjs-node'
  });

  return model;
}

async function readTxtFiles(directoryPath) {
  const fileContents = [];

  fs.readdirSync(directoryPath).forEach((file) => {
    if (file.endsWith('.txt')) {
      const filePath = path.join(directoryPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      fileContents.push({ fileName: file, content });
    }
  });

  return fileContents;
}

async function preprocessDocuments(documents, tokenizer) {
  const inputIds = [];
  const attentionMasks = [];

  for (const doc of documents) {
    const encoding = await tokenizer.encode(doc.content, { addSpecialTokens: true });
    inputIds.push(encoding.input_ids);
    attentionMasks.push(encoding.attention_mask);
  }

  return { inputIds, attentionMasks };
}

async function semanticSearch(keyword, documents, model, tokenizer) {
  const { inputIds, attentionMasks } = await preprocessDocuments(documents, tokenizer);

  const queryEncoding = await tokenizer.encode(keyword, { addSpecialTokens: true });
  const queryInput = {
    input_ids: tf.tensor([queryEncoding.input_ids]),
    attention_mask: tf.tensor([queryEncoding.attention_mask]),
  };

  const scores = inputIds.map((inputId, index) => {
    const documentInput = {
      input_ids: tf.tensor([inputId]),
      attention_mask: tf.tensor([attentionMasks[index]]),
    };
    const results = model.predict(documentInput, queryInput);
    const score = results[0].dataSync()[0];
    results.forEach((tensor) => tensor.dispose());
    return score;
  });

  const rankedDocuments = documents.map((doc, index) => ({ fileName: doc.fileName, content: doc.content, score: scores[index] }));
  rankedDocuments.sort((a, b) => b.score - a.score);

  return rankedDocuments;
}

async function do_semantic_search(keyword) {
  try {
    const model = await loadModel();

    const directoryPath = 'outputs/';
    const numResults = 5;

    const documents = await readTxtFiles(directoryPath);

    const tokenizer = await Tokenizer.fromOptions({ do_lower_case: true });
    const searchResults = await semanticSearch(keyword, documents, model, tokenizer);

    console.log(`Semantic search results for keyword "${keyword}":`);
    searchResults.slice(0, numResults).forEach((result, index) => {
      console.log(`${index + 1}. File: ${result.fileName} | Score: ${result.score}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

