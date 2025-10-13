'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

export function CameraUpload({
  onImageCapture,
  onImageUpload,
  isLoading = false,
}: ICameraUploadProps & { isLoading?: boolean }) {
  const [showCamera, setShowCamera] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
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
        throw new Error('Bu tarayıcı kamera erişimini desteklemiyor');
      }

      // Kamera izni iste - mobil cihazlar için optimize edilmiş
      const constraints = {
        video: {
          facingMode: 'environment', // Arka kamera (mobilde daha iyi)
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false, // Ses kaydına gerek yok
      };

      // Mobil cihaz kontrolü
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        // Mobil cihazlarda daha basit ayarlar
        constraints.video = {
          facingMode: 'environment',
          width: { ideal: 1280, max: 1280 },
          height: { ideal: 720, max: 720 },
          frameRate: { ideal: 30, max: 30 },
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Kamera erişim hatası:', error);

      // Hata türüne göre farklı mesajlar göster
      let errorMessage = 'Kamera erişimi başarısız oldu.';
      let showMobileInstructions = false;

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Kamera izni reddedildi.';
          showMobileInstructions = true;
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Kamera bulunamadı. Lütfen cihazınızda kamera olduğundan emin olun.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Bu tarayıcı kamera erişimini desteklemiyor.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Kamera başka bir uygulama tarafından kullanılıyor.';
        }
      }

      // Mobil cihazlarda detaylı talimatlar göster
      if (showMobileInstructions) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
          // Mobil cihazlarda yardım panelini göster
          setShowPermissionHelp(true);
          alert(errorMessage + '\n\nDetaylı talimatlar için "Nasıl izin verilir?" butonuna tıklayın.');
        } else {
          alert(errorMessage + '\n\nLütfen tarayıcı ayarlarından kamera iznini verin.');
        }
      } else {
        alert(errorMessage);
      }
    }
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

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
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

  if (showCamera) {
    return (
      <div className='space-y-4'>
        <div className='relative'>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className='mx-auto w-full max-w-md rounded-lg'
            style={{
              transform: 'scaleX(-1)', // Ayna efekti
              WebkitTransform: 'scaleX(-1)', // Safari desteği
            }}
          />
          <canvas ref={canvasRef} className='hidden' />
        </div>

        <div className='flex justify-center space-x-4'>
          <button
            onClick={capturePhoto}
            disabled={isLoading}
            className='flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50'
          >
            <Camera className='h-5 w-5' />
            <span>Fotoğraf Çek</span>
          </button>

          <button onClick={stopCamera} className='rounded-lg bg-gray-600 px-6 py-3 text-white hover:bg-gray-700'>
            İptal
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
