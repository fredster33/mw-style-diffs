export const escHtml = (s) => 
  s.replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;');

const lcs = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  
  const result = [];
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

export const wordDiff = (oldLine, newLine) => {
  const splitWords = (s) => {
    const tokens = [];
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
    
    if (match && match.oldIdx === oi && match.newIdx === ni) {
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