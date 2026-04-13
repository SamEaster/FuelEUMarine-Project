# FuelEU Maritime Domain Knowledge

## Target Intensity
- 2025 Target = 89.3368 gCO₂e/MJ

## Energy Calculation
energy = fuelConsumption * 41000

## Compliance Balance (CB)
CB = (target - actual) * energy

## Interpretation
- CB > 0 → Surplus
- CB < 0 → Deficit

---

## Banking Rules (Article 20)
- Only positive CB can be banked
- Banked CB can be used later
- Cannot apply more than available

---

## Pooling Rules (Article 21)
- Sum of CB ≥ 0
- Deficit ship must not worsen
- Surplus ship must not become negative

### Pooling Algorithm
1. Sort ships by CB descending
2. Transfer surplus → deficits
3. Stop when deficits resolved or surplus exhausted

---

## Comparison Formula
percentDiff = ((comparison / baseline) - 1) * 100

## Compliance Check
compliant = ghgIntensity <= target