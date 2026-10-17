# Grass growth outlook

## Scope and sources

Experimental, qualitative planning estimate for the scheduled store and forecast window (up to seven days from the visit date). It estimates growth potential, not grass height, clipping yield, a contractual priority, or actual measured growth. Existing scheduling intervals are untouched.

- MET Norway Locationforecast supplies temperature and precipitation forecasts at the resolved store location. Daily averages are time weighted using hourly linear interpolation of temperature samples no more than six hours apart. Days require at least 18 covered hours. Local date boundaries use Europe/Rome. The displayed date range and count reflect the available forecast, including shorter horizons for visits further away.
- NASA POWER Daily API provides preceding temperature (T2M, C) and precipitation (PRECTOTCORR, mm/day) estimates, not an on-site gauge. Up to 32 days are fetched; model windows use 21 preceding days. Meteorological native resolution is approximately 0.5 by 0.625 degrees; requests/cache are shared on this grid, with original store latitude retained for day length. Historic days are UTC, forecast days are Italian local days; the difference is disclosed and tolerable only for this coarse period outlook, never precise wetness timing. The NASA history does NOT silently become hourly history for the separate wet-grass estimate.
- https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- https://power.larc.nasa.gov/docs/methodology/data/sources/
- NASA commercial reuse with attribution: https://forum.earthdata.nasa.gov/viewtopic.php?t=82
- Thermal-potential context and limitations: Zhou and Soldat, 2021, https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2021.749854/full

## Uncalibrated rules

These rules are operational assumptions, not a validated biological model or an implementation of the cited paper's trained model. Thermal response uses exp(-0.5*((mean temperature-optimum)/width)^2), with chosen cool-season parameters 20 C/5.5 C and warm-season parameters 31 C/7 C. Unknown grass defaults to cool-season with an explicit warning. Daily thermal scores are averaged. If at least 14 historical temperature days in the prior 21 days are available and the latest is within ten days of the scheduled date, blend 25% of the available preceding seven days' thermal potential (minimum three days) and 75% forecast. Otherwise use forecasts only and disclose missing history.

A heuristic daylight multiplier is clamped to 0.55–1 using astronomical day length/14. This is not measured irradiance and does not account for local shade. Forecast model terrain is used implicitly by MET Norway; no unsupported claim of precise altitude-adjusted historical data is made.

Water checks require adequate temperature history, at least 12 precipitation days of the previous 14 and precipitation for all forecast days used. Below 10 mm of antecedent rain, growth is capped to low if less than 5 mm is forecast, or medium if rain is returning (gradual recovery). This is a coarse warning, not a soil water balance. Irrigation present disables the low-rain cap without claiming irrigation amount is adequate. Unknown irrigation explicitly assumes no irrigation for this conditional adjustment. No missing value becomes zero. Categories: <0.10 practically none; <0.35 low; <0.70 medium; otherwise strong. Internal index is never displayed as an accuracy percentage.

## Persistence and access

The `stores.grass_kind` and `stores.grass_irrigation` fields retain unknown by default. Existing admin-only UPDATE policies protect edits; employees see results read-only. The history Edge Function checks a valid user and active profile and selects stores through the caller's RLS-scoped client. Provider fetches use only fixed endpoints and validated coordinates. Shared history cache uses the existing service-only weather cache with a namespaced key, 12-hour TTL and explicitly stale fallback under 48 hours. No subscription or paid API key is needed. Missing upstream history falls back to a clearly limited forecast potential, without preventing normal weather or schedules from loading.

## Verification

Tests cover four thermal classes, grass type, dry spell, irrigation, gradual recovery, short/missing forecasts, missing history and NASA fill values; UI edit controls, auth/profile/store access checks and shared caching. A live NASA response for the Milan area was checked for units, data shape and missing recent values, and combined with a live MET Norway response. Unauthenticated calls to the deployed function returned 401. No end-to-end signed-in device session or field calibration was available.
