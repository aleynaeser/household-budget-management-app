'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';

export function CameraUpload({
  onImageCapture,
  onImageUpload,
  isLoading = false,
}: ICameraUploadProps & { isLoading?: boolean }) {
  const [showCamera, setShowCamera] = useState(false);
  const [showFullscreenCamera, setShowFullscreenCamera] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Kamera izni durumunu kontrol et
  const checkCameraPermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setCameraPermission(permission.state);

        permission.onchange = () => {
          setCameraPermission(permission.state);
        };
      }
    } catch (error) {
      console.log('Permission API desteklenmiyor', error);
    }
  };

  // Component mount olduğunda izin durumunu kontrol et
  React.useEffect(() => {
    checkCameraPermission();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };

  const startCamera = async () => {
    try {
      // Önce kamera desteğini kontrol et
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Bu tarayıcı kamera erişimini desteklemiyor');
        return;
      }

      // Kamera izni iste
      const constraints = {
        video: {
          facingMode: facingMode,
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Önce kamera UI'ını göster, sonra video'yu bağla
      setShowCamera(true);

      // Kısa bir gecikme ile video ref'i kontrol et
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      let errorMessage = 'Kamera erişimi başarısız oldu.';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Kamera izni reddedildi. Lütfen tarayıcı ayarlarından kamera iznini verin.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Kamera bulunamadı.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Bu tarayıcı kamera erişimini desteklemiyor.';
        }
      }

      alert(errorMessage);
    }
  };

  const openFullscreenCamera = () => {
    setShowFullscreenCamera(true);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], 'receipt-photo.jpg', { type: 'image/jpeg' });
              setPreview(URL.createObjectURL(blob));
              onImageCapture(file);
              stopCamera();
            }
          },
          'image/jpeg',
          0.8,
        );
      }
    }
  };

  const switchCamera = async () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    await stopCamera();
    await startCamera();
  };

  const stopCamera = async () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
    setShowFullscreenCamera(false);
  };

  const resetPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (preview) {
    return (
      <div className='space-y-4 text-center'>
        <div className='relative inline-block'>
          <img src={preview} alt='Seçilen resim' className='h-auto max-h-96 max-w-full rounded-lg border border-gray-600' />

          <button
            onClick={resetPreview}
            className='absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
        <p className='text-sm text-gray-400'>Resim seçildi. Analiz başlatılıyor...</p>
      </div>
    );
  }

  if (showCamera && !showFullscreenCamera) {
    return (
      <div className='space-y-4'>
        <div className='relative mx-auto max-w-md'>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className='h-64 w-full rounded-lg object-cover'
            style={{
              transform: 'scaleX(-1)', // Ayna efekti
              WebkitTransform: 'scaleX(-1)', // Safari desteği
            }}
          />
          <canvas ref={canvasRef} className='hidden' />
        </div>

        <div className='flex justify-center space-x-4'>
          <button
            onClick={openFullscreenCamera}
            className='flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700'
          >
            <Camera className='h-5 w-5' />
            <span>Tam Ekran Çek</span>
          </button>

          <button
            onClick={capturePhoto}
            disabled={isLoading}
            className='flex items-center space-x-2 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:opacity-50'
          >
            <Camera className='h-5 w-5' />
            <span>Hızlı Çek</span>
          </button>

          <button
            onClick={switchCamera}
            className='flex items-center space-x-2 rounded-lg bg-gray-600 px-6 py-3 text-white hover:bg-gray-700'
          >
            <RotateCcw className='h-5 w-5' />
            <span>Çevir</span>
          </button>

          <button onClick={stopCamera} className='rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700'>
            <X className='h-5 w-5' />
          </button>
        </div>
      </div>
    );
  }

  if (showFullscreenCamera) {
    return (
      <div className='fixed inset-0 z-50 bg-black'>
        {/* Kamera */}
        <div className='absolute inset-0'>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className='h-full w-full object-cover'
            style={{
              transform: 'scaleX(-1)', // Ayna efekti
              WebkitTransform: 'scaleX(-1)', // Safari desteği
            }}
          />
          <canvas ref={canvasRef} className='hidden' />
        </div>

        {/* Kontrol Paneli */}
        <div className='absolute right-0 bottom-0 flex h-full w-1/4 min-w-[130px] flex-col-reverse items-center justify-between bg-black/80 p-12 md:flex-col-reverse'>
          {/* Kamera Değiştirme Butonu */}
          <button
            onClick={switchCamera}
            className='flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30'
          >
            <RotateCcw className='h-6 w-6' />
          </button>

          {/* Fotoğraf Çekme Butonu */}
          <button
            onClick={capturePhoto}
            disabled={isLoading}
            className='flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 text-white hover:bg-white/30 disabled:opacity-50'
          >
            <Camera className='h-8 w-8' />
          </button>

          {/* İptal Butonu */}
          <button
            onClick={stopCamera}
            className='flex h-10 w-10 items-center justify-center rounded-full bg-red-500/80 text-white hover:bg-red-500'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        {/* Mobil için alt panel */}
        <div className='absolute right-0 bottom-0 left-0 flex h-1/5 w-full items-center justify-between bg-black/80 p-4 md:hidden'>
          <button
            onClick={stopCamera}
            className='flex h-12 w-12 items-center justify-center rounded-full bg-red-500/80 text-white'
          >
            <X className='h-6 w-6' />
          </button>

          <button
            onClick={capturePhoto}
            disabled={isLoading}
            className='flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 text-white hover:bg-white/30 disabled:opacity-50'
          >
            <Camera className='h-8 w-8' />
          </button>

          <button
            onClick={switchCamera}
            className='flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30'
          >
            <RotateCcw className='h-6 w-6' />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Kamera İzni Yardım Paneli */}
      {showPermissionHelp && (
        <div className='rounded-lg border border-yellow-500 bg-yellow-900/20 p-4'>
          <div className='mb-3 flex items-start justify-between'>
            <h4 className='font-semibold text-yellow-400'>📱 Kamera İzni Nasıl Verilir?</h4>
            <button onClick={() => setShowPermissionHelp(false)} className='text-yellow-400 hover:text-yellow-300'>
              ✕
            </button>
          </div>

          <div className='space-y-3 text-sm text-gray-300'>
            <div>
              <strong className='text-yellow-400'>Chrome (Android/iOS):</strong>
              <ol className='mt-1 ml-4 space-y-1'>
                <li>1. Adres çubuğundaki 🔒 ikonuna tıklayın</li>
                <li>2. &quot;Kamera&quot; iznini &quot;İzin Ver&quot; yapın</li>
                <li>3. Sayfayı yenileyin</li>
              </ol>
            </div>

            <div>
              <strong className='text-yellow-400'>Safari (iOS):</strong>
              <ol className='mt-1 ml-4 space-y-1'>
                <li>1. Ayarlar → Safari → Kamera</li>
                <li>2. &quot;İzin Ver&quot; seçin</li>
                <li>3. Sayfayı yenileyin</li>
              </ol>
            </div>

            <div>
              <strong className='text-yellow-400'>Firefox (Android):</strong>
              <ol className='mt-1 ml-4 space-y-1'>
                <li>1. Tarayıcı menüsünden &quot;Site Bilgileri&quot;</li>
                <li>2. Kamera iznini &quot;İzin Ver&quot; yapın</li>
              </ol>
            </div>

            <div className='border-t border-yellow-500/30 pt-2'>
              <p className='text-yellow-300'>
                💡 <strong>Alternatif:</strong> Dosya yükleme seçeneğini kullanabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Kamera Seçeneği */}
        <button
          onClick={startCamera}
          disabled={isLoading}
          className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 p-8 transition-colors hover:border-blue-500 hover:bg-gray-800/50 disabled:opacity-50'
        >
          <Camera className='mb-4 h-12 w-12 text-blue-500' />
          <h3 className='mb-2 text-lg font-semibold text-white'>Kamera ile Çek</h3>
          <p className='text-center text-sm text-gray-400'>Fiş fotoğrafını doğrudan çekin</p>
          <div className='pt-2 text-center'>
            {cameraPermission === 'denied' ? (
              <div className='space-y-1'>
                <span className='text-xs text-red-400'>❌ Kamera izni reddedildi</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPermissionHelp(true);
                  }}
                  className='text-xs text-blue-400 underline hover:text-blue-300'
                >
                  Nasıl izin verilir?
                </button>
              </div>
            ) : cameraPermission === 'granted' ? (
              <span className='text-xs text-green-400'>✅ Kamera izni verildi</span>
            ) : cameraPermission === 'prompt' ? (
              <span className='text-xs text-yellow-400'>📱 Kamera izni gereklidir.</span>
            ) : (
              <span className='text-xs text-gray-400'>📱 Kamera durumu bilinmiyor</span>
            )}
          </div>
        </button>

        {/* Dosya Yükleme Seçeneği */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 p-8 transition-colors hover:border-green-500 hover:bg-gray-800/50 disabled:opacity-50'
        >
          <Upload className='mb-4 h-12 w-12 text-green-500' />
          <h3 className='mb-2 text-lg font-semibold text-white'>Dosya Yükle</h3>
          <p className='text-center text-sm text-gray-400'>Galeriden fiş fotoğrafı seçin</p>
        </button>
      </div>

      <input ref={fileInputRef} type='file' accept='image/*' onChange={handleFileSelect} className='hidden' />

      {isLoading && (
        <div className='py-4 text-center'>
          <div className='inline-flex items-center space-x-2 text-blue-500'>
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
            <span>İşleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}
