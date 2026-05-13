import React from 'react';

export interface FilterParams {
  minElevation: string;
  maxElevation: string;
  minLength: string;
  maxLength: string;
  minDepth: string;
  maxDepth: string;
}

interface MapFiltersProps {
  filters: FilterParams;
  onFilterChange: (newFilters: FilterParams) => void;
  onReset: () => void;
}

const FilterInput = ({ 
  label, 
  nameMin, 
  nameMax, 
  valueMin, 
  valueMax, 
  unit, 
  onChange 
}: { 
  label: string; 
  nameMin: keyof FilterParams; 
  nameMax: keyof FilterParams; 
  valueMin: string; 
  valueMax: string;
  unit: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="mb-6">
    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">{label} ({unit})</label>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Min</span>
        <input
          type="number"
          name={nameMin}
          value={valueMin}
          onChange={onChange}
          placeholder="0"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
        />
      </div>
      <div>
        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Max</span>
        <input
          type="number"
          name={nameMax}
          value={valueMax}
          onChange={onChange}
          placeholder="Max"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
        />
      </div>
    </div>
  </div>
);

const MapFilters: React.FC<MapFiltersProps> = ({ filters, onFilterChange, onReset }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2">
        <FilterInput
          label="Quota Ingresso"
          nameMin="minElevation"
          nameMax="maxElevation"
          valueMin={filters.minElevation}
          valueMax={filters.maxElevation}
          unit="m"
          onChange={handleChange}
        />
        <FilterInput
          label="Sviluppo Spaziale"
          nameMin="minLength"
          nameMax="maxLength"
          valueMin={filters.minLength}
          valueMax={filters.maxLength}
          unit="m"
          onChange={handleChange}
        />
        <FilterInput
          label="Dislivello Negativo"
          nameMin="minDepth"
          nameMax="maxDepth"
          valueMin={filters.minDepth}
          valueMax={filters.maxDepth}
          unit="m"
          onChange={handleChange}
        />
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={onReset}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-colors border border-slate-200 flex items-center justify-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reset Filtri</span>
        </button>
      </div>
    </div>
  );
};

export default MapFilters;
