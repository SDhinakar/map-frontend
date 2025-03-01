"use client";

import { useRouter } from 'next/navigation';
import CampusMap from '@/components/CampusMap';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { API_URL } from '@/networking';

export default function Dashboard() {
  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token
    router.push('/login'); // Redirect to login page
  };

  const fetchLocations = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login'); // Redirect to login if no token
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/location/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setLocations(data.locations); // Update state with fetched locations
      } else {
        console.error('Error fetching locations:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login'); // Redirect to login if no token
    } else {
      fetchLocations(); // Fetch locations if token exists
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gradient-to-b from-blue-100 to-green-100">
      <motion.div 
        className="w-full max-w-3xl flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-blue-800">BIT Campus Map</h1>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </motion.div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <CampusMap locations={locations} />
      )}
    </main>
  );
}