'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { MessageCircle, Info, Send } from 'lucide-react';

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'KEEP_A_SECRET_PLEASE';

const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
};

const decryptMessage = (ciphertext) => {
  if (ciphertext) {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption error:", error);
      return "Error decrypting message";
    }
  }
  return "";
};

export default function CPRGChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, 'messages'), 
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    try {
      const encryptedMessage = encryptMessage(input);
      await addDoc(collection(db, 'messages'), { 
        text: encryptedMessage, 
        createdAt: new Date() 
      });
      setInput('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-8 w-8 text-blue-600" strokeWidth={2} />
            <h1 className="text-2xl font-semibold text-gray-800">CPRG Final Project</h1>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Info className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About CPRG Secure Chat</DialogTitle>
                <DialogDescription>
                  An end-to-end encrypted messaging platform ensuring 
                  your communications remain private and secure. Sort of like Singal.
                </DialogDescription>
              </DialogHeader>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Encryption:</strong> Messages are encrypted client-side before transmission
                </p>
                <p className="text-sm">
                  <strong>Privacy:</strong> No messages are stored in plain text
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card className="flex-1 flex flex-col h-full rounded-none container mx-auto">
        <ScrollArea className="flex-1 p-4 space-y-2 overflow-y-auto">
          {messages.map((message) => (
            <Card 
              key={message.id} 
              className="p-3 my-2 break-words bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              variant="outline"
            >
              {decryptMessage(message.text)}
            </Card>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="p-4 border-t flex space-x-2">
          <Input
            type="text"
            placeholder="Type a secure message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage}
            disabled={!input.trim()}
            className="flex items-center"
          >
            <Send className="mr-2 h-4 w-4" /> Send
          </Button>
        </div>
      </Card>
    </div>
  );
}