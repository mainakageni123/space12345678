import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectedVehicle = ({ vehicle }) => {
    const navigate = useNavigate();

    const handleAddVehicle = () => {
        navigate('/admin-command-center/fleet/add');
    };

    if (!vehicle) {
        return (
            <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Selected Vehicle</h2>
                <div className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <button
                        onClick={handleAddVehicle}
                        className="flex flex-col items-center justify-center p-4 text-center hover:bg-gray-100 transition-colors rounded-lg"
                    >
                        {/* Plus icon */}
                        <svg 
                            className="w-8 h-8 text-gray-400 mb-2" 
                            fill="none" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span className="text-sm font-medium text-gray-600">Add Vehicle to Fleet</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Selected Vehicle</h2>
            <div className="flex items-start space-x-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                    {vehicle.image ? (
                        <img 
                            src={vehicle.image} 
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400">No image</span>
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">{vehicle.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{vehicle.type}</p>
                    <div className="mt-2">
                        <span className="text-lg font-semibold text-blue-600">
                            KES {vehicle.price} per day
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectedVehicle;