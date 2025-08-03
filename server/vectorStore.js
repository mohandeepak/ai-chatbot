// server/vectorStore.js
import { getEmbedding } from "./embeddingService.js";
import cosineSimilarity from "compute-cosine-similarity";

const documents = []; // [{ id, text, embedding, meta }]

export async function addToStore(id, text, meta = {}) {
  const embedding = await getEmbedding(text);
  documents.push({ id, text, embedding, meta });
}

export async function queryStore(query, topK = 3) {
  const queryEmbedding = await getEmbedding(query);
  const results = documents
    .map(doc => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return results;
}
