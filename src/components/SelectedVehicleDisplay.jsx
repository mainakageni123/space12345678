import React from 'react';
import AppImage from './AppImage';

const SelectedVehicleDisplay = ({ vehicle }) => {
    if (!vehicle || !vehicle.name) {
        return null;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Selected Vehicle</h2>
            <div className="flex flex-col items-center justify-center border rounded-lg bg-gray-50 overflow-hidden">
                <div className="w-full h-48 relative">
                    <AppImage
                        src={vehicle.imageUrl || vehicle.image || vehicle.raw?.imageUrl}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                        fallback="/assets/images/no_image.png"
                    />
                </div>
                <div className="w-full p-4 bg-white">
                    <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                    <p className="text-gray-600">KES {vehicle.price || vehicle.pricePerDay || vehicle.raw?.price || 0} per day</p>
                </div>
            </div>
        </div>
    );
};

export default SelectedVehicleDisplay;