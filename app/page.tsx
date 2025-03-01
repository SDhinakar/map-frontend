"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import logo from '../assets/logo.png';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-950">
      <div className="bg-white p-12 rounded-lg shadow-lg w-[32rem] text-center">
        <Image
          src={logo}
          alt="Bannari Amman Institute of Technology"
          className="mx-auto mb-4 w-28 h-28"
        />
        <h1 className="text-3xl font-bold mb-8">Welcome to BIT Campus Map</h1>
        <div className="space-y-4">
          <Link href="/login">
            <Button className="w-full bg-green-500 text-white py-3 rounded-lg shadow-lg hover:bg-green-600">
              Log In
            </Button>
          </Link>
          {/* Add margin-top to create space between the buttons */}
          <div className="mt-6"></div>
          <Link href="/signup">
            <Button className="w-full bg-blue-500 text-white py-3 rounded-lg shadow-lg hover:bg-blue-600">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}