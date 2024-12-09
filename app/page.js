'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link'

import { MessageCircle } from 'lucide-react';



export default function HomePage() {

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-6 bg-white shadow-lg rounded-md">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to my CPRG final project!</h1>
        <p className="mt-4 text-gray-600">
          An end to end encrypted chat app :)
        </p>
        <Button
          variant="secondary"
          className="mt-6 "
        >
                      <MessageCircle className="h-8 w-8 text-blue-600" strokeWidth={2} />

            <Link href="/chat">Start Chatting</Link>

          
        </Button>
      </div>
    </div>
  );
}
