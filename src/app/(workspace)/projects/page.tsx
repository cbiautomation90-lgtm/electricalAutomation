import PlannedModule from '../planned-module';

export default function ProjectsPage() {
  return (
    <PlannedModule
      title="Projects"
      description="Manage electrical and automation projects from planning through completion."
      capabilities={[
        'Project portfolio and milestones',
        'Assigned project tasks and due dates',
        'Budget and target-date tracking',
        'Project status and completion reporting',
      ]}
    />
  );
}
