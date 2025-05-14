import {
  // ColesAdapter,
  // WoolworthsAdapter,
  AmazonAdapter,
  ChemistWarehouseAdapter,
  GenericCheerioAdapter,
  RMWilliamsAdapter,
} from '../adapters';
import { Adapter } from '../models';

export default async function adapterLoader(adapterId: string) {
  const doc = await Adapter.findById(adapterId);
  if (!doc) throw new Error('Adapter document not found');

  if (doc.type === 'builtin') {
    switch (doc.name) {
      case 'ChemistWarehouse':
        return new ChemistWarehouseAdapter();
      case 'Amazon':
        return new AmazonAdapter();
      // case 'Coles':
      //   return new ColesAdapter();
      // case 'Woolworths':
      // return new WoolworthsAdapter();
      case 'RMWilliams':
        return new RMWilliamsAdapter();
      default:
        throw new Error(`Unknown builtin adapter: ${doc.name}`);
    }
  }
  // custom selector
  return new GenericCheerioAdapter(doc.selector!);
}
