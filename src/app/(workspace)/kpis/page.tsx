import PlannedModule from '../planned-module';

export default function KpisPage() {
  return (
    <PlannedModule
      title="KPI & control"
      description="Review operational performance and enter controlled manual KPI measurements."
      capabilities={[
        'Manual KPI entries by reporting period',
        'Targets and period-over-period variance',
        'Maintenance reliability and downtime views',
        'Export-ready management reporting',
      ]}
    />
  );
}
