import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterSidebar = ({ filters, onFiltersChange, onClearFilters, isOpen, onToggle }) => {
  const vehicleClassOptions = [
    { value: 'all', label: 'All Vehicles' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'suv', label: 'SUV' }
  ];

  const priceRanges = [
    { value: 'all', label: 'Any Price' },
    { value: '0-5000', label: 'KSH 0 - 5,000/day' },
    { value: '5001-10000', label: 'KSH 5,001 - 10,000/day' },
    { value: '10001-20000', label: 'KSH 10,001 - 20,000/day' },
    { value: '20001+', label: 'KSH 20,001+/day' }
  ];

  const activeFiltersCount = Object.values(filters)?.filter(value => 
    value && value !== 'all' && (Array.isArray(value) ? value?.length > 0 : true)
  )?.length;

  return (
    <div className="lg:sticky lg:top-24 lg:h-fit bg-surface-premium rounded-lg premium-shadow p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-charcoal">Filters</h3>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-adventure-orange hover:text-adventure-orange/80"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              iconName="X"
              className="text-text-refined hover:text-text-charcoal"
            >
              Hide
            </Button>
          </div>
        </div>

        {/* Vehicle Class */}
        <div className="space-y-3">
          <Select
            label="Vehicle Class"
            options={vehicleClassOptions}
            value={filters?.vehicleClass || 'all'}
            onChange={(value) => onFiltersChange({ ...filters, vehicleClass: value })}
          />
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Select
            label="Price Range"
            options={priceRanges}
            value={filters?.priceRange || 'all'}
            onChange={(value) => onFiltersChange({ ...filters, priceRange: value })}
          />
        </div>

        {/* Mobile Apply Button */}
        <div className="lg:hidden pt-4">
          <Button
            variant="default"
            fullWidth
            onClick={onToggle}
            className="bg-cosmic-depth hover:bg-cosmic-depth/90"
          >
            Apply Filters
          </Button>
        </div>
      </div>
  );
};

export default FilterSidebar;