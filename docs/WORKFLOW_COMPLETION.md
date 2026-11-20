# Remaining workflow implementation

This increment adds calibration equipment/event entry, project-task entry, safety investigation updates, inventory movements, and a live operational report snapshot.

Apply migrations in order through `202611200005_operational_workflows.sql`. The migration posts inventory movements atomically: receipt/return add stock, issue subtracts only when sufficient stock exists, and adjustment sets the balance to the entered count. Calibration events update the equipment's most recent calibration dates and status. Blank safety incident references are generated automatically.

Before production use, apply the migrations in staging and verify role permissions, calibration due-date procedures, inventory adjustment controls, safety investigation governance, report definitions, and audit requirements. Run the repository's typecheck, lint, test, and build scripts in the project environment.
