import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileCode,
  CheckCircle,
  AlertCircle,
  Eye,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { newspaperService } from '../services/newspaper';
import { HTMLValidationResult, LanguageCode } from '../types';

export const UploadEdition: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [publicationDate, setPublicationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [title, setTitle] = useState<string>('Rise ’n’ Shine – English Daily Broadsheet');
  const [description, setDescription] = useState<string>('');
  const [statusChoice, setStatusChoice] = useState<'draft' | 'published'>('published');

  // File states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<HTMLValidationResult | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // Progress and UX states
  const [validating, setValidating] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Duplicate Confirmation Dialog State
  const [duplicateConflict, setDuplicateConflict] = useState<{
    message: string;
    existing_id: number;
  } | null>(null);
  const [autoReplace, setAutoReplace] = useState<boolean>(true);

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Language auto-update default title
  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    if (newLang === 'en') {
      setTitle('Rise ’n’ Shine – English Daily Broadsheet');
    } else if (newLang === 'te') {
      setTitle('రైజ్ ’న్’ షైన్ – తెలుగు ప్రధాన సంచిక');
    } else if (newLang === 'hi') {
      setTitle('राइज ’न’ शाइन – हिंदी राष्ट्रीय संस्करण');
    }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.html') && !file.name.toLowerCase().endsWith('.htm')) {
      setErrorMessage('Please select a valid HTML file (.html or .htm).');
      setSelectedFile(null);
      setValidationResult(null);
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setValidationResult(null);
    setPreviewHtml(null);

    // Read preview text in memory
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewHtml(event.target?.result as string);
    };
    reader.readAsText(file, 'utf-8');

    // Run backend validation & sanitization check
    try {
      setValidating(true);
      const result = await newspaperService.validateHTML(file);
      setValidationResult(result);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || 'HTML file validation failed. Ensure valid UTF-8 encoding.'
      );
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e?: React.SyntheticEvent, forceConfirm = false) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedFile) {
      setErrorMessage('Please select an HTML file to upload.');
      return;
    }

    const effectiveTitle = (title.trim() || selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', effectiveTitle);
    formData.append('language', language);
    formData.append('publication_date', publicationDate);
    if (description.trim()) {
      formData.append('description', description.trim());
    }
    formData.append('status_choice', statusChoice);
    if (forceConfirm || autoReplace) {
      formData.append('confirm_replace', 'true');
      formData.append('auto_replace', 'true');
    }

    try {
      setUploading(true);
      const uploaded = await newspaperService.uploadEdition(formData);
      setDuplicateConflict(null);
      setSuccessMessage(
        `Successfully published & updated edition #${uploaded.id}: "${uploaded.title}". Previous latest news deleted and new latest news updated automatically!`
      );
      setTimeout(() => {
        navigate('/admin/editions');
      }, 1500);
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Duplicate conflict requiring explicit admin confirmation
        const data = err.response.data?.detail;
        setDuplicateConflict({
          message: data?.message || `An edition for ${language.toUpperCase()} on ${publicationDate} already exists.`,
          existing_id: data?.existing_id,
        });
      } else {
        setErrorMessage(
          err.response?.data?.detail || 'Upload failed. Please check backend connectivity and validation.'
        );
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Title */}
      <div className="border-b border-brand-border pb-5">
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
          Publishing Pipeline
        </span>
        <h1 className="font-headline text-2xl sm:text-3xl font-black text-brand-charcoal mt-1">
          Upload Newspaper Broadsheet
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Upload and validate daily HTML newspaper files. Sanitized content is stored directly in Neon PostgreSQL TEXT storage.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Step 1: Language & Publication Date */}
        <div className="bg-white border border-brand-border rounded-xl p-6 shadow-subtle space-y-5">
          <h3 className="font-headline text-lg font-bold text-brand-charcoal flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center font-mono">
              1
            </span>
            <span>Edition Target & Scheduling</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                Newspaper Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    language === 'en'
                      ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                      : 'border-brand-border text-brand-charcoal hover:bg-gray-50'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('te')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all font-telugu ${
                    language === 'te'
                      ? 'bg-brand-green text-brand-charcoal border-lime-400 shadow-sm'
                      : 'border-brand-border text-brand-charcoal hover:bg-gray-50'
                  }`}
                >
                  తెలుగు
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('hi')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all font-hindi ${
                    language === 'hi'
                      ? 'bg-brand-yellow text-brand-charcoal border-amber-300 shadow-sm'
                      : 'border-brand-border text-brand-charcoal hover:bg-gray-50'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            {/* Publication Date */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                Publication Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                <input
                  type="date"
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue bg-white font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Title and Description */}
        <div className="bg-white border border-brand-border rounded-xl p-6 shadow-subtle space-y-5">
          <h3 className="font-headline text-lg font-bold text-brand-charcoal flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center font-mono">
              2
            </span>
            <span>Edition Metadata</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                Edition Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue bg-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                Summary / Editorial Notes (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief summary of lead stories, headline features, or volume notes..."
                className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-blue bg-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* Step 3: HTML File Upload & Validation */}
        <div className="bg-white border border-brand-border rounded-xl p-6 shadow-subtle space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold text-brand-charcoal flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center font-mono">
                3
              </span>
              <span>Upload HTML Newspaper File</span>
            </h3>
            <span className="text-[11px] text-brand-muted">Max Limit: 5 MB</span>
          </div>

          {/* Drag & Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              selectedFile
                ? 'border-brand-green bg-green-50/20'
                : 'border-brand-border hover:border-brand-blue hover:bg-gray-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-charcoal">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop newspaper HTML file'}
                </p>
                <p className="text-[11px] text-brand-muted mt-1">
                  Only .html and .htm files are supported. Must be UTF-8 encoded.
                </p>
              </div>
              {selectedFile && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white border border-brand-border text-xs font-mono">
                  <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>
          </div>

          {/* Validation Feedback Strip */}
          {validating && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs text-brand-blue flex items-center gap-3">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing HTML encoding and sanitizing tags...</span>
            </div>
          )}

          {validationResult && (
            <div className="p-4 rounded-lg bg-green-50 border border-brand-green text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Validation Passed • Clean BroadSheet Structure</span>
                </span>
                <span className="text-[11px] font-mono">
                  Sanitized Size: {(validationResult.content_size_bytes / 1024).toFixed(1)} KB
                </span>
              </div>

              {validationResult.warning && (
                <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                  {validationResult.warning}
                </div>
              )}

              {/* Sample headings parsed */}
              {validationResult.sample_headings?.length > 0 && (
                <div className="text-[11px] text-brand-muted">
                  <span className="font-bold text-brand-charcoal">Parsed Headline: </span>
                  <span>{validationResult.sample_headings[0]}</span>
                </div>
              )}

              {/* Preview Button */}
              {previewHtml && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-brand-blue bg-white text-brand-blue text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Broadsheet Preview</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 4: Publishing Status & Action */}
        <div className="bg-white border border-brand-border rounded-xl p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
              Publishing State
            </span>
            <div className="flex items-center gap-4 text-xs font-medium">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={statusChoice === 'published'}
                  onChange={() => setStatusChoice('published')}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                <span>Publish Immediately</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={statusChoice === 'draft'}
                  onChange={() => setStatusChoice('draft')}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                <span>Save as Draft</span>
              </label>
            </div>
          </div>

          {/* Auto-replace & clean latest news option */}
          <div className="pt-3 border-t border-brand-border">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-brand-charcoal">
              <input
                type="checkbox"
                checked={autoReplace}
                onChange={(e) => setAutoReplace(e.target.checked)}
                className="h-4 w-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue"
              />
              <span className="leading-snug">
                <strong className="text-brand-blue">Auto-replace existing edition</strong> & automatically delete previous latest news to show new latest news
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/editions')}
              className="px-4 py-2.5 rounded-lg border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || uploading || validating}
              className="px-6 py-2.5 rounded-lg bg-brand-blue text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-subtle disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <span>Writing to Database...</span>
              ) : (
                <>
                  <span>{statusChoice === 'published' ? 'Publish Edition' : 'Save Draft'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Duplicate Edition Confirmation Modal */}
      {duplicateConflict && (
        <Modal
          isOpen={!!duplicateConflict}
          onClose={() => setDuplicateConflict(null)}
          title="Edition Already Exists"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-xs text-amber-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Duplicate Edition Detected</p>
                <p className="mt-1 leading-relaxed">{duplicateConflict.message}</p>
              </div>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              In accordance with editorial safety rules, confirming replacement will overwrite this edition's broadsheet HTML in PostgreSQL, <strong>delete previous latest news</strong> for this language, and <strong>show the new latest news</strong> extracted from this file.
            </p>
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
              <button
                type="button"
                onClick={() => setDuplicateConflict(null)}
                disabled={uploading}
                className="px-4 py-2 rounded-lg border border-brand-border text-xs font-bold hover:bg-gray-50 disabled:opacity-50"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={uploading}
                className="px-4 py-2 rounded-lg bg-brand-blue text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-800 flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Replacing & Updating Latest News...</span>
                  </>
                ) : (
                  <span>Confirm Replacement & Update Latest News</span>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Live Sandboxed Broadsheet Preview Modal */}
      {showPreviewModal && previewHtml && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title={`Preview: ${title}`}
          maxWidth="full"
        >
          <div className="space-y-4">
            <div className="p-2.5 bg-gray-50 rounded border border-brand-border text-xs text-brand-muted flex items-center justify-between">
              <span>Sandboxed preview rendering in secure iframe</span>
              <span className="font-bold text-brand-blue uppercase">{language} DESK</span>
            </div>
            <div className="w-full h-[650px] border border-brand-border rounded overflow-hidden bg-white shadow-inner">
              <iframe
                title="Preview"
                srcDoc={previewHtml}
                sandbox="allow-same-origin"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
