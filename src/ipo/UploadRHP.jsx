import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { uploadRHP } from '../services/ipoApi';

const MAX_MB = 30;

export default function UploadRHP({ ipo, onAnalysisReady }) {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setStatus('error');
      setMessage('Please upload a PDF file.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setStatus('error');
      setMessage(`File is too large — max ${MAX_MB}MB.`);
      return;
    }

    setFileName(file.name);
    setStatus('uploading');
    setMessage('Reading and analyzing the document — this can take up to a minute…');

    try {
      const analysis = await uploadRHP(ipo.id, file);
      setStatus('success');
      setMessage('Analysis updated from your uploaded document.');
      onAnalysisReady?.(analysis);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Upload failed. Please try again.');
    }
  };

  return (
    <section className="ipo-section-block" id="upload-rhp">
      <div className="section-label-tag">RHP</div>
      <h2 className="section-title">Have the RHP? Upload It</h2>
      <p className="section-subtitle">
        Didn't find the right filing automatically, or want the analysis grounded in a specific document? Upload the Red Herring Prospectus PDF directly — it takes priority over anything found automatically.
      </p>
      <div
        className={`upload-dropzone glass-card ${dragging ? 'dragging' : ''} ${status}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => status !== 'uploading' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={e => handleFile(e.target.files?.[0])}
        />
        {status === 'uploading' ? (
          <>
            <Loader2 size={32} className="spinning" />
            <p className="upload-title">Processing {fileName}…</p>
            <p className="upload-hint">{message}</p>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 size={32} color="var(--green)" />
            <p className="upload-title">{fileName}</p>
            <p className="upload-hint">{message}</p>
          </>
        ) : status === 'error' ? (
          <>
            <AlertTriangle size={32} color="var(--red)" />
            <p className="upload-title">Upload failed</p>
            <p className="upload-hint">{message}</p>
          </>
        ) : (
          <>
            <UploadCloud size={32} />
            <p className="upload-title">Drag and drop the RHP PDF here, or click to browse</p>
            <p className="upload-hint"><FileText size={12} /> PDF only, up to {MAX_MB}MB</p>
          </>
        )}
      </div>
    </section>
  );
}
