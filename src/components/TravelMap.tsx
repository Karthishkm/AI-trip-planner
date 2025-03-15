import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { motion } from 'framer-motion';
import { useTravelStore } from '../store';

// Fix for default marker icons
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Search control component
function SearchControl() {
  const map = useMap();
  
  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search for places...'
    });

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
}

// Map event handler component
function MapEventHandler() {
  const map = useMap();

  useEffect(() => {
    const handleFocusLocation = (e: CustomEvent<{ lat: number; lng: number }>) => {
      const { lat, lng } = e.detail;
      if (lat !== 0 && lng !== 0) {
        map.setView([lat, lng], 15, {
          animate: true,
          duration: 1
        });
      }
    };

    window.addEventListener('focusLocation', handleFocusLocation as EventListener);

    return () => {
      window.removeEventListener('focusLocation', handleFocusLocation as EventListener);
    };
  }, [map]);

  return null;
}

export default function TravelMap() {
  const { currentPlan } = useTravelStore();
  const defaultPosition: [number, number] = [20.5937, 78.9629]; // India center
  const mapRef = useRef<L.Map>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  useEffect(() => {
    if (currentPlan && mapRef.current) {
      const coordinates: [number, number][] = [];
      
      currentPlan.days.forEach(day => {
        // Add activity locations
        day.activities.forEach(activity => {
          if (activity.location && activity.location.lat !== 0 && activity.location.lng !== 0) {
            coordinates.push([activity.location.lat, activity.location.lng]);
          }
        });
        
        // Add meal locations
        day.meals.forEach(meal => {
          if (meal.location && meal.location.lat !== 0 && meal.location.lng !== 0) {
            coordinates.push([meal.location.lat, meal.location.lng]);
          }
        });
      });

      if (coordinates.length > 0) {
        const newBounds = L.latLngBounds(coordinates);
        setBounds(newBounds);
        mapRef.current.fitBounds(newBounds, {
          padding: [50, 50],
          animate: true,
          duration: 1
        });
      }
    }
  }, [currentPlan]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card rounded-xl p-6 shadow-xl h-[600px]"
    >
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
        Interactive Map
      </h2>
      
      <div className="h-[500px] rounded-lg overflow-hidden">
        <MapContainer
          center={defaultPosition}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          className="dark-map"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <SearchControl />
          <MapEventHandler />
          
          {currentPlan?.days.map((day) => (
            <React.Fragment key={day.day}>
              {day.activities.map((activity, index) => {
                if (activity.location && activity.location.lat !== 0 && activity.location.lng !== 0) {
                  return (
                    <Marker
                      key={`activity-${day.day}-${index}`}
                      position={[activity.location.lat, activity.location.lng]}
                    >
                      <Popup>
                        <div className="text-dark-DEFAULT">
                          <h3 className="font-semibold">{activity.name}</h3>
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-600 mt-1">{activity.address}</p>
                          <p className="text-sm font-medium mt-1">Cost: ₹{activity.cost.toLocaleString()}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
              
              {day.meals.map((meal, index) => {
                if (meal.location && meal.location.lat !== 0 && meal.location.lng !== 0) {
                  return (
                    <Marker
                      key={`meal-${day.day}-${index}`}
                      position={[meal.location.lat, meal.location.lng]}
                    >
                      <Popup>
                        <div className="text-dark-DEFAULT">
                          <h3 className="font-semibold">{meal.restaurant}</h3>
                          <p className="text-sm">{meal.cuisine} Cuisine</p>
                          <p className="text-xs text-gray-600 mt-1">{meal.address}</p>
                          <p className="text-sm font-medium mt-1">Cost: ₹{meal.cost.toLocaleString()}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
    </motion.div>
  );
}