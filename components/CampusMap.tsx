"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { MapPin, RotateCw, Search, Building, Book, Coffee, Dumbbell, Home } from 'lucide-react'

interface Location {
  id: number
  name: string
  x: number
  y: number
  type: 'building' | 'library' | 'cafeteria' | 'gym' | 'hostel'
}

interface Route {
  id: number
  from: number
  to: number
  path: string
}

const locationIcons = {
  building: Building,
  library: Book,
  cafeteria: Coffee,
  gym: Dumbbell,
  hostel: Home,
}

export default function CampusMap() {
  const [locations, setLocations] = useState<Location[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [isAddingLocation, setIsAddingLocation] = useState(false)
  const [fromLocation, setFromLocation] = useState<string>("")
  const [toLocation, setToLocation] = useState<string>("")
  const [highlightedRoute, setHighlightedRoute] = useState<Route | null>(null)
  const [searchLocation, setSearchLocation] = useState<string>("")
  const [foundLocation, setFoundLocation] = useState<Location | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    updateRoutes()
  }, [locations])

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !isAddingLocation) return

    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const name = prompt("Enter location name:")
    if (name) {
      const type = prompt("Enter location type (building, library, cafeteria, gym, hostel):") as Location['type']
      if (type && Object.keys(locationIcons).includes(type)) {
        const newLocation: Location = { id: locations.length + 1, name, x, y, type }
        setLocations([...locations, newLocation])
      } else {
        alert("Invalid location type. Please try again.")
      }
    }
    setIsAddingLocation(false)
  }

  const updateRoutes = () => {
    const newRoutes: Route[] = []
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const from = locations[i]
        const to = locations[j]
        newRoutes.push({
          id: newRoutes.length + 1,
          from: from.id,
          to: to.id,
          path: `M${from.x},${from.y} L${to.x},${to.y}`
        })
      }
    }
    setRoutes(newRoutes)
  }

  const handleFindRoute = () => {
    if (fromLocation && toLocation) {
      const route = routes.find(r => 
        (r.from === parseInt(fromLocation) && r.to === parseInt(toLocation)) ||
        (r.from === parseInt(toLocation) && r.to === parseInt(fromLocation))
      )
      setHighlightedRoute(route || null)
      setFoundLocation(null)
    }
  }

  const handleFindLocation = () => {
    const location = locations.find(l => l.name.toLowerCase() === searchLocation.toLowerCase())
    setFoundLocation(location || null)
    setHighlightedRoute(null)
    if (!location) {
      alert("Location not found")
    }
  }

  const resetHighlight = () => {
    setHighlightedRoute(null)
    setFoundLocation(null)
    setFromLocation("")
    setToLocation("")
    setSearchLocation("")
  }

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-3xl mx-auto">
      <div className="flex space-x-4 w-full">
        <Select value={fromLocation} onValueChange={setFromLocation}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="From Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map(loc => (
              <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={toLocation} onValueChange={setToLocation}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="To Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map(loc => (
              <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleFindRoute} className="flex-grow">Find Route</Button>
        <Button onClick={resetHighlight} variant="outline" size="icon">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
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
          
          {routes.map(route => (
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

          {locations.map(location => {
            const Icon = locationIcons[location.type]
            return (
              <motion.g key={location.id}
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
            )
          })}
        </svg>
        <Button 
          className="absolute top-4 right-4"
          onClick={() => setIsAddingLocation(!isAddingLocation)}
          variant={isAddingLocation ? "secondary" : "default"}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {isAddingLocation ? "Cancel" : "Add Location"}
        </Button>
      </div>
      {highlightedRoute && (
        <motion.div 
          className="text-center p-4 bg-green-100 rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-semibold">
            Route found from {locations.find(l => l.id === parseInt(fromLocation))?.name} to {locations.find(l => l.id === parseInt(toLocation))?.name}
          </p>
        </motion.div>
      )}
      {foundLocation && (
        <motion.div 
          className="text-center p-4 bg-blue-100 rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-semibold">
            Location found: {foundLocation.name}
          </p>
        </motion.div>
      )}
    </div>
  )
}

