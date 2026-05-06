import { createElement, useId } from 'react'

type Props = {
  a: string
  b: string
  className?: string
}

export function GradientVisual({ a, b, className = '' }: Props) {
  const gradientId = useId()

  return createElement(
    'svg',
    {
      'aria-hidden': true,
      viewBox: '0 0 100 100',
      className,
      preserveAspectRatio: 'none',
    },
    createElement(
      'defs',
      null,
      createElement(
        'linearGradient',
        { id: gradientId, x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
        createElement('stop', { offset: '0%', stopColor: a }),
        createElement('stop', { offset: '100%', stopColor: b }),
      ),
    ),
    createElement('rect', { width: '100', height: '100', fill: `url(#${gradientId})` }),
  )
}