"use client";
import './globals.css'
import { Inter } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from 'react';
import Provider from './provider';


const inter = Inter({ subsets: ['latin'] })

const metadata = {
  title: 'AUTO CHECKER',
  description: 'Automated test paper checker',
}

export default function RootLayout({ children }) {
  useEffect(() =>{
    import("bootstrap/dist/js/bootstrap"); 
  }, []);
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
            {children}
        </Provider>
        </body>
    </html>
  )
}
