import React from 'react';

interface AnalysisItem {
  title: string;
  content: string[];
}

interface AnalysisResultProps {
  data: AnalysisItem[];
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  return (
    <div className='space-y-8 p-6'>
      {data.map((item, index) => (
        <div key={index} className='rounded-lg bg-[var(--black-light)] p-6 shadow-lg'>
          <h2 className='mb-4 border-b border-[var(--off-white)] pb-2 text-xl font-semibold text-[var(--off-white)]'>
            {item.title}
          </h2>
          <div className='space-y-3'>
            {item.content.map((content, contentIndex) => (
              <p key={contentIndex} className='whitespace-pre-wrap text-[var(--off-white)]'>
                {content}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalysisResult;
