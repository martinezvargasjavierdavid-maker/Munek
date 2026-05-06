import { BrandMark } from './BrandMark'

type Props = {
  className?: string
  markSize?: number
  textClassName?: string
  compact?: boolean
}

export function BrandLogo({ className = '', markSize = 42, textClassName = '', compact = false }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {markSize > 0 && <BrandMark size={markSize} className="shrink-0" />}
      {!compact && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <span className="text-xl font-black tracking-tight">MUÑEK</span>
          <span className="text-[10px] font-medium tracking-[0.3em] text-accent">
            SUPLEMENTOS
          </span>
        </div>
      )}
    </div>
  )
}
