"use client"

import { useRouter } from 'next/navigation'
import CampusMap from '../components/CampusMap'
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/login')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/login')
    }
  })

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
      <CampusMap />
    </main>
  )
}

