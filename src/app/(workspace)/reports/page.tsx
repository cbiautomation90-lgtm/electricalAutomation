import PlannedModule from '../planned-module';

export default function ReportsPage() {
  return (
    <PlannedModule
      title="Reports"
      description="Generate operational reports across assets, maintenance, safety, inventory, projects, and KPIs."
      capabilities={[
        'Asset and work-order summaries',
        'PM compliance and backlog reports',
        'Spare-parts and incident summaries',
        'Management KPI and project exports',
      ]}
    />
  );
}
