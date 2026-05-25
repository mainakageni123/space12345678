import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SearchBar = ({ onSearch, searchQuery, onSearchChange, placeholder = 'Search by make, model, or features...' }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    location: '',
    pickupDate: '',
    returnDate: '',
    tripPurpose: ''
  });

  const handleAdvancedSearch = () => {
    onSearch({
      query: searchQuery,
      ...advancedFilters
    });
    setIsAdvancedOpen(false);
  };

  const handleQuickSearch = (e) => {
    e?.preventDefault();
    onSearch({ query: searchQuery });
  };

  return (
    <div className="bg-surface-premium rounded-xl premium-shadow p-4 sm:p-6 mb-6 sm:mb-8">
      {/* Main Search */}
      <form onSubmit={handleQuickSearch} className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-refined" 
            />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            iconName="Filter"
            iconPosition="left"
            className=""
          >
            Advanced
          </Button>
          <Button
            type="submit"
            variant="default"
            iconName="Search"
            iconPosition="left"
            className="bg-cosmic-depth hover:bg-cosmic-depth/90"
          >
            Search
          </Button>
        </div>
      </form>
      {/* Advanced Search Panel */}
      {isAdvancedOpen && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-lg font-semibold text-text-charcoal mb-4">Advanced Search</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input
              label="Pickup Location"
              type="text"
              placeholder="Enter city or address"
              value={advancedFilters?.location}
              onChange={(e) => setAdvancedFilters({
                ...advancedFilters,
                location: e?.target?.value
              })}
            />
            
            <Input
              label="Pickup Date"
              type="date"
              value={advancedFilters?.pickupDate}
              onChange={(e) => setAdvancedFilters({
                ...advancedFilters,
                pickupDate: e?.target?.value
              })}
            />
            
            <Input
              label="Return Date"
              type="date"
              value={advancedFilters?.returnDate}
              onChange={(e) => setAdvancedFilters({
                ...advancedFilters,
                returnDate: e?.target?.value
              })}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-charcoal">Trip Purpose</label>
              <select
                value={advancedFilters?.tripPurpose}
                onChange={(e) => setAdvancedFilters({
                  ...advancedFilters,
                  tripPurpose: e?.target?.value
                })}
                className="w-full h-10 px-3 border border-border rounded-lg bg-surface-premium text-text-charcoal focus:outline-none focus:ring-2 focus:ring-cosmic-depth focus:border-transparent"
              >
                <option value="">Select purpose</option>
                <option value="business">Business Travel</option>
                <option value="leisure">Leisure Travel</option>
                <option value="adventure">Adventure Trip</option>
                <option value="family">Family Vacation</option>
                <option value="wedding">Wedding/Event</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => {
                setAdvancedFilters({
                  location: '',
                  pickupDate: '',
                  returnDate: '',
                  tripPurpose: ''
                });
              }}
            >
              Clear
            </Button>
            <Button
              variant="default"
              onClick={handleAdvancedSearch}
              iconName="Search"
              iconPosition="left"
              className="bg-adventure-orange hover:bg-adventure-orange/90"
            >
              Search with Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;