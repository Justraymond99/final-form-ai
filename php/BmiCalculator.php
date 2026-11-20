<?php
declare(strict_types=1);

final class BmiCalculator
{
    public static function calculate(?float $weightKg, ?float $heightM): float
    {
        if ($weightKg === null || $heightM === null) {
            throw new InvalidArgumentException('Weight and height are required.');
        }
        if (!is_finite($weightKg) || !is_finite($heightM) || $weightKg <= 0 || $heightM <= 0) {
            throw new InvalidArgumentException('Weight and height must be positive, finite numbers.');
        }
        return round($weightKg / ($heightM * $heightM), 2);
    }
}
