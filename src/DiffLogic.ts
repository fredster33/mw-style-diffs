interface LCSMatch {
  type: 'same';
  oldIdx: number;
  newIdx: number;
}

interface WordDiffResult {
  old: string;
  new: string;
}

export const escHtml = (s: string): string =>
  s.replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;');

const lcs = (a: string[], b: string[]): LCSMatch[] => {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array.from({ length: n + 1 }, () => 0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }

  const result: LCSMatch[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i-1] === b[j-1]) {
      result.unshift({ type: 'same', oldIdx: i-1, newIdx: j-1 });
      i--; j--;
    } else if (dp[i-1][j] > dp[i][j-1]) {
      i--;
    } else {
      j--;
    }
  }
  return result;
};

export const wordDiff = (oldLine: string, newLine: string): WordDiffResult => {
  const splitWords = (s: string): string[] => {
    const tokens: string[] = [];
    let current = '';
    for (const ch of s) {
      if (/\s/.test(ch)) {
        if (current) { tokens.push(current); current = ''; }
        tokens.push(ch);
      } else {
        current += ch;
      }
    }
    if (current) tokens.push(current);
    return tokens;
  };

  const oldWords = splitWords(oldLine);
  const newWords = splitWords(newLine);
  const common = lcs(oldWords, newWords);

  let oldResult = '', newResult = '';
  let oi = 0, ni = 0, ci = 0;

  while (oi < oldWords.length || ni < newWords.length) {
    const match = ci < common.length ? common[ci] : null;

    if (match?.oldIdx === oi && match.newIdx === ni) {
      oldResult += escHtml(oldWords[oi]);
      newResult += escHtml(newWords[ni]);
      oi++; ni++; ci++;
    } else {
      let delChunk = '';
      while (oi < oldWords.length && (!match || match.oldIdx > oi)) {
        delChunk += oldWords[oi++];
      }
      if (delChunk) {
        oldResult += `<del class="diffchange diffchange-inline">${escHtml(delChunk)}</del>`;
      }

      let addChunk = '';
      while (ni < newWords.length && (!match || match.newIdx > ni)) {
        addChunk += newWords[ni++];
      }
      if (addChunk) {
        newResult += `<ins class="diffchange diffchange-inline">${escHtml(addChunk)}</ins>`;
      }
    }
  }

  return { old: oldResult, new: newResult };
};

export { lcs };