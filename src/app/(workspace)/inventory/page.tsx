import PlannedModule from '../planned-module';

export default function InventoryPage() {
  return (
    <PlannedModule
      title="Inventory & spares"
      description="Control spare parts and consumables used by electrical and automation maintenance."
      capabilities={[
        'Part register and storage locations',
        'Receipt, issue, return, and adjustment transactions',
        'Work-order-linked parts usage',
        'Reorder levels and low-stock visibility',
      ]}
    />
  );
}
