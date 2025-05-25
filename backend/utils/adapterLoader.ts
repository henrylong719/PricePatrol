import {
  AmazonAdapter,
  BuiltinAdapterName,
  ChemistWarehouseAdapter,
  DavidJonesAdapter,
  GenericCheerioAdapter,
  JBHifiAdapter,
  OfficeworksAdapter,
  RMWilliamsAdapter,
  TaoBaoAdapter,
  UniqloAdapter,
} from '../adapters';
import { BasePlaywrightAdapter } from '../adapters/basePlaywrightAdapter';
import { Adapter } from '../models';

/** Map each enum value to its concrete class */
const BUILTIN_ADAPTERS: Record<
  BuiltinAdapterName,
  new () => BasePlaywrightAdapter
> = {
  [BuiltinAdapterName.Amazon]: AmazonAdapter,
  [BuiltinAdapterName.ChemistWarehouse]: ChemistWarehouseAdapter,
  [BuiltinAdapterName.RMWilliams]: RMWilliamsAdapter,
  [BuiltinAdapterName.DavidJones]: DavidJonesAdapter,
  [BuiltinAdapterName.Uniqlo]: UniqloAdapter,
  [BuiltinAdapterName.JBHifiAdapter]: JBHifiAdapter,
  [BuiltinAdapterName.OfficeworksAdapter]: OfficeworksAdapter,
  [BuiltinAdapterName.TaoBaoAdapter]: TaoBaoAdapter,
};

export default async function adapterLoader(adapterId: string) {
  const doc = await Adapter.findById(adapterId);
  if (!doc) throw new Error('Adapter document not found');

  if (doc.type === 'builtin') {
    const AdapterClass = BUILTIN_ADAPTERS[doc.name as BuiltinAdapterName];
    if (!AdapterClass) {
      throw new Error(`Unknown builtin adapter: ${doc.name}`);
    }
    return new AdapterClass();
  }

  // Custom (user-provided) selector → generic Cheerio adapter
  return new GenericCheerioAdapter(doc.selector!);
}
