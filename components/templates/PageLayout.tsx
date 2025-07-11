'use client'

import { ReactNode } from 'react'
import { Navigation } from '../organisms/Navigation'
import { Footer } from '../organisms/Footer'
import DynamicBackground from '../DynamicBackground'
import { motion } from 'framer-motion'
import { GlobalAIChat } from './GlobalAIChat'


interface PageLayoutProps {
  children: ReactNode
  backgroundState?: 'default' | 'welcoming' | 'exploring' | 'analyzing' | 'presenting'
  heroBackgroundImage?: string
}

export function PageLayout({ children, backgroundState = 'default', heroBackgroundImage }: PageLayoutProps) {
  return (
    <>
      <main className="relative min-h-screen overflow-hidden transition-all duration-300">
        <DynamicBackground 
          state={backgroundState} 
          showImage={false} // No background image in content sections
          overlayOpacity={1.0} // Fully opaque - no transparency
        />
        <Navigation />
        
        
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen flex flex-col"
        >
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </motion.div>
      </main>
      
      {/* Global AI Chat - Full height sidebar */}
      <GlobalAIChat />
    </>
  )
}