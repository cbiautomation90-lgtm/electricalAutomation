import Link from 'next/link';
import PlannedModule from '../planned-module';

export default async function InspectionsPage() {
  return (
    <PlannedModule
      title="Inspections & test equipment"
      description="Inspect assets, record findings, and manage test-equipment calibration status."
      capabilities={[
        'Reusable electrical and automation inspection templates',
        'Asset-linked inspection history and follow-up findings',
        'Calibration register with due and overdue status',
        'Links to corrective work orders',
      ]}
    />
  );
}
