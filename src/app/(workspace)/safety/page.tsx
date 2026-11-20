import PlannedModule from '../planned-module';

export default function SafetyPage() {
  return (
    <PlannedModule
      title="Safety & incidents"
      description="Report incidents and track investigations and corrective actions."
      capabilities={[
        'Near-miss and incident reporting',
        'Severity and investigation workflow',
        'Immediate and corrective actions',
        'Incident closure evidence',
      ]}
    />
  );
}
