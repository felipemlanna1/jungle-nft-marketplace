import { describe, expect, it, vi } from 'vitest';
import { useQuantityInput } from './useQuantityInput';

describe('quantity availability changes', () => {
  it('lets a collector reduce an outdated quantity to the available inventory', () => {
    const onValueChange = vi.fn();
    const controls = useQuantityInput({ value: 3, max: 1, label: 'quantity', onValueChange });
    expect(controls.decreaseDisabled).toBe(false);
    expect(controls.increaseDisabled).toBe(true);
    controls.decrease();
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(1);
  });

  it('does not offer an invalid quantity after the edition sells out', () => {
    const onValueChange = vi.fn();
    const controls = useQuantityInput({ value: 3, max: 0, label: 'quantity', onValueChange });
    expect(controls.decreaseDisabled).toBe(true);
    expect(controls.increaseDisabled).toBe(true);
    controls.decrease();
    controls.increase();
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
