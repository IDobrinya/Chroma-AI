import React from 'react';

interface NavigationViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationView: React.FC<NavigationViewProps> = ({ isOpen, onClose }) => {
  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-gray-800 text-white transition-transform duration-300 ease-in-out w-64 z-20
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Настройки</h2>
      </div>
      <nav className="mt-4">
        <ul>
          <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Здоровый
          </li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer">
            Протаномалия
          </li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer">
            Деутераномалия
          </li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer">
            Тританомалия
          </li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer">
            Ахроматопсия
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavigationView;