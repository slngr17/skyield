import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image } from 'lucide-react';

export default function ImageUploader({ onFileSelect, preview, onClear }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-white/10">
        <img
          src={preview}
          alt="Rooftop preview"
          className="w-full h-64 object-cover"
        />
        <button
          onClick={onClear}
          className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 backdrop-blur-sm text-white p-1.5 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm text-emerald-300 flex items-center gap-2">
          <Image size={14} />
          Image uploaded
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
        isDragActive
          ? 'border-emerald-400 bg-emerald-400/10'
          : 'border-white/20 hover:border-white/40 bg-white/5'
      }`}
    >
      <input {...getInputProps()} />
      <Upload
        size={40}
        className={`mb-3 ${isDragActive ? 'text-emerald-400' : 'text-gray-500'}`}
      />
      <p className="text-sm text-gray-400 text-center px-4">
        {isDragActive ? (
          <span className="text-emerald-400 font-medium">Drop your rooftop image here</span>
        ) : (
          <>
            <span className="font-medium text-gray-300">Drag & drop</span> a rooftop photo here, or{' '}
            <span className="text-emerald-400 font-medium">click to browse</span>
          </>
        )}
      </p>
      <p className="text-xs text-gray-600 mt-2">Supports JPG, PNG, WebP</p>
    </div>
  );
}
