import {
  AmazonAdapter,
  ChemistWarehouseAdapter,
  GenericCheerioAdapter,
  RMWilliamsAdapter,
} from '../adapters';
import { Adapter } from '../models';

// Given an Adapter _document ID_, fetch the DB doc and
// return an instance of the right adapter class.
export default async function adapterLoader(adapterId: string) {
  const doc = await Adapter.findById(adapterId);
  if (!doc) throw new Error('Adapter document not found');

  if (doc.type === 'builtin') {
    switch (doc.name) {
      case 'Amazon':
        return new AmazonAdapter();
      case 'ChemistWarehouse':
        return new ChemistWarehouseAdapter();
      case 'RMWilliams':
        return new RMWilliamsAdapter();
      default:
        throw new Error(`Unknown builtin adapter: ${doc.name}`);
    }
  }

  // For user-provided selectors, fall back to a generic Cheerio adapter
  return new GenericCheerioAdapter(doc.selector!);
}
