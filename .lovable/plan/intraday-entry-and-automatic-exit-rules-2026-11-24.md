# Intraday Entry and Automatic Exit Rules

## User-facing changes
- Show Intraday picks as awaiting entry until CMP reaches the recommended entry, with the same clear entry guidance used on Swing.
- Automatically close eligible picks when CMP reaches/crosses T1, T2, T3, or stop-loss, respecting BUY and SELL directions.
- Square off remaining Intraday picks at 3:15 PM India time. Picks that never entered become Not Executed; entered picks close at the latest available price.

## Technical details
- Extend the Intraday recommendation model and detail/list visuals with a persistent entry-triggered state and a price-range indicator.
- Update the scheduled live-price sync to record entry activation, evaluate target/stop-loss exits, and enforce the 3:15 PM cutoff safely.
- Add an explicit time-exit reason for the 3:15 square-off and preserve accurate realized P&L.
- Add targeted tests for BUY/SELL entry and exit thresholds, pending-entry square-off, and the 3:15 PM cutoff.
