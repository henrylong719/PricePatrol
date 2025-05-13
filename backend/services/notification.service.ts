export async function handlePriceNotification(watch: any, price: number) {
  // Continuous‑drop alerts
  if (watch.continuousDrop && price < (watch.lastPrice ?? Infinity)) {
    console.log(`📉  ${watch.url} dropped again to ${price}`);
    watch.lastPrice = price;
    await watch.save();
    return;
  }

  // Target‑price alert
  if (watch.targetPrice && price <= watch.targetPrice && !watch.notified) {
    console.log(
      `🎯  ${watch.url} hit target (${price} <= ${watch.targetPrice})`
    );
    watch.notified = true;
    await watch.save();
  }
}
