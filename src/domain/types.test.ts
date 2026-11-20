import { describe, expect, it } from 'vitest';
import { UserRole } from './types';

describe('EAM role definitions', () => {
  it('defines all six department roles', () => {
    expect(Object.values(UserRole)).toHaveLength(6);
    expect(UserRole.DepartmentHead).toBe('department_head');
  });
});
