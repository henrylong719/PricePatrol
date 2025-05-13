import { ChemistWarehouseAdapter } from '../adapters/chemistWarehouseAdapter';
import { GenericCheerioAdapter } from '../adapters/genericCheerioAdapter';
import { Adapter } from '../models';

export default async function adapterLoader(adapterId: string) {
  const doc = await Adapter.findById(adapterId);
  if (!doc) throw new Error('Adapter document not found');

  if (doc.type === 'builtin') {
    switch (doc.name) {
      case 'ChemistWarehouse':
        return new ChemistWarehouseAdapter();
      default:
        throw new Error(`Unknown builtin adapter: ${doc.name}`);
    }
  }
  // custom selector
  return new GenericCheerioAdapter(doc.selector!);
}
