# Grass wetness planning estimate

This is an uncalibrated heuristic for surface grass moisture, not an observed measurement, a calibrated agronomic model, or a soil bearing-capacity recommendation. No measured historical rain is available from the existing forecast endpoint. Lookback periods use forecast values only, and unknown past periods remain unknown. No store-specific learning, irrigation, shade or soil model is implemented.

Each time band is evaluated at its first available forecast timestamp, shown explicitly in Europe/Rome time. The preceding 24 elapsed hours are used, including DST changes. Rain bins prefer nonoverlapping hourly blocks, falling back to longer intervals distributed proportionally and marked limited. Missing precipitation is never zero.

Chosen provisional rules (not scientifically validated thresholds): rainfall >=0.1 mm/hour resets a moisture index to 3; relative humidity >=95%, wind <3 m/s in evening/night/morning supports possible dew, index >=2. Daytime temperature >=10 C, humidity <80% and available cloud/wind fields permit slow decay; humidity <65%, cloud <50%, wind >=1 m/s permit faster decay. These index values are internal rules, not physical water content. A dry classification requires complete precipitation and drying-input coverage of the preceding 24 hours. Positive rain/dew evidence can give a wet warning with limited coverage, explicitly labeled. Temperatures <=0 C give a separate possible-freezing message. Confidence is qualitative only, never a numeric accuracy claim.

General context, not validation of this heuristic:
- University of Maryland Extension, Starting a New Lawn: https://extension.umd.edu/resource/starting-new-lawn
- University of Maryland Extension, Maintaining an Established Lawn: https://extension.umd.edu/resource/maintaining-established-lawn

Tests cover missing history, preceding rain with a dry arrival forecast, complete drying weather, possible dew, missing humidity and freezing.
