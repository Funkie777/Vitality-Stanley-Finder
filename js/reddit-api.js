// Fetch and parse Stanley grid data from Reddit's public JSON API.
// Reddit returns Access-Control-Allow-Origin: * for GET requests on
// public posts, so no CORS proxy is needed.

import { extractGrids, normaliseGrid } from './parser.js';

const POSTS = [
  'https://www.reddit.com/r/Vitalityhealth/comments/1nv2kjl',
  'https://www.reddit.com/r/Vitalityhealth/comments/1qashye',
];

const SEARCH_URL =
  'https://www.reddit.com/r/Vitalityhealth/search.json' +
  '?q=stanley+grid&sort=new&limit=20&raw_json=1&restrict_sr=1';

const CACHE_KEY = 'vsf_reddit_cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function extractTexts(data) {
  const texts = [];
  if (!Array.isArray(data)) return texts;

  // data[0] = post listing, data[1] = comments listing
  const postData = data[0]?.data?.children?.[0]?.data;
  if (postData) {
    if (postData.title)    texts.push(postData.title);
    if (postData.selftext) texts.push(postData.selftext);
  }

  function walkComments(children) {
    for (const child of children ?? []) {
      const d = child.data;
      if (d?.body) texts.push(d.body);
      if (d?.replies?.data?.children) walkComments(d.replies.data.children);
    }
  }
  walkComments(data[1]?.data?.children);

  return texts;
}

async function fetchPost(baseUrl) {
  const data = await fetchJSON(`${baseUrl}.json?raw_json=1&limit=500`);
  const texts = extractTexts(data);
  const grids = [];
  for (const text of texts) {
    grids.push(...extractGrids(text, 'reddit'));
  }
  return grids;
}

async function fetchSearch() {
  const data = await fetchJSON(SEARCH_URL);
  const grids = [];
  for (const child of data?.data?.children ?? []) {
    const d = child.data;
    if (d?.selftext) grids.push(...extractGrids(d.selftext, 'reddit'));
    if (d?.title)    grids.push(...extractGrids(d.title,    'reddit'));
  }
  return grids;
}

export async function fetchRedditGrids() {
  // Return cached data if still fresh
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { grids, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp < CACHE_TTL) return grids;
    }
  } catch {/* ignore corrupt cache */}

  const all = [];
  let postsFetched = 0;
  let errors = 0;

  for (const url of POSTS) {
    try {
      const grids = await fetchPost(url);
      all.push(...grids);
      postsFetched++;
    } catch (e) {
      errors++;
      console.warn('[Reddit] Failed to fetch post:', url, e.message);
    }
  }

  try {
    const searchGrids = await fetchSearch();
    all.push(...searchGrids);
  } catch (e) {
    errors++;
    console.warn('[Reddit] Search failed:', e.message);
  }

  const grids = all.map(normaliseGrid);

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      grids,
      timestamp: Date.now(),
      postsFetched,
      errors,
    }));
  } catch {/* localStorage full */}

  return grids;
}

export function clearRedditCache() {
  localStorage.removeItem(CACHE_KEY);
}

export function getRedditCacheInfo() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { timestamp, grids, postsFetched, errors } = JSON.parse(raw);
    return {
      ageMinutes: Math.floor((Date.now() - timestamp) / 60000),
      count: grids.length,
      postsFetched,
      errors,
    };
  } catch {
    return null;
  }
}
