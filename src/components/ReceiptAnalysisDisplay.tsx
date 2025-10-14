'use client';

import { useState } from 'react';
import { Calendar, Store, DollarSign, TrendingUp, TrendingDown, RotateCcw, Download, Eye, EyeOff } from 'lucide-react';

interface ReceiptAnalysisDisplayProps {
  analysis: IReceiptAnalysisResponse;
  imageUrl: string | null;
  onReset: () => void;
}

export function ReceiptAnalysisDisplay({ analysis, imageUrl, onReset }: ReceiptAnalysisDisplayProps) {
  const [showImage, setShowImage] = useState(true);
  const [showJson, setShowJson] = useState(false);

  const { receiptAnalyze } = analysis;

  const downloadJson = () => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `receipt-analysis-${receiptAnalyze.id}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Gıda: 'bg-green-500',
      Sağlık: 'bg-red-500',
      Temizlik: 'bg-blue-500',
      'Ev Eşyası': 'bg-purple-500',
      'Kişisel Bakım': 'bg-pink-500',
      Diğer: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  console.log(imageUrl);

  return (
    <div className='mt-10 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-white'>Analiz Sonuçları</h2>

        <div className='flex space-x-2'>
          <button
            onClick={() => setShowImage(!showImage)}
            className='flex items-center space-x-2 rounded-lg bg-gray-700 px-3 py-2 text-white hover:bg-gray-600'
          >
            {showImage ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            <span>{showImage ? 'Gizle' : 'Göster'}</span>
          </button>

          <button
            onClick={downloadJson}
            className='flex items-center space-x-2 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700'
          >
            <Download className='h-4 w-4' />
            <span>JSON İndir</span>
          </button>

          <button
            onClick={onReset}
            className='flex items-center space-x-2 rounded-lg bg-gray-600 px-3 py-2 text-white hover:bg-gray-700'
          >
            <RotateCcw className='h-4 w-4' />
            <span>Yeni Analiz</span>
          </button>
        </div>
      </div>

      {/* Receipt Image */}
      {showImage && imageUrl && (
        <div className='text-center'>
          <img
            src={imageUrl}
            alt='Analiz edilen fiş'
            className='min-h-lg mx-auto h-auto max-w-full min-w-lg rounded-lg border border-gray-600'
          />
        </div>
      )}

      {/* Receipt Info */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='rounded-lg bg-gray-800 p-4'>
          <div className='mb-2 flex items-center space-x-2'>
            <Store className='h-5 w-5 text-blue-500' />

            <span className='text-gray-400'>Market</span>
          </div>

          <p className='font-semibold text-white'>{receiptAnalyze.marketName}</p>
        </div>

        <div className='rounded-lg bg-gray-800 p-4'>
          <div className='mb-2 flex items-center space-x-2'>
            <Calendar className='h-5 w-5 text-green-500' />
            <span className='text-gray-400'>Tarih</span>
          </div>

          <p className='font-semibold text-white'>{receiptAnalyze.date}</p>
        </div>

        <div className='rounded-lg bg-gray-800 p-4'>
          <div className='mb-2 flex items-center space-x-2'>
            <DollarSign className='h-5 w-5 text-yellow-500' />
            <span className='text-gray-400'>Toplam</span>
          </div>

          <p className='text-lg font-semibold text-white'>{receiptAnalyze.totalAmount}</p>
        </div>
      </div>

      {/* Analysis Content */}
      <div className='space-y-6'>
        <h3 className='text-xl font-bold text-white'>AI Analiz Raporu</h3>

        {analysis.content.map((item, index) => (
          <div key={index} className='rounded-lg bg-gray-800 p-6'>
            <h4 className='mb-4 text-lg font-semibold text-blue-400'>{item.title}</h4>

            <ul className='space-y-2'>
              {item.content.map((content, contentIndex) => (
                <li key={contentIndex} className='leading-relaxed text-gray-300'>
                  {content}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Expenses Breakdown */}
      <div className='space-y-4'>
        <h3 className='text-xl font-bold text-white'>Harcama Detayları</h3>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {receiptAnalyze.expenses.map((expense: TExpense, index: number) => (
            <div
              key={index}
              className={`rounded-lg border-l-4 p-4 ${
                expense.isMostExpensive
                  ? 'border-red-500 bg-red-900/20'
                  : expense.isMostCheap
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-gray-500 bg-gray-800'
              }`}
            >
              <div className='mb-2 flex items-center justify-between'>
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold text-white ${getCategoryColor(expense.parentCategory)}`}
                >
                  {expense.parentCategory}
                </span>
                <span className='font-semibold text-white'>{expense.amount}</span>
              </div>

              <div className='text-xs text-gray-300'>Alt Kategori: {expense.subCategory}</div>

              {expense.isMostExpensive && (
                <div className='flex items-center space-x-1 text-sm text-red-400'>
                  <TrendingUp className='h-4 w-4' />
                  <span>En pahalı harcama</span>
                </div>
              )}

              {expense.isMostCheap && (
                <div className='flex items-center space-x-1 text-sm text-green-400'>
                  <TrendingDown className='h-4 w-4' />
                  <span>En ucuz harcama</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* JSON Data Toggle */}
      <div className='space-y-4'>
        <button
          onClick={() => setShowJson(!showJson)}
          className='flex items-center space-x-2 rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600'
        >
          <span>{showJson ? 'JSON Verisini Gizle' : 'JSON Verisini Göster'}</span>
        </button>

        {showJson && (
          <div className='rounded-lg bg-gray-900 p-4'>
            <pre className='max-h-96 overflow-auto text-sm text-gray-300'>{JSON.stringify(analysis, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
