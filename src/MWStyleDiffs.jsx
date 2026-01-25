import { useState, useCallback } from 'react';
import { lcs, wordDiff, escHtml } from '../src/DiffLogic';
import '../src/MWStyleDiffs.css';

export default function MWStyleDiffs() {
  const [oldText, setOldText] = useState('The quick brown fox jumps over the lazy dog.\n\nThis is a sample paragraph that will be changed.\n\nThis line stays the same.');
  const [newText, setNewText] = useState('The quick red fox leaps over the lazy dog.\n\nThis is a modified paragraph that has been updated.\n\nThis line stays the same.\n\nA new paragraph was added.');
  const [diffHtml, setDiffHtml] = useState('');

  const generateDiff = useCallback(() => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const common = lcs(oldLines, newLines);
    
    let html = '';
    let oi = 0, ni = 0, ci = 0;
    
    while (oi < oldLines.length || ni < newLines.length) {
      const match = ci < common.length ? common[ci] : null;
      
      if (match && match.oldIdx === oi && match.newIdx === ni) {
        const line = escHtml(oldLines[oi]);
        html += `<tr>
          <td class="diff-marker" data-marker=""></td>
          <td class="diff-context"><div>${line || '&nbsp;'}</div></td>
          <td class="diff-marker" data-marker=""></td>
          <td class="diff-context"><div>${line || '&nbsp;'}</div></td>
        </tr>`;
        oi++; ni++; ci++;
      } else {
        const nextOldIdx = match ? match.oldIdx : oldLines.length;
        const nextNewIdx = match ? match.newIdx : newLines.length;
        
        const deletedLines = [];
        const addedLines = [];
        
        while (oi < nextOldIdx) deletedLines.push(oldLines[oi++]);
        while (ni < nextNewIdx) addedLines.push(newLines[ni++]);
        
        const maxPairs = Math.min(deletedLines.length, addedLines.length);
        
        for (let k = 0; k < maxPairs; k++) {
          const wd = wordDiff(deletedLines[k], addedLines[k]);
          html += `<tr>
            <td class="diff-marker" data-marker="−"></td>
            <td class="diff-deletedline diff-side-deleted"><div>${wd.old || '&nbsp;'}</div></td>
            <td class="diff-marker" data-marker="+"></td>
            <td class="diff-addedline diff-side-added"><div>${wd.new || '&nbsp;'}</div></td>
          </tr>`;
        }
        
        for (let k = maxPairs; k < deletedLines.length; k++) {
          html += `<tr>
            <td class="diff-marker" data-marker="−"></td>
            <td class="diff-deletedline diff-side-deleted"><div>${escHtml(deletedLines[k]) || '&nbsp;'}</div></td>
            <td class="diff-marker"></td>
            <td class="diff-empty"></td>
          </tr>`;
        }
        
        for (let k = maxPairs; k < addedLines.length; k++) {
          html += `<tr>
            <td class="diff-marker"></td>
            <td class="diff-empty"></td>
            <td class="diff-marker" data-marker="+"></td>
            <td class="diff-addedline diff-side-added"><div>${escHtml(addedLines[k]) || '&nbsp;'}</div></td>
          </tr>`;
        }
      }
    }
    
    if (!html) {
      html = '<tr><td colspan="4" class="diff-notice">No differences found — texts are identical</td></tr>';
    }
    
    setDiffHtml(html);
  }, [oldText, newText]);

  const clearAll = () => {
    setOldText('');
    setNewText('');
    setDiffHtml('');
  };

  const swapTexts = () => {
    setOldText(newText);
    setNewText(oldText);
    setDiffHtml('');
  };

  return (
    <div className="mw-diff-app">
      <div className="wiki-panel">
        <div className="wiki-panel-header">
          <h1>MediaWiki-Style Diff Generator</h1>
        </div>
        <div className="wiki-panel-body">
          <div className="input-grid">
            <div>
              <label className="input-label">Old Version</label>
              <textarea
                className="wiki-textarea"
                value={oldText}
                onChange={(e) => setOldText(e.target.value)}
                placeholder="Enter original text..."
              />
            </div>
            <div>
              <label className="input-label">New Version</label>
              <textarea
                className="wiki-textarea"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter modified text..."
              />
            </div>
          </div>
          <div className="btn-row">
            <button className="wiki-btn wiki-btn-primary" onClick={generateDiff}>
              Compare Versions
            </button>
            <button className="wiki-btn wiki-btn-secondary" onClick={swapTexts}>
              ⇄ Swap
            </button>
            <button className="wiki-btn wiki-btn-secondary" onClick={clearAll}>
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="wiki-panel">
        {diffHtml ? (
          <>
            <div className="diff-header">
              <span>← Old text</span>
              <span>New text →</span>
            </div>
            <div className="diff-table-wrapper">
              <table className="diff-table">
                <colgroup>
                  <col style={{width: '20px'}} />
                  <col style={{width: 'calc(50% - 20px)'}} />
                  <col style={{width: '20px'}} />
                  <col style={{width: 'calc(50% - 20px)'}} />
                </colgroup>
                <tbody dangerouslySetInnerHTML={{ __html: diffHtml }} />
              </table>
            </div>
            <div className="diff-legend">
              <strong>Legend: </strong>
              <span className="legend-item legend-removed">Removed line</span>
              <span className="legend-item legend-added">Added line</span>
              <span className="legend-item legend-change-del">Removed text</span>
              <span className="legend-item legend-change-add">Added text</span>
            </div>
          </>
        ) : (
          <div className="placeholder">
            Enter text in both fields and click <strong>Compare Versions</strong> to see the diff.
          </div>
        )}
      </div>
    </div>
  );
}