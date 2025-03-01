"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, RotateCw, Search, Building, Book, Coffee, Dumbbell, Home } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'building' | 'library' | 'cafeteria' | 'gym' | 'hostel';
}

interface Route {
  id: number;
  from: string;
  to: string;
  path: string;
}

const locationIcons = {
  building: Building,
  library: Book,
  cafeteria: Coffee,
  gym: Dumbbell,
  hostel: Home,
};

// const API_URL = "http://localhost:5000"; // Replace with your backend URL

export default function CampusMap() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [fromLocation, setFromLocation] = useState<string>("");
  const [toLocation, setToLocation] = useState<string>("");
  const [highlightedRoute, setHighlightedRoute] = useState<Route | null>(null);
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [foundLocation, setFoundLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Fetch locations for the logged-in user
  useEffect(() => {
    const fetchUserLocations = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/location/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Fetched Locations:", data);

        if (response.ok) {
          if (Array.isArray(data.locations)) {
            setLocations(
              data.locations
                .filter((loc: any) => loc._id || loc.id)
                .map((loc: any) => ({
                  id: loc._id || loc.id || "",
                  name: loc.name,
                  x: loc.x,
                  y: loc.y,
                  type: loc.type,
                }))
            );
          } else {
            setError("Invalid data structure received");
          }
        } else {
          setError(data.message || "Failed to fetch locations");
        }
      } catch (error) {
        setError("Failed to fetch locations");
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocations();
  }, []);

  // Memoized routes calculation
  const routes = useMemo(() => {
    const newRoutes: Route[] = [];
    let routeIdCounter = 1; // Counter to generate unique numeric IDs
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const from = locations[i];
        const to = locations[j];
        newRoutes.push({
          id: routeIdCounter++, // Increment the counter for each route
          from: from.id,
          to: to.id,
          path: `M${from.x},${from.y} L${to.x},${to.y}`,
        });
      }
    }
    return newRoutes;
  }, [locations]);

  // Add a new location
  const handleMapClick = async (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !isAddingLocation) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const name = prompt("Enter location name:");
    if (!name) {
      setError("Location name is required");
      return;
    }

    // Check if the location name already exists
    const isNameTaken = locations.some((loc) => loc.name.toLowerCase() === name.toLowerCase());
    if (isNameTaken) {
      setError("Location name must be unique. Please choose a different name.");
      return;
    }

    const type = prompt("Enter location type (building, library, cafeteria, gym, hostel):") as Location['type'];
    if (!type || !Object.keys(locationIcons).includes(type)) {
      setError("Invalid location type. Please try again.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/location/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, x, y, type }),
      });

      const data = await response.json();
      console.log("Backend Response:", data);

      if (response.ok) {
        setLocations([...locations, data.location]);
        setError(null); // Clear any previous errors
      } else {
        setError(data.message || "Failed to add location");
      }
    } catch (error) {
      setError("Failed to add location");
    }
    setIsAddingLocation(false);
  };

  // Find a route between two locations
  const handleFindRoute = () => {
    if (fromLocation && toLocation) {
      const route = routes.find(
        (r) =>
          (r.from === fromLocation && r.to === toLocation) ||
          (r.from === toLocation && r.to === fromLocation)
      );
      setHighlightedRoute(route || null);
      setFoundLocation(null);
    }
  };

  // Find a location by name
  const handleFindLocation = () => {
    const location = locations.find((l) => l.name.toLowerCase() === searchLocation.toLowerCase());
    setFoundLocation(location || null);
    setHighlightedRoute(null);
    if (!location) {
      setError("Location not found");
    }
  };

  // Reset highlighted route and found location
  const resetHighlight = () => {
    setHighlightedRoute(null);
    setFoundLocation(null);
    setFromLocation("");
    setToLocation("");
    setSearchLocation("");
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-3xl mx-auto">
      {/* Loading and Error Messages */}
      {loading && <p>Loading...</p>}
      {error && (
        <motion.div
          className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-semibold">{error}</p>
        </motion.div>
      )}

      {/* Route Selection */}
      <div className="flex space-x-4 w-full">
        <Select value={fromLocation} onValueChange={setFromLocation}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="From Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={`location-${loc.id}`} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={toLocation} onValueChange={setToLocation}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="To Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={`location-${loc.id}`} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleFindRoute} className="flex-grow">
          Find Route
        </Button>
        <Button onClick={resetHighlight} variant="outline" size="icon">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Location Search */}
      <div className="flex space-x-4 w-full">
        <Input
          type="text"
          placeholder="Search location"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleFindLocation} variant="secondary">
          <Search className="mr-2 h-4 w-4" />
          Find Location
        </Button>
      </div>

      {/* Map */}
      <div className="relative border border-gray-300 rounded-lg shadow-lg overflow-hidden">
        <svg
          ref={svgRef}
          width="800"
          height="600"
          viewBox="0 0 800 600"
          onClick={handleMapClick}
          className={`cursor-${isAddingLocation ? 'crosshair' : 'default'}`}
        >
          <rect x="0" y="0" width="800" height="600" fill="#e6f0e6" stroke="#228B22" strokeWidth="2" />

          {/* Render Routes */}
          {routes.map((route) => (
            <motion.path
              key={route.id}
              d={route.path}
              stroke={highlightedRoute && highlightedRoute.id === route.id ? "#FFD700" : "#ADD8E6"}
              strokeWidth={highlightedRoute && highlightedRoute.id === route.id ? "4" : "2"}
              fill="none"
              opacity={highlightedRoute ? (highlightedRoute.id === route.id ? 1 : 0.3) : 1}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          ))}

          {/* Render Locations */}
          {locations.map((location) => {
            const Icon = locationIcons[location.type];
            return (
              <motion.g
                key={location.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <circle
                  cx={location.x}
                  cy={location.y}
                  r="20"
                  fill={foundLocation && foundLocation.id === location.id ? "#FF6347" : "#4CAF50"}
                  stroke="#228B22"
                  strokeWidth="2"
                />
                <Icon x={location.x - 10} y={location.y - 10} width="20" height="20" color="white" />
                <text
                  x={location.x}
                  y={location.y + 30}
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {location.name}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Add Location Button */}
        <Button
          className="absolute top-4 right-4"
          onClick={() => setIsAddingLocation(!isAddingLocation)}
          variant={isAddingLocation ? "secondary" : "default"}
          aria-label={isAddingLocation ? "Cancel adding location" : "Add location"}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {isAddingLocation ? "Cancel" : "Add Location"}
        </Button>
      </div>

      {/* Highlighted Route */}
      {highlightedRoute && (
        <motion.div
          className="text-center p-4 bg-green-100 rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-semibold">
            Route found from {locations.find((l) => l.id === fromLocation)?.name} to{" "}
            {locations.find((l) => l.id === toLocation)?.name}
          </p>
        </motion.div>
      )}

      {/* Found Location */}
      {foundLocation && (
        <motion.div
          className="text-center p-4 bg-blue-100 rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-semibold">Location found: {foundLocation.name}</p>
        </motion.div>
      )}
    </div>
  );
}