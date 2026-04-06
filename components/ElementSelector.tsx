import React from 'react';
import { ElementType } from '../types';
import { ELEMENTS } from '../constants';

interface ElementSelectorProps {
  currentElement: ElementType;
  onSelect: (el: ElementType) => void;
}

const ElementSelector: React.FC<ElementSelectorProps> = ({ currentElement, onSelect }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {Object.values(ELEMENTS).map((el) => {
        const Icon = el.icon;
        const isActive = currentElement === el.id;
        
        return (
          <button
            key={el.id}
            onClick={() => onSelect(el.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 border
              ${isActive 
                ? `${el.bg} ${el.color} border-${el.id === 'FIRE' ? 'rose' : el.id === 'WATER' ? 'sky' : el.id === 'EARTH' ? 'green' : el.id === 'AIR' ? 'slate' : 'violet'}-200 shadow-md transform scale-105 ring-2 ring-offset-2 ring-transparent` 
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
            `}
          >
            <Icon className={`w-5 h-5 ${isActive ? el.color : 'text-gray-400'}`} />
            <span className="font-medium">{el.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ElementSelector;
