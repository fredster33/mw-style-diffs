import { useState, useCallback, useRef, useEffect } from 'react';
import { lcs, wordDiff, escHtml } from '../src/DiffLogic';
import '../src/MWStyleDiffs.css';

export default function MWStyleDiffs() {
  const [oldText, setOldText] = useState('The quick brown fox jumps over the lazy dog.\n\nThis is a sample paragraph that will be changed.\n\nThis line stays the same.');
  const [newText, setNewText] = useState('The quick red fox leaps over the lazy dog.\n\nThis is a modified paragraph that has been updated.\n\nThis line stays the same.\n\nA new paragraph was added.');
  const [diffHtml, setDiffHtml] = useState('');
  const outputRef = useRef(null);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
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
          <td class="diff-marker" aria-label="Unchanged"><span aria-hidden="true"></span></td>
          <td class="diff-context"><div>${line || '&nbsp;'}</div></td>
          <td class="diff-marker" aria-label="Unchanged"><span aria-hidden="true"></span></td>
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
            <td class="diff-marker" aria-label="Removed"><span aria-hidden="true">−</span></td>
            <td class="diff-deletedline diff-side-deleted"><div>${wd.old || '&nbsp;'}</div></td>
            <td class="diff-marker" aria-label="Added"><span aria-hidden="true">+</span></td>
            <td class="diff-addedline diff-side-added"><div>${wd.new || '&nbsp;'}</div></td>
          </tr>`;
        }

        for (let k = maxPairs; k < deletedLines.length; k++) {
          html += `<tr>
            <td class="diff-marker" aria-label="Removed"><span aria-hidden="true">−</span></td>
            <td class="diff-deletedline diff-side-deleted"><div>${escHtml(deletedLines[k]) || '&nbsp;'}</div></td>
            <td class="diff-marker" aria-label="Empty"><span aria-hidden="true"></span></td>
            <td class="diff-empty"></td>
          </tr>`;
        }

        for (let k = maxPairs; k < addedLines.length; k++) {
          html += `<tr>
            <td class="diff-marker" aria-label="Empty"><span aria-hidden="true"></span></td>
            <td class="diff-empty"></td>
            <td class="diff-marker" aria-label="Added"><span aria-hidden="true">+</span></td>
            <td class="diff-addedline diff-side-added"><div>${escHtml(addedLines[k]) || '&nbsp;'}</div></td>
          </tr>`;
        }
      }
    }

    if (!html) {
      html = '<tr><td colSpan="4" class="diff-notice">No differences found — texts are identical</td></tr>';
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

  useEffect(() => {
    if (diffHtml && outputRef.current) {
      outputRef.current.focus();
    }
  }, [diffHtml]);

  return (
    <div className="mw-diff-app">
      <header className="wiki-panel wiki-panel-header">
        <h1>
          <img src="/favicon.svg" alt="" className="header-icon" />
          MediaWiki-Style Diff Generator
        </h1>
      </header>

      <main>
        <div className="wiki-panel">
          <div className="wiki-panel-body">
            <form id="diff-form" onSubmit={handleSubmit}>
              <div className="input-grid">
                <section>
                  <label htmlFor="old-text" className="input-label">Old Version</label>
                  <textarea
                    id="old-text"
                    name="old-text"
                    className="wiki-textarea"
                    value={oldText}
                    onChange={(e) => setOldText(e.target.value)}
                    placeholder="Enter original text..."
                  />
                </section>
                <section>
                  <label htmlFor="new-text" className="input-label">New Version</label>
                  <textarea
                    id="new-text"
                    name="new-text"
                    className="wiki-textarea"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter modified text..."
                  />
                </section>
              </div>
              <div className="btn-row">
                <button type="submit" className="wiki-btn wiki-btn-primary">
                  Compare Versions
                </button>
                <button type="button" className="wiki-btn wiki-btn-secondary" onClick={swapTexts}>
                  <span aria-hidden="true">⇄ </span>Swap
                </button>
                <button type="button" className="wiki-btn wiki-btn-secondary" onClick={clearAll}>
                  Clear All
                </button>
              </div>
            </form>
          </div>
        </div>

        <output
          className="wiki-panel"
          form="diff-form"
          name="diff-result"
          htmlFor="old-text new-text"
          ref={outputRef}
          tabIndex="-1"
        >
          {diffHtml ? (
            <div className="diff-table-wrapper">
              <table className="diff-table" aria-label="Diff results">
                <colgroup>
                  <col style={{width: '20px'}} />
                  <col style={{width: 'calc(50% - 20px)'}} />
                  <col style={{width: '20px'}} />
                  <col style={{width: 'calc(50% - 20px)'}} />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col" colSpan="2"><span aria-hidden="true">← </span>Old text</th>
                    <th scope="col" colSpan="2">New text<span aria-hidden="true"> →</span></th>
                  </tr>
                </thead>
                <tbody dangerouslySetInnerHTML={{ __html: diffHtml }} />
                <tfoot>
                  <tr>
                    <td colSpan="4" className="diff-legend">
                      <strong>Legend: </strong>
                      <ul className="legend-list">
                        <li className="legend-item legend-removed">Removed line</li>
                        <li className="legend-item legend-added">Added line</li>
                        <li className="legend-item legend-change-del">Removed text</li>
                        <li className="legend-item legend-change-add">Added text</li>
                      </ul>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="placeholder">
              Enter text in both fields and click <strong>Compare Versions</strong> to see the diff.
            </div>
          )}
        </output>
      </main>

      <footer className="app-footer">
        made with ❤️ by <a href="https://github.com/fredster33/mw-style-diffs" target="_blank" rel="noopener">fredster33</a>
      </footer>
    </div>
  );
}