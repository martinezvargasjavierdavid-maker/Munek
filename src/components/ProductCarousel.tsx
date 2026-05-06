import { useRef, useState, useEffect } from 'react'
import type { Product } from '../app/catalog'
import { ProductCard } from './ProductCard'

type Props = {
    title: string
    products: Product[]
    onAdd: (variantId: string, quantity: number) => void
}

export function ProductCarousel({ title, products, onAdd }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setShowLeftArrow(scrollLeft > 10)
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    useEffect(() => {
        checkScroll()
        window.addEventListener('resize', checkScroll)
        return () => window.removeEventListener('resize', checkScroll)
    }, [products])

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current
            const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    return (
        <div className="mb-16 last:mb-0 relative group/carousel">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-xl md:text-2xl font-black tracking-tighter text-fg uppercase italic">
                    {title}
                </h3>
                <span className="text-xs font-medium text-muted/60 tracking-widest uppercase">
                    {products.length} {products.length === 1 ? 'Producto' : 'Productos'}
                </span>
            </div>

            <div className="relative">
                {/* Navigation Arrows */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full glass inline-flex items-center justify-center text-white hover:bg-accent transition-all duration-300 opacity-0 pointer-events-none group-hover/carousel:opacity-100 group-hover/carousel:pointer-events-auto md:opacity-100 md:pointer-events-auto shadow-premium"
                        aria-label="Anterior"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full glass inline-flex items-center justify-center text-white hover:bg-accent transition-all duration-300 opacity-0 pointer-events-none group-hover/carousel:opacity-100 group-hover/carousel:pointer-events-auto md:opacity-100 md:pointer-events-auto shadow-premium"
                        aria-label="Siguiente"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-2 px-2"
                >
                    {products.map((product) => (
                        <div key={product.id} className="w-55 md:w-65 shrink-0 snap-start">
                            <ProductCard
                                product={product}
                                onAdd={onAdd}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
