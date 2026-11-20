import PlannedModule from '../planned-module';

export default function MaintenancePage() {
  return (
    <PlannedModule
      title="Maintenance management"
      description="Plan preventive work and progress breakdown repairs through the maintenance lifecycle."
      capabilities={[
        'Asset preventive-maintenance schedules',
        'Due and overdue PM task visibility',
        'Automatic linkage to corrective work orders',
        'Maintenance completion notes and approval status',
      ]}
    />
  );
}
