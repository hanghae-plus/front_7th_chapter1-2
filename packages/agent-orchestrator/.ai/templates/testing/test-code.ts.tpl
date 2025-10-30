import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {{component}} from '{{path}}'

describe('{{feature_id}}', () => {
  it('should {{behavior}}', () => {
    render(<{{component}} />)
    // TODO: assertions from AC
    expect(true).toBe(true)
  })
})