'use client'

import { useState, useEffect, useRef } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '../utils/cn'

interface LazyImageProps extends Omit<ImageProps, 'onLoad'> {
  blurDataURL?: string
  lowQualitySrc?: string
}

export function LazyImage({ 
  src, 
  alt, 
  className,
  blurDataURL,
  lowQualitySrc,
  ...props 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {!isLoaded && blurDataURL && (
        <div 
          className="absolute inset-0 bg-gray-800 animate-pulse"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Main image - only load when in view */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          className={cn(
            'transition-opacity duration-700',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={() => setIsLoaded(true)}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
          {...props}
        />
      )}

      {/* Loading shimmer */}
      {!isLoaded && !blurDataURL && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent shimmer" />
        </div>
      )}
    </div>
  )
} 