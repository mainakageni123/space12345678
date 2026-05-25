import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';

const EmptyVehicleSelector = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Selected Vehicle</h2>
            <div className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Button
                    variant="primary"
                    onClick={() => navigate('/fleet-discovery')}
                    className="flex items-center gap-2"
                >
                    <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path d="M12 4v16m8-8H4"></path>
                    </svg>
                    Add Vehicle to Fleet
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                    No vehicle selected. Click to add one to your fleet.
                </p>
            </div>
        </div>
    );
};

export default EmptyVehicleSelector;