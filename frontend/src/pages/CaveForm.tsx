import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as cavesApi from '../api/caves';
import type { CaveWritePayload, CaveMedia, ApiError } from '../api/caves';

const CaveForm: React.FC = () => {
  const params = useParams();
  const id = params.id;
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CaveWritePayload>({
    registry_id: '',
    plaque_number: '',
    name: '',
    latitude: 46.0,
    longitude: 11.0,
    elevation: null,
    length: null,
    depth_positive: null,
    depth_negative: null,
    municipality: '',
    valley: '',
    geology: null,
    description: '',
    last_survey_date: '',
    is_published: true,
  });

  const [media, setMedia] = useState<CaveMedia[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'survey_pdf' | 'survey_image'>('photo');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const [caveData, mediaData] = await Promise.all([
            cavesApi.fetchCave(id),
            cavesApi.fetchCaveMedia(id)
          ]);
          
          setFormData({
            registry_id: caveData.registry_id,
            plaque_number: caveData.plaque_number || '',
            name: caveData.name,
            latitude: caveData.latitude ?? 0,
            longitude: caveData.longitude ?? 0,
            elevation: caveData.elevation,
            length: caveData.length,
            depth_positive: caveData.depth_positive,
            depth_negative: caveData.depth_negative,
            municipality: caveData.municipality || '',
            valley: caveData.valley || '',
            geology: caveData.geology as CaveWritePayload['geology'],
            description: caveData.description || '',
            last_survey_date: caveData.last_survey_date || '',
            is_published: caveData.is_published,
          });
          setMedia(mediaData);
          setError(null);
        } catch (err) {
          console.error('Error loading cave data:', err);
          setError('Errore durante il caricamento dei dati della grotta. Verifica che il codice catasto sia corretto.');
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [isEditMode, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val === '' ? (type === 'number' ? null : '') : (type === 'number' ? parseFloat(value) : val)
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Explicit validation check to trigger browser popup
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      if (isEditMode && id) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { registry_id, ...updateData } = formData;
        await cavesApi.updateCave(id, updateData);
      } else {
        await cavesApi.createCave(formData);
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Error saving cave:', err);
      const apiErr = err as ApiError;
      if (apiErr.data) {
        setFieldErrors(apiErr.data);
      } else {
        setError('Errore durante il salvataggio della grotta. Riprova più tardi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !id) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', uploadFile);
    formDataUpload.append('media_type', mediaType);
    if (caption) formDataUpload.append('caption', caption);

    try {
      const newMedia = await cavesApi.uploadMedia(id, formDataUpload);
      setMedia(prev => [...prev, newMedia]);
      setUploadFile(null);
      setCaption('');
      const fileInput = document.getElementById('media-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Error uploading media:', err);
      alert('Errore durante l\'upload del file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!window.confirm("Eliminare questo file?")) return;

    try {
      await cavesApi.deleteMedia(mediaId);
      setMedia(prev => prev.filter(m => m.id !== mediaId));
    } catch (err) {
      console.error('Error deleting media:', err);
      alert('Errore durante l\'eliminazione del file.');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950/50 flex flex-col items-center justify-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mb-4"></div>
        <p className="text-teal-400 font-medium">Caricamento in corso...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isEditMode ? `Modifica: ${formData.name}` : 'Nuova grotta'}
        </h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          Annulla
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate={false} className="bg-slate-800 rounded-lg border border-slate-700 shadow-xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registry ID */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Codice catasto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="registry_id"
              value={formData.registry_id}
              onChange={handleChange}
              disabled={isEditMode}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              required
            />
            {fieldErrors.registry_id && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.registry_id[0]}</p>
            )}
          </div>

          {/* Plaque Number */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Numero placchetta</label>
            <input
              type="text"
              name="plaque_number"
              value={formData.plaque_number || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500"
              required
            />
            {fieldErrors.name && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.name[0]}</p>
            )}
          </div>

          {/* Coordinates */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Latitudine <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.000001"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500"
              required
            />
            {fieldErrors.latitude && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.latitude[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Longitudine <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.000001"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500"
              required
            />
            {fieldErrors.longitude && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.longitude[0]}</p>
            )}
          </div>

          {/* Physical specs */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Quota ingresso (m)</label>
            <input
              type="number"
              name="elevation"
              value={formData.elevation ?? ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Estensione spaziale (m)</label>
            <input
              type="number"
              name="length"
              value={formData.length ?? ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Verticale positiva (m)</label>
            <input
              type="number"
              name="depth_positive"
              value={formData.depth_positive ?? ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Verticale negativa (m)</label>
            <input
              type="number"
              name="depth_negative"
              value={formData.depth_negative ?? ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Comune</label>
            <input
              type="text"
              name="municipality"
              value={formData.municipality || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Valle</label>
            <input
              type="text"
              name="valley"
              value={formData.valley || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Geology & Date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Geologia <span className="text-red-500">*</span>
            </label>
            <select
              name="geology"
              value={formData.geology || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">- Seleziona -</option>
              <option value="limestone">Calcare</option>
              <option value="dolomite">Dolomia</option>
              <option value="gypsum">Gesso</option>
              <option value="other">Altro</option>
            </select>
            {fieldErrors.geology && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.geology[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Data ultima modifica <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="last_survey_date"
              value={formData.last_survey_date || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 text-white"
              required
            />
            {fieldErrors.last_survey_date && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.last_survey_date[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">Descrizione</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="w-5 h-5 bg-slate-900 border-slate-700 rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm font-medium text-slate-300">Pubblicata (visibile a tutti)</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-700 rounded-md font-bold text-white transition-colors min-w-[160px]"
          >
            {isSubmitting ? 'Salvataggio...' : 'Salva Grotta'}
          </button>
        </div>
      </form>

      {/* Media Manager Section */}
      {isEditMode && (
        <div className="space-y-6">
          <hr className="border-slate-700" />
          <h2 className="text-2xl font-bold">Gestione media</h2>
          
          <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {media.length === 0 ? (
                  <p className="text-slate-500 text-sm">Nessun file caricato.</p>
                ) : (
                  media.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          item.media_type === 'photo' ? 'bg-blue-900 text-blue-300' : 
                          item.media_type === 'survey_pdf' ? 'bg-red-900 text-red-300' : 'bg-purple-900 text-purple-300'
                        }`}>
                          {item.media_type === 'photo' ? 'Foto' : item.media_type === 'survey_pdf' ? 'PDF' : 'Rilievo'}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{item.caption || item.file_url.split('/').pop()}</p>
                          <p className="text-[10px] text-slate-500">Caricato il {new Date(item.uploaded_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <a 
                          href={item.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                        >
                          Visualizza
                        </a>
                        <button 
                          onClick={() => handleDeleteMedia(item.id)}
                          className="text-xs text-red-400 hover:text-red-300 font-medium"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-900/50 rounded-lg border border-dashed border-slate-600">
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Tipo media</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as 'photo' | 'survey_pdf' | 'survey_image')}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm"
                  >
                    <option value="photo">Foto</option>
                    <option value="survey_pdf">Rilievo PDF</option>
                    <option value="survey_image">Rilievo Immagine</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Didascalia (opzionale)</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm"
                    placeholder="E es. Ingresso grotta"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Seleziona file</label>
                  <input
                    id="media-file"
                    type="file"
                    accept={mediaType === 'survey_pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp'}
                    onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
                    required
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-800 disabled:text-slate-500 rounded font-bold text-sm transition-colors"
                  >
                    {isUploading ? 'Caricamento...' : 'Carica'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaveForm;
